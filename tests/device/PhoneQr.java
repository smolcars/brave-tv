// Decodes a TV screenshot for the pairing probe. Stdout is private IPC to the wrapper.
import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import java.io.File;
import javax.imageio.ImageIO;

class PhoneQr {
    public static void main(String[] args) throws Exception {
        var image = ImageIO.read(new File(args[0]));
        int width = image.getWidth();
        int height = image.getHeight();
        var source = new RGBLuminanceSource(width, height,
                image.getRGB(0, 0, width, height, null, 0, width));
        var decoded = new MultiFormatReader().decode(new BinaryBitmap(new HybridBinarizer(source)));
        System.out.print(decoded.getText());
    }
}
