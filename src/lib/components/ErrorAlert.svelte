<script lang="ts">
  import { Alert, AlertDescription } from '$lib/components/ui/alert/index.js';

  interface Props {
    error: string | null;
    onDismiss?: () => void;
    showIcon?: boolean;
  }

  let { error = null, onDismiss, showIcon = true }: Props = $props();
</script>

{#if error}
  <Alert variant="destructive" class="animate-in slide-in-from-top-2 duration-200">
    {#if showIcon}
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    {/if}
    <AlertDescription class="flex items-center justify-between">
      <span>{error}</span>
      {#if onDismiss}
        <button
          onclick={onDismiss}
          class="ml-2 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Dismiss error"
        >
          <svg
            class="size-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {/if}
    </AlertDescription>
  </Alert>
{/if}
