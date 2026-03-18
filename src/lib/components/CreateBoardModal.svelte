<script lang="ts">
  import { boardsStore } from '$lib/stores/boards';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  let name = $state('');
  let loading = $state(false);
  let error = $state('');
  let nameInput = $state<HTMLInputElement | null>(null);

  // Reset form and focus when modal opens
  $effect(() => {
    if (isOpen) {
      name = '';
      error = '';
      // Focus the name input after a brief delay to ensure modal is rendered
      setTimeout(() => nameInput?.focus(), 100);
    }
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    // Validate
    if (!name.trim()) {
      error = 'Please enter a board name';
      return;
    }

    if (name.length > 255) {
      error = 'Board name is too long (max 255 characters)';
      return;
    }

    loading = true;
    error = '';

    const result = await boardsStore.createBoard(name.trim(), 5);

    loading = false;

    if (result.success) {
      onClose();
    } else {
      error = result.error || 'Failed to create board';
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }
</script>

<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Content
    class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-0 border-0 gap-0"
  >
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <Dialog.Title class="text-xl font-bold text-gray-900">Create New Board</Dialog.Title>
        <Dialog.Close
          class="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Dialog.Close>
      </div>
    </div>

    <!-- Form -->
    <form onsubmit={handleSubmit} class="p-6 space-y-5">
      <!-- Board Name -->
      <div>
        <Label for="board-name" class="block mb-2">
          Board Name <span class="text-red-500">*</span>
        </Label>
        <Input
          bind:ref={nameInput}
          id="board-name"
          type="text"
          bind:value={name}
          placeholder="e.g., 2026 Goals, Reading Challenge, Fitness Bingo"
          required
          maxlength={255}
          disabled={loading}
          class="w-full px-4 py-3 h-auto"
        />
        <p class="text-xs text-gray-500 mt-1">Give your board a memorable name</p>
      </div>

      <!-- Error Message -->
      {#if error}
        <div
          role="alert"
          aria-live="polite"
          class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
        >
          <svg
            class="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm text-red-800">{error}</p>
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3">
        <button
          type="button"
          onclick={onClose}
          disabled={loading}
          class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
        >
          {#if loading}
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              aria-label="Creating board"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating...
          {:else}
            Create Board
          {/if}
        </button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
