<!-- ABOUTME: Button that exports the bingo board as a downloadable image. -->
<!-- ABOUTME: Shows a spinner while exporting and uses toast for error feedback. -->
<script lang="ts">
  import { exportBoardAsImage } from '$lib/utils/export';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';

  interface Props {
    boardName: string;
    exportElement: HTMLElement | undefined;
  }

  let { boardName, exportElement }: Props = $props();

  let loading = $state(false);

  async function handleExport() {
    if (!exportElement) return;

    loading = true;

    try {
      await exportBoardAsImage(exportElement, boardName);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      loading = false;
    }
  }
</script>

<Button
  onclick={handleExport}
  disabled={loading || !exportElement}
  aria-label="Export board as image"
  title="Save as image"
  variant="ghost"
  size="icon"
>
  {#if loading}
    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  {:else}
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  {/if}
</Button>
