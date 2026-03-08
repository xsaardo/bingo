<script lang="ts">
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import type { Board } from '$lib/types';

	interface Props {
		board: Board;
		exportRef?: HTMLDivElement | undefined;
	}

	let { board, exportRef = $bindable() }: Props = $props();

	let bingoLines = $derived<BingoLine[]>(detectBingo(board));
	let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));

	// Cell size for 1080x1080 layout:
	// Top padding: 80px (title area), bottom padding: 40px (branding), sides: 40px each
	// Grid area: 1080 - 80 - 40 = 960px tall, 1080 - 80 = 1000px wide
	const PADDING = 40;
	const TITLE_HEIGHT = 80;
	const BRANDING_HEIGHT = 36;
	const GRID_SIZE = 1080 - PADDING * 2 - TITLE_HEIGHT - BRANDING_HEIGHT;
	const GAP = 6;
	let CELL_SIZE = $derived(Math.floor((GRID_SIZE - GAP * (board.size - 1)) / board.size));
	let FONT_SIZE = $derived(board.size === 5 ? 13 : board.size === 4 ? 16 : 20);
</script>

<!-- Off-screen export container — must be rendered (not display:none) so html-to-image works -->
<div
	bind:this={exportRef}
	style="
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1080px;
    height: 1080px;
    background: linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: {PADDING}px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  "
>
	<!-- Board title -->
	<div
		style="
      width: 100%;
      height: {TITLE_HEIGHT}px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0;
    "
	>
		<h1
			style="
        font-size: 36px;
        font-weight: 800;
        color: #111827;
        margin: 0;
        text-align: center;
        letter-spacing: -0.5px;
        max-width: 900px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      "
		>
			{board.name}
		</h1>
	</div>

	<!-- Bingo grid -->
	<div
		style="
      display: grid;
      grid-template-columns: repeat({board.size}, {CELL_SIZE}px);
      grid-template-rows: repeat({board.size}, {CELL_SIZE}px);
      gap: {GAP}px;
      flex-shrink: 0;
    "
	>
		{#each board.goals as goal, index}
			{@const inBingo = bingoIndices.has(index)}
			{@const completed = goal.completed}
			<div
				style="
          width: {CELL_SIZE}px;
          height: {CELL_SIZE}px;
          border-radius: 10px;
          border: 2px solid {inBingo && completed ? '#eab308' : completed ? '#22c55e' : '#d1d5db'};
          background: {inBingo && completed ? '#fefce8' : completed ? '#f0fdf4' : '#ffffff'};
          box-shadow: {inBingo && completed ? '0 0 0 3px rgba(234, 179, 8, 0.3), 0 2px 6px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        "
			>
				<!-- Goal title -->
				<p
					style="
            font-size: {FONT_SIZE}px;
            font-weight: 600;
            color: {completed ? '#14532d' : '#111827'};
            text-align: center;
            margin: 0;
            line-height: 1.3;
            max-height: {CELL_SIZE - 36}px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            word-break: break-word;
          "
				>
					{goal.title || ''}
				</p>

				<!-- Completion indicator -->
				{#if completed}
					<div
						style="
              position: absolute;
              bottom: 6px;
              right: 6px;
              width: 20px;
              height: 20px;
              background: {inBingo ? '#eab308' : '#22c55e'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            "
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Branding footer -->
	<div
		style="
      width: 100%;
      height: {BRANDING_HEIGHT}px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: auto;
      padding-top: 8px;
    "
	>
		<div
			style="
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0.4;
      "
		>
			<!-- Mini logo -->
			<svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="1" y="1" width="6" height="6" rx="1.5" fill="#2563eb" />
				<rect x="8" y="1" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="15" y="1" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="1" y="8" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="8" y="8" width="6" height="6" rx="1.5" fill="#2563eb" />
				<rect x="15" y="8" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="1" y="15" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="8" y="15" width="6" height="6" rx="1.5" stroke="#2563eb" stroke-width="1.5" />
				<rect x="15" y="15" width="6" height="6" rx="1.5" fill="#2563eb" />
			</svg>
			<span
				style="
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          letter-spacing: 1px;
        "
			>
				BINGOAL
			</span>
		</div>
	</div>
</div>
