<script lang="ts">
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import type { Goal } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		goal: Goal;
		index: number;
	}

	let { goal, index }: Props = $props();
	let title = $state(goal.title);
	let notes = $state(goal.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Auto-save with debounce
	function autoSave() {
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			await currentBoardStore.saveGoal(goal.id, title, notes);
		}, 500);
	}

	// Watch for changes and trigger auto-save
	$effect(() => {
		// Only auto-save if values have changed from the original goal
		if (title !== goal.title || notes !== goal.notes) {
			autoSave();
		}
	});

	async function handleClose() {
		// Save immediately on close
		if (saveTimeout) clearTimeout(saveTimeout);
		await currentBoardStore.saveGoal(goal.id, title, notes);
		uiStore.clearSelection();
	}

	async function toggleComplete() {
		await currentBoardStore.toggleComplete(goal.id);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	// Handle escape key
	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				handleClose();
			}
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<!-- Backdrop (mobile only) -->
<div
	role="button"
	tabindex="-1"
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
	class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
></div>

<!-- Sidebar -->
<div
	class="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col
	transform transition-transform duration-300 ease-in-out
	lg:border-l lg:border-gray-200"
	data-testid="goal-sidebar"
>
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
		<h2 class="text-xl font-bold text-gray-900">Goal Details</h2>
		<button
			onclick={handleClose}
			class="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
			data-testid="close-sidebar-button"
		>
			×
		</button>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-4 space-y-4">
		<!-- Completion Toggle -->
		<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
			<button
				onclick={toggleComplete}
				class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all active:scale-90 {goal.completed
					? 'bg-green-500 border-green-500'
					: 'border-gray-300 hover:border-green-500'}"
				data-testid="sidebar-checkbox"
			>
				{#if goal.completed}
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				{/if}
			</button>
			<span class="text-sm font-medium {goal.completed ? 'text-green-700' : 'text-gray-700'}">
				{goal.completed ? 'Completed' : 'Mark as complete'}
			</span>
		</div>

		<!-- Goal Title -->
		<div>
			<label for="sidebar-goal-title" class="block text-sm font-medium text-gray-700 mb-2">
				Goal Title
			</label>
			<input
				id="sidebar-goal-title"
				type="text"
				bind:value={title}
				placeholder="Enter your goal..."
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				data-testid="sidebar-title-input"
			/>
		</div>

		<!-- Progress Notes -->
		<div class="flex-1 flex flex-col">
			<label for="sidebar-goal-notes" class="block text-sm font-medium text-gray-700 mb-2">
				Progress Notes
			</label>
			<textarea
				id="sidebar-goal-notes"
				bind:value={notes}
				placeholder="Track your progress, milestones, and reflections here..."
				class="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
				data-testid="sidebar-notes-textarea"
			></textarea>
			<p class="text-xs text-gray-500 mt-2">
				Changes are automatically saved
			</p>
		</div>
	</div>
</div>
