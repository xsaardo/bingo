<script lang="ts">
	import type { Milestone } from '$lib/types';
	import RichTextEditor from './RichTextEditor.svelte';
	import { format } from 'date-fns';

	interface Props {
		milestone: Milestone;
		expanded: boolean;
		onToggle: () => void;
		onUpdate: (updates: Partial<Milestone>) => void;
		onDelete: () => void;
		onToggleComplete: () => void;
	}

	let { milestone, expanded, onToggle, onUpdate, onDelete, onToggleComplete }: Props = $props();

	let title = $state(milestone.title);
	let notes = $state(milestone.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Sync state with milestone prop
	$effect(() => {
		title = milestone.title;
		notes = milestone.notes;
	});

	// Auto-save with debounce
	function autoSave() {
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(() => {
			const updates: Partial<Milestone> = {};
			if (title !== milestone.title) updates.title = title;
			if (notes !== milestone.notes) updates.notes = notes;

			if (Object.keys(updates).length > 0) {
				onUpdate(updates);
			}
		}, 500);
	}

	// Watch for changes and trigger auto-save
	$effect(() => {
		if (title !== milestone.title || notes !== milestone.notes) {
			autoSave();
		}
	});
</script>

{#if expanded}
	<!-- Expanded view -->
	<div data-testid="milestone-item" class="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
		<div class="flex items-center justify-between cursor-pointer" onclick={onToggle}>
			<div class="flex items-center gap-2">
				<span
					onclick={(e) => e.stopPropagation()}
					class="cursor-move text-gray-400 select-none"
					data-drag-handle
					>⋮</span
				>
				<button
					onclick={(e) => {
						e.stopPropagation();
						onToggleComplete();
					}}
					class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all active:scale-90"
					class:bg-green-500={milestone.completed}
					class:border-green-500={milestone.completed}
					class:border-gray-300={!milestone.completed}
					class:hover:border-green-500={!milestone.completed}
					data-testid="milestone-checkbox"
				>
					{#if milestone.completed}
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
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
		<span
			onclick={(e) => e.stopPropagation()}
			class="cursor-move text-gray-400 select-none"
			data-drag-handle
			>⋮</span
		>
		<button
			onclick={(e) => {
				e.stopPropagation();
				onToggleComplete();
			}}
			class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all active:scale-90 {milestone.completed
				? 'bg-green-500 border-green-500'
				: 'border-gray-300 hover:border-green-500'}"
			data-testid="milestone-checkbox"
		>
			{#if milestone.completed}
				<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
				</svg>
			{/if}
		</button>
		<span class="flex-1 text-sm {milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
			{milestone.title}
		</span>
		{#if milestone.completedAt}
			<span class="text-xs text-gray-500">
				{format(new Date(milestone.completedAt), 'MMM d')}
			</span>
		{/if}
	</div>
{/if}
