<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={["flex flex-col gap-1.5 text-center sm:text-left", className].filter(Boolean).join(" ")}
	{...restProps}
>
	{@render children?.()}
</div>
