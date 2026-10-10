package org.bravetv.remoteime.test;

import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;

/** Emulator-only stimulus: the phone's real IME path, without a command endpoint. */
public final class RemoteIme extends InputMethodService {
    @Override
    public boolean onEvaluateInputViewShown() { return true; }

    @Override
    public boolean onShowInputRequested(int flags, boolean configChange) { return true; }

    @Override
    public View onCreateInputView() {
        LinearLayout row = new LinearLayout(this);
        for (boolean composing : new boolean[] {true, false}) {
            Button button = new Button(this);
            button.setText(composing ? "Compose Japanese" : "Commit Japanese");
            button.setOnClickListener(view -> {
                InputConnection input = getCurrentInputConnection();
                if (input == null) return;
                if (composing) input.setComposingText("日本", 1);
                else input.commitText("日本", 1);
            });
            row.addView(button, new LinearLayout.LayoutParams(0, 180, 1));
        }
        return row;
    }
}
