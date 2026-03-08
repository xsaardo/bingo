<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';
  import Overlay from './dialog-overlay.svelte';

  interface Props {
    ref?: HTMLDivElement | null;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Portal>
  <Overlay />
  <DialogPrimitive.Content
    bind:ref
    class={[
      'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
      'w-full max-w-lg',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
      className
    ]
      .filter(Boolean)
      .join(' ')}
    {...restProps}
  >
    {@render children?.()}
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>
