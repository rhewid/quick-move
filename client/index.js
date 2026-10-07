// Quick move: reliable double click, and Ctrl+click, in the NPC shop windows.
//
// The client only moves an item on a native "dblclick". The browser drops that
// event when the list redraws between the two clicks, which it does on every
// click, so fast clicking does nothing. This plugin counts the clicks itself,
// fires the client's own dblclick on the item, and hides the native one so an
// item is never moved twice.
//
// Since app 1.5 the shop windows no longer listen for "dblclick": they count two
// quick clicks themselves. A synthetic "dblclick" does nothing there any more, so
// Ctrl+click also sends two clicks (marked, so this plugin ignores its own). Older
// clients ignore the clicks and react to the "dblclick", so one Ctrl+click moves
// the item exactly once on both.

const SHOP = new Set(['NpcStore', 'VendingShop', 'CashShop', 'Vending']);
const TRANSFER = /^(Inventory|Storage|CartItems)/;   // Ctrl+click uses the client's Alt+right-click transfer
const EQUIP = /^Equipment/;                          // Ctrl+click takes the item off
const RODEX = 'WriteRodex';                          // Ctrl+click moves by simulated drag and drop
const ITEM = '.item[data-index]';

const visible = component => component?.host?.isConnected && component.host.style.display !== 'none';

// Replays the client's own drag and drop of an item onto a target element.
function dragTo(item, target) {
	const data = new DataTransfer();
	const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
	fire(item, 'dragstart');
	fire(target, 'drop');
	fire(item, 'dragend');
}

export default function init(parameters, api) {
	if (api?.version !== 1) throw new Error('quick-move needs client API 1');

	const gap = Math.min(1000, Math.max(150, Number(parameters?.double_click_ms) || 450));
	const ctrlClick = parameters?.ctrl_click !== false;

	const attached = new Map();   // component host -> { root, click, dbl }

	function attach(component) {
		const shop = SHOP.has(component.name);
		const transfer = TRANSFER.test(component.name);
		const equip = EQUIP.test(component.name);
		const rodex = component.name === RODEX;
		if (attached.has(component.host) || !(shop || transfer || equip || rodex)) return;
		let last = null;          // { key, time } of the previous plain click

		const doubleClick = item => item.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
		// what Ctrl+click sends: the "dblclick" older clients wait for, plus the two clicks the 1.5+ shop windows count
		const move = item => {
			doubleClick(item);
			for (let i = 0; i < 2; i++) {
				const synthetic = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
				synthetic.quickMove = true;
				item.dispatchEvent(synthetic);
			}
		};

		const click = event => {
			if (event.quickMove || event.button !== 0) return;
			const item = event.target.closest?.(ITEM);
			if (!item) return;

			if (transfer || equip || rodex) {
				if (!ctrlClick || !event.ctrlKey) return;
				event.preventDefault();
				event.stopImmediatePropagation();
				if (equip) return move(item);
				const mail = [...attached.values()].find(entry => entry.name === RODEX && visible(entry.component));
				if (rodex) {
					const inventory = [...attached.values()].find(entry => TRANSFER.test(entry.name) && entry.name.startsWith('Inventory'));
					if (inventory) dragTo(item, inventory.component.host);
					return;
				}
				if (mail && component.name.startsWith('Inventory')) {
					return dragTo(item, mail.component.root.querySelector('.items'));
				}
				item.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, altKey: true }));
				return;
			}

			if (ctrlClick && event.ctrlKey) {
				event.preventDefault();
				event.stopImmediatePropagation();
				last = null;
				move(item);
				return;
			}

			const panel = item.closest('.InputWindow, .OutputWindow');
			const key = `${panel?.className}:${item.dataset.index}`;
			const now = performance.now();
			if (last && last.key === key && now - last.time <= gap) {
				last = null;
				// only the "dblclick": a 1.5+ shop already counted these two real clicks itself
				doubleClick(item);
			} else {
				last = { key, time: now };
			}
		};

		// The client's own dblclick is replaced by the one sent above.
		const dbl = event => {
			if (!event.isTrusted || !event.target.closest?.(ITEM)) return;
			event.preventDefault();
			event.stopImmediatePropagation();
		};

		component.root.addEventListener('click', click, true);
		if (shop) component.root.addEventListener('dblclick', dbl, true);
		attached.set(component.host, { name: component.name, component, root: component.root, click, dbl });
	}

	function detach({ host }) {
		const entry = attached.get(host);
		if (!entry) return;
		entry.root.removeEventListener('click', entry.click, true);
		entry.root.removeEventListener('dblclick', entry.dbl, true);
		attached.delete(host);
	}

	api.on('ui:append', attach, { replay: true });
	api.on('ui:remove', detach);
	api.cleanup(() => { for (const host of [...attached.keys()]) detach({ host }); });
}
