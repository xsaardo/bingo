import { toPng } from 'html-to-image';

export async function exportBoardAsImage(element: HTMLElement, boardName: string): Promise<void> {
  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1080,
    cacheBust: true,
    // Skip font embedding — fonts are already rendered by the browser.
    // Embedding requires fetching cross-origin font files which is slow.
    skipFonts: true,
    // The element lives at (0,0) with opacity:0 so the browser paints it.
    // Override position so the clone renders at the foreignObject origin, and restore opacity for the capture.
    // opacity is not inherited, so only the root needs overriding — children already compute opacity:1.
    style: { position: 'relative', left: '0', top: '0', opacity: '1' }
  });

  const [header, base64] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });
  const file = new File([blob], `${boardName}-bingo.png`, { type: 'image/png' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${boardName} Bingo Board` });
      return;
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        throw err;
      }
      // AbortError: gesture window expired or user cancelled — fall through to download
    }
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${boardName}-bingo.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
