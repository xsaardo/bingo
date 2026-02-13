<script lang="ts">
	import { onMount } from 'svelte';
	import { currentBoardStore, currentBoard } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import type { Goal } from '$lib/types';
	import RichTextEditor from './RichTextEditor.svelte';
	import DateMetadata from './DateMetadata.svelte';
	import MilestoneList from './MilestoneList.svelte';

	interface Props {
		goal: Goal;
		index: number;
	}

	let { goal: initialGoal }: Props = $props();

	// Get reactive goal from store instead of relying only on prop
	let goal = $derived(
		$currentBoard?.goals.find(g => g.id === initialGoal.id) || initialGoal
	);

	// svelte-ignore state_referenced_locally — initial values synced via $effect below
	let title = $state(initialGoal.title);
	// svelte-ignore state_referenced_locally
	let notes = $state(initialGoal.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let titleInput: HTMLInputElement;

	// Sync local state with goal (from store)
	$effect(() => {
		title = goal.title;
		notes = goal.notes;
	});

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
		// Save immediately on close only if there are changes
		if (saveTimeout) clearTimeout(saveTimeout);

		// Only save if title or notes have changed
		if (title !== goal.title || notes !== goal.notes) {
			await currentBoardStore.saveGoal(goal.id, title, notes);
		}

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

		// Auto-focus the title input when modal opens
		titleInput?.focus();

		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<!-- Backdrop -->
<div
	role="button"
	tabindex="-1"
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && handleClose()}
	class="fixed inset-0 flex items-center justify-center z-50 p-4"
	style="background-color: rgba(0, 0, 0, 0.3);"
>
	<!-- Modal -->
	<div
		role="dialog"
		aria-labelledby="modal-title"
		tabindex="0"
		class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		data-testid="goal-modal"
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-gray-200">
			<h2 id="modal-title" class="text-xl font-semibold text-gray-900">Goal Details</h2>
			<button
				onclick={handleClose}
				class="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
				data-testid="close-modal-button"
			>
				×
			</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6">
			<!-- Completion Toggle -->
			<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
				<button
					onclick={toggleComplete}
					class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all active:scale-90 {goal.completed
						? 'bg-green-500 border-green-500'
						: 'border-gray-300 hover:border-green-500'}"
					data-testid="modal-checkbox"
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
				<label for="modal-goal-title" class="block text-sm font-medium text-gray-700 mb-2">
					Goal Title
				</label>
				<input
					bind:this={titleInput}
					id="modal-goal-title"
					type="text"
					bind:value={title}
					placeholder="Enter your goal..."
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
					data-testid="modal-title-input"
				/>
			</div>

			<!-- Date Metadata -->
			<DateMetadata
				startedAt={goal.startedAt}
				completedAt={goal.completedAt}
				lastUpdatedAt={goal.lastUpdatedAt}
			/>

			<!-- Progress Notes -->
			<div class="flex-1 flex flex-col">
				<div class="block text-sm font-medium text-gray-700 mb-2">📝 Progress Notes</div>
				<RichTextEditor
					content={notes}
					placeholder="Track your progress, milestones, and reflections here..."
					onUpdate={(html) => {
						notes = html;
					}}
				/>
				<p class="text-xs text-gray-500 mt-2">Changes are automatically saved</p>
			</div>

			<!-- Milestones -->
			<MilestoneList goalId={goal.id} milestones={goal.milestones} />
		</div>
	</div>
</div>
