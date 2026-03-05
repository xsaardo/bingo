<!-- ABOUTME: shadcn-svelte Checkbox component backed by bits-ui -->
<!-- ABOUTME: Provides accessible checkbox with checked/indeterminate states -->

<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type RootProps = ComponentProps<typeof CheckboxPrimitive.Root>;

	type Props = Omit<RootProps, 'class'> & {
		class?: string;
		'data-testid'?: string;
	};

	let {
		checked = $bindable(false),
		onCheckedChange,
		disabled = false,
		class: className = '',
		'data-testid': testid,
		...restProps
	}: Props = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	{onCheckedChange}
	{disabled}
	data-testid={testid}
	class="peer shrink-0 rounded border-2 flex items-center justify-center transition-all active:scale-90
		data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500
		data-[state=unchecked]:border-gray-300 data-[state=unchecked]:hover:border-green-500
		focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
		disabled:cursor-not-allowed disabled:opacity-50 {className}"
	{...restProps}
>
	{#snippet children({ checked: isChecked })}
		{#if isChecked}
			<svg class="w-3/5 h-3/5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
			</svg>
		{/if}
	{/snippet}
</CheckboxPrimitive.Root>
