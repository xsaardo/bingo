<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DialogPrimitive.Description> & {
    class?: string;
  };

  let { ref = $bindable(null), class: className, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Description
  bind:ref
  class={['text-sm text-gray-500', className].filter(Boolean).join(' ')}
  {...restProps}
/>
