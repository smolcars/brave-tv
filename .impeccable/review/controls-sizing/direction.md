# Consistent TV controls and compact Phone status

The user's physical-TV photo (`user-tv-before.jpg`) overrides the earlier
footer/navigation approval. This is a local refinement of Ambient, mode Operate.
The request is consistent Home/Tabs/Favorites focus geometry and sizing,
readable/scalable menu labels (especially Bookmarks), and a small connected-phone
icon instead of the large top-right status label. Preserve native actions,
remote input, native font scaling, connection ownership, data and privacy guards.

Implementation: `brave` final source `3b2ccb47f4d8283e92f57f5a59233e1ea2520488`. The shared native TV Material button
uses an explicit matching fill/focus-border shape in all states and no focused
scale expansion. Compact navigation uses 12dp corners, 48dp targets, the same
14sp label role and a 96dp minimum width multiplied by font scale. The phone
shortcut is 48dp square with a connected-state dot and an accessible live label.
Browser controls use at most two columns, 180dp minimum width multiplied by font
scale, 10dp gaps and 72dp minimum row height multiplied by font scale. Icons stay
20dp; all action text uses the same 18sp role, two lines maximum, and 16dp/10dp
padding. The webpage connected badge is a 24dp phone mark inside a 48dp target;
it retains its accessible name/callback and never takes page keyboard focus.

The full-screen scenic artwork, forest palette, mint focus, search pill,
favorites, footer and native behavior remain the direction contract. There is
no approved comp or new raster asset in this code-led refinement. The user's
photo is the primary defect evidence. No HTML/CSS detector applies to Kotlin.

Required native capture matrix: 1080p TV Home with focused navigation at font
scale 1.0 and 1.3; browser controls with focus on a disabled Browse action and
on Bookmarks at both scales; connected Home shortcut and webpage phone badge.
Validate on the emulator first, then verify the ARM build on the physical TV.
Native checks cover uniform targets, narrow focus/callbacks, menu update/Back,
badge size/focus/callback/disposal and phone cancellation/connection restoration.

Final x64 app + TEST and blocking Android analysis pass. All fourteen native
checks pass at final source, seven methods each at text scales 1.0 and 1.3.
The eight PNGs are now final confirmation captures, after the centering fix.
Normal/enlarged menus keep labels centered and Bookmarks on one line.
Native approval/connection/navigation/disconnect was exercised through the real
server using an emulator-local test client; no physical phone was used.
