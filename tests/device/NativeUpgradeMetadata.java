// Read-only native readers. Private tabs permit counts only, never payload decoding.
import org.chromium.base.TriState;
import org.chromium.chrome.browser.tab.flatbuffer.TabStateFlatBufferV1;
import org.chromium.chrome.browser.tabpersistence.TabMetadataFileManager;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.nio.ByteBuffer;

public final class NativeUpgradeMetadata {
    public static void main(String[] args) throws Exception {
        if (args.length != 1
                || !(args[0].equals("active")
                        || args[0].equals("tab")
                        || args[0].equals("counts")
                        || args[0].equals("normal-ids")))
            throw new IllegalArgumentException("Expected active, tab, counts or normal-ids mode");
        int bound = args[0].equals("counts") ? 20 : args[0].equals("tab") ? 4 * 1024 * 1024 : 65536;
        byte[] data = System.in.readNBytes(bound + 1);
        if (data.length < 20 || data.length > bound) {
            throw new IllegalStateException("Native fixture metadata size bound");
        }
        if (!args[0].equals("tab")) {
            ByteBuffer header = ByteBuffer.wrap(data);
            if (header.getInt() != 5) throw new IllegalStateException("Pinned metadata version");
            int count = header.getInt();
            int privateCount = header.getInt();
            if (count < 1 || count > 64 || privateCount < 0 || privateCount > count) {
                throw new IllegalStateException("Native fixture count bound");
            }
            if (args[0].equals("counts")) {
                System.out.println((count - privateCount) + "\t" + privateCount);
                return;
            }
            if (privateCount != 0) {
                throw new IllegalStateException("Normal fixture metadata required");
            }
            TabMetadataFileManager.readSavedMetadataFile(
                    new DataInputStream(new ByteArrayInputStream(data)),
                    (index, id, url, incognito, active, privateActive) -> {
                        if (incognito != TriState.FALSE || privateActive) {
                            throw new IllegalStateException("Private metadata rejected");
                        }
                        if (args[0].equals("normal-ids")) {
                            System.out.println(id + "\t" + active);
                            return;
                        }
                        if (!url.startsWith("http://127.0.0.1:18088/")
                                && !url.startsWith("http://10.0.2.2:18088/")) {
                            throw new IllegalStateException("Owned normal fixture URL required");
                        }
                        System.out.println(id + "\t" + active + "\t" + url);
                    },
                    null);
        } else {
            var state = TabStateFlatBufferV1.getRootAsTabStateFlatBufferV1(ByteBuffer.wrap(data));
            var group = state.tabGroupId();
            String token =
                    group == null || (group.high() == 0 && group.low() == 0)
                            ? "none"
                            : String.format("%016X%016X", group.high(), group.low());
            System.out.println(token);
        }
    }
}
