# Quick Move

A client mod for [Ragnarok Offline](https://github.com/Flux159/ragnarokoffline.app). In NPC shop and sell windows it makes moving items between the two sides reliable.

- **Fast double click works.** The client drops the browser's double click when the list redraws between clicks, so you had to pause between clicks. The mod counts the clicks itself.
- **Ctrl+click** moves the item with one click (setting: Ctrl+click moves the item). It also works between Inventory, Kafra Storage and Cart, in both directions: Ctrl+click an item and it goes to the other open window (storage first if both are open). It also works in Equipment (takes the item off), the Vending shop setup window, the Trade window (from Inventory) and the Rodex write window (both directions).

## Install

Copy the `quick-move` folder to `%APPDATA%\Ragnarok Offline\state\mods`, or use Settings → Mods → Add mod from folder. Restart the client after changing settings.

## Compatibility

Works with Ragnarok Offline 1.4.5 and newer, including 1.5.x. The shop windows changed in 1.5 (they now count two quick clicks themselves instead of listening for a double click event); version 1.0.1 handles both.

## Changelog

- **1.0.1** Fixed Ctrl+click in the NPC sell window and the other shop windows on app 1.5 and newer, where it did nothing. Ctrl+click now sends both the double click older clients wait for and the two quick clicks the newer shop windows count. Fast double click and the storage / cart / equipment / trade / Rodex moves are unchanged.
- **1.0.0** First release.
