<!-- ABOUTME: Reusable checkbox button component with checkmark icon -->
<!-- ABOUTME: Used for milestone and goal completion status -->

<script lang="ts">
	interface Props {
		checked: boolean;
		onclick: (e: MouseEvent) => void;
		testid?: string;
	}

	let { checked, onclick, testid = 'checkbox' }: Props = $props();
</script>

<button
	{onclick}
	class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all active:scale-90"
	class:bg-green-500={checked}
	class:border-green-500={checked}
	class:border-gray-300={!checked}
	class:hover:border-green-500={!checked}
	data-testid={testid}
>
	{#if checked}
		<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
		</svg>
	{/if}
</button>
