# Quick Move 1.0.1

Fixes **Ctrl+click not working in NPC shop windows** (selling, buying, vending, cash shop) on Ragnarok Offline app 1.5 and newer. It still worked in Kafra storage, cart, equipment, trade and Rodex.

## Fixed

- Ctrl+click in shop and sell windows did nothing on app 1.5.x. Since 1.5 the shop windows no longer listen for a double click event; they count two quick clicks themselves, so the fake double click Quick Move sent was never heard. Ctrl+click now sends both the double click older clients wait for and two marked clicks the newer windows count, so the item is moved exactly once on either.
- Quick Move ignores its own marked clicks, so nothing is moved twice.

## Changed

- Fast double click (two real clicks) now only sends the old-style double click; 1.5+ shops already count those two real clicks themselves, and sending clicks as well would have moved the item twice.

## Notes

- Compatible with app 1.4.5 and newer (`requires.app` unchanged).
- Storage / cart / inventory / equipment / trade / Rodex Ctrl+click are untouched.
- Copy the mod folder over the installed one and restart the client.
- Not tested in game yet: please check Ctrl+click in the sell window.
