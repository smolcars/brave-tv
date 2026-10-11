package org.bravetv.remoteime.test;

import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.Activity;
import android.app.Instrumentation;
import android.app.UiAutomation;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;

import java.util.ArrayDeque;

/** Emulator-only native semantics inspection, without reading or returning editor contents. */
public final class EditorAccessibilityProbe extends Instrumentation {
    @Override
    public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        start();
    }

    @Override
    public void onStart() {
        Bundle result = new Bundle();
        int editorCount = 0;
        boolean hintMatches = false;
        boolean textActionPresent = false;
        UiAutomation automation =
                getUiAutomation(UiAutomation.FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES);
        AccessibilityServiceInfo info = automation.getServiceInfo();
        info.flags |= AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        automation.setServiceInfo(info);
        for (AccessibilityWindowInfo window : automation.getWindows()) {
            if (!window.isFocused()) continue;
            AccessibilityNodeInfo root = window.getRoot();
            if (root == null
                    || !TextUtils.equals(root.getPackageName(), "com.brave.browser_default")) {
                continue;
            }
            ArrayDeque<AccessibilityNodeInfo> pending = new ArrayDeque<>();
            pending.add(root);
            int visited = 0;
            while (!pending.isEmpty() && visited++ < 256) {
                AccessibilityNodeInfo node = pending.removeFirst();
                if (node.isEditable()
                        && TextUtils.equals(node.getClassName(), "android.widget.EditText")) {
                    editorCount++;
                    hintMatches |= TextUtils.equals(node.getHintText(), "Address or search");
                    textActionPresent |=
                            node.getActionList()
                                    .contains(
                                            AccessibilityNodeInfo.AccessibilityAction
                                                    .ACTION_SET_TEXT);
                }
                for (int child = 0;
                        child < node.getChildCount() && visited + pending.size() < 256;
                        child++) {
                    AccessibilityNodeInfo next = node.getChild(child);
                    if (next != null) pending.add(next);
                }
            }
        }
        result.putInt("editorCount", editorCount);
        result.putBoolean("nativeHintMatches", hintMatches);
        result.putBoolean("nativeSetTextAction", textActionPresent);
        finish(
                editorCount == 1 && hintMatches && textActionPresent
                        ? Activity.RESULT_OK
                        : Activity.RESULT_CANCELED,
                result);
    }
}
