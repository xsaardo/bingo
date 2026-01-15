import type { Board } from '$lib/types';

const STORAGE_KEY = 'bingo-board';

export function saveBoard(board: Board): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function loadBoard(): Board | null {
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : null;
}

export function clearBoard(): void {
	localStorage.removeItem(STORAGE_KEY);
}
