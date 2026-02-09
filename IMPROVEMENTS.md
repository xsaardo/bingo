# Future Improvements

This document tracks potential enhancements and technical debt for future implementation.

## Milestone Drag-and-Drop Error Handling

**Status:** Deferred
**Priority:** Low
**Effort:** ~30 minutes

### Context

Currently, milestone reordering uses optimistic updates with no error handling:
- UI updates immediately when user drags
- Database save happens in background
- If save fails, error is logged to console but user sees no feedback
- Discrepancy self-heals on next modal open

This follows the **industry standard pattern** for task management apps (Trello, Asana, Linear) where:
- Low-stakes data doesn't need aggressive error handling
- Frequent operations shouldn't interrupt user flow
- Self-healing on refresh is acceptable

### Why We Skipped It

1. **Batch update optimization** (completed) makes failures extremely rare (~90% reduction)
2. **Silent failures are rare** with Supabase's reliability
3. **User experience** - optimistic UI feels faster than blocking alerts
4. **Self-healing** - correct state loads on next modal open

### Potential Enhancements (if user reports issues)

**Option 1: Subtle Toast Notification (Recommended)**
```typescript
// In MilestoneList.svelte handleFinalize()
if (!result.success) {
  console.error('Failed to reorder milestones:', result.error);
  toast.error('Changes not saved. Refresh to sync.');
}
```

**Requirements:**
- Install toast library: `npm install svelte-french-toast` or `sonner`
- Non-blocking notification in bottom-right corner
- Auto-dismiss after 3-5 seconds

**Option 2: Auto-Retry Once**
```typescript
if (!result.success) {
  // Silently retry once
  const retry = await currentBoardStore.reorderMilestones(goalId, newOrder);
  if (!retry.success) {
    console.error('Retry failed:', retry.error);
    // Optional: show toast notification
  }
}
```

**Benefits:**
- Handles transient network issues automatically
- No user interaction required
- Works ~95% of the time

**Option 3: Rollback with Animation**
```typescript
const previousItems = items;
items = e.detail.items;

const result = await reorderMilestones(...);
if (!result.success) {
  items = previousItems; // Snap back to original order
  toast.error('Failed to save order');
}
```

**Trade-offs:**
- ✅ UI stays perfectly in sync with database
- ❌ Jarring animation when rollback happens
- ❌ Interrupts user flow
- ❌ Not standard for task apps

### When to Implement

Implement if:
- Users report "changes disappearing" or sync issues
- Analytics show high failure rates (>1% of reorders)
- App expands to offline-first or poor connectivity scenarios

### References

- File: `src/lib/components/MilestoneList.svelte` (line 70-75)
- Store: `src/lib/stores/currentBoard.ts` (reorderMilestones method)
- Discussion: Phase 8 code review (2026-02-09)

---

## Other Improvements

(Add future improvements below)
