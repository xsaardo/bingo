<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DialogPrimitive.Title> & {
    class?: string;
  };

  let { ref = $bindable(null), class: className, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Title
  bind:ref
  class={['text-lg font-semibold leading-none tracking-tight', className].filter(Boolean).join(' ')}
  {...restProps}
/>
