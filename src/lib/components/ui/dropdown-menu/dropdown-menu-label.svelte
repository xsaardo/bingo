<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<div class="px-3 py-2 text-xs font-semibold text-gray-500 {className}">
  {@render children?.()}
</div>
