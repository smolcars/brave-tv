package org.bravetv.remoteime.test;

import android.app.Activity;
import android.app.Instrumentation;
import android.app.UiAutomation;
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
            require(hasLabel(automation, HOME), "Start at trusted normal Home");
            long[] samples = new long[10];
            long[] renderSamples = new long[10];
            ArrayList<Long> frameDurations = new ArrayList<>();
            for (int sample = 0; sample < samples.length; sample++) {
                require(hasLabel(automation, HOME), "Normal Home must own each sample");
                long started = SystemClock.uptimeMillis();
                long inputNanos = System.nanoTime();
                automation.executeAndWaitForEvent(
                        () -> back(automation), event -> hasLabel(automation, CONTROLS), 3000);
                samples[sample] = SystemClock.uptimeMillis() - started;
                automation.waitForIdle(100, 3000);
                require(hasLabel(automation, CONTROLS), "Native panel must remain available");
                renderSamples[sample] = firstPanelFrame(automation, inputNanos, frameDurations);
                automation.executeAndWaitForEvent(
                        () -> back(automation), event -> hasLabel(automation, HOME), 3000);
                automation.waitForIdle(100, 3000);
            }
            result.putString("inputToNativePanelSemanticsMs", Arrays.toString(samples));
            result.putString("inputToFirstPanelFrameCompletedNs", Arrays.toString(renderSamples));
            result.putString("panelFrameDurationsNs", frameDurations.toString());
            result.putBoolean("normalHomeRestored", hasLabel(automation, HOME));
            result.putBoolean("firstPixelMeasurement", false);
            finish(Activity.RESULT_OK, result);
        } catch (TimeoutException | IllegalStateException | IOException error) {
            result.putString("failure", error.getMessage());
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

    private static void back(UiAutomation automation) {
        long time = SystemClock.uptimeMillis();
        require(
                automation.injectInputEvent(
                        new KeyEvent(time, time, KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_BACK, 0),
                        true),
                "Native Back down rejected");
        require(
                automation.injectInputEvent(
                        new KeyEvent(
                                time,
                                SystemClock.uptimeMillis(),
                                KeyEvent.ACTION_UP,
                                KeyEvent.KEYCODE_BACK,
                                0),
                        true),
                "Native Back up rejected");
    }

    private static boolean hasLabel(UiAutomation automation, String label) {
        AccessibilityNodeInfo root = automation.getRootInActiveWindow();
        if (root == null || !TextUtils.equals(root.getPackageName(), PACKAGE)) return false;
        ArrayDeque<AccessibilityNodeInfo> pending = new ArrayDeque<>();
        pending.add(root);
        int visited = 0;
        while (!pending.isEmpty() && visited++ < 256) {
            AccessibilityNodeInfo node = pending.removeFirst();
            if (!node.isEditable()
                    && (TextUtils.equals(node.getText(), label)
                            || TextUtils.equals(node.getContentDescription(), label))) return true;
            for (int child = 0;
                    child < node.getChildCount() && pending.size() + visited < 256;
                    child++) {
                AccessibilityNodeInfo next = node.getChild(child);
                if (next != null) pending.add(next);
            }
        }
        return false;
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }
}
