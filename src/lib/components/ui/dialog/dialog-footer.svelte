<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div
  class={['flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2', className]
    .filter(Boolean)
    .join(' ')}
  {...restProps}
>
  {@render children?.()}
</div>
