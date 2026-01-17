<script lang="ts">
	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		confirmVariant?: 'danger' | 'primary';
		onConfirm: () => void | Promise<void>;
		onCancel: () => void;
	}

	let { isOpen, title, message, confirmText = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }: Props = $props();

	let loading = $state(false);

	async function handleConfirm() {
		loading = true;
		try {
			await onConfirm();
		} finally {
			loading = false;
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && !loading) {
			onCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !loading) {
			onCancel();
		} else if (event.key === 'Enter' && !loading) {
			handleConfirm();
		}
	}

	// Button styles based on variant
	const confirmButtonClass = $derived(
		confirmVariant === 'danger'
			? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
			: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
	);

	const iconBgClass = $derived(
		confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
	);

	const headerBgClass = $derived(
		confirmVariant === 'danger' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
	);

	const iconColorClass = $derived(
		confirmVariant === 'danger' ? 'text-red-600' : 'text-blue-600'
	);
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirmation-modal-title"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
			<!-- Header with Icon -->
			<div class="px-6 py-5 border-b {headerBgClass}">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<div class="w-12 h-12 rounded-full flex items-center justify-center {iconBgClass}">
							<svg
								class="w-6 h-6 {iconColorClass}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								{#if confirmVariant === 'danger'}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								{:else}
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								{/if}
							</svg>
						</div>
					</div>
					<div class="ml-4 flex-1">
						<h3 id="confirmation-modal-title" class="text-xl font-bold text-gray-900">
							{title}
						</h3>
					</div>
				</div>
			</div>

			<!-- Body -->
			<div class="px-6 py-5">
				<p class="text-gray-700">{message}</p>
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
				<button
					onclick={onCancel}
					disabled={loading}
					class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
				>
					Cancel
				</button>
				<button
					onclick={handleConfirm}
					disabled={loading}
					class="px-4 py-2 text-white rounded-lg transition-colors disabled:cursor-not-allowed font-medium flex items-center {confirmButtonClass}"
				>
					{#if loading}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
							aria-label="Processing"
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
						Processing...
					{:else}
						{confirmText}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
