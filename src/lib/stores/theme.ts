// ABOUTME: Manages theme preferences and persists them to localStorage
// ABOUTME: Provides reactive theme state for background and future theme options

import { writable, derived } from 'svelte/store';

interface ThemeState {
	background: 'horse' | string;
}

const STORAGE_KEY = 'bingo-theme';

const initialState: ThemeState = {
	background: 'horse'
};

const themeState = writable<ThemeState>(initialState);

export const currentBackground = derived(themeState, ($state) => $state.background);

export const themeStore = {
	subscribe: themeState.subscribe,

	init() {
		if (typeof window === 'undefined') return;

		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				themeState.set(parsed);
			} catch (e) {
				console.error('Failed to parse theme from localStorage:', e);
			}
		}
	},

	setBackground(background: string) {
		themeState.update((state) => ({ ...state, background }));
	}
};

// Auto-save to localStorage
themeStore.subscribe(($state) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify($state));
});
