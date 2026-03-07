<script lang="ts">
  import type { Board } from '$lib/types';
  import { boardsStore } from '$lib/stores/boards';
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    board: Board;
    onDelete?: (_boardId: string) => void;
  }

  let { board, onDelete }: Props = $props();

  function focusOnMount(node: HTMLElement) {
    node.focus();
    return {};
  }

  // Calculate completion stats
  const completedGoals = $derived(board.goals.filter((g) => g.completed).length);
  const totalGoals = $derived(board.goals.length);
  const completionPercentage = $derived(
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
  );
  const hasContent = $derived(board.goals.some((g) => g.title.trim() !== ''));

  // Inline edit state
  let isEditing = $state(false);
  let editName = $state('');
  let saving = $state(false);
  let saveError = $state<string | null>(null);

  function handleDeleteClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (onDelete) {
      onDelete(board.id);
    }
  }

  function handleEditClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    editName = board.name;
    isEditing = true;
    saveError = null;
  }

  function handleEditKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }

  function cancelEdit() {
    isEditing = false;
    editName = '';
    saveError = null;
  }

  async function saveName() {
    const trimmed = editName.trim();
    if (!trimmed) {
      saveError = 'Name cannot be empty';
      return;
    }
    if (trimmed.length > 100) {
      saveError = 'Name must be 100 characters or fewer';
      return;
    }
    if (trimmed === board.name) {
      cancelEdit();
      return;
    }
    saving = true;
    saveError = null;
    const result = await boardsStore.updateBoardName(board.id, trimmed);
    saving = false;
    if (result.success) {
      isEditing = false;
    } else {
      saveError = result.error ?? 'Failed to save';
    }
  }

  function handleInputClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
</script>

<a
  href="/boards/{board.id}"
  data-testid="board-card"
  class="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden group"
>
  <!-- Header -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        {#if isEditing}
          <div class="flex flex-col gap-1" onclick={handleInputClick}>
            <div class="flex items-center gap-2">
              <input
                type="text"
                bind:value={editName}
                onkeydown={handleEditKeydown}
                onblur={saveName}
                disabled={saving}
                maxlength={100}
                class="flex-1 text-lg font-semibold text-gray-900 border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                use:focusOnMount
              />
              <button
                onclick={cancelEdit}
                class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Cancel"
                type="button"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {#if saveError}
              <p class="text-xs text-red-500">{saveError}</p>
            {/if}
            {#if saving}
              <p class="text-xs text-gray-400">Saving...</p>
            {/if}
          </div>
        {:else}
          <div class="flex items-center gap-1 group/name">
            <h3
              class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors"
            >
              {board.name}
            </h3>
            <button
              onclick={handleEditClick}
              class="flex-shrink-0 p-1 text-gray-300 hover:text-blue-500 rounded opacity-0 group-hover/name:opacity-100 transition-all"
              title="Rename board"
              type="button"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        {/if}
      </div>

      <!-- Delete Button -->
      {#if onDelete}
        <button
          onclick={handleDeleteClick}
          class="flex-shrink-0 ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete board"
          aria-label="Delete board"
          data-testid="delete-board-button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Progress Section -->
  <div class="p-4">
    <!-- Progress Bar -->
    <div class="mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Progress</span>
        <span class="text-sm font-semibold text-blue-600">{completionPercentage}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style="width: {completionPercentage}%"
        ></div>
      </div>
      <p class="text-xs text-gray-500 mt-1">
        {completedGoals} of {totalGoals} goals completed
      </p>
    </div>

    <!-- Status Badge -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        {#if !hasContent}
          <Badge variant="secondary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Empty
          </Badge>
        {:else if completedGoals === totalGoals}
          <Badge variant="outline" class="border-green-500 bg-green-50 text-green-700">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Complete
          </Badge>
        {:else if completedGoals > 0}
          <Badge variant="outline" class="border-blue-400 bg-blue-50 text-blue-700">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            In Progress
          </Badge>
        {:else}
          <Badge variant="outline" class="border-yellow-400 bg-yellow-50 text-yellow-700">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Not Started
          </Badge>
        {/if}
      </div>

      <span class="text-xs text-gray-400">Created {formatDate(board.createdAt)}</span>
    </div>
  </div>
</a>
