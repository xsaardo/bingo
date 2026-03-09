import { toPng } from 'html-to-image';

export async function exportBoardAsImage(element: HTMLElement, boardName: string): Promise<void> {
  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1080,
    cacheBust: true,
    // The element lives at (0,0) with opacity:0 so the browser paints it.
    // Override position so the clone renders at the foreignObject origin, and restore opacity for the capture.
    // opacity is not inherited, so only the root needs overriding — children already compute opacity:1.
    style: { position: 'relative', left: '0', top: '0', opacity: '1' }
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
