<!-- ABOUTME: Modal dialog for viewing and editing a single goal -->
<!-- ABOUTME: Shows title and completion toggle by default; signed-in users can expand for notes and milestones -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale, slide } from 'svelte/transition';
	import { currentBoardStore, currentBoard } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import { currentUser } from '$lib/stores/auth';
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

	let title = $state(goal.title);
	let notes = $state(goal.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let titleInput: HTMLInputElement;
	let isExpanded = $state(false);

	// Check if user is anonymous
	const isAnonymous = $derived($currentUser?.is_anonymous === true);

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

	async function handleSave() {
		if (saveTimeout) clearTimeout(saveTimeout);
		await currentBoardStore.saveGoal(goal.id, title, notes);
	}

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
	in:fade={{ duration: 150 }}
	class="fixed inset-0 flex items-center justify-center z-50 p-4"
	style="background-color: rgba(0, 0, 0, 0.3);"
>
	<!-- Modal -->
	<div
		role="dialog"
		aria-label="Edit goal"
		tabindex="0"
		in:scale={{ duration: 200, start: 0.95 }}
		class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		data-testid="goal-modal"
	>
		<!-- Header -->
		<div class="flex items-center justify-end px-6 pt-3 pb-1">
			<button
				onclick={handleClose}
				class="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
				data-testid="close-modal-button"
			>
				×
			</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-scroll px-6 pt-2 pb-2 space-y-3">
			<!-- Title + Completion Toggle inline -->
			<div class="flex items-center gap-3">
				<button
					onclick={toggleComplete}
					class="shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all active:scale-90 {goal.completed
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
				<input
					bind:this={titleInput}
					id="modal-goal-title"
					type="text"
					bind:value={title}
					placeholder="Enter your goal..."
					class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
					data-testid="modal-title-input"
				/>
			</div>

			<!-- Expanded section -->
			{#if isExpanded}
				<div transition:slide={{ duration: 200 }} class="space-y-3">
					{#if isAnonymous}
						<!-- Sign-in prompt for anonymous users -->
						<div
							data-testid="sign-in-for-details"
							class="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50"
						>
							<p class="text-gray-600 text-sm mb-3">Sign in to add notes and milestones to your goals</p>
							<a
								href="/auth/login"
								class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
							>
								Sign in
							</a>
						</div>
					{:else}
						<!-- Date Metadata -->
						<DateMetadata
							startedAt={goal.startedAt}
							completedAt={goal.completedAt}
							lastUpdatedAt={goal.lastUpdatedAt}
						/>

						<!-- Progress Notes -->
						<div class="flex-1 flex flex-col" data-testid="goal-notes-section">
							<div class="block text-sm font-medium text-gray-700 mb-2">📝 Progress Notes</div>
							<RichTextEditor
								content={notes}
								placeholder="Track your progress, milestones, and reflections here..."
								onUpdate={(html) => {
									notes = html;
								}}
							/>
						</div>

						<!-- Milestones -->
						<div data-testid="goal-milestones-section">
							<MilestoneList goalId={goal.id} milestones={goal.milestones} />
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-end gap-2 px-6 pt-1 pb-3">
			<button
				onclick={() => (isExpanded = !isExpanded)}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
				data-testid="expand-modal-button"
			>
				More options
			</button>
			<button
				onclick={handleSave}
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
				data-testid="save-goal-button"
			>
				Save
			</button>
		</div>
	</div>
</div>
