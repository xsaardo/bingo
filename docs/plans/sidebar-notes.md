# Enhanced Notes Sidebar Feature - Design & Implementation Plan

**Status:** Design Complete, Awaiting Implementation
**Created:** 2026-01-28
**Last Updated:** 2026-01-28

## Table of Contents
1. [Overview](#overview)
2. [Design Decisions](#design-decisions)
3. [Data Model Changes](#data-model-changes)
4. [UI/UX Design](#uiux-design)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Success Criteria](#success-criteria)

---

## Overview

### Current State
The notes sidebar currently provides basic functionality:
- Plain text title and notes editing
- Simple completion toggle
- Auto-save with 500ms debounce
- Mobile-responsive slide-out design
- 📝 emoji indicator in goal square when notes exist

### Goals
Enhance the notes sidebar to support:
1. **Rich text editing** with formatting capabilities
2. **Milestone tracking** with sub-tasks and progress monitoring
3. **Date metadata** for tracking progress over time
4. **Last updated indicators** to identify stale goals

### Non-Goals
- Code block support in rich text editor
- Note migration (app not yet public)
- Color-coded staleness indicators (keeping it simple for now)

---

## Design Decisions

### 1. Rich Text Editor
**Decision:** Use TipTap library

**Rationale:**
- Modern, extensible architecture
- Good Svelte support
- Active development and community
- Lightweight compared to alternatives (Lexical)
- More flexible than Quill

**Features to include:**
- ✅ Bold, Italic, Underline, Strikethrough
- ✅ Headings (H1, H2, H3)
- ✅ Bullet lists and numbered lists
- ✅ Hyperlinks
- ❌ Code blocks (not needed for goal tracking)

### 2. Date Format
**Decision:** Use ISO 8601 strings

**Rationale:**
- Supabase stores `timestamptz` and returns ISO strings
- Clean JSON serialization
- Consistent with existing `createdAt`/`updatedAt` fields
- Works well with `date-fns` for formatting
- No conversion overhead when persisting to database

### 3. Milestone Structure
**Decision:** Full-featured milestone objects with ordering

**Features:**
- Each milestone can have title, rich text notes, completion status
- Individual completion dates
- User-controlled ordering via drag-and-drop
- Progress tracking (X/Y milestones complete)

**Rationale:**
- Provides flexibility for complex goals
- Mirrors main goal structure for consistency
- Supports different planning styles (some users want detailed milestones)

### 4. Date Auto-Population
**Decision:** Automatic date tracking

**Behavior:**
- `startedAt`: Auto-set on first edit (title or notes)
- `completedAt`: Auto-set when marked complete, cleared when unchecked
- `lastUpdatedAt`: Auto-set on any change to goal or milestones

**Rationale:**
- Reduces manual data entry
- Ensures accurate tracking
- Helps identify stale goals automatically

### 5. UI Layout
**Decision:** Inline editing with collapsed milestones

**Rationale:**
- Keeps sidebar focused and uncluttered
- Reduces cognitive load (show details on demand)
- Inline editing is faster than modal workflows
- Consistent with modern UI patterns

---

## Data Model Changes

### Updated TypeScript Interfaces

```typescript
// src/lib/types.ts

export interface Milestone {
  id: string;
  title: string;
  notes: string;              // Rich text HTML from TipTap
  completed: boolean;
  completedAt: string | null; // ISO 8601 string
  createdAt: string;          // ISO 8601 string
  position: number;           // 0-indexed for ordering
}

export interface Goal {
  id: string;
  title: string;
  notes: string;              // NOW: Rich text HTML (was plain text)
  completed: boolean;

  // NEW: Date metadata
  startedAt: string | null;   // Auto-set on first edit
  completedAt: string | null; // Auto-set when marked complete
  lastUpdatedAt: string;      // Auto-set on any change

  // NEW: Milestones
  milestones: Milestone[];    // Array of milestone objects
}

// Board interface remains unchanged
export interface Board {
  id: string;
  name: string;
  size: number;
  goals: Goal[];
  createdAt: string;
  updatedAt: string;
}

export type BoardSize = 3 | 4 | 5;
```

### Database Schema Changes

**Goals table updates:**
```sql
ALTER TABLE goals
ADD COLUMN started_at TIMESTAMPTZ,
ADD COLUMN completed_at TIMESTAMPTZ,
ADD COLUMN last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```

**New Milestones table:**
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  position INTEGER NOT NULL,
  CONSTRAINT positive_position CHECK (position >= 0)
);

CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_position ON milestones(goal_id, position);
```

### Migration Notes
- **No data migration needed** - app not yet publicly available
- Existing `notes` field will start accepting HTML
- New goals will have all date fields populated
- Existing goals will have `NULL` for `startedAt` until first edit

---

## UI/UX Design

### Sidebar Layout

```
┌─────────────────────────────────────────┐
│ Header: "Goal Details"            [×]   │ ← Close button
├─────────────────────────────────────────┤
│                                         │
│ ✅ Completion Toggle                     │
│ "Completed" / "Mark as complete"        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Goal Title                              │
│ [Input field.........................] │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Metadata Summary (read-only)            │
│ Started: Jan 15, 2026                   │
│ Completed: Jan 28, 2026 (if completed)  │
│ Last updated: 2 hours ago               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Progress Notes                          │
│ ┌─────────────────────────────────────┐ │
│ │ [B] [I] [U] [S] [H1▾] [•] [1.] [🔗] │ │ ← Toolbar
│ ├─────────────────────────────────────┤ │
│ │                                     │ │
│ │ Rich text editor content...         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Milestones (3/5 complete)      [+ Add]  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [⋮] ☐ Research options        [›]  │ │ ← Collapsed
│ │     📅 Due: Jan 30                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [⋮] ☑ Initial planning         [∨]  │ │ ← Expanded
│ │     [Delete]                        │ │
│ │                                     │ │
│ │ Title: [Initial planning........]   │ │
│ │                                     │ │
│ │ Notes (optional)                    │ │
│ │ [Mini TipTap editor]                │ │
│ │                                     │ │
│ │ Target Date (optional)              │ │
│ │ [📅 Jan 30, 2026]                   │ │
│ │                                     │ │
│ │ ☑ Mark milestone complete           │ │
│ │ Completed: Jan 28, 2026             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [⋮] ☐ Execute plan             [›]  │ │
│ │     📅 Due: Feb 15                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Goal Square Updates

**Before (current):**
```
┌─────────────────┐
│                 │
│  Finish docs    │
│                 │
│                 │
│ [✓] 📝          │
└─────────────────┘
```

**After (with last updated):**
```
┌─────────────────┐
│                 │
│  Finish docs    │
│                 │
│                 │
│ [✓] 📝 3d ago   │
└─────────────────┘
```

**Text sizing (responsive):**
- 3×3 board: `text-[9px]` or `text-[10px]`
- 4×4 board: `text-[10px]`
- 5×5 board: `text-[8px]`

**Time format examples:**
- `2m ago` - less than 1 hour
- `3h ago` - less than 24 hours
- `5d ago` - less than 7 days
- `2w ago` - less than 30 days
- `3mo ago` - 30+ days

### Component Breakdown

**New components to create:**
1. `RichTextEditor.svelte` - TipTap wrapper with toolbar
2. `MilestoneItem.svelte` - Individual milestone with collapse/expand
3. `MilestoneList.svelte` - Container with drag-drop support
4. `DateMetadata.svelte` - Read-only date display section

**Components to update:**
1. `GoalSidebar.svelte` - Add new sections, replace textarea
2. `GoalSquare.svelte` - Add last updated display
3. `currentBoard.ts` - Add milestone CRUD methods, date logic

---

## Implementation Plan

### Phase 1: Dependencies & Setup

**Task 1.1: Install NPM packages**
```bash
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-underline
npm install date-fns
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Task 1.2: Verify installations**
- Check package versions in `package.json`
- Run `npm run check` to ensure no TypeScript errors
- Test dev server still starts

**Estimated time:** 30 minutes

---

### Phase 2: Data Model Updates

**Task 2.1: Update TypeScript types**
- Update `src/lib/types.ts` with new `Milestone` interface
- Update `Goal` interface with new fields
- Export types properly

**Task 2.2: Update Supabase schema**
- Create migration file for `goals` table updates
- Create migration file for new `milestones` table
- Run migrations against Supabase database
- Verify schema changes in Supabase dashboard

**Task 2.3: Update store type signatures**
- Update `currentBoard.ts` to handle new `Goal` structure
- Add type guards if needed for backwards compatibility
- Update method signatures to accept new fields

**Tests to write:**
- Type tests (compilation should pass)
- Store initialization with new fields
- Default values for new fields

**Estimated time:** 2 hours

---

### Phase 3: Date Auto-Population Logic

**Task 3.1: Implement `startedAt` logic**

**TDD approach:**
```typescript
// Test 1: startedAt should be null for new goals
// Test 2: startedAt should set on first title edit
// Test 3: startedAt should set on first notes edit
// Test 4: startedAt should NOT change on subsequent edits
```

**Implementation:**
- Add `startedAt` check in `saveGoal` method
- Set to current ISO string if currently null and content exists
- Preserve existing value if already set

**Task 3.2: Implement `completedAt` logic**

**TDD approach:**
```typescript
// Test 1: completedAt should set when goal marked complete
// Test 2: completedAt should clear when goal unchecked
// Test 3: completedAt should update if goal re-completed
```

**Implementation:**
- Add `completedAt` logic in `toggleComplete` method
- Set to current ISO string when `completed` becomes true
- Set to null when `completed` becomes false

**Task 3.3: Implement `lastUpdatedAt` logic**

**TDD approach:**
```typescript
// Test 1: lastUpdatedAt should update on title change
// Test 2: lastUpdatedAt should update on notes change
// Test 3: lastUpdatedAt should update on completion toggle
// Test 4: lastUpdatedAt should update on milestone changes
```

**Implementation:**
- Add `lastUpdatedAt` to all goal mutation methods
- Always set to current ISO string
- Ensure it persists to Supabase

**Task 3.4: Update Supabase persistence**
- Modify `saveGoal` to include new date fields
- Modify `toggleComplete` to include new date fields
- Test round-trip persistence (save → load → verify)

**Estimated time:** 3 hours

---

### Phase 4: Rich Text Editor Integration

**Task 4.1: Create RichTextEditor component**

**TDD approach:**
```typescript
// Test 1: Component renders with empty content
// Test 2: Component renders with existing HTML content
// Test 3: Toolbar shows all required buttons
// Test 4: Bold button makes text bold
// Test 5: Link button opens link dialog
// Test 6: Content emits on change
```

**Component structure:**
```svelte
<!-- src/lib/components/RichTextEditor.svelte -->
<script lang="ts">
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Link from '@tiptap/extension-link';
  import Underline from '@tiptap/extension-underline';
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    content: string;
    placeholder?: string;
    onUpdate: (html: string) => void;
  }

  let { content, placeholder = '', onUpdate }: Props = $props();

  let editor: Editor;
  let element: HTMLElement;

  // Initialize editor
  // Configure extensions
  // Handle updates
  // Cleanup on destroy
</script>

<!-- Toolbar -->
<div class="border border-gray-300 rounded-lg">
  <div class="border-b border-gray-300 p-2 flex gap-1 flex-wrap">
    <!-- Bold, Italic, Underline, Strikethrough buttons -->
    <!-- Heading dropdown -->
    <!-- List buttons -->
    <!-- Link button -->
  </div>

  <!-- Editor content area -->
  <div bind:this={element} class="prose prose-sm p-3 min-h-[200px]"></div>
</div>
```

**Task 4.2: Configure TipTap extensions**
- StarterKit (includes basic marks, nodes, commands)
- Link extension with click handler
- Underline extension
- Configure placeholder
- Configure focus handling

**Task 4.3: Build toolbar UI**
- Button components for each format
- Active state styling (blue when active)
- Heading dropdown (H1, H2, H3, Paragraph)
- Link dialog (input for URL)
- Keyboard shortcuts (Cmd+B, Cmd+I, etc.)

**Task 4.4: Replace textarea in GoalSidebar**
- Import `RichTextEditor`
- Replace `<textarea>` with `<RichTextEditor>`
- Pass `notes` as content prop
- Handle `onUpdate` callback
- Maintain auto-save behavior

**Task 4.5: Test full workflow**
- Type text, apply formatting
- Save goal, reload page
- Verify formatting persists
- Test all toolbar buttons
- Test keyboard shortcuts

**Estimated time:** 4-5 hours

---

### Phase 5: Milestones CRUD Operations

**Task 5.1: Add milestone methods to store**

**TDD approach:**
```typescript
// Test: Add milestone to goal
// Test: Update milestone title
// Test: Update milestone notes
// Test: Toggle milestone completion
// Test: Delete milestone
// Test: Milestones persist to Supabase
```

**Store methods to add:**
```typescript
// src/lib/stores/currentBoard.ts

addMilestone(goalId: string, title: string): Promise<void>
updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void>
toggleMilestoneComplete(milestoneId: string): Promise<void>
deleteMilestone(milestoneId: string): Promise<void>
reorderMilestones(goalId: string, newOrder: string[]): Promise<void>
```

**Implementation details:**
- Generate UUID for new milestones
- Set `position` based on current milestone count
- Update parent goal's `lastUpdatedAt`
- Persist changes to Supabase `milestones` table

**Task 5.2: Create MilestoneItem component**

**Component structure:**
```svelte
<!-- src/lib/components/MilestoneItem.svelte -->
<script lang="ts">
  import type { Milestone } from '$lib/types';
  import RichTextEditor from './RichTextEditor.svelte';
  import { formatDistanceToNow } from 'date-fns';

  interface Props {
    milestone: Milestone;
    expanded: boolean;
    onToggle: () => void;
    onUpdate: (updates: Partial<Milestone>) => void;
    onDelete: () => void;
    onToggleComplete: () => void;
  }

  let { milestone, expanded, onToggle, onUpdate, onDelete, onToggleComplete }: Props = $props();

  // Local state for inline editing
  // Auto-save logic
  // Date picker handling
</script>

{#if expanded}
  <!-- Expanded view with all fields -->
{:else}
  <!-- Collapsed view with summary -->
{/if}
```

**Features:**
- Collapsed: Show checkbox, title, target date, expand arrow
- Expanded: Show all fields, delete button, rich text editor
- Auto-save on blur (500ms debounce)
- Date picker for target date (optional)
- Completion date shows when completed

**Task 5.3: Create MilestoneList component**

**Component structure:**
```svelte
<!-- src/lib/components/MilestoneList.svelte -->
<script lang="ts">
  import type { Milestone } from '$lib/types';
  import MilestoneItem from './MilestoneItem.svelte';

  interface Props {
    goalId: string;
    milestones: Milestone[];
  }

  let { goalId, milestones }: Props = $props();

  let expandedIds = $state<Set<string>>(new Set());
  let newMilestoneTitle = $state('');

  // Progress calculation
  let completedCount = $derived(milestones.filter(m => m.completed).length);
  let totalCount = $derived(milestones.length);

  // Add milestone handler
  // Toggle expand/collapse
  // Pass through CRUD operations
</script>

<div>
  <div class="flex items-center justify-between mb-2">
    <h3>Milestones ({completedCount}/{totalCount} complete)</h3>
    <button onclick={handleAdd}>+ Add</button>
  </div>

  <div class="space-y-2">
    {#each sortedMilestones as milestone}
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
</div>
```

**Task 5.4: Add milestones section to GoalSidebar**
- Import `MilestoneList`
- Add below rich text editor
- Pass goal ID and milestones array
- Wire up to store methods

**Task 5.5: Milestone completion date logic**

**TDD approach:**
```typescript
// Test: completedAt sets when milestone marked complete
// Test: completedAt clears when milestone unchecked
// Test: Parent goal's lastUpdatedAt updates
```

**Implementation:**
- Add date logic to `toggleMilestoneComplete`
- Mirror the goal completion behavior
- Update parent goal's `lastUpdatedAt`

**Estimated time:** 5-6 hours

---

### Phase 6: Milestone Drag-and-Drop Reordering

**Task 6.1: Install and configure dnd-kit**

**TDD approach:**
```typescript
// Test: Milestones render in position order
// Test: Dragging updates position values
// Test: New positions persist to database
// Test: Other milestones shift correctly
```

**Task 6.2: Add drag functionality to MilestoneList**

**Implementation:**
```svelte
<script lang="ts">
  import { DndContext, closestCenter } from '@dnd-kit/core';
  import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      // Reorder milestones
      // Update positions
      // Call store method to persist
    }
  }
</script>

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={milestones}
    strategy={verticalListSortingStrategy}
  >
    {#each milestones as milestone}
      <MilestoneItem ... />
    {/each}
  </SortableContext>
</DndContext>
```

**Task 6.3: Add drag handle to MilestoneItem**

**Implementation:**
- Add `⋮` icon as drag handle
- Import `useSortable` hook
- Wire up drag listeners
- Add visual feedback (cursor change, opacity)

**Task 6.4: Implement reorderMilestones in store**

**Logic:**
1. Accept new order (array of IDs)
2. Update position field for each milestone
3. Persist to Supabase
4. Update parent goal's `lastUpdatedAt`

**Estimated time:** 3-4 hours

---

### Phase 7: Last Updated Display

**Task 7.1: Create date formatting utility**

**File:** `src/lib/utils/dates.ts`

```typescript
import { formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const distance = formatDistanceToNow(date, { addSuffix: true });

  // Simplify output: "2 hours ago" → "2h ago"
  return distance
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' weeks', 'w')
    .replace(' week', 'w')
    .replace(' months', 'mo')
    .replace(' month', 'mo')
    .replace(' ago', ' ago');
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

**Task 7.2: Add DateMetadata component**

**Component structure:**
```svelte
<!-- src/lib/components/DateMetadata.svelte -->
<script lang="ts">
  import { formatRelativeTime } from '$lib/utils/dates';
  import { format } from 'date-fns';

  interface Props {
    startedAt: string | null;
    completedAt: string | null;
    lastUpdatedAt: string;
  }

  let { startedAt, completedAt, lastUpdatedAt }: Props = $props();
</script>

<div class="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
  {#if startedAt}
    <div class="flex justify-between">
      <span class="text-gray-600">Started:</span>
      <span class="font-medium">{format(new Date(startedAt), 'MMM d, yyyy')}</span>
    </div>
  {/if}

  {#if completedAt}
    <div class="flex justify-between">
      <span class="text-gray-600">Completed:</span>
      <span class="font-medium text-green-600">{format(new Date(completedAt), 'MMM d, yyyy')}</span>
    </div>
  {/if}

  <div class="flex justify-between">
    <span class="text-gray-600">Last updated:</span>
    <span class="font-medium">{formatRelativeTime(lastUpdatedAt)}</span>
  </div>
</div>
```

**Task 7.3: Add DateMetadata to GoalSidebar**
- Import component
- Add between title and rich text editor
- Pass date props from goal

**Task 7.4: Update GoalSquare to show last updated**

**Changes to make:**
```svelte
<!-- src/lib/components/GoalSquare.svelte -->
<script lang="ts">
  import { formatRelativeTime } from '$lib/utils/dates';

  // ... existing props

  let lastUpdatedText = $derived(
    goal.notes ? formatRelativeTime(goal.lastUpdatedAt) : null
  );

  // Responsive text size based on board size
  let timeTextSize = $derived(
    boardSize === 3 ? 'text-[10px]' :
    boardSize === 4 ? 'text-[10px]' :
    'text-[8px]'
  );
</script>

<!-- In the bottom section -->
<div class="flex items-center justify-between mt-1 sm:mt-2">
  <button ...><!-- checkbox --></button>

  {#if goal.notes}
    <span class="flex items-center gap-1 text-gray-500 {timeTextSize}">
      <span>📝</span>
      <span>{lastUpdatedText}</span>
    </span>
  {/if}
</div>
```

**TDD approach:**
```typescript
// Test: Last updated shows when notes exist
// Test: Last updated hidden when no notes
// Test: Text size changes based on board size
// Test: Relative time updates reactively
```

**Task 7.5: Pass board size to GoalSquare**
- Update `BingoBoard.svelte` to pass `size` prop
- Update `GoalSquare` interface to accept it

**Estimated time:** 2-3 hours

---

### Phase 8: Integration & Polish

**Task 8.1: Update auto-save to handle all fields**

**Verify:**
- Title changes trigger auto-save
- Notes (rich text) changes trigger auto-save
- Milestone changes update parent goal's `lastUpdatedAt`
- All dates persist correctly
- No duplicate saves or race conditions

**Task 8.2: End-to-end testing**

**Test scenarios:**
1. Create new goal → Add title → Verify `startedAt` set
2. Add rich text notes → Format text → Save → Reload → Verify formatting
3. Add milestone → Edit milestone → Reorder → Verify persistence
4. Mark goal complete → Verify `completedAt` set
5. Uncheck goal → Verify `completedAt` cleared
6. Wait 5 minutes → Verify "5m ago" shows correctly
7. Add milestone, wait, verify parent goal's `lastUpdatedAt` changes

**Task 8.3: Responsive design testing**

**Test on:**
- Mobile (320px - 640px): Full-width sidebar, readable text
- Tablet (640px - 1024px): Sidebar width appropriate
- Desktop (1024px+): Sidebar doesn't block board too much

**Verify:**
- Toolbar wraps correctly on small screens
- Date text readable on all board sizes
- Milestone items stack properly
- Drag handles work on touch devices

**Task 8.4: Accessibility audit**

**Checklist:**
- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces milestone count
- [ ] Rich text editor has proper role attributes
- [ ] Date information readable by screen readers
- [ ] Drag-drop has keyboard alternative

**Task 8.5: Performance check**

**Verify:**
- Auto-save debounce working (not saving on every keystroke)
- Large number of milestones (20+) doesn't lag
- Rich text editor doesn't slow down typing
- No memory leaks in editor initialization/cleanup

**Task 8.6: Error handling**

**Add proper error handling for:**
- Supabase save failures (show error alert)
- Invalid dates (shouldn't happen, but guard against it)
- Milestone reorder conflicts
- Rich text editor initialization failures

**Task 8.7: Documentation updates**

**Update files:**
- `CLAUDE.md`: Add GoalSidebar, MilestoneItem, RichTextEditor to component list
- `README.md` (if exists): Update features list
- Add JSDoc comments to new store methods
- Add ABOUTME comments to new component files

**Estimated time:** 3-4 hours

---

## Testing Strategy

### Unit Tests

**Date logic (`src/lib/utils/dates.ts`):**
- `formatRelativeTime` produces correct output
- Handles edge cases (future dates, invalid dates)

**Store methods (`src/lib/stores/currentBoard.ts`):**
- `addMilestone` increments position correctly
- `toggleMilestoneComplete` sets date correctly
- `reorderMilestones` updates positions
- `saveGoal` sets `startedAt` on first edit
- `toggleComplete` sets/clears `completedAt`
- All mutations update `lastUpdatedAt`

### Component Tests

**RichTextEditor.svelte:**
- Renders with initial content
- Toolbar buttons work
- Emits HTML on change
- Cleans up on destroy

**MilestoneItem.svelte:**
- Toggles expand/collapse
- Saves on blur
- Delete confirms (if we add confirmation)
- Date picker works

**MilestoneList.svelte:**
- Calculates progress correctly
- Adds new milestones
- Sorts by position

**DateMetadata.svelte:**
- Formats dates correctly
- Shows/hides fields based on null values

**GoalSquare.svelte:**
- Shows last updated when notes exist
- Hides last updated when no notes
- Text size responsive to board size

### Integration Tests

**Full workflow:**
1. Click goal square → Sidebar opens
2. Edit title → `startedAt` and `lastUpdatedAt` set
3. Add rich text notes → Saves as HTML
4. Add milestone → Shows in list
5. Reorder milestone → Position updates
6. Mark milestone complete → Date sets
7. Mark goal complete → `completedAt` sets
8. Close sidebar → All changes persisted
9. Reload page → All data intact

**Auto-save:**
- Type in editor → Wait 500ms → Verify save called
- Type again within 500ms → Verify only one save

**Date auto-population:**
- New goal has no dates
- First edit sets `startedAt`
- Second edit doesn't change `startedAt`
- Completion sets `completedAt`
- Uncheck clears `completedAt`

### Manual Testing Checklist

**Browser testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Screen sizes:**
- [ ] Mobile (375x667)
- [ ] Tablet (768x1024)
- [ ] Desktop (1920x1080)
- [ ] Ultra-wide (2560x1440)

**Keyboard navigation:**
- [ ] Tab through all fields
- [ ] Enter to submit forms
- [ ] Escape to close sidebar
- [ ] Keyboard shortcuts in editor

**Accessibility:**
- [ ] VoiceOver (macOS)
- [ ] NVDA (Windows)
- [ ] ChromeVox (Chrome extension)

---

## Success Criteria

### Functional Requirements
✅ Users can format goal notes with rich text (bold, italic, underline, strikethrough, headings, lists, links)
✅ Users can create, edit, delete, and reorder milestones
✅ Each milestone can have title, rich notes, optional target date
✅ Milestone completion tracked with automatic date stamping
✅ Goal dates auto-populate (`startedAt`, `completedAt`, `lastUpdatedAt`)
✅ Last updated time displays in goal squares (when notes exist)
✅ Last updated time displays in sidebar metadata section
✅ All data persists to Supabase database
✅ Auto-save works with 500ms debounce (no save on every keystroke)

### Non-Functional Requirements
✅ Rich text editor loads in < 500ms
✅ Typing in editor feels responsive (no lag)
✅ Drag-drop reordering smooth (< 100ms delay)
✅ Sidebar remains responsive on mobile devices
✅ Date formatting uses `date-fns` consistently
✅ All interactive elements keyboard accessible
✅ Screen readers can navigate all features
✅ No console errors or warnings
✅ TypeScript compilation passes with no errors

### User Experience
✅ Rich text toolbar is intuitive and discoverable
✅ Milestones collapsed by default (clean interface)
✅ Inline editing feels natural (no jarring modals)
✅ Last updated info helps identify stale goals
✅ Drag handles clearly indicate reorderable items
✅ Progress counter (X/Y complete) motivates completion
✅ Dates display in human-friendly format
✅ Auto-save provides confidence (no fear of data loss)

### Technical Debt
✅ No migration code needed (clean implementation)
✅ Components follow existing patterns (consistency)
✅ Types fully documented (no `any` types)
✅ Tests cover critical paths (> 80% coverage)
✅ ABOUTME comments on all new files
✅ No backwards compatibility hacks

---

## Open Questions

1. **Milestone target dates:**
   - Should we add reminders/notifications for upcoming dates?
   - Color-code milestones by proximity to target date?

2. **Rich text sanitization:**
   - Do we need to sanitize HTML output (prevent XSS)?
   - TipTap handles most of this, but verify

3. **Milestone notes:**
   - Should milestone notes be as full-featured as goal notes?
   - Or simplified (fewer formatting options)?

4. **Export functionality:**
   - Future feature: Export goal with milestones to PDF/Markdown?
   - If yes, ensure data model supports it

5. **Undo/Redo:**
   - Should rich text editor have undo/redo?
   - TipTap supports it - enable or leave disabled?

---

## Future Enhancements (Out of Scope)

These features were considered but deferred:

❌ **Code blocks in rich text** - Not needed for goal tracking
❌ **Color-coded staleness** - Keeping UI simple for now
❌ **Milestone dependencies** - Adds complexity, YAGNI
❌ **Recurring milestones** - Not a common use case
❌ **Attachments/images** - Requires file storage, out of scope
❌ **Comments/collaboration** - Multi-user feature, much larger scope
❌ **Milestone templates** - Premature optimization
❌ **AI-powered suggestions** - Interesting, but not core feature

---

## Appendix A: TipTap Configuration Reference

```typescript
// Full editor configuration
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

const editor = new Editor({
  element: element,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: false,  // Explicitly disable
      code: false,       // Explicitly disable
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline',
      },
    }),
    Underline,
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    onUpdate(editor.getHTML());
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none',
    },
  },
});
```

## Appendix B: Database Migration Scripts

**Migration 1: Update goals table**
```sql
-- Add new columns to goals table
ALTER TABLE goals
ADD COLUMN started_at TIMESTAMPTZ,
ADD COLUMN completed_at TIMESTAMPTZ,
ADD COLUMN last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add trigger to auto-update last_updated_at
CREATE OR REPLACE FUNCTION update_goals_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_last_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_goals_last_updated_at();
```

**Migration 2: Create milestones table**
```sql
-- Create milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  position INTEGER NOT NULL,
  CONSTRAINT positive_position CHECK (position >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_milestones_position ON milestones(goal_id, position);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
  ON milestones FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own milestones"
  ON milestones FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own milestones"
  ON milestones FOR UPDATE
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own milestones"
  ON milestones FOR DELETE
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );
```

---

**End of Plan Document**
