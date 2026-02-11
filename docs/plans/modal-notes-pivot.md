# Enhanced Notes Modal Feature - Revised Implementation Plan

**Status:** Ready for Implementation
**Created:** 2026-01-31
**Context:** Pivoting from sidebar to modal based on Google Calendar design pattern

## Table of Contents

1. [Summary of Changes](#summary-of-changes)
2. [What We've Completed (Phases 1-4)](#what-weve-completed-phases-1-4)
3. [Design Changes](#design-changes)
4. [Revised Implementation Plan](#revised-implementation-plan)
5. [Success Criteria](#success-criteria)

---

## Summary of Changes

### From Sidebar to Modal

- **Old approach:** Slide-out sidebar from the right (GoalSidebar.svelte)
- **New approach:** Centered modal overlay (enhanced GoalModal.svelte)
- **Inspiration:** Google Calendar event creation modal

### Why This Change?

1. **Better UX:** Centered modals feel more focused and intentional
2. **More screen real estate:** Can make the modal larger without blocking the board
3. **Familiar pattern:** Users know how to interact with centered modals
4. **Cleaner design:** Matches modern web app conventions
5. **Mobile-friendly:** Easier to make responsive (full-screen on mobile, centered on desktop)

### What Stays the Same

- All data model changes (Phase 2) ✅
- Date auto-population logic (Phase 3) ✅
- RichTextEditor component (Phase 4) ✅
- Milestones functionality (Phase 5-6)
- Auto-save behavior
- All backend/store logic

### What Changes

- UI presentation: sidebar → modal
- Component to update: GoalSidebar.svelte → GoalModal.svelte
- Layout: right-aligned slide-out → centered overlay
- Size: Fixed width (384px) → Responsive (max-w-2xl)

---

## What We've Completed (Phases 1-4)

### ✅ Phase 1: Dependencies & Setup

**Status:** COMPLETE

Installed packages:

- `@tiptap/core`
- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-underline`
- `date-fns`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

### ✅ Phase 2: Data Model Updates

**Status:** COMPLETE

**TypeScript types updated:**

```typescript
export interface Milestone {
	id: string;
	title: string;
	notes: string; // Rich text HTML
	completed: boolean;
	completedAt: string | null; // ISO 8601
	createdAt: string; // ISO 8601
	position: number;
}

export interface Goal {
	id: string;
	title: string;
	notes: string; // NOW: Rich text HTML
	completed: boolean;
	startedAt: string | null; // Auto-set on first edit
	completedAt: string | null; // Auto-set when marked complete
	lastUpdatedAt: string; // Auto-set on any change
	milestones: Milestone[];
}
```

**Database schema:**

- `goals` table: Added `started_at`, `completed_at`, `last_updated_at`
- `milestones` table: Created with all required columns and indexes
- RLS policies: Configured for user access control

### ✅ Phase 3: Date Auto-Population Logic

**Status:** COMPLETE

Implemented in `currentBoard.ts`:

- `startedAt`: Auto-set on first edit
- `completedAt`: Auto-set when marked complete, cleared when unchecked
- `lastUpdatedAt`: Auto-set on any change
- All date fields persist to Supabase

Tests verify:

- Dates set correctly on first edit
- Dates don't change on subsequent edits (startedAt)
- Completion dates toggle correctly
- Parent goal's lastUpdatedAt updates with milestone changes

### ✅ Phase 4: Rich Text Editor Integration

**Status:** COMPLETE

**Created `RichTextEditor.svelte`:**

- TipTap integration with Svelte 5 runes
- Toolbar with: Bold, Italic, Underline, Strikethrough, Headings (H1-H3), Lists, Links
- Auto-cleanup on component destruction
- `onUpdate` callback for parent components
- Placeholder support
- Proper focus handling

**Integrated into GoalSidebar.svelte:**

- Replaced plain textarea with RichTextEditor
- Maintains auto-save behavior (500ms debounce)
- Notes now stored as HTML in database

**Tests:**

- Component renders correctly
- Toolbar buttons work
- Content persists after save/reload
- All formatting options functional

---

## Design Changes

### Google Calendar Modal Pattern

**Key Design Elements:**

1. **Centered overlay:** Modal appears in center of screen with backdrop
2. **Icon-based sections:** Each section has a small icon on the left
3. **Inline editing:** All fields editable directly (no "edit mode" toggle)
4. **Clean header:** Simple title + close button (X) in top-right
5. **Expandable sections:** Milestones can collapse/expand
6. **Action buttons:** Primary (Save) and secondary (Cancel/More options) at bottom
7. **Responsive:** Full-screen on mobile, max-width on desktop

### Adapted Layout for Bingo App

```
┌──────────────────────────────────────────────────────┐
│ Goal Details                                    [×]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ☑  Completed                                         │ ← Completion toggle
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Goal Title                                           │
│ [Write a book...............................] │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 📅 Started: Jan 15, 2026                             │ ← Date metadata
│    Last updated: 2 hours ago                         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 📝 Progress Notes                                    │
│ ┌────────────────────────────────────────────────┐  │
│ │ [B] [I] [U] [S] [H1▾] [•] [1.] [🔗]           │  │ ← Toolbar
│ ├────────────────────────────────────────────────┤  │
│ │                                                │  │
│ │ Completed chapter 1 outline...                 │  │ ← Rich text editor
│ │                                                │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ✓ Milestones (2/4 complete)               [+ Add]   │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ [⋮] ☑ Research topic              [›]          │  │ ← Collapsed
│ │     Completed: Jan 20                          │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ [⋮] ☑ Create outline              [∨]          │  │ ← Expanded
│ │                                                │  │
│ │ Title: [Create outline....................]    │  │
│ │                                                │  │
│ │ Notes (optional)                               │  │
│ │ [Mini rich text editor]                        │  │
│ │                                                │  │
│ │ ☑ Mark milestone complete                     │  │
│ │ Completed: Jan 28, 2026                        │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ [⋮] ☐ Write first draft           [›]          │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ [⋮] ☐ Edit and revise              [›]          │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                        [Cancel] [Save]│
└──────────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (lg and up):**

- Modal: `max-w-2xl` (672px)
- Centered vertically and horizontally
- Backdrop: Semi-transparent black

**Tablet (md to lg):**

- Modal: `max-w-xl` (576px)
- Centered with some padding on sides

**Mobile (sm and below):**

- Modal: Full screen (or near-full with small margin)
- Scrollable content
- Action buttons sticky at bottom

---

## Revised Implementation Plan

### Phase 5: Update GoalModal to Enhanced Design

**What we're doing:**

- Take the existing simple GoalModal.svelte
- Enhance it with all features from GoalSidebar.svelte
- Add sections for milestones (Phase 6) and date metadata (Phase 7)
- Keep the centered modal pattern, just make it more feature-rich

**Task 5.1: Create enhanced GoalModal component**

**TDD approach:**

```typescript
// Test 1: Modal renders centered with backdrop
// Test 2: Close button works (X in top-right)
// Test 3: Escape key closes modal
// Test 4: Backdrop click closes modal
// Test 5: Completion toggle works
// Test 6: Title input auto-focuses
// Test 7: RichTextEditor integrated
// Test 8: Auto-save triggers on change (500ms debounce)
// Test 9: Date metadata displays correctly
```

**Component structure:**

```svelte
<!-- src/lib/components/GoalModal.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { currentBoardStore } from '$lib/stores/currentBoard';
	import { uiStore } from '$lib/stores/board';
	import type { Goal } from '$lib/types';
	import RichTextEditor from './RichTextEditor.svelte';
	import DateMetadata from './DateMetadata.svelte';
	import MilestoneList from './MilestoneList.svelte';

	interface Props {
		goal: Goal;
		index: number;
	}

	let { goal, index }: Props = $props();
	let title = $state(goal.title);
	let notes = $state(goal.notes);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Sync state
	// Auto-save logic
	// Close handlers
	// Escape key handling
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
	onclick={handleBackdropClick}
	role="button"
	tabindex="-1"
>
	<!-- Modal -->
	<div
		class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-gray-200">
			<h2 class="text-xl font-semibold text-gray-900">Goal Details</h2>
			<button onclick={handleClose} class="...">×</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6">
			<!-- Completion Toggle -->
			<div class="flex items-center gap-3">
				<button onclick={toggleComplete} class="...">
					<!-- Checkbox SVG -->
				</button>
				<span>{goal.completed ? 'Completed' : 'Mark as complete'}</span>
			</div>

			<!-- Goal Title -->
			<div>
				<label class="...">Goal Title</label>
				<input bind:value={title} class="..." />
			</div>

			<!-- Date Metadata -->
			<DateMetadata
				startedAt={goal.startedAt}
				completedAt={goal.completedAt}
				lastUpdatedAt={goal.lastUpdatedAt}
			/>

			<!-- Progress Notes -->
			<div>
				<label class="...">📝 Progress Notes</label>
				<RichTextEditor
					content={notes}
					placeholder="Track your progress, milestones, and reflections..."
					onUpdate={(html) => (notes = html)}
				/>
			</div>

			<!-- Milestones -->
			<MilestoneList goalId={goal.id} milestones={goal.milestones} />
		</div>

		<!-- Footer Actions -->
		<div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
			<button onclick={handleClose} class="...">Cancel</button>
			<button onclick={handleSave} class="...">Save</button>
		</div>
	</div>
</div>
```

**Key implementation details:**

- Max width: `max-w-2xl` (responsive)
- Max height: `max-h-[90vh]` (prevents overflow on short screens)
- Scrollable content: Middle section scrolls, header/footer fixed
- Auto-save: Same 500ms debounce as sidebar
- Immediate save: On close (Cancel or X)
- Focus: Auto-focus title input on open

**Task 5.2: Update BingoBoard.svelte**

- Import enhanced `GoalModal` instead of `GoalSidebar`
- Remove `GoalSidebar` import
- Pass goal and index props
- Test that modal opens on goal square click

**Task 5.3: Remove or deprecate GoalSidebar**

- Since we're moving to modal, we can delete `GoalSidebar.svelte`
- Or keep it commented out in case we want to reference it later
- Update imports in any test files

**Estimated time:** 2-3 hours

---

### Phase 6: DateMetadata Component

**Task 6.1: Create DateMetadata component**

**TDD approach:**

```typescript
// Test 1: Renders with all dates
// Test 2: Hides startedAt when null
// Test 3: Hides completedAt when null
// Test 4: Always shows lastUpdatedAt
// Test 5: Formats dates correctly
// Test 6: Uses relative time for lastUpdatedAt
```

**Component structure:**

```svelte
<!-- src/lib/components/DateMetadata.svelte -->
<script lang="ts">
	import { format } from 'date-fns';
	import { formatRelativeTime } from '$lib/utils/dates';

	interface Props {
		startedAt: string | null;
		completedAt: string | null;
		lastUpdatedAt: string;
	}

	let { startedAt, completedAt, lastUpdatedAt }: Props = $props();
</script>

<div class="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
	<span class="text-lg">📅</span>
	<div class="flex-1 space-y-1">
		{#if startedAt}
			<div class="flex justify-between">
				<span>Started:</span>
				<span class="font-medium">{format(new Date(startedAt), 'MMM d, yyyy')}</span>
			</div>
		{/if}

		{#if completedAt}
			<div class="flex justify-between">
				<span>Completed:</span>
				<span class="font-medium text-green-600">
					{format(new Date(completedAt), 'MMM d, yyyy')}
				</span>
			</div>
		{/if}

		<div class="flex justify-between">
			<span>Last updated:</span>
			<span class="font-medium">{formatRelativeTime(lastUpdatedAt)}</span>
		</div>
	</div>
</div>
```

**Task 6.2: Create date formatting utility**

**File:** `src/lib/utils/dates.ts`

```typescript
import { formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const distance = formatDistanceToNow(date, { addSuffix: true });

	// Simplify output: "2 hours ago" → "2h ago"
	return distance
		.replace(/about /g, '')
		.replace(/ minutes?/g, 'm')
		.replace(/ hours?/g, 'h')
		.replace(/ days?/g, 'd')
		.replace(/ weeks?/g, 'w')
		.replace(/ months?/g, 'mo');
}
```

**TDD approach:**

```typescript
// Test: "2 minutes ago" → "2m ago"
// Test: "1 hour ago" → "1h ago"
// Test: "5 days ago" → "5d ago"
// Test: "2 weeks ago" → "2w ago"
// Test: "3 months ago" → "3mo ago"
```

**Task 6.3: Integrate into GoalModal**

- Import DateMetadata component
- Place between title and notes sections
- Pass date props from goal

**Estimated time:** 1-2 hours

---

### Phase 7: Milestones CRUD Operations

**Task 7.1: Add milestone methods to store**

_Note: These may already be partially implemented from earlier work. We'll verify and complete them._

**Store methods needed in `currentBoard.ts`:**

```typescript
addMilestone(goalId: string, title: string): Promise<void>
updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void>
toggleMilestoneComplete(milestoneId: string): Promise<void>
deleteMilestone(milestoneId: string): Promise<void>
reorderMilestones(goalId: string, newOrder: string[]): Promise<void>
```

**TDD approach:**

```typescript
// Test: Add milestone increments position
// Test: Update milestone title persists
// Test: Toggle completion sets/clears completedAt
// Test: Delete milestone removes from array
// Test: Reorder updates all positions
// Test: All operations update parent goal's lastUpdatedAt
```

**Task 7.2: Create MilestoneItem component**

**Component structure:**

```svelte
<!-- src/lib/components/MilestoneItem.svelte -->
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

	// Auto-save logic (500ms debounce)
</script>

{#if expanded}
	<!-- Expanded view -->
	<div class="border border-gray-200 rounded-lg p-4 space-y-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="cursor-move text-gray-400">⋮</span>
				<button onclick={onToggleComplete} class="...">
					<!-- Checkbox -->
				</button>
				<button onclick={onToggle} class="...">∨</button>
			</div>
			<button onclick={onDelete} class="text-red-600 text-sm">Delete</button>
		</div>

		<input
			bind:value={title}
			placeholder="Milestone title..."
			class="w-full px-3 py-2 border rounded"
		/>

		<div>
			<label class="text-sm text-gray-600">Notes (optional)</label>
			<RichTextEditor
				content={notes}
				placeholder="Additional details..."
				onUpdate={(html) => (notes = html)}
			/>
		</div>

		{#if milestone.completedAt}
			<div class="text-sm text-green-600">
				Completed: {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
			</div>
		{/if}
	</div>
{:else}
	<!-- Collapsed view -->
	<div class="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
		<span class="cursor-move text-gray-400">⋮</span>
		<button onclick={onToggleComplete} class="...">
			<!-- Checkbox -->
		</button>
		<span class="flex-1 {milestone.completed ? 'line-through text-gray-500' : ''}">
			{milestone.title}
		</span>
		{#if milestone.completedAt}
			<span class="text-xs text-gray-500">
				{format(new Date(milestone.completedAt), 'MMM d')}
			</span>
		{/if}
		<button onclick={onToggle} class="...">›</button>
	</div>
{/if}
```

**Task 7.3: Create MilestoneList component**

**Component structure:**

```svelte
<!-- src/lib/components/MilestoneList.svelte -->
<script lang="ts">
	import type { Milestone } from '$lib/types';
	import MilestoneItem from './MilestoneItem.svelte';
	import { currentBoardStore } from '$lib/stores/currentBoard';

	interface Props {
		goalId: string;
		milestones: Milestone[];
	}

	let { goalId, milestones }: Props = $props();
	let expandedIds = $state<Set<string>>(new Set());
	let newMilestoneTitle = $state('');
	let showAddInput = $state(false);

	// Derived state
	let completedCount = $derived(milestones.filter((m) => m.completed).length);
	let totalCount = $derived(milestones.length);
	let sortedMilestones = $derived(milestones.sort((a, b) => a.position - b.position));

	async function handleAdd() {
		if (!newMilestoneTitle.trim()) return;
		await currentBoardStore.addMilestone(goalId, newMilestoneTitle);
		newMilestoneTitle = '';
		showAddInput = false;
	}

	async function handleUpdate(milestoneId: string, updates: Partial<Milestone>) {
		await currentBoardStore.updateMilestone(milestoneId, updates);
	}

	async function handleDelete(milestoneId: string) {
		await currentBoardStore.deleteMilestone(milestoneId);
	}

	async function handleToggleComplete(milestoneId: string) {
		await currentBoardStore.toggleMilestoneComplete(milestoneId);
	}

	function toggleExpand(milestoneId: string) {
		if (expandedIds.has(milestoneId)) {
			expandedIds.delete(milestoneId);
		} else {
			expandedIds.add(milestoneId);
		}
		expandedIds = new Set(expandedIds); // Trigger reactivity
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
			class="text-sm text-blue-600 hover:text-blue-700"
		>
			+ Add
		</button>
	</div>

	{#if showAddInput}
		<div class="flex gap-2">
			<input
				bind:value={newMilestoneTitle}
				placeholder="New milestone..."
				class="flex-1 px-3 py-2 border rounded"
				onkeydown={(e) => e.key === 'Enter' && handleAdd()}
			/>
			<button onclick={handleAdd} class="px-3 py-2 bg-blue-500 text-white rounded"> Add </button>
			<button onclick={() => (showAddInput = false)} class="px-3 py-2 text-gray-600">
				Cancel
			</button>
		</div>
	{/if}

	<div class="space-y-2">
		{#each sortedMilestones as milestone (milestone.id)}
			<MilestoneItem
				{milestone}
				expanded={expandedIds.has(milestone.id)}
				onToggle={() => toggleExpand(milestone.id)}
				onUpdate={(updates) => handleUpdate(milestone.id, updates)}
				onDelete={() => handleDelete(milestone.id)}
				onToggleComplete={() => handleToggleComplete(milestone.id)}
			/>
		{/each}
	</div>

	{#if milestones.length === 0}
		<p class="text-sm text-gray-500 text-center py-4">
			No milestones yet. Click "+ Add" to create one.
		</p>
	{/if}
</div>
```

**Task 7.4: Integrate into GoalModal**

- Import MilestoneList
- Add below Progress Notes section
- Pass goalId and milestones array
- Test full CRUD workflow

**Estimated time:** 4-5 hours

---

### Phase 8: Milestone Drag-and-Drop Reordering

**Task 8.1: Add drag functionality to MilestoneList**

**Implementation:**

```svelte
<script lang="ts">
	import { DndContext, closestCenter } from '@dnd-kit/core';
	import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
	import { useSortable } from '@dnd-kit/sortable';

	// ... existing props ...

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = sortedMilestones.findIndex((m) => m.id === active.id);
		const newIndex = sortedMilestones.findIndex((m) => m.id === over.id);

		// Create new order
		const reordered = [...sortedMilestones];
		const [moved] = reordered.splice(oldIndex, 1);
		reordered.splice(newIndex, 0, moved);

		// Update positions
		const newOrder = reordered.map((m) => m.id);
		await currentBoardStore.reorderMilestones(goalId, newOrder);
	}
</script>

<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
	<SortableContext items={sortedMilestones.map((m) => m.id)} strategy={verticalListSortingStrategy}>
		{#each sortedMilestones as milestone (milestone.id)}
			<MilestoneItem ... />
		{/each}
	</SortableContext>
</DndContext>
```

**Task 8.2: Add drag handle to MilestoneItem**

- Import `useSortable` hook
- Wire up drag listeners to the `⋮` icon
- Add visual feedback (cursor change, opacity)

**Task 8.3: Implement reorderMilestones in store**

**Logic:**

```typescript
async reorderMilestones(goalId: string, newOrder: string[]): Promise<void> {
  const goal = this.getCurrentGoal(goalId);
  if (!goal) return;

  // Update positions
  const updatedMilestones = newOrder.map((id, index) => {
    const milestone = goal.milestones.find(m => m.id === id);
    return { ...milestone, position: index };
  });

  // Update goal
  await this.updateGoal(goalId, {
    milestones: updatedMilestones,
    lastUpdatedAt: new Date().toISOString()
  });

  // Persist to Supabase
  await this.saveMilestonesToDatabase(goalId, updatedMilestones);
}
```

**TDD approach:**

```typescript
// Test: Milestones render in position order
// Test: Dragging updates positions correctly
// Test: New positions persist to database
// Test: Parent goal's lastUpdatedAt updates
```

**Estimated time:** 2-3 hours

---

### Phase 9: Last Updated Display in Goal Squares

**Task 9.1: Update GoalSquare component**

**Changes:**

```svelte
<!-- src/lib/components/GoalSquare.svelte -->
<script lang="ts">
	import { formatRelativeTime } from '$lib/utils/dates';

	// ... existing props ...

	interface Props {
		goal: Goal;
		index: number;
		boardSize: number; // NEW: pass from BingoBoard
		onSelect: () => void;
	}

	let { goal, index, boardSize, onSelect }: Props = $props();

	let lastUpdatedText = $derived(
		goal.lastUpdatedAt ? formatRelativeTime(goal.lastUpdatedAt) : null
	);

	let timeTextSize = $derived(
		boardSize === 3 ? 'text-[10px]' : boardSize === 4 ? 'text-[10px]' : 'text-[8px]'
	);
</script>

<!-- ... existing goal square markup ... -->

<!-- In the bottom section with checkbox and 📝 -->
<div class="flex items-center justify-between mt-1 sm:mt-2">
	<button ...><!-- checkbox --></button>

	{#if goal.notes}
		<span class="flex items-center gap-1 text-gray-500 {timeTextSize}">
			<span>📝</span>
			{#if lastUpdatedText}
				<span>{lastUpdatedText}</span>
			{/if}
		</span>
	{/if}
</div>
```

**Task 9.2: Update BingoBoard to pass board size**

```svelte
<GoalSquare
	{goal}
	index={i}
	boardSize={$currentBoard.size}
	onSelect={() => uiStore.selectGoal(i)}
/>
```

**TDD approach:**

```typescript
// Test: Last updated shows when notes exist
// Test: Last updated hidden when no notes
// Test: Text size changes based on board size
// Test: Relative time formats correctly
```

**Estimated time:** 1 hour

---

### Phase 10: Integration, Testing & Polish

**Task 10.1: End-to-end testing**

**Test scenarios:**

1. Click goal square → Modal opens centered
2. Edit title → Auto-save triggers → Close modal → Reopen → Title persisted
3. Format text in notes → Save → Reload page → Formatting intact
4. Add milestone → Expand → Edit → Save → Reopen modal → Milestone persisted
5. Reorder milestones → Close modal → Reopen → Order maintained
6. Mark milestone complete → CompletedAt date shows
7. Mark goal complete → CompletedAt shows in metadata
8. Wait 5 minutes → Last updated shows "5m ago" in goal square

**Task 10.2: Responsive design testing**

**Test on:**

- Mobile (375px): Full-screen modal, readable text
- Tablet (768px): Centered modal with padding
- Desktop (1920px): Max-width respected

**Verify:**

- Modal doesn't overflow screen
- Toolbar wraps nicely on narrow screens
- Milestone items stack properly
- Action buttons accessible

**Task 10.3: Accessibility audit**

**Checklist:**

- [ ] Modal has proper `role="dialog"` and `aria-labelledby`
- [ ] Focus trapped within modal when open
- [ ] Escape key closes modal
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces milestone count
- [ ] Date metadata readable by screen readers

**Task 10.4: Performance check**

**Verify:**

- Auto-save debounce working (500ms)
- No lag when typing in rich text editor
- Large number of milestones (20+) doesn't slow down UI
- No memory leaks from editor instances

**Task 10.5: Error handling**

**Add proper handling for:**

- Supabase save failures → Show error alert
- Milestone reorder conflicts → Retry logic
- Rich text editor initialization failures → Graceful fallback

**Task 10.6: Clean up**

**Tasks:**

- Remove GoalSidebar.svelte (or comment it out)
- Update test files that reference GoalSidebar
- Update documentation (CLAUDE.md, README.md)
- Add JSDoc comments to new methods
- Verify no console errors/warnings

**Estimated time:** 3-4 hours

---

## Success Criteria

### Functional Requirements

✅ Modal opens centered when goal square clicked
✅ All fields editable inline (title, notes, milestones)
✅ Rich text editor with full formatting support
✅ Date metadata displays correctly (started, completed, last updated)
✅ Milestones can be added, edited, deleted, and reordered
✅ Auto-save works with 500ms debounce
✅ Last updated time shows in goal squares
✅ All data persists to Supabase

### Non-Functional Requirements

✅ Modal responsive (full-screen on mobile, centered on desktop)
✅ No lag when typing in rich text editor
✅ Drag-drop feels smooth
✅ Keyboard navigation works (Tab, Enter, Escape)
✅ Screen readers can access all features
✅ No console errors or warnings
✅ TypeScript compilation passes

### User Experience

✅ Modal design feels modern and clean (Google Calendar-inspired)
✅ Inline editing feels natural
✅ Milestones collapsed by default (clean interface)
✅ Progress counter motivates completion
✅ Date metadata helps identify stale goals
✅ Auto-save provides confidence

---

## Migration Notes

### Deprecating GoalSidebar

Since we're moving from sidebar to modal:

1. **GoalSidebar.svelte** can be deleted (or kept as reference)
2. **BingoBoard.svelte** needs import updated from `GoalSidebar` to `GoalModal`
3. **Tests** that reference sidebar need updating
4. **Existing data** will work as-is (no data migration needed)

### What Gets Reused

From the sidebar implementation:

- ✅ RichTextEditor component (already built)
- ✅ Auto-save logic (copy from sidebar)
- ✅ Date auto-population (already in store)
- ✅ Store methods (already implemented)

We're just changing the **presentation layer**, not the underlying logic.

---

## Timeline Estimate

| Phase     | Description             | Estimated Time  |
| --------- | ----------------------- | --------------- |
| Phase 5   | Enhanced GoalModal      | 2-3 hours       |
| Phase 6   | DateMetadata component  | 1-2 hours       |
| Phase 7   | Milestones CRUD         | 4-5 hours       |
| Phase 8   | Drag-and-drop           | 2-3 hours       |
| Phase 9   | Last updated in squares | 1 hour          |
| Phase 10  | Integration & polish    | 3-4 hours       |
| **Total** |                         | **13-18 hours** |

---

## Next Steps

1. Review this plan with Cuong
2. Start with Phase 5 (Enhanced GoalModal)
3. Test each phase before moving to next
4. Use TDD throughout
5. Commit frequently

---

**End of Revised Plan**
