import org.chromium.chrome.browser.tv.TvRemoteInput;

public final class TvRemoteInputTest {
    private static final class Page implements TvRemoteInput.Target {
        int width = 100;
        int height = 80;
        int x;
        int y;
        int clicks;
        boolean controlsFocused;
        int scrollX;
        int scrollY;
        int top;
        int bottom = 79;
        int edgeDirection;
        TvRemoteInput.Mode mode;

        @Override
        public int getWidth() {
            return width;
        }

        @Override
        public int getHeight() {
            return height;
        }

        @Override
        public int getTop() {
            return top;
        }

        @Override
        public int getBottom() {
            return Math.min(bottom, height - 1);
        }

        @Override
        public void showPointer(int x, int y, TvRemoteInput.Mode mode, int edgeDirection) {
            this.x = x;
            this.y = y;
            controlsFocused = false;
            this.mode = mode;
            this.edgeDirection = edgeDirection;
        }

        @Override
        public void click(int x, int y) {
            this.x = x;
            this.y = y;
            clicks++;
        }

        @Override
        public void showControls() {
            controlsFocused = true;
        }

        @Override
        public void scroll(int x, int y, int dx, int dy) {
            this.x = x;
            this.y = y;
            scrollX += dx;
            scrollY += dy;
        }
    }

    private static void edgeScrolling() {
        Page page = new Page();
        TvRemoteInput input = new TvRemoteInput(page, 10);
        assert input.activate(TvRemoteInput.Mode.POINTER);
        assert input.positionPointer(50, 69);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 1000);
        assert page.y == 79 && page.scrollY == 0 : "Arrival at the edge never scrolls";
        assert page.edgeDirection == 1 : "An outward hold shows its direction";
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 1449);
        assert page.scrollY == 0 : "Edge hold has a grace period";
        input.onKey(TvRemoteInput.Key.DOWN, true, 2, false, 1450);
        assert page.scrollY == 1 && page.y == 79 : "Continued hold scrolls at the pointer";
        input.onKey(TvRemoteInput.Key.DOWN, true, 3, false, 1500);
        assert page.scrollY == 2 : "Live repeats continue scrolling";
        input.onKey(TvRemoteInput.Key.UP, true, 0, false, 1501);
        assert page.y == 69 && page.scrollY == 2 && page.edgeDirection == 0
                : "Reversing an active hold immediately returns to pointer movement";
        input.onKey(TvRemoteInput.Key.UP, false, 0, false, 1502);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 1503);
        input.onKey(TvRemoteInput.Key.DOWN, false, 0, false, 1510);
        assert page.edgeDirection == 0 : "Release removes the cue";
        input.onKey(TvRemoteInput.Key.DOWN, true, 4, false, 2000);
        assert page.scrollY == 2 : "Unmatched repeats cannot restart scrolling";
        input.onKey(TvRemoteInput.Key.UP, true, 0, false, 2010);
        assert page.y == 69 && page.scrollY == 2 : "Reversal immediately moves inward";
        input.onKey(TvRemoteInput.Key.UP, false, 0, false, 2020);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 2100);
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 2200);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 3000);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 3010);
        assert page.clicks == 1 && page.scrollY == 2 : "OK cancels scrolling and clicks once";
        input.onKey(TvRemoteInput.Key.DOWN, true, 2, false, 3100);
        assert page.scrollY == 2 : "Arrow held across OK requires a fresh press";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 3200);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, true, 3650);
        input.onKey(TvRemoteInput.Key.DOWN, true, 2, false, 4000);
        assert page.scrollY == 2 : "Canceled direction discards its hold";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 4010);
        assert !input.onKey(TvRemoteInput.Key.OTHER, true, 0, true, 4020);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 4500);
        assert page.scrollY == 2
                : "Canceled unrelated input cancels edge intent but passes through";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 4100);
        input.cancelPress();
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 5000);
        assert page.scrollY == 2 : "Native input takeover cancels old repeats";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 5100);
        assert input.resume();
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 6000);
        assert page.scrollY == 2 : "Resume does not restore a held arrow";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 6100);
        page.bottom = 59;
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 7000);
        assert page.y == 59 && page.scrollY == 2 : "Viewport change clamps and cancels intent";
        page.top = 20;
        assert input.positionPointer(50, 30);
        input.onKey(TvRemoteInput.Key.UP, true, 0, false, 7100);
        input.onKey(TvRemoteInput.Key.UP, true, 1, false, 7550);
        assert page.y == 20 && page.scrollY == 1 : "Up scrolls at the visible content top";
        input.onKey(TvRemoteInput.Key.LEFT, true, 0, false, 7560);
        assert page.x == 40 && page.edgeDirection == 0 : "Horizontal movement clears edge intent";
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 7600);
        input.onKey(TvRemoteInput.Key.RIGHT, true, 1, false, 8600);
        assert page.scrollX == 0 && page.scrollY == 1 : "Side edges never autoscroll";
        assert input.positionPointer(99, 40);
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 8610);
        input.onKey(TvRemoteInput.Key.RIGHT, true, 1, false, 9610);
        assert page.x == 99 && page.scrollX == 0 : "Holding at a side edge only clamps";
        assert input.positionPointer(50, 39);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 9620);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 10620);
        assert page.y == 59 && page.scrollY == 1 : "A long approach does not consume edge grace";
        input.onKey(TvRemoteInput.Key.DOWN, true, 2, false, 11069);
        assert page.scrollY == 1 : "Grace starts at arrival, even after a long approach";
        assert input.positionPointer(50, 59);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 8700);
        assert input.positionPointer(30, 59);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 9600);
        assert page.scrollY == 1 : "Phone positioning cancels physical edge intent";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 9700);
        assert input.back();
        assert input.activate(TvRemoteInput.Mode.POINTER);
        input.onKey(TvRemoteInput.Key.DOWN, true, 1, false, 10600);
        assert page.scrollY == 1 : "Back and reactivation cannot restore an old hold";
    }

    public static void main(String[] args) {
        edgeScrolling();
        Page page = new Page();
        TvRemoteInput input = new TvRemoteInput(page, 10);
        assert input.activate(TvRemoteInput.Mode.POINTER);
        assert page.x == 50 && page.y == 40 : "Pointer starts in the page center";
        assert input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0);
        assert page.x == 60 && page.y == 40 : "Right moves the pointer";
        assert input.onKey(TvRemoteInput.Key.RIGHT, false, 0, false, 0);
        assert page.x == 60 : "Key release does not move the pointer again";
        for (int i = 0; i < 20; i++) {
            input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0);
            input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 0);
        }
        assert page.x == 99 && page.y == 79 : "Pointer stays inside the bottom/right edges";
        for (int i = 0; i < 20; i++) {
            input.onKey(TvRemoteInput.Key.LEFT, true, 0, false, 0);
            input.onKey(TvRemoteInput.Key.UP, true, 0, false, 0);
        }
        assert page.x == 0 && page.y == 0 : "Pointer stays inside the top/left edges";
        page.width = 5;
        page.height = 4;
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 0);
        assert page.x == 4 && page.y == 3 : "Movement uses the current viewport";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.SELECT, true, 1, false, 0);
        assert page.clicks == 0 : "Holding OK does not repeatedly click";
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.clicks == 1 : "Releasing OK clicks once";
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.clicks == 1 : "An unmatched release cannot click";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, true, 0);
        assert page.clicks == 1 : "A canceled press cannot click";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        assert input.back() : "Back leaves page interaction before browser history";
        assert page.controlsFocused : "Back returns focus to browser controls";
        assert !input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0)
                : "Native controls own D-pad focus";
        assert !input.back() : "Back in controls belongs to the native dispatcher";
        assert !input.resume() : "Native controls must not resume page input";
        assert input.activate(TvRemoteInput.Mode.POINTER);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.clicks == 1 : "A press from before the mode switch cannot click";
        assert !input.onKey(TvRemoteInput.Key.OTHER, true, 0, false, 0)
                : "Unrelated keys are passed to the browser";
        page.width = 100;
        page.height = 80;
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0);
        int pointedX = page.x;
        int pointedY = page.y;
        assert input.activate(TvRemoteInput.Mode.SCROLL);
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        assert input.resume() : "A suspended scroll mode resumes";
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.mode == TvRemoteInput.Mode.SCROLL : "Resuming cancels the old held OK";
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.DOWN, false, 0, false, 0);
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false, 0);
        assert page.scrollY == 1 && page.scrollX == 1 : "D-pad scrolls on press only";
        assert page.x == pointedX && page.y == pointedY
                : "Scroll targets the element under the preserved pointer";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.mode == TvRemoteInput.Mode.POINTER : "OK returns from scroll to pointer";
        assert page.clicks == 1 : "Leaving scroll mode must not click the page";
        page.width = 3;
        page.height = 2;
        assert input.resume();
        assert page.x == 2 && page.y == 1 : "Resuming clamps to the current viewport";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.x == 2 && page.y == 1 : "Click coordinates clamp after a resize";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        page.width = 0;
        assert !input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0)
                : "Missing content returns input to native handling";
        assert page.clicks == 2 : "Disappearing content cancels a pending click";
        assert page.controlsFocused : "Missing content restores browser controls";
        assert !input.activate(TvRemoteInput.Mode.POINTER)
                : "A page with no viewport cannot receive a pointer";
        page.width = 100;
        input.activate(TvRemoteInput.Mode.POINTER);
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        input.cancelPress();
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.clicks == 2 : "Losing window focus cancels a pending click";
        page.height = 80;
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false, 0);
        assert input.positionPointer(75, 60);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false, 0);
        assert page.clicks == 2 : "Phone movement cancels a held physical OK";
        assert input.resume();
        assert page.x == 75 && page.y == 60 : "Resume retains the phone's pointer position";
        input.onKey(TvRemoteInput.Key.LEFT, true, 0, false, 0);
        assert page.x == 65 && page.y == 60 : "Physical movement continues from the phone position";
        input.back();
        assert input.positionPointer(500, -20);
        assert input.resume() && page.x == 99 && page.y == 0
                : "A phone-only pointer activates and clamps before fullscreen recovery";
        page.width = 0;
        assert !input.positionPointer(1, 1) : "A missing viewport rejects phone positioning";
    }
}
