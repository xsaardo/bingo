<script lang="ts">
	import { onMount } from 'svelte';
	import BoardSizeSelector from '$lib/components/BoardSizeSelector.svelte';
	import BingoBoard from '$lib/components/BingoBoard.svelte';
	import { boardStore } from '$lib/stores/board';

	onMount(() => {
		boardStore.init();
	});
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold text-center mb-8 text-gray-900">
			New Year Goals Bingo
		</h1>

		<BoardSizeSelector />
		<BingoBoard />
	</div>
</div>
