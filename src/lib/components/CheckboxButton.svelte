<!-- ABOUTME: Thin wrapper around shadcn-svelte Checkbox for milestone and goal completion -->
<!-- ABOUTME: Maintains backward-compatible onclick/testid API over the bits-ui Checkbox primitive -->

<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';

  interface Props {
    checked: boolean;
    onclick?: (e: MouseEvent) => void;
    testid?: string;
    class?: string;
  }

  let { checked, onclick, testid = 'checkbox', class: className = 'w-5 h-5' }: Props = $props();

  // Optimistic local state so that aria-checked updates immediately on interaction,
  // satisfying Playwright's .check() assertion before the async store update resolves.
  let localChecked = $state(checked);
  $effect(() => {
    localChecked = checked;
  });

  function handleCheckedChange(newChecked: boolean) {
    localChecked = newChecked; // Optimistic update — aria-checked reflects intent immediately
    if (onclick) {
      onclick(new MouseEvent('click'));
    }
  }
</script>

<!-- Note: onclick is NOT spread to avoid double-firing alongside onCheckedChange on mouse clicks -->
<Checkbox
  checked={localChecked}
  onCheckedChange={handleCheckedChange}
  data-testid={testid}
  class={className}
/>
