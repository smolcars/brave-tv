"""Verify the actual tab-promotion bytecode adapter with JVM side effects.

Usage: nix develop --command python3 tests/build/check_tv_tab_promo_adapter.py CHROMIUM_SRC
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
SOURCES = {
    "org.chromium.base.DeviceInfo": """
public class DeviceInfo {
    public static boolean tv;
    public static boolean isTV() { return tv; }
}""",
    "org.chromium.chrome.browser.app.BraveActivity": "public class BraveActivity {}",
    "org.chromium.chrome.browser.ChromeTabbedActivity": """
public class ChromeTabbedActivity extends org.chromium.chrome.browser.app.BraveActivity {
    public int initializations;
    public void initialize() { initiateArchivedTabsAutoDeletePromoManager(); }
    private void initiateArchivedTabsAutoDeletePromoManager() {
        // Exercise the original branch and stack frames after the inserted entry guard.
        if (initializations == 0) initializations = 1;
        else initializations++;
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
        reader.accept(new BraveTabbedActivityClassAdapter(writer), 0);
        Files.write(path, writer.toByteArray());
    }
}""",
    "verify.Run": """
import org.chromium.base.DeviceInfo;
import org.chromium.chrome.browser.ChromeTabbedActivity;
public class Run {
    public static void main(String[] args) {
        ChromeTabbedActivity activity = new ChromeTabbedActivity();
        DeviceInfo.tv = true;
        activity.initialize();
        activity.initialize();
        assert activity.initializations == 0 : "TV must not initialize the promotion";
        DeviceInfo.tv = false;
        activity.initialize();
        activity.initialize();
        assert activity.initializations == 2 : "Phone initialization must remain unchanged";
        DeviceInfo.tv = true;
        activity.initialize();
        assert activity.initializations == 2 : "TV must not touch existing state";
        System.out.println("TV/phone promotion initialization passed JVM verification");
    }
}""",
}

with tempfile.TemporaryDirectory(prefix="tv-tab-promo-adapter-") as tmp:
    work = pathlib.Path(tmp)
    files = []
    for name, source in SOURCES.items():
        path = work / (name.replace(".", "/") + ".java")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"package {name.rsplit('.', 1)[0]};\n{source}\n")
        files.append(str(path))
    adapters = ROOT / "brave/build/android/bytecode/java/org/brave/bytecode"
    files += [str(adapters / name) for name in (
        "BraveClassVisitor.java", "BraveTabbedActivityClassAdapter.java")]
    subprocess.run(["javac", "-cp", CP, "-d", tmp, *files], check=True)
    target = work / "org/chromium/chrome/browser/ChromeTabbedActivity.class"
    subprocess.run(["java", "-cp", f"{tmp}:{CP}", "org.brave.bytecode.Rewrite",
                    str(target)], check=True)
    subprocess.run(["java", "-ea", "-Xverify:all", "-cp", tmp, "verify.Run"], check=True)

    source = work / "org/chromium/chrome/browser/ChromeTabbedActivity.java"
    source.write_text(source.read_text().replace(
        "initiateArchivedTabsAutoDeletePromoManager", "renamedUpstreamMethod"))
    subprocess.run(["javac", "-cp", tmp, "-d", tmp, str(source)], check=True)
    missing = subprocess.run(
        ["java", "-cp", f"{tmp}:{CP}", "org.brave.bytecode.Rewrite", str(target)],
        capture_output=True, text=True)
    assert missing.returncode != 0 and "TV tab-promotion method missing" in missing.stderr
    print("Missing upstream hook rejected")
