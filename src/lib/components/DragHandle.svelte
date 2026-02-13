<!-- ABOUTME: Reusable drag handle component for drag-and-drop lists -->
<!-- ABOUTME: Displays vertical dots icon with proper cursor and accessibility -->

<script lang="ts">
	interface Props {
		onclick?: (e: MouseEvent) => void;
	}

	let { onclick }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
		}
	}
</script>

<span
	onclick={onclick}
	onkeydown={handleKeydown}
	class="cursor-move text-gray-400 select-none"
	data-drag-handle
	aria-label="Drag to reorder"
	role="button"
	tabindex="0"
>⋮</span>
