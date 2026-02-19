<!-- ABOUTME: Welcome modal shown when a new board is first created -->
<!-- ABOUTME: Invites users to click any square to start adding goals -->
<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		boardSize: number;
	}

	let { isOpen, onClose, boardSize }: Props = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	// Global keyboard event listener for Escape key
	$effect(() => {
		if (!isOpen) return;

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="welcome-title"
		tabindex="-1"
	>
		<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
			<!-- Header -->
			<div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
				<div class="text-center">
					<div
						class="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-3"
					>
						<svg
							class="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</div>
					<h2 id="welcome-title" class="text-2xl font-bold text-white">Your board is ready!</h2>
				</div>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-4">
				<div class="text-center">
					<p class="text-gray-700 text-lg mb-4">
						You have a {boardSize}×{boardSize} grid with {boardSize * boardSize} squares ready to fill.
					</p>
					<p class="text-gray-600">
						Click any square to add your first goal and start tracking your progress!
					</p>
				</div>

				<!-- Visual hint -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div class="flex items-start">
						<svg
							class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="text-sm text-blue-800">
							<strong>Tip:</strong> Each square can hold a goal with detailed notes. Complete goals by
							clicking the checkbox, and watch for bingo lines!
						</p>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="px-6 pb-6">
				<button
					onclick={onClose}
					class="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
				>
					Get Started
				</button>
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
