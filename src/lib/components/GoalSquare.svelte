<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import { formatRelativeTime } from '$lib/utils/dates';
	import type { Goal } from '$lib/types';

	interface Props {
		goal: Goal;
		index: number;
		isInBingo?: boolean;
		boardSize: number;
	}

	let { goal, index, isInBingo = false, boardSize }: Props = $props();

	// Calculate responsive text sizes based on board size
	let titleTextClass = $derived(
		boardSize === 3
			? 'text-xs sm:text-sm md:text-base lg:text-lg'
			: boardSize === 4
				? 'text-[10px] sm:text-xs md:text-sm lg:text-base'
				: 'text-[8px] sm:text-[10px] md:text-xs lg:text-sm'
	);

	let placeholderTextClass = $derived(
		boardSize === 3
			? 'text-[10px] sm:text-xs md:text-sm'
			: boardSize === 4
				? 'text-[8px] sm:text-[10px] md:text-xs'
				: 'text-[7px] sm:text-[8px] md:text-[10px]'
	);

	let dabberSizeClass = $derived(
		boardSize === 3
			? 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6'
			: boardSize === 4
				? 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'
				: 'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4'
	);

	let notesEmojiClass = $derived(
		boardSize === 3
			? 'text-[10px] sm:text-xs md:text-sm'
			: boardSize === 4
				? 'text-[8px] sm:text-[10px] md:text-xs'
				: 'text-[7px] sm:text-[8px] md:text-[10px]'
	);

	let lastUpdatedText = $derived(
		goal.lastUpdatedAt ? formatRelativeTime(goal.lastUpdatedAt) : null
	);

	let timeTextSize = $derived(
		boardSize === 3
			? 'text-[10px]'
			: boardSize === 4
				? 'text-[10px]'
				: 'text-[8px]'
	);

	async function toggleComplete(e: Event) {
		e.stopPropagation();
		await currentBoardStore.toggleComplete(goal.id);
	}

	function selectGoal() {
		uiStore.selectGoal(index);
	}
</script>

<style>
	/* Bingo winner: red marker ring drawn around the winning cell */
	@keyframes marker-ring {
		0%, 100% {
			box-shadow:
				0 0 0 3px rgba(220, 38, 38, 0.5),
				0 0 0 5px rgba(220, 38, 38, 0.15),
				inset 0 0 12px rgba(220, 38, 38, 0.12);
		}
		50% {
			box-shadow:
				0 0 0 4px rgba(220, 38, 38, 0.65),
				0 0 0 8px rgba(220, 38, 38, 0.2),
				inset 0 0 16px rgba(220, 38, 38, 0.18);
		}
	}

	:global(.bingo-winner) {
		animation: marker-ring 1.8s ease-in-out infinite;
	}

	/* The bingo dabber ink mark — translucent circle stamped on paper */
	.dabber-mark {
		position: absolute;
		width: 76%;
		height: 76%;
		border-radius: 50%;
		/* Radial gradient mimics ink pooling thicker at center, like a real dauber */
		background: radial-gradient(
			circle at 42% 38%,
			rgba(90, 0, 100, 0.42) 0%,
			rgba(70, 0, 80, 0.68) 45%,
			rgba(50, 0, 60, 0.82) 80%,
			rgba(40, 0, 50, 0.88) 100%
		);
		top: 50%;
		left: 50%;
		/* Slight off-center offset and rotation for handmade feel */
		transform: translate(-46%, -52%) rotate(-4deg);
		/* Multiply blends with paper so text stays faintly visible through ink */
		mix-blend-mode: multiply;
		pointer-events: none;
		z-index: 1;
	}

	/* Dabber button — small circle indicator in the corner */
	.dabber-btn {
		border-radius: 50%;
		border: 2px solid #c4b896;
		background: transparent;
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
		position: relative;
		z-index: 2;
	}

	.dabber-btn:hover {
		border-color: #8b4060;
		background: rgba(139, 64, 96, 0.08);
	}

	.dabber-btn.is-complete {
		border-color: rgba(90, 0, 100, 0.6);
		background: radial-gradient(
			circle at 40% 35%,
			rgba(90, 0, 100, 0.5),
			rgba(50, 0, 60, 0.8)
		);
	}
</style>

<div
	data-testid="goal-square"
	role="button"
	tabindex="0"
	onclick={selectGoal}
	onkeydown={(e) => e.key === 'Enter' && selectGoal()}
	class="aspect-square border p-1 sm:p-2 md:p-3 lg:p-4 cursor-pointer transition-all duration-200 overflow-hidden relative {isInBingo &&
	goal.completed
		? 'bingo-winner'
		: ''}"
	style="background-color: #fdfbf5; border-color: #c4b896; border-radius: 2px;"
>
	<!-- Dabber ink mark overlay for completed goals -->
	{#if goal.completed}
		<div class="dabber-mark"></div>
	{/if}

	<div class="h-full flex flex-col justify-between min-h-0 relative z-10">
		<div class="flex-1 flex items-center justify-center text-center px-1 overflow-hidden min-h-0">
			{#if goal.title}
				<p
					class="font-handwritten {titleTextClass} line-clamp-3"
					style="color: {goal.completed ? 'rgba(60, 20, 70, 0.75)' : '#2c2418'};"
				>
					{goal.title}
				</p>
			{:else}
				<p class="{placeholderTextClass} italic" style="color: #a89878;">Click to add</p>
			{/if}
		</div>

		<div class="flex items-center justify-between mt-0.5 sm:mt-1 flex-shrink-0">
			<!-- Dabber stamp button -->
			<button
				data-testid="goal-checkbox"
				onclick={toggleComplete}
				class="dabber-btn {dabberSizeClass} {goal.completed ? 'is-complete' : ''} active:scale-90"
				aria-label={goal.completed ? 'Mark incomplete' : 'Mark complete'}
			></button>

			{#if goal.notes}
				<span class="flex items-center gap-0.5 sm:gap-1 flex-shrink-0" style="color: #8a7a60;">
					<span class="{notesEmojiClass}">📝</span>
					{#if lastUpdatedText}
						<span class="{timeTextSize}">{lastUpdatedText}</span>
					{/if}
				</span>
			{/if}
		</div>
	</div>
</div>
