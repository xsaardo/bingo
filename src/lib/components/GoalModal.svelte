<!-- ABOUTME: Modal dialog for viewing and editing a single goal -->
<!-- ABOUTME: Shows title and completion toggle by default; signed-in users can expand for notes and milestones -->

<script lang="ts">
  import { currentBoardStore, currentBoard } from '$lib/stores/currentBoard';
  import { uiStore } from '$lib/stores/board';
  import { currentUser } from '$lib/stores/auth';
  import type { Goal } from '$lib/types';
  import RichTextEditor from './RichTextEditor.svelte';
  import { Input } from '$lib/components/ui/input/index.js';
  import DateMetadata from './DateMetadata.svelte';
  import MilestoneList from './MilestoneList.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import CheckboxButton from './CheckboxButton.svelte';

  interface Props {
    goal: Goal;
    index: number;
  }

  let { goal: initialGoal }: Props = $props();

  // Get reactive goal from store instead of relying only on prop
  let goal = $derived($currentBoard?.goals.find((g) => g.id === initialGoal.id) || initialGoal);

  let title = $state(goal.title);
  let notes = $state(goal.notes);
  let titleInput: HTMLInputElement | null = null;
  let isExpanded = $state(false);

  // Check if user is anonymous
  const isAnonymous = $derived($currentUser?.is_anonymous === true);

  async function handleSave() {
    await currentBoardStore.saveGoal(goal.id, title, notes);
    uiStore.clearSelection();
  }

  function handleClose() {
    uiStore.clearSelection();
  }

  async function toggleComplete() {
    await currentBoardStore.toggleComplete(goal.id);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      handleClose();
    }
  }

  // Auto-focus title input when modal opens
  $effect(() => {
    setTimeout(() => titleInput?.focus(), 50);
  });
</script>

<Dialog.Root open={true} onOpenChange={handleOpenChange}>
  <Dialog.Content
    class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden p-0 border-0 gap-0"
    data-testid="goal-modal"
  >
    <!-- Header -->
    <div class="flex items-center justify-end px-6 pt-3 pb-1">
      <Dialog.Close
        class="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
        data-testid="close-modal-button"
      >
        ×
      </Dialog.Close>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-scroll px-6 pt-2 pb-2 space-y-3">
      <!-- Title + Completion Toggle inline -->
      <div class="flex items-center gap-3">
        <CheckboxButton
          checked={goal.completed}
          onclick={(e) => {
            e.stopPropagation();
            toggleComplete();
          }}
          testid="modal-checkbox"
          class="shrink-0 w-6 h-6"
        />
        <Input
          bind:ref={titleInput}
          id="modal-goal-title"
          type="text"
          bind:value={title}
          placeholder="Enter your goal..."
          onkeydown={(e) => e.key === 'Enter' && handleSave()}
          class="flex-1 px-3 py-2 h-auto"
          data-testid="modal-title-input"
        />
      </div>

      <!-- Expanded section -->
      <div
        class="grid transition-all duration-200 ease-in-out"
        style="grid-template-rows: {isExpanded ? '1fr' : '0fr'};"
      >
        <div class="overflow-hidden">
          <div class="space-y-3">
            {#if isAnonymous}
              <!-- Sign-in prompt for anonymous users -->
              <div
                data-testid="sign-in-for-details"
                class="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50"
              >
                <p class="text-gray-600 text-sm mb-3">
                  Sign in to add notes and milestones to your goals
                </p>
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
        </div>
      </div>
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
  </Dialog.Content>
</Dialog.Root>
