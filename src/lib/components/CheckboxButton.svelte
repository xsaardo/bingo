<!-- ABOUTME: Thin wrapper around shadcn-svelte Checkbox for milestone and goal completion -->
<!-- ABOUTME: Maintains backward-compatible onclick/testid API over the bits-ui Checkbox primitive -->

<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		checked: boolean;
		onclick: (e: MouseEvent) => void;
		testid?: string;
		class?: string;
	}

	let { checked, onclick, testid = 'checkbox', class: className = 'w-5 h-5' }: Props = $props();
</script>

<Checkbox
	{checked}
	onCheckedChange={() => {}}
	{onclick}
	data-testid={testid}
	class={className}
/>
