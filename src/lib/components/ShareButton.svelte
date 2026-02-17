<!-- ABOUTME: Button that exports the current board as a shareable image -->
<!-- ABOUTME: Uses native share sheet on mobile, file download on desktop -->

<script lang="ts">
	import { exportBoardAsImage } from '$lib/utils/export';
	import type { Board } from '$lib/types';

	interface Props {
		board: Board;
		font: string;
		exportableEl: HTMLElement | null;
	}

	let { board, font, exportableEl }: Props = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleShare() {
		if (!exportableEl) return;
		loading = true;
		error = null;
		try {
			await exportBoardAsImage(exportableEl, board.name);
		} catch (e) {
			error = 'Failed to export image. Please try again.';
			console.error('Export failed:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="relative">
	<button
		data-testid="share-button"
		onclick={handleShare}
		disabled={loading}
		class="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
		title="Share board as image"
	>
		{#if loading}
			<!-- Spinner -->
			<svg
				class="w-4 h-4 animate-spin"
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
			<span>Exporting...</span>
		{:else}
			<!-- Share/upload icon -->
			<svg
				class="w-4 h-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
				/>
			</svg>
			<span>Share</span>
		{/if}
	</button>

	{#if error}
		<p class="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap">{error}</p>
	{/if}
</div>
