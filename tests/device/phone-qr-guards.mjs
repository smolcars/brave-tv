// Host-only CLI negatives. Synthetic subprocesses never contact a device or browser.
// Usage: node phone-qr-guards.mjs PLAYWRIGHT_CORE
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, existsSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [modulePath] = process.argv.slice(2);
assert.ok(modulePath, "Provide the installed playwright-core path");
const folder = mkdtempSync(join(tmpdir(), "tv-qr-guards-"));
const marker = "SYNTHETIC_PAIRING_SECRET_MUST_STAY_PRIVATE";
const data = {
  success: true,
  data: {
    appBundleId: "com.brave.browser_default",
    nodes: [
      { index: 0, type: "androidx.compose.ui.platform.ComposeView" },
      {
        index: 1, parentIndex: 0, type: "android.widget.ImageView",
        visibleToUser: true, bundleId: "com.brave.browser_default",
        label: "Pairing QR code; manual address and code above",
      },
    ],
  },
};
try {
  writeFileSync(join(folder, "adb"), `#!/usr/bin/env python3
import os, sys
a=sys.argv[1:]
if a[2:]==['emu','avd','name']:
 print(('qr-tv-test' if a[1]=='emulator-5554' else 'qr-phone-test')+'\\r\\nOK')
elif a[2:]==['forward','--list']:
 print('emulator-5556 tcp:9223 localabstract:chrome_devtools_remote' if os.environ['QR_CASE']!='forward' else '')
elif a[2:]==['shell','dumpsys','window','windows']:
 print('fl=SECURE' if os.environ['QR_CASE']=='secure' else 'fl=HARDWARE_ACCELERATED')
elif a[2:]==['exec-out','screencap','-p']:
 sys.stdout.buffer.write(b'synthetic screenshot bytes')
else: raise SystemExit(2)
`, { mode: 0o700 });
  writeFileSync(join(folder, "java"), `#!/usr/bin/env python3
print('${marker}')
`, { mode: 0o700 });
  const driver = join(folder, "driver.py");
  writeFileSync(driver, `import json, os
d=json.loads(${JSON.stringify(JSON.stringify(data))})
c=os.environ['QR_CASE']
if c in ['stdout','json']:
 print('${marker}')
 raise SystemExit(1 if c=='stdout' else 0)
if c=='ancestry': d['data']['nodes'][0]['type']='android.webkit.WebView'
print(json.dumps(d))
`);
  for (const name of ["device", "forward", "stdout", "json", "ancestry", "secure", "invitation"]) {
    const shot = join(folder, name + ".png");
    const run = spawnSync(process.execPath, [
      resolve("tests/device/phone-qr-pair.mjs"), modulePath, "synthetic.jar", shot,
      "emulator-5554", name === "device" ? "wrong-avd" : "qr-tv-test",
      "emulator-5556", "qr-phone-test", driver,
    ], {
      encoding: "utf8", timeout: 20000,
      env: { ...process.env, PATH: folder + ":" + process.env.PATH, QR_CASE: name },
    });
    assert.equal(run.status, 1, name);
    assert.ok(!(run.stdout + run.stderr).includes(marker), name + " leaked private output");
    const expected = {
      device: "Emulator identity changed", forward: "Phone CDP forward must belong",
      ancestry: "Open the native pairing QR panel before capture",
      secure: "Refuse capture while a secure window exists",
    }[name] ?? "Private QR capture or decode failed";
    assert.ok(run.stderr.includes(expected), name + " failed at the wrong boundary");
    assert.equal(existsSync(shot), name === "invitation", name + " unexpected capture");
    if (existsSync(shot)) assert.equal(statSync(shot).mode & 0o777, 0o600);
  }
  console.log("PASS: 7 QR CLI guards; private output redacted and capture bounded to a new private file.");
} finally {
  rmSync(folder, { recursive: true, force: true });
}
