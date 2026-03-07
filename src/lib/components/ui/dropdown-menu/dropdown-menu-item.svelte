<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    class?: string;
  };

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Item
  class="relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 {className}"
  {...restProps}
>
  {@render children?.()}
</DropdownMenuPrimitive.Item>
