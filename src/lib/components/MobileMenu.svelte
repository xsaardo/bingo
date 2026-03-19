<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  let open = $state(false);
  let menuEl: HTMLDivElement | undefined = $state();

  function toggle(e: MouseEvent) {
    e.stopPropagation();
    open = !open;
  }

  function close() {
    open = false;
  }

  function handleOutsideClick(e: MouseEvent) {
    if (open && menuEl && !menuEl.contains(e.target as Node)) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleOutsideClick} />

<div class="relative sm:hidden" bind:this={menuEl}>
  <button
    onclick={toggle}
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    aria-haspopup="true"
    class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
  >
    {#if open}
      <!-- X icon -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    {:else}
      <!-- Hamburger icon -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    {/if}
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      role="menu"
      aria-label="Navigation menu"
    >
      <div class="py-1 flex flex-col">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>
