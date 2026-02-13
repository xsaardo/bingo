<!-- ABOUTME: Renders a goal's milestones with add, delete, and drag-to-reorder -->
<!-- ABOUTME: Shows completion progress count and manages expand/collapse state -->

<script lang="ts">
	import type { Milestone } from '$lib/types';
	import MilestoneItem from './MilestoneItem.svelte';
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	interface Props {
		goalId: string;
		milestones: Milestone[];
	}

	let { goalId, milestones }: Props = $props();

	let expandedIds = $state<Set<string>>(new Set());
	let newMilestoneTitle = $state('');
	let showAddInput = $state(false);
	let items = $state<Milestone[]>([]);

	// Derived state
	let completedCount = $derived(milestones.filter((m) => m.completed).length);
	let totalCount = $derived(milestones.length);

	// Sync items with milestones prop, sorted by position
	$effect(() => {
		items = [...milestones].sort((a, b) => a.position - b.position);
	});

	async function handleAdd() {
		if (!newMilestoneTitle.trim()) return;

		const result = await currentBoardStore.addMilestone(goalId, newMilestoneTitle);
		if (!result.success) {
			console.error('Failed to add milestone:', result.error);
			alert(`Failed to add milestone: ${result.error}`);
			return;
		}
		newMilestoneTitle = '';
		showAddInput = false;
	}

	async function handleUpdate(milestoneId: string, updates: Partial<Milestone>) {
		await currentBoardStore.updateMilestone(goalId, milestoneId, updates);
	}

	async function handleDelete(milestoneId: string) {
		await currentBoardStore.deleteMilestone(goalId, milestoneId);
		// Remove from expanded set if it was expanded
		expandedIds.delete(milestoneId);
		expandedIds = new Set(expandedIds);
	}

	async function handleToggleComplete(milestoneId: string) {
		await currentBoardStore.toggleMilestoneComplete(goalId, milestoneId);
	}

	function toggleExpand(milestoneId: string) {
		if (expandedIds.has(milestoneId)) {
			expandedIds.delete(milestoneId);
		} else {
			expandedIds.add(milestoneId);
		}
		expandedIds = new Set(expandedIds); // Trigger reactivity
	}

	function handleConsider(e: CustomEvent<{ items: Milestone[]; info: { source: string } }>) {
		items = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent<{ items: Milestone[]; info: { source: string } }>) {
		items = e.detail.items;

		const newOrder = items.map((m) => m.id);
		await currentBoardStore.reorderMilestones(goalId, newOrder);
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-gray-700 flex items-center gap-2">
			<span>✓</span>
			Milestones ({completedCount}/{totalCount} complete)
		</h3>
		<button
			onclick={() => (showAddInput = !showAddInput)}
			class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
		>
			+ Add
		</button>
	</div>

	{#if showAddInput}
		<div class="flex gap-2">
			<input
				bind:value={newMilestoneTitle}
				placeholder="New milestone..."
				class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
				onkeydown={(e) => e.key === 'Enter' && handleAdd()}
			/>
			<button
				onclick={handleAdd}
				class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
			>
				Add
			</button>
			<button
				onclick={() => (showAddInput = false)}
				class="px-3 py-2 text-gray-600 hover:text-gray-700 transition-colors text-sm"
			>
				Cancel
			</button>
		</div>
	{/if}

	<div
		class="space-y-2"
		use:dndzone={{ items, flipDurationMs: 200, dropTargetStyle: {} }}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
	>
		{#each items as milestone (milestone.id)}
			<div animate:flip={{ duration: 200 }}>
				<MilestoneItem
					{milestone}
					expanded={expandedIds.has(milestone.id)}
					onToggle={() => toggleExpand(milestone.id)}
					onUpdate={(updates) => handleUpdate(milestone.id, updates)}
					onDelete={() => handleDelete(milestone.id)}
					onToggleComplete={() => handleToggleComplete(milestone.id)}
				/>
			</div>
		{/each}
	</div>

	{#if milestones.length === 0}
		<p class="text-sm text-gray-500 text-center py-4">
			No milestones yet. Click "+ Add" to create one.
		</p>
	{/if}
</div>
