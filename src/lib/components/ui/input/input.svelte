<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		class: className,
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	}: HTMLInputAttributes & { class?: string; ref?: HTMLInputElement | null } = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn(
		'flex h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
/>
