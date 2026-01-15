<script lang="ts">
	import { hasLegacyBoard, migrateLegacyBoard, skipMigration } from '$lib/utils/migration';

	interface Props {
		onComplete: () => void;
	}

	let { onComplete }: Props = $props();

	let showPrompt = $state(hasLegacyBoard());
	let migrating = $state(false);
	let error = $state('');

	async function handleMigrate() {
		migrating = true;
		error = '';

		const result = await migrateLegacyBoard();

		migrating = false;

		if (result.success) {
			showPrompt = false;
			onComplete();
		} else {
			error = result.error || 'Migration failed';
		}
	}

	function handleSkip() {
		skipMigration();
		showPrompt = false;
	}
</script>

{#if showPrompt}
	<div
		class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-6 mb-6 shadow-lg"
	>
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
				</div>
			</div>
			<div class="ml-4 flex-1">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">
					Migrate Your Existing Board 🚀
				</h3>
				<p class="text-sm text-gray-700 mb-4">
					We detected a bingo board saved in your browser. Would you like to migrate it to your
					account? Your data will be securely saved to the cloud and accessible from any device.
				</p>

				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
						<p class="text-sm text-red-800">{error}</p>
					</div>
				{/if}

				<div class="flex items-center space-x-3">
					<button
						onclick={handleMigrate}
						disabled={migrating}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
					>
						{#if migrating}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Migrating...
						{:else}
							Migrate Board
						{/if}
					</button>

					<button
						onclick={handleSkip}
						disabled={migrating}
						class="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Skip
					</button>
				</div>

				<p class="text-xs text-gray-500 mt-3">
					<strong>Note:</strong> Migration will create a new board with the same size. You'll need
					to re-enter your goal details.
				</p>
			</div>
		</div>
	</div>
{/if}
