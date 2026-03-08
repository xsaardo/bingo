<script lang="ts">
	import { exportBoardAsImage } from '$lib/utils/export';

	interface Props {
		boardName: string;
		exportElement: HTMLElement | undefined;
	}

	let { boardName, exportElement }: Props = $props();

	let loading = $state(false);
	let error = $state('');

	async function handleExport() {
		if (!exportElement) return;

		loading = true;
		error = '';

		try {
			await exportBoardAsImage(exportElement, boardName);
		} catch (err) {
			console.error('Export failed:', err);
			error = 'Export failed. Please try again.';
			setTimeout(() => {
				error = '';
			}, 3000);
		} finally {
			loading = false;
		}
	}
</script>

<button
	onclick={handleExport}
	disabled={loading || !exportElement}
	aria-label="Export board as image"
	title="Save as image"
	class="p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
>
	{#if loading}
		<!-- Spinner -->
		<svg
			class="w-5 h-5 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{:else}
		<!-- Download/image icon -->
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	{/if}
</button>

{#if error}
	<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
		<div
			class="flex items-center gap-3 bg-red-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm"
		>
			<svg class="w-4 h-4 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			<span>{error}</span>
		</div>
	</div>
{/if}
