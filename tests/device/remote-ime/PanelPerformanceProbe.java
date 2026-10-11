package org.bravetv.remoteime.test;

import android.app.Activity;
import android.app.Instrumentation;
import android.app.UiAutomation;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.os.SystemClock;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeoutException;

/**
 * Normal emulator Home only; measures input to available native panel semantics, not first pixel.
 */
public final class PanelPerformanceProbe extends Instrumentation {
    private static final String PACKAGE = "com.brave.browser_default";
    private static final String HOME = "The web. On your terms.";
    private static final String CONTROLS = "Browser controls";

    @Override
    public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        start();
    }

    @Override
    public void onStart() {
        Bundle result = new Bundle();
        try {
            require(
                    "ranchu".equals(Build.HARDWARE)
                            && Build.VERSION.SDK_INT == 36
                            && Arrays.asList(Build.SUPPORTED_ABIS).contains("x86_64"),
                    "API36 x64 emulator only");
            UiAutomation automation =
                    getUiAutomation(UiAutomation.FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES);
            automation.waitForIdle(100, 3000);
            AccessibilityNodeInfo root = ownedRoot(automation);
            require(root != null && findLabel(root, HOME) != null, "Start at trusted normal Home");
            int homeWindow = root.getWindowId();
            long[] samples = new long[10];
            long[] renderSamples = new long[10];
            ArrayList<Long> frameDurations = new ArrayList<>();
            for (int sample = 0; sample < samples.length; sample++) {
                result.putString("phase", "Sample " + sample + " Home focus");
                require(isHome(automation, homeWindow), "Normal Home must own each sample");
                AccessibilityNodeInfo button = findLabel(ownedRoot(automation), CONTROLS);
                require(button != null && button.isEnabled(), "Native Home control button missing");
                if (!button.isFocused()) {
                    AccessibilityNodeInfo address =
                            findLabel(ownedRoot(automation), "Address or search");
                    require(
                            address != null && address.isFocused(),
                            "Native Home Address focus required");
                    Rect addressBounds = new Rect();
                    Rect controlsBounds = new Rect();
                    address.getBoundsInScreen(addressBounds);
                    button.getBoundsInScreen(controlsBounds);
                    key(
                            automation,
                            controlsBounds.left > addressBounds.right
                                    ? KeyEvent.KEYCODE_DPAD_RIGHT
                                    : KeyEvent.KEYCODE_DPAD_DOWN);
                }
                automation.waitForIdle(100, 3000);
                waitForFocus(automation, CONTROLS);
                long started = SystemClock.uptimeMillis();
                long inputNanos = System.nanoTime();
                result.putString("phase", "Sample " + sample + " opening");
                automation.executeAndWaitForEvent(
                        () -> key(automation, KeyEvent.KEYCODE_DPAD_CENTER),
                        event -> isPanel(automation, homeWindow),
                        3000);
                samples[sample] = SystemClock.uptimeMillis() - started;
                automation.waitForIdle(100, 3000);
                require(isPanel(automation, homeWindow), "Native panel must remain available");
                result.putString("phase", "Sample " + sample + " frame report");
                renderSamples[sample] = firstPanelFrame(automation, inputNanos, frameDurations);
                result.putString("phase", "Sample " + sample + " Home preparation");
                AccessibilityNodeInfo home = findLabel(ownedRoot(automation), "Home");
                if (home == null) {
                    AccessibilityNodeInfo more = findLabel(ownedRoot(automation), "More controls");
                    require(more != null && more.isEnabled(), "Normal compact panel missing");
                    automation.executeAndWaitForEvent(
                            () -> key(automation, KeyEvent.KEYCODE_BACK),
                            event -> isHome(automation, homeWindow),
                            3000);
                    automation.waitForIdle(100, 3000);
                    continue;
                }
                require(home != null && home.isEnabled(), "Normal panel Home action missing");
                AccessibilityNodeInfo homeAction = home;
                automation.executeAndWaitForEvent(
                        () ->
                                require(
                                        homeAction.performAction(
                                                AccessibilityNodeInfo.ACTION_CLICK),
                                        "Normal panel Home action rejected"),
                        event -> isHome(automation, homeWindow),
                        3000);
                automation.waitForIdle(100, 3000);
            }
            result.putString("inputToNativePanelSemanticsMs", Arrays.toString(samples));
            result.putString("inputToFirstPanelFrameCompletedNs", Arrays.toString(renderSamples));
            result.putString("panelFrameDurationsNs", frameDurations.toString());
            result.putBoolean("normalHomeRestored", isHome(automation, homeWindow));
            result.putBoolean("firstPixelMeasurement", false);
            result.putString("phase", "Complete");
            finish(Activity.RESULT_OK, result);
        } catch (TimeoutException | IllegalStateException | IOException error) {
            result.putString(
                    "failure",
                    "Panel timing failed: "
                            + error.getClass().getSimpleName()
                            + (error instanceof IllegalStateException
                                    ? ": " + error.getMessage()
                                    : ""));
            finish(Activity.RESULT_CANCELED, result);
        }
    }

    private static long firstPanelFrame(
            UiAutomation automation, long inputNanos, ArrayList<Long> durations)
            throws IOException {
        ParcelFileDescriptor descriptor =
                automation.executeShellCommand("dumpsys gfxinfo " + PACKAGE + " framestats");
        long completed = Long.MAX_VALUE;
        int flags = -1, intended = -1, draw = -1, end = -1;
        int lines = 0;
        try (BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                new ParcelFileDescriptor.AutoCloseInputStream(descriptor)))) {
            String line;
            while ((line = reader.readLine()) != null) {
                require(++lines <= 4096, "Native frame report exceeds fixture bound");
                if (line.startsWith("Flags,")) {
                    String[] columns = line.split(",");
                    flags = Arrays.asList(columns).indexOf("Flags");
                    intended = Arrays.asList(columns).indexOf("IntendedVsync");
                    draw = Arrays.asList(columns).indexOf("DrawStart");
                    end = Arrays.asList(columns).indexOf("FrameCompleted");
                    require(
                            flags >= 0 && intended >= 0 && draw >= 0 && end >= 0,
                            "Required native frame columns missing");
                } else if (flags >= 0 && line.matches("[0-9]+,.*")) {
                    String[] values = line.split(",");
                    require(values.length > end, "Incomplete native frame row");
                    long finish = Long.parseLong(values[end]);
                    long drawStart = Long.parseLong(values[draw]);
                    long vsync = Long.parseLong(values[intended]);
                    if (finish > System.nanoTime() || finish < drawStart || drawStart < inputNanos)
                        continue;
                    // Only the newly created normal Controls window has a first-draw frame here.
                    if (Long.parseLong(values[flags]) == 1) completed = Math.min(completed, finish);
                    if (finish >= vsync) durations.add(finish - vsync);
                } else if (line.startsWith("---PROFILEDATA---")) {
                    flags = -1;
                }
            }
        }
        require(completed != Long.MAX_VALUE, "New native panel first-draw frame missing");
        return completed - inputNanos;
    }

    private static void waitForFocus(UiAutomation automation, String label) {
        long deadline = SystemClock.uptimeMillis() + 3000;
        while (SystemClock.uptimeMillis() < deadline) {
            AccessibilityNodeInfo node = findLabel(ownedRoot(automation), label);
            if (node != null && node.isFocused()) return;
            SystemClock.sleep(20);
        }
        throw new IllegalStateException("Native Home control must own focus");
    }

    private static void key(UiAutomation automation, int code) {
        long time = SystemClock.uptimeMillis();
        require(
                automation.injectInputEvent(
                        new KeyEvent(time, time, KeyEvent.ACTION_DOWN, code, 0), true),
                "Native key down rejected");
        require(
                automation.injectInputEvent(
                        new KeyEvent(time, SystemClock.uptimeMillis(), KeyEvent.ACTION_UP, code, 0),
                        true),
                "Native key up rejected");
    }

    private static AccessibilityNodeInfo ownedRoot(UiAutomation automation) {
        AccessibilityNodeInfo root = automation.getRootInActiveWindow();
        return root != null && TextUtils.equals(root.getPackageName(), PACKAGE) ? root : null;
    }

    private static boolean isHome(UiAutomation automation, int homeWindow) {
        AccessibilityNodeInfo root = ownedRoot(automation);
        return root != null && root.getWindowId() == homeWindow && findLabel(root, HOME) != null;
    }

    private static boolean isPanel(UiAutomation automation, int homeWindow) {
        AccessibilityNodeInfo root = ownedRoot(automation);
        return root != null
                && root.getWindowId() != homeWindow
                && findLabel(root, CONTROLS) != null
                && findLabel(root, "Reload page") != null;
    }

    private static AccessibilityNodeInfo findLabel(AccessibilityNodeInfo root, String label) {
        if (root == null) return null;
        ArrayDeque<AccessibilityNodeInfo> pending = new ArrayDeque<>();
        pending.add(root);
        int visited = 0;
        while (!pending.isEmpty() && visited++ < 256) {
            AccessibilityNodeInfo node = pending.removeFirst();
            if (!node.isEditable()
                    && (TextUtils.equals(node.getText(), label)
                            || TextUtils.equals(node.getContentDescription(), label))) return node;
            for (int child = 0;
                    child < node.getChildCount() && pending.size() + visited < 256;
                    child++) {
                AccessibilityNodeInfo next = node.getChild(child);
                if (next != null) pending.add(next);
            }
        }
        return null;
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }
}
