<script lang="ts">
	import { boardsStore } from '$lib/stores/boards';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	let name = $state('');
	let size = $state(3);
	let loading = $state(false);
	let error = $state('');
	let nameInput = $state<HTMLInputElement | undefined>(undefined);

	// Reset form and focus when modal opens
	$effect(() => {
		if (isOpen) {
			name = '';
			size = 3;
			error = '';
			// Focus the name input after a brief delay to ensure modal is rendered
			setTimeout(() => nameInput?.focus(), 100);
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		// Validate
		if (!name.trim()) {
			error = 'Please enter a board name';
			return;
		}

		if (name.length > 255) {
			error = 'Board name is too long (max 255 characters)';
			return;
		}

		loading = true;
		error = '';

		const result = await boardsStore.createBoard(name.trim(), size);

		loading = false;

		if (result.success) {
			onClose();
		} else {
			error = result.error || 'Failed to create board';
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
			<!-- Header -->
			<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
				<div class="flex items-center justify-between">
					<h2 id="modal-title" class="text-xl font-bold text-white">Create New Board</h2>
					<button
						onclick={onClose}
						class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
						aria-label="Close modal"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<p class="text-blue-100 text-sm mt-1">Set up your bingo board</p>
			</div>

			<!-- Form -->
			<form onsubmit={handleSubmit} class="p-6 space-y-5">
				<!-- Board Name -->
				<div>
					<label for="board-name" class="block text-sm font-medium text-gray-700 mb-2">
						Board Name <span class="text-red-500">*</span>
					</label>
					<input
						bind:this={nameInput}
						id="board-name"
						type="text"
						bind:value={name}
						placeholder="e.g., 2026 Goals, Reading Challenge, Fitness Bingo"
						required
						maxlength="255"
						disabled={loading}
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
					/>
					<p class="text-xs text-gray-500 mt-1">Give your board a memorable name</p>
				</div>

				<!-- Board Size -->
				<div>
					<div class="block text-sm font-medium text-gray-700 mb-3">
						Board Size <span class="text-red-500">*</span>
					</div>
					<div class="grid grid-cols-3 gap-3">
						{#each [3, 4, 5] as sizeOption}
							<button
								type="button"
								onclick={() => (size = sizeOption)}
								disabled={loading}
								class="relative p-4 border-2 rounded-lg transition-all disabled:cursor-not-allowed {size ===
								sizeOption
									? 'border-blue-600 bg-blue-50'
									: 'border-gray-200 hover:border-blue-300 bg-white'}"
							>
								{#if size === sizeOption}
									<div class="absolute top-2 right-2">
										<svg
											class="w-5 h-5 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
								{/if}
								<div class="text-center">
									<div
										class="text-2xl font-bold {size === sizeOption
											? 'text-blue-600'
											: 'text-gray-700'}"
									>
										{sizeOption}×{sizeOption}
									</div>
									<div class="text-xs text-gray-500 mt-1">
										{sizeOption * sizeOption} goals
									</div>
								</div>
							</button>
						{/each}
					</div>
					<p class="text-xs text-gray-500 mt-2">Choose how many goals you want on your board</p>
				</div>

				<!-- Error Message -->
				{#if error}
					<div
						role="alert"
						aria-live="polite"
						class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
					>
						<svg
							class="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
							aria-hidden="true"
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
				<div class="flex items-center justify-end space-x-3 pt-4 border-t">
					<button
						type="button"
						onclick={onClose}
						disabled={loading}
						class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
					>
						{#if loading}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								aria-label="Creating board"
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
							Creating...
						{:else}
							Create Board
						{/if}
					</button>
				</div>
			</form>
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
