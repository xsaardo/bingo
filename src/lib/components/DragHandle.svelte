<!-- ABOUTME: Reusable drag handle component for drag-and-drop lists -->
<!-- ABOUTME: Displays vertical dots icon with proper cursor and accessibility -->

<script lang="ts">
	interface Props {
		onclick?: (e: MouseEvent) => void;
	}

	let { onclick }: Props = $props();
</script>

<span
	onclick={onclick}
	class="cursor-move text-gray-400 select-none"
	data-drag-handle
	aria-label="Drag to reorder"
	role="button"
	tabindex="0"
>⋮</span>
