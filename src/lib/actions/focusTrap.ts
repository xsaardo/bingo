// ABOUTME: Svelte action that traps keyboard focus within a modal/dialog element.
// ABOUTME: Captures the previously focused element and restores it on destroy.

const FOCUSABLE_SELECTORS = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Svelte action: traps Tab/Shift+Tab focus within `node`.
 * On destroy, returns focus to the element that was active before the trap was set.
 *
 * Usage:
 *   <div use:focusTrap>...</div>
 */
export function focusTrap(node: HTMLElement) {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	function getFocusable(): HTMLElement[] {
		return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
			(el) => !el.closest('[aria-hidden="true"]')
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const focusable = getFocusable();
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey) {
			// Shift+Tab: if on first element, wrap to last
			if (document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
		} else {
			// Tab: if on last element, wrap to first
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			// Restore focus to the element that was focused before the modal opened
			previouslyFocused?.focus();
		}
	};
}
