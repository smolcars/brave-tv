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
        public void showPointer(int x, int y, TvRemoteInput.Mode mode) {
            this.x = x;
            this.y = y;
            controlsFocused = false;
            this.mode = mode;
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

    public static void main(String[] args) {
        Page page = new Page();
        TvRemoteInput input = new TvRemoteInput(page, 10);
        assert input.activate(TvRemoteInput.Mode.POINTER);
        assert page.x == 50 && page.y == 40 : "Pointer starts in the page center";
        assert input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false);
        assert page.x == 60 && page.y == 40 : "Right moves the pointer";
        assert input.onKey(TvRemoteInput.Key.RIGHT, false, 0, false);
        assert page.x == 60 : "Key release does not move the pointer again";
        for (int i = 0; i < 20; i++) {
            input.onKey(TvRemoteInput.Key.RIGHT, true, i, false);
            input.onKey(TvRemoteInput.Key.DOWN, true, i, false);
        }
        assert page.x == 99 && page.y == 79 : "Pointer stays inside the bottom/right edges";
        for (int i = 0; i < 20; i++) {
            input.onKey(TvRemoteInput.Key.LEFT, true, i, false);
            input.onKey(TvRemoteInput.Key.UP, true, i, false);
        }
        assert page.x == 0 && page.y == 0 : "Pointer stays inside the top/left edges";
        page.width = 5;
        page.height = 4;
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false);
        assert page.x == 4 && page.y == 3 : "Movement uses the current viewport";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        input.onKey(TvRemoteInput.Key.SELECT, true, 1, false);
        assert page.clicks == 0 : "Holding OK does not repeatedly click";
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.clicks == 1 : "Releasing OK clicks once";
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.clicks == 1 : "An unmatched release cannot click";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, true);
        assert page.clicks == 1 : "A canceled press cannot click";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        assert input.back() : "Back leaves page interaction before browser history";
        assert page.controlsFocused : "Back returns focus to browser controls";
        assert !input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false)
                : "Native controls own D-pad focus";
        assert !input.back() : "Back in controls belongs to the native dispatcher";
        assert input.activate(TvRemoteInput.Mode.POINTER);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.clicks == 1 : "A press from before the mode switch cannot click";
        assert !input.onKey(TvRemoteInput.Key.OTHER, true, 0, false)
                : "Unrelated keys are passed to the browser";
        page.width = 100;
        page.height = 80;
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false);
        int pointedX = page.x;
        int pointedY = page.y;
        assert input.activate(TvRemoteInput.Mode.SCROLL);
        input.onKey(TvRemoteInput.Key.DOWN, true, 0, false);
        input.onKey(TvRemoteInput.Key.DOWN, false, 0, false);
        input.onKey(TvRemoteInput.Key.RIGHT, true, 0, false);
        assert page.scrollY == 1 && page.scrollX == 1 : "D-pad scrolls on press only";
        assert page.x == pointedX && page.y == pointedY
                : "Scroll targets the element under the preserved pointer";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.mode == TvRemoteInput.Mode.POINTER : "OK returns from scroll to pointer";
        assert page.clicks == 1 : "Leaving scroll mode must not click the page";
        page.width = 3;
        page.height = 2;
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.x == 2 && page.y == 1 : "Click coordinates clamp after a resize";
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        page.width = 0;
        assert !input.onKey(TvRemoteInput.Key.SELECT, false, 0, false)
                : "Missing content returns input to native handling";
        assert page.clicks == 2 : "Disappearing content cancels a pending click";
        assert page.controlsFocused : "Missing content restores browser controls";
        assert !input.activate(TvRemoteInput.Mode.POINTER)
                : "A page with no viewport cannot receive a pointer";
        page.width = 100;
        input.activate(TvRemoteInput.Mode.POINTER);
        input.onKey(TvRemoteInput.Key.SELECT, true, 0, false);
        input.cancelPress();
        input.onKey(TvRemoteInput.Key.SELECT, false, 0, false);
        assert page.clicks == 2 : "Losing window focus cancels a pending click";
    }
}
