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

<a
	href="/boards/{board.id}"
	class="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden group"
>
	<!-- Header -->
	<div class="p-4 border-b border-gray-100">
		<div class="flex items-start justify-between">
			<div class="flex-1 min-w-0">
				<h3
					class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors"
				>
					{board.name}
				</h3>
				<p class="text-sm text-gray-500 mt-1">
					{board.size}×{board.size} grid • {totalGoals} goals
				</p>
			</div>

			<!-- Delete Button -->
			{#if onDelete}
				<button
					onclick={handleDeleteClick}
					class="flex-shrink-0 ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
					title="Delete board"
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
	<div class="p-4">
		<!-- Progress Bar -->
		<div class="mb-3">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-medium text-gray-700">Progress</span>
				<span class="text-sm font-semibold text-blue-600">{completionPercentage}%</span>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
				<div
					class="bg-blue-600 h-2 rounded-full transition-all duration-300"
					style="width: {completionPercentage}%"
				></div>
			</div>
			<p class="text-xs text-gray-500 mt-1">
				{completedGoals} of {totalGoals} goals completed
			</p>
		</div>

		<!-- Status Badge -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				{#if !hasContent}
					<span
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
					>
						<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						Empty
					</span>
				{:else if completedGoals === totalGoals}
					<span
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
					>
						<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Complete
					</span>
				{:else if completedGoals > 0}
					<span
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
					>
						<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						In Progress
					</span>
				{:else}
					<span
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
					>
						<svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Not Started
					</span>
				{/if}
			</div>

			<span class="text-xs text-gray-400">{formatDate(board.createdAt)}</span>
		</div>
	</div>

	<!-- Footer - View Board -->
	<div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
		<div class="flex items-center justify-between text-sm">
			<span class="text-blue-600 font-medium group-hover:text-blue-700">View board</span>
			<svg
				class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</div>
	</div>
</a>
