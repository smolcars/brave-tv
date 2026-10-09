import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

/** Checks the visible TV cursor at a known fixture position (API 36, 320 dpi). */
class CursorScreenshot {
    public static void main(String[] args) throws Exception {
        if (args.length < 3 || args.length > 4 || (args.length == 4 && !args[3].equals("absent"))) {
            throw new IllegalArgumentException(
                    "Usage: CursorScreenshot.java screenshot.png x y [absent]");
        }
        BufferedImage screenshot = ImageIO.read(new File(args[0]));
        int x = Integer.parseInt(args[1]);
        int y = Integer.parseInt(args[2]);
        int center = screenshot.getRGB(x, y) & 0xffffff;
        int ring = screenshot.getRGB(x, y - 14) & 0xffffff;
        boolean visible = center == 0xffffff && ring == 0x000000;
        boolean expectedVisible = args.length == 3;
        if (visible != expectedVisible) {
            throw new AssertionError(
                    "Unexpected cursor visibility at "
                            + x
                            + ","
                            + y
                            + ": center="
                            + Integer.toHexString(center)
                            + ", ring="
                            + Integer.toHexString(ring));
        }
        System.out.println(
                "PASS: cursor " + (visible ? "visible" : "absent") + " at " + x + "," + y);
    }
}
