<!-- ABOUTME: Fixed-size board component used as input for image export -->
<!-- ABOUTME: Not interactive - rendered off-screen at 1080x1080px, styled for social sharing -->

<script lang="ts">
	import { detectBingo } from '$lib/utils/bingo';
	import type { Board } from '$lib/types';

	interface Props {
		board: Board;
		font: string;
		ref?: HTMLElement | null;
	}

	let { board, font, ref = $bindable(null) }: Props = $props();

	const SIZE = 1080;
	const PADDING = 40;
	const TITLE_HEIGHT = 90;
	const WATERMARK_HEIGHT = 36;
	const GAP_AFTER_TITLE = 16;
	const GAP_BEFORE_WATERMARK = 16;

	const GRID_SIZE =
		SIZE -
		2 * PADDING -
		TITLE_HEIGHT -
		GAP_AFTER_TITLE -
		GAP_BEFORE_WATERMARK -
		WATERMARK_HEIGHT;

	const CELL_GAP = 8;
	let cellSize = $derived(
		Math.floor((GRID_SIZE - (board.size - 1) * CELL_GAP) / board.size)
	);

	let bingoLines = $derived(detectBingo(board));
	let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));

	let completedCount = $derived(board.goals.filter((g) => g.completed).length);
	let totalCount = $derived(board.goals.length);

	function cellStyle(index: number): string {
		const goal = board.goals[index];
		const inBingo = bingoIndices.has(index);

		let bg = '#ffffff';
		let border = '2px solid #d1d5db';

		if (inBingo && goal.completed) {
			bg = '#fefce8';
			border = '2px solid #eab308';
		} else if (goal.completed) {
			bg = '#f0fdf4';
			border = '2px solid #22c55e';
		}

		return `
			width: ${cellSize}px;
			height: ${cellSize}px;
			background: ${bg};
			border: ${border};
			border-radius: 10px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 8px;
			position: relative;
			box-sizing: border-box;
			${inBingo && goal.completed ? 'box-shadow: 0 0 0 3px #facc15;' : ''}
		`;
	}

	function titleFontSize(): number {
		const len = board.name.length;
		if (len <= 20) return 42;
		if (len <= 35) return 34;
		return 26;
	}

	function goalFontSize(): number {
		if (board.size === 3) return 22;
		if (board.size === 4) return 16;
		return 12;
	}
</script>

<!-- Positioned off-screen but rendered in DOM for html-to-image capture -->
<div
	bind:this={ref}
	style="
		position: absolute;
		left: -9999px;
		top: -9999px;
		width: {SIZE}px;
		height: {SIZE}px;
		background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
		padding: {PADDING}px;
		box-sizing: border-box;
		font-family: {font || 'system-ui, sans-serif'};
		display: flex;
		flex-direction: column;
	"
	aria-hidden="true"
	data-testid="exportable-board"
>
	<!-- Board Title -->
	<div
		style="
			height: {TITLE_HEIGHT}px;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
		"
	>
		<h1
			style="
				font-size: {titleFontSize()}px;
				font-weight: 800;
				color: #1e293b;
				margin: 0;
				line-height: 1.1;
			"
		>
			{board.name}
		</h1>
	</div>

	<!-- Gap -->
	<div style="height: {GAP_AFTER_TITLE}px; flex-shrink: 0;"></div>

	<!-- Grid -->
	<div
		style="
			display: grid;
			grid-template-columns: repeat({board.size}, {cellSize}px);
			grid-template-rows: repeat({board.size}, {cellSize}px);
			gap: {CELL_GAP}px;
			flex-shrink: 0;
		"
	>
		{#each board.goals as goal, index}
			<div style={cellStyle(index)}>
				<!-- Checkmark badge -->
				{#if goal.completed}
					<div
						style="
							position: absolute;
							top: 6px;
							right: 6px;
							width: {board.size === 3 ? 22 : board.size === 4 ? 18 : 14}px;
							height: {board.size === 3 ? 22 : board.size === 4 ? 18 : 14}px;
							background: #22c55e;
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
						"
					>
						<svg
							width={board.size === 3 ? 13 : board.size === 4 ? 11 : 9}
							height={board.size === 3 ? 13 : board.size === 4 ? 11 : 9}
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							stroke-width="3.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}

				<!-- Goal title -->
				{#if goal.title}
					<p
						style="
							font-size: {goalFontSize()}px;
							font-weight: 600;
							color: {goal.completed ? '#166534' : '#1e293b'};
							text-align: center;
							margin: 0;
							padding: {goal.completed ? '0 20px 0 0' : '0'};
							overflow: hidden;
							display: -webkit-box;
							-webkit-line-clamp: {board.size === 3 ? 3 : board.size === 4 ? 3 : 4};
							-webkit-box-orient: vertical;
							line-height: 1.3;
							word-break: break-word;
						"
					>
						{goal.title}
					</p>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Gap before watermark -->
	<div style="height: {GAP_BEFORE_WATERMARK}px; flex-shrink: 0;"></div>

	<!-- Watermark + progress -->
	<div
		style="
			height: {WATERMARK_HEIGHT}px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		"
	>
		<span
			style="
				font-size: 14px;
				font-weight: 500;
				color: #64748b;
			"
		>
			{completedCount}/{totalCount} goals completed
		</span>
		<span
			style="
				font-size: 13px;
				color: #94a3b8;
				font-weight: 400;
			"
		>
			bingo.app
		</span>
	</div>
</div>
