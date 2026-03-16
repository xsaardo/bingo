<!-- ABOUTME: Thin wrapper around shadcn-svelte Checkbox for milestone and goal completion -->
<!-- ABOUTME: Uses bind:checked with local state so bits-ui can manage visual state correctly -->

<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';

  interface Props {
    checked: boolean;
    onclick: (e: MouseEvent) => void;
    testid?: string;
    class?: string;
  }

  let { checked, onclick, testid = 'checkbox', class: className = 'w-5 h-5' }: Props = $props();

  let internalChecked = $state(checked);

  // Sync internal state when the external checked prop changes (e.g. store updates)
  $effect(() => {
    internalChecked = checked;
  });
</script>

<Checkbox bind:checked={internalChecked} {onclick} data-testid={testid} class={className} />
