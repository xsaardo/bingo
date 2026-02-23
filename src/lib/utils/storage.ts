// ABOUTME: Browser localStorage utilities for persisting board state
// ABOUTME: Handles saving/loading the legacy board object and anonymous user's board ID

import type { Board } from '$lib/types';

const STORAGE_KEY = 'bingo-board';
const ANONYMOUS_BOARD_KEY = 'bingo-anonymous-board-id';

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

export function saveAnonymousBoardId(boardId: string): void {
	localStorage.setItem(ANONYMOUS_BOARD_KEY, boardId);
}

export function getAnonymousBoardId(): string | null {
	return localStorage.getItem(ANONYMOUS_BOARD_KEY);
}
