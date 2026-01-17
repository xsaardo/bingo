<script lang="ts">
	import { currentBoard } from '$lib/stores/currentBoard';
	import { detectBingo, type BingoLine } from '$lib/utils/bingo';
	import { currentTheme } from '$lib/stores/theme';
	import GoalSquare from './GoalSquare.svelte';

	let bingoLines = $derived<BingoLine[]>($currentBoard ? detectBingo($currentBoard) : []);
	let hasBingo = $derived(bingoLines.length > 0);
	let bingoIndices = $derived(new Set(bingoLines.flatMap((line) => line.indices)));
	let isEmpty = $derived($currentBoard ? $currentBoard.goals.every((goal) => !goal.title.trim()) : false);
	let theme = $derived($currentTheme);
</script>

<style>
	@keyframes pulse-celebration {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.02);
			opacity: 0.95;
		}
	}

	.celebrate {
		animation: pulse-celebration 2s ease-in-out infinite;
	}
</style>

{#if $currentBoard}
	<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadowLg} p-3 sm:p-4 md:p-6 border-2 {theme.colors.cardBorder} relative">
		{#if hasBingo}
			<div
				class="celebrate mb-3 sm:mb-4 p-3 sm:p-4 {theme.colors.bingoBanner} border-2 {theme.colors.bingoBannerBorder} {theme.styles.borderRadius} text-center {theme.styles.shadow} {theme.fonts.heading}"
			>
				<p class="text-xl sm:text-2xl font-bold {theme.colors.bingoText}">🎉 BINGO! 🎉</p>
				<p class="text-xs sm:text-sm {theme.colors.bingoText} mt-1 {theme.fonts.body}">
					You completed {bingoLines.length} {bingoLines.length === 1 ? 'line' : 'lines'}!
				</p>
			</div>
		{/if}

		<div
			class="grid gap-2 sm:gap-3"
			style="grid-template-columns: repeat({$currentBoard.size}, minmax(0, 1fr));"
		>
			{#each $currentBoard.goals as goal, index}
				<GoalSquare {goal} {index} isInBingo={bingoIndices.has(index)} />
			{/each}
		</div>

		{#if isEmpty}
			<div
				class="absolute inset-0 flex items-center justify-center {theme.colors.cardBg} bg-opacity-95 {theme.styles.borderRadius} pointer-events-none"
			>
				<div class="text-center max-w-md px-6 py-8 animate-in fade-in duration-300">
					<div
						class="inline-flex items-center justify-center w-16 h-16 {theme.colors.squareCompleted} rounded-full mb-4"
					>
						<svg
							class="w-8 h-8 {theme.colors.text}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</div>
					<h3 class="text-xl {theme.fonts.heading} {theme.colors.text} mb-2">Your board is ready!</h3>
					<p class="{theme.colors.textMuted} text-sm {theme.fonts.body}">
						Click any square to add your first goal and start tracking your progress.
					</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
