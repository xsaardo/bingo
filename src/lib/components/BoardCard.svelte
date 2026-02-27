<script lang="ts">
	import type { Board } from '$lib/types';

	interface Props {
		board: Board;
		onDelete?: (_boardId: string) => void;
	}

	let { board, onDelete }: Props = $props();

	// Calculate completion stats
	const completedGoals = $derived(board.goals.filter((g) => g.completed).length);
	const totalGoals = $derived(board.goals.length);
	const completionPercentage = $derived(
		totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
	);
	const hasContent = $derived(board.goals.some((g) => g.title.trim() !== ''));

	function handleDeleteClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (onDelete) {
			onDelete(board.id);
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) {
			return 'Today';
		} else if (diffInDays === 1) {
			return 'Yesterday';
		} else if (diffInDays < 7) {
			return `${diffInDays} days ago`;
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}
	}
</script>

<style>
	/* Push pin at top of the card */
	.push-pin {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: radial-gradient(circle at 38% 35%, #e8d060, #c8a000 60%, #a07800);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
		z-index: 10;
	}

	.push-pin::after {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 7px;
		background: linear-gradient(to bottom, #b8b8b8, #888);
		border-radius: 0 0 2px 2px;
	}

	/* Index card hover — lift the card slightly */
	.card-link {
		display: block;
		text-decoration: none;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.card-link:hover {
		transform: translateY(-3px) rotate(0.3deg);
		box-shadow:
			3px 5px 8px rgba(0, 0, 0, 0.25),
			6px 8px 16px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(180, 155, 100, 0.4);
	}

	/* Pencil progress bar track */
	.pencil-track {
		background: rgba(180, 160, 120, 0.25);
		border: 1px solid rgba(160, 140, 100, 0.4);
		border-radius: 2px;
		height: 8px;
		overflow: hidden;
	}

	/* Progress fill — looks like a pencil-colored bar */
	.pencil-fill {
		height: 100%;
		border-radius: 1px;
		background: repeating-linear-gradient(
			90deg,
			#5a8a3a,
			#5a8a3a 3px,
			#4a7a2a 3px,
			#4a7a2a 6px
		);
		transition: width 0.3s ease;
	}
</style>

<a
	href="/boards/{board.id}"
	class="card-link index-card overflow-hidden group"
	style="border-radius: 3px; margin-top: 10px; position: relative;"
>
	<!-- Push pin decorative element -->
	<div class="push-pin"></div>

	<!-- Header — sits above the ruled lines -->
	<div class="px-4 pt-6 pb-2" style="border-bottom: 1px solid rgba(184, 207, 232, 0.6);">
		<div class="flex items-start justify-between">
			<div class="flex-1 min-w-0" style="padding-left: 38px;">
				<h3
					class="font-handwritten text-xl font-semibold truncate group-hover:text-blue-700 transition-colors"
					style="color: #2c2418;"
				>
					{board.name}
				</h3>
			</div>

			<!-- Delete Button -->
			{#if onDelete}
				<button
					onclick={handleDeleteClick}
					class="flex-shrink-0 ml-2 p-2 rounded-lg transition-colors"
					style="color: #a89878;"
					title="Delete board"
					onmouseenter={(e) => (e.currentTarget.style.color = '#b91c1c')}
					onmouseleave={(e) => (e.currentTarget.style.color = '#a89878')}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Progress Section -->
	<div class="px-4 py-3" style="padding-left: calc(46px + 1rem);">
		<!-- Progress Bar — pencil-stroke style -->
		<div class="mb-3">
			<div class="flex items-center justify-between mb-1.5">
				<span class="font-handwritten text-sm font-medium" style="color: #5a4a32;">Progress</span>
				<span class="font-handwritten text-sm font-semibold" style="color: #3a6a20;">{completionPercentage}%</span>
			</div>
			<div class="pencil-track">
				<div class="pencil-fill" style="width: {completionPercentage}%"></div>
			</div>
			<p class="font-handwritten text-xs mt-1" style="color: #8a7a60;">
				{completedGoals} of {totalGoals} goals completed
			</p>
		</div>

		<!-- Status Badge -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				{#if !hasContent}
					<span
						class="font-handwritten inline-flex items-center px-2 py-0.5 text-xs font-medium"
						style="color: #8a7a60; border: 1px dashed #c4b896; border-radius: 2px;"
					>
						Empty
					</span>
				{:else if completedGoals === totalGoals}
					<span
						class="font-handwritten inline-flex items-center px-2 py-0.5 text-xs font-medium"
						style="color: #3a7a20; border: 1px solid #5a9a40; border-radius: 2px; background: rgba(90, 154, 64, 0.08);"
					>
						✓ Complete
					</span>
				{:else if completedGoals > 0}
					<span
						class="font-handwritten inline-flex items-center px-2 py-0.5 text-xs font-medium"
						style="color: #3a5a9a; border: 1px solid #6a8aba; border-radius: 2px; background: rgba(90, 120, 180, 0.08);"
					>
						In Progress
					</span>
				{:else}
					<span
						class="font-handwritten inline-flex items-center px-2 py-0.5 text-xs font-medium"
						style="color: #8a6a20; border: 1px solid #c4a030; border-radius: 2px; background: rgba(196, 160, 48, 0.08);"
					>
						Not Started
					</span>
				{/if}
			</div>

			<span class="font-handwritten text-xs" style="color: #a89878;">Created {formatDate(board.createdAt)}</span>
		</div>
	</div>
</a>
