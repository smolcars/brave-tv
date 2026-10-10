"""With a disposable final grouped tab's confirmation open, check TV D-pad focus."""
import argparse
import re
import subprocess
import time
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('serial')
parser.add_argument('action', choices=['cancel', 'delete'])
args = parser.parse_args()
assert re.fullmatch(r'emulator-\d+', args.serial), 'Emulator-only destructive fixture'


def adb(*parts: str) -> str:
    return subprocess.check_output(
        ['adb', '-s', args.serial, 'shell', *parts], text=True, timeout=20)


def hierarchy() -> ET.Element:
    result = adb('uiautomator', 'dump', '/data/local/tmp/tv-group-window.xml')
    assert 'dumped to' in result
    return ET.fromstring(adb('cat', '/data/local/tmp/tv-group-window.xml'))


def focus(label: str) -> None:
    tree = hierarchy()
    focused = [n.get('text') for n in tree.iter('node') if n.get('focused') == 'true']
    assert label in focused, f'Expected actionable focus {label!r}, got {focused}'


tree = hierarchy()
assert any(n.get('text') == 'Close tab and delete group?' for n in tree.iter('node'))
focus('Cancel')
adb('input', 'keyevent', '22')
focus('Delete group')
adb('input', 'keyevent', '21')
focus('Cancel')
if args.action == 'delete':
    adb('input', 'keyevent', '22')
    focus('Delete group')
adb('input', 'keyevent', '23')
deadline = time.monotonic() + 15
while True:
    tree = hierarchy()
    if not any(n.get('text') == 'Close tab and delete group?' for n in tree.iter('node')):
        break
    assert time.monotonic() < deadline, 'Confirmation did not dismiss'
if args.action == 'delete':
    focus('Address or search')
    adb('input', 'keyevent', '22')
    focus('Browser controls')
else:
    assert any(n.get('text') == '10.0.2.2:18088/remote-input.html'
               for n in tree.iter('node')), 'Cancel lost the original fixture'
    adb('input', 'keyevent', '4')
    focus('Close tab')
    adb('input', 'keyevent', '23')
    tree = hierarchy()
    assert any(n.get('text') == 'Close tab and delete group?'
               for n in tree.iter('node')), 'Cancel lost the original group'
    focus('Cancel')
print(f'PASS: actionable initial focus, D-pad buttons and {args.action} outcome')
