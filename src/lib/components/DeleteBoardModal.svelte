<script lang="ts">
	import { boardsStore } from '$lib/stores/boards';
	import type { Board } from '$lib/types';

	interface Props {
		isOpen: boolean;
		board: Board | null;
		onClose: () => void;
	}

	let { isOpen, board, onClose }: Props = $props();

	let loading = $state(false);
	let error = $state('');

	// Reset error when modal opens/closes
	$effect(() => {
		if (isOpen) {
			error = '';
		}
	});

	async function handleDelete() {
		if (!board) return;

		loading = true;
		error = '';

		const result = await boardsStore.deleteBoard(board.id);

		loading = false;

		if (result.success) {
			onClose();
		} else {
			error = result.error || 'Failed to delete board';
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !loading) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !loading) {
			onClose();
		}
	}
</script>

{#if isOpen && board}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-modal-title"
	>
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
		>
			<!-- Header with Warning Icon -->
			<div class="bg-red-50 px-6 py-5 border-b border-red-100">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
							<svg
								class="w-6 h-6 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					</div>
					<div class="ml-4 flex-1">
						<h2 id="delete-modal-title" class="text-xl font-bold text-gray-900">
							Delete Board?
						</h2>
						<p class="text-sm text-gray-600 mt-1">This action cannot be undone</p>
					</div>
					{#if !loading}
						<button
							onclick={onClose}
							class="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
							aria-label="Close modal"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-4">
				<!-- Board Info -->
				<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
					<p class="text-sm text-gray-600 mb-1">Board to delete:</p>
					<p class="font-semibold text-gray-900 text-lg">{board.name}</p>
					<p class="text-sm text-gray-500 mt-1">
						{board.size}×{board.size} grid • {board.goals.length} goals
					</p>
				</div>

				<!-- Warning Message -->
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
					<div class="flex items-start">
						<svg
							class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div class="text-sm text-yellow-800">
							<p class="font-medium mb-1">Warning: Permanent Deletion</p>
							<ul class="list-disc list-inside space-y-1">
								<li>All goals will be permanently deleted</li>
								<li>All progress will be lost</li>
								<li>This action cannot be undone</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
						<svg
							class="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="text-sm text-red-800">{error}</p>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex items-center justify-end space-x-3 pt-2">
					<button
						type="button"
						onclick={onClose}
						disabled={loading}
						class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleDelete}
						disabled={loading}
						class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center"
					>
						{#if loading}
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
							Deleting...
						{:else}
							<svg
								class="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete Board
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes scale-in {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
