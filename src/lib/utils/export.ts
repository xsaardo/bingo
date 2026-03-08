import { toPng } from 'html-to-image';

export async function exportBoardAsImage(element: HTMLElement, boardName: string): Promise<void> {
	const dataUrl = await toPng(element, {
		width: 1080,
		height: 1080,
		style: { transform: 'scale(1)', transformOrigin: 'top left' }
	});

	const blob = await (await fetch(dataUrl)).blob();
	const file = new File([blob], `${boardName}-bingo.png`, { type: 'image/png' });

	if (navigator.share && navigator.canShare({ files: [file] })) {
		await navigator.share({ files: [file], title: `${boardName} Bingo Board` });
	} else {
		// Desktop fallback: download
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = `${boardName}-bingo.png`;
		link.click();
	}
}
