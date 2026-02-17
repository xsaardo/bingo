// ABOUTME: Utility for exporting a board as a shareable image
// ABOUTME: Handles rendering a DOM element to PNG and triggering download or native share

import { toPng } from 'html-to-image';

const EXPORT_SIZE = 1080;

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

export async function exportBoardAsImage(element: HTMLElement, boardName: string): Promise<void> {
	const dataUrl = await toPng(element, {
		width: EXPORT_SIZE,
		height: EXPORT_SIZE,
		pixelRatio: 1
	});

	const filename = `${sanitizeFilename(boardName)}-bingo.png`;

	// On mobile, try native share sheet which supports TikTok, Instagram, etc.
	if (typeof navigator !== 'undefined' && navigator.share) {
		const response = await fetch(dataUrl);
		const blob = await response.blob();
		const file = new File([blob], filename, { type: 'image/png' });

		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			await navigator.share({ files: [file], title: `${boardName} Bingo Board` });
			return;
		}
	}

	// Desktop fallback: trigger file download
	const a = document.createElement('a');
	a.href = dataUrl;
	a.download = filename;
	a.click();
}
