// ABOUTME: Detects completed bingo lines (rows, columns, diagonals) on a board
// ABOUTME: Returns matching line indices for visual highlighting

import type { Board } from '$lib/types';

export interface BingoLine {
	type: 'row' | 'column' | 'diagonal';
	index?: number;
	indices: number[];
}

export function detectBingo(board: Board): BingoLine[] {
	const { goals, size } = board;
	const completedLines: BingoLine[] = [];

	// Check rows
	for (let row = 0; row < size; row++) {
		const rowIndices = Array.from({ length: size }, (_, col) => row * size + col);
		if (rowIndices.every((i) => goals[i].completed)) {
			completedLines.push({ type: 'row', index: row, indices: rowIndices });
		}
	}

	// Check columns
	for (let col = 0; col < size; col++) {
		const colIndices = Array.from({ length: size }, (_, row) => row * size + col);
		if (colIndices.every((i) => goals[i].completed)) {
			completedLines.push({ type: 'column', index: col, indices: colIndices });
		}
	}

	// Check diagonal (top-left to bottom-right)
	const diagonal1 = Array.from({ length: size }, (_, i) => i * size + i);
	if (diagonal1.every((i) => goals[i].completed)) {
		completedLines.push({ type: 'diagonal', indices: diagonal1 });
	}

	// Check diagonal (top-right to bottom-left)
	const diagonal2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
	if (diagonal2.every((i) => goals[i].completed)) {
		completedLines.push({ type: 'diagonal', indices: diagonal2 });
	}

	return completedLines;
}
