"""Verify the TV factory adapter on a JVM, without Android or native code.

Usage: nix develop --command python3 tests/build/check_tv_home_adapter.py CHROMIUM_SRC
"""

import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = pathlib.Path(sys.argv[1]).resolve()
LIBS = SRC / "third_party/android_deps/autorolled/cipd/libs"
CP = ":".join(str(LIBS / p) for p in (
    "org_ow2_asm_asm/asm.jar", "org_ow2_asm_asm_tree/asm-tree.jar"))
PREFIX = "org.chromium.chrome.browser."
SOURCES = {
    PREFIX + "tab.Tab": "public class Tab { public boolean tv, incognito; }",
    PREFIX + "ui.native_page.NativePage": "public interface NativePage {}",
    PREFIX + "ui.native_page.NativePageHost": "public interface NativePageHost {}",
    PREFIX + "tv.TvHomePage": """
import org.chromium.chrome.browser.tab.Tab;
import org.chromium.chrome.browser.ui.native_page.*;
public class TvHomePage implements NativePage {
    public static NativePage createIfTelevision(NativePageHost host, Tab tab) {
        return tab.tv ? new TvHomePage() : null;
    }
}""",
    PREFIX + "native_page.NativePageFactory": """
import org.chromium.chrome.browser.tab.Tab;
import org.chromium.chrome.browser.ui.native_page.*;
public class NativePageFactory {
    public static class TabShim implements NativePageHost {}
    public static class UpstreamPage implements NativePage {}
    public static class PrivatePage implements NativePage {}
    public static class NativePageBuilder {
        public NativePage buildNewTabPage(Tab tab, String url) {
            NativePageHost host = new TabShim();
            if (tab.incognito) return new PrivatePage();
            // Keep a realistic maximum stack depth without computing new frames.
            System.out.printf("%s %s %s%n", host, tab, url);
            return new UpstreamPage();
        }
    }
}""",
    "org.brave.bytecode.Rewrite": """
import java.nio.file.*;
import org.objectweb.asm.*;
public class Rewrite {
    public static void main(String[] args) throws Exception {
        Path path = Path.of(args[0]);
        ClassReader reader = new ClassReader(Files.readAllBytes(path));
        ClassWriter writer = new ClassWriter(reader, 0);
        reader.accept(new TvNativePageClassAdapter(writer), 0);
        Files.write(path, writer.toByteArray());
    }
}""",
    "verify.Run": """
import org.chromium.chrome.browser.native_page.NativePageFactory.*;
import org.chromium.chrome.browser.tab.Tab;
import org.chromium.chrome.browser.tv.TvHomePage;
public class Run {
    public static void main(String[] args) {
        NativePageBuilder builder = new NativePageBuilder();
        Tab tab = new Tab();
        assert builder.buildNewTabPage(tab, "newtab") instanceof UpstreamPage;
        tab.incognito = true;
        assert builder.buildNewTabPage(tab, "newtab") instanceof PrivatePage;
        tab.tv = true;
        assert builder.buildNewTabPage(tab, "newtab") instanceof TvHomePage;
        tab.incognito = false;
        assert builder.buildNewTabPage(tab, "newtab") instanceof TvHomePage;
        System.out.println("TV and non-TV factory paths passed JVM verification");
    }
}""",
}

with tempfile.TemporaryDirectory(prefix="tv-home-adapter-") as tmp:
    work = pathlib.Path(tmp)
    files = []
    for name, source in SOURCES.items():
        path = work / (name.replace(".", "/") + ".java")
        path.parent.mkdir(parents=True, exist_ok=True)
        package = name.rsplit(".", 1)[0]
        path.write_text(f"package {package};\n{source}\n")
        files.append(str(path))
    adapters = ROOT / "brave/build/android/bytecode/java/org/brave/bytecode"
    files += [str(adapters / name) for name in (
        "BraveClassVisitor.java", "TvNativePageClassAdapter.java")]
    subprocess.run(["javac", "-cp", CP, "-d", tmp, *files], check=True)
    target = work / (PREFIX.replace(".", "/")
                     + "native_page/NativePageFactory$NativePageBuilder.class")
    subprocess.run(["java", "-cp", f"{tmp}:{CP}", "org.brave.bytecode.Rewrite",
                    str(target)], check=True)
    subprocess.run(["java", "-ea", "-Xverify:all", "-cp", tmp, "verify.Run"], check=True)
