<script lang="ts">
	import type { Milestone } from '$lib/types';
	import RichTextEditor from './RichTextEditor.svelte';
	import CheckboxButton from './CheckboxButton.svelte';
	import DragHandle from './DragHandle.svelte';
	import { format } from 'date-fns';
	import { onDestroy } from 'svelte';

	interface Props {
		milestone: Milestone;
		expanded: boolean;
		onToggle: () => void;
		onUpdate: (updates: Partial<Milestone>) => void;
		onDelete: () => void;
		onToggleComplete: () => void;
	}

	let { milestone, expanded, onToggle, onUpdate, onDelete, onToggleComplete }: Props = $props();

	const AUTO_SAVE_DELAY_MS = 500;

	let title = $state(milestone.title);
	let notes = $state(milestone.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Sync state with milestone prop when it changes externally
	// Don't sync if user is actively editing (saveTimeout pending)
	$effect(() => {
		if (!saveTimeout) {
			title = milestone.title;
			notes = milestone.notes;
		}
	});

	// Auto-save with debounce when user makes changes
	function autoSave() {
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(() => {
			const updates: Partial<Milestone> = {};
			if (title !== milestone.title) updates.title = title;
			if (notes !== milestone.notes) updates.notes = notes;

			if (Object.keys(updates).length > 0) {
				onUpdate(updates);
			}

			// Clear timeout after save completes to allow prop sync
			saveTimeout = null;
		}, AUTO_SAVE_DELAY_MS);
	}

	// Watch for changes and trigger auto-save
	$effect(() => {
		if (title !== milestone.title || notes !== milestone.notes) {
			autoSave();
		}
	});

	// Cleanup timeout on component destroy
	onDestroy(() => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}
	});
</script>

{#if expanded}
	<!-- Expanded view -->
	<div data-testid="milestone-item" class="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
		<div class="flex items-center justify-between cursor-pointer" onclick={onToggle}>
			<div class="flex items-center gap-2">
				<DragHandle onclick={(e) => e.stopPropagation()} />
				<CheckboxButton
					checked={milestone.completed}
					onclick={(e) => {
						e.stopPropagation();
						onToggleComplete();
					}}
					testid="milestone-checkbox"
				/>
			</div>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				class="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
			>
				Delete
			</button>
		</div>

		<input
			bind:value={title}
			placeholder="Milestone title..."
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
		/>

		<div>
			<label class="block text-xs text-gray-600 mb-1">Notes (optional)</label>
			<RichTextEditor
				content={notes}
				placeholder="Additional details..."
				onUpdate={(html) => {
					notes = html;
				}}
			/>
		</div>

		{#if milestone.completedAt}
			<div class="text-sm text-green-600 font-medium">
				Completed: {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
			</div>
		{/if}
	</div>
{:else}
	<!-- Collapsed view -->
	<div
		data-testid="milestone-item"
		onclick={onToggle}
		class="border border-gray-200 rounded-lg p-3 flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
	>
		<DragHandle onclick={(e) => e.stopPropagation()} />
		<CheckboxButton
			checked={milestone.completed}
			onclick={(e) => {
				e.stopPropagation();
				onToggleComplete();
			}}
			testid="milestone-checkbox"
		/>
		<span
			class="flex-1 text-sm"
			class:line-through={milestone.completed}
			class:text-gray-500={milestone.completed}
			class:text-gray-900={!milestone.completed}
		>
			{milestone.title}
		</span>
		{#if milestone.completedAt}
			<span class="text-xs text-gray-500">
				{format(new Date(milestone.completedAt), 'MMM d')}
			</span>
		{/if}
	</div>
{/if}
