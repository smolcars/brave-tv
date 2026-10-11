package org.bravetv.remoteime.test;

import android.content.res.Configuration;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Emulator-only fixed synthetic stimuli through genuine InputConnection, without an endpoint. */
public final class RemoteIme extends InputMethodService {
    private TextView mPrivacyFlags;

    @Override
    public void onStartInput(EditorInfo info, boolean restarting) {
        super.onStartInput(info, restarting);
        updatePrivacyFlags(info);
    }

    @Override
    public void onStartInputView(EditorInfo info, boolean restarting) {
        super.onStartInputView(info, restarting);
        updatePrivacyFlags(info);
    }

    @Override
    public boolean onEvaluateInputViewShown() {
        return true;
    }

    @Override
    public boolean onShowInputRequested(int flags, boolean configChange) {
        return true;
    }

    @Override
    public View onCreateInputView() {
        if ((getResources().getConfiguration().uiMode & Configuration.UI_MODE_TYPE_MASK)
                == Configuration.UI_MODE_TYPE_TELEVISION) return createTvView();
        LinearLayout row = new LinearLayout(this);
        for (boolean composing : new boolean[] {true, false}) {
            Button button = new Button(this);
            button.setText(composing ? "Compose Japanese" : "Commit Japanese");
            button.setOnClickListener(
                    view -> {
                        InputConnection input = getCurrentInputConnection();
                        if (input == null) return;
                        if (composing) input.setComposingText("日本", 1);
                        else input.commitText("日本", 1);
                    });
            row.addView(button, new LinearLayout.LayoutParams(0, 180, 1));
        }
        return row;
    }

    private View createTvView() {
        LinearLayout column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        mPrivacyFlags = new TextView(this);
        updatePrivacyFlags(getCurrentInputEditorInfo());
        column.addView(mPrivacyFlags);
        LinearLayout first = new LinearLayout(this);
        column.addView(first);
        addStimulus(
                first,
                "Seed Unicode",
                input -> {
                    input.performContextMenuAction(android.R.id.selectAll);
                    input.commitText("नमस्ते🙂", 1);
                });
        addStimulus(
                first,
                "Replace selection",
                input -> {
                    input.setSelection(0, 6);
                    input.commitText("日本", 1);
                });
        addStimulus(
                first,
                "Delete code point",
                input -> {
                    input.setSelection(4, 4);
                    input.deleteSurroundingTextInCodePoints(1, 0);
                });
        LinearLayout second = new LinearLayout(this);
        column.addView(second);
        addStimulus(
                second,
                "Compose Japanese",
                input -> {
                    input.performContextMenuAction(android.R.id.selectAll);
                    input.setComposingText("かな", 1);
                });
        addStimulus(second, "Commit Japanese", input -> input.commitText("日本", 1));
        addStimulus(
                second,
                "Exceed address limit",
                input -> {
                    input.performContextMenuAction(android.R.id.selectAll);
                    StringBuilder oversized = new StringBuilder();
                    for (int i = 0; i < 8193; i++) oversized.append('a');
                    input.commitText(oversized, 1);
                });
        LinearLayout third = new LinearLayout(this);
        column.addView(third);
        addStimulus(
                third,
                "Fixture URL",
                input -> {
                    input.performContextMenuAction(android.R.id.selectAll);
                    input.commitText("http://10.0.2.2:18088/remote-input.html", 1);
                });
        addStimulus(
                third,
                "Site data URL",
                input -> {
                    input.performContextMenuAction(android.R.id.selectAll);
                    input.commitText("http://10.0.2.2:18088/privacy.html", 1);
                });
        return column;
    }

    private void updatePrivacyFlags(EditorInfo info) {
        if (mPrivacyFlags == null) return;
        int expected =
                EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING
                        | EditorInfo.IME_FLAG_NO_EXTRACT_UI
                        | EditorInfo.IME_FLAG_NO_FULLSCREEN;
        mPrivacyFlags.setText(
                "Native IME privacy flags: "
                        + (info != null && (info.imeOptions & expected) == expected));
    }

    private interface Stimulus {
        void apply(InputConnection input);
    }

    private void addStimulus(LinearLayout row, String label, Stimulus stimulus) {
        Button button = new Button(this);
        button.setText(label);
        button.setOnClickListener(
                view -> {
                    InputConnection input = getCurrentInputConnection();
                    if (input != null) stimulus.apply(input);
                });
        row.addView(button, new LinearLayout.LayoutParams(0, 100, 1));
    }
}
