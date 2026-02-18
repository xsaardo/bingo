<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthInitialized } from '$lib/stores/auth';
	import { boardsStore } from '$lib/stores/boards';

	let boardName = $state('My 2026 Goals');
	let creating = $state(false);
	let error = $state('');
	let nameInput = $state<HTMLInputElement>();

	// Auto-select the placeholder text when input is focused
	function handleFocus(e: FocusEvent) {
		const input = e.target as HTMLInputElement;
		input.select();
	}

	async function handleCreateBoard() {
		creating = true;
		error = '';

		const result = await boardsStore.createBoard(boardName.trim() || 'My 2026 Goals', 5);
		creating = false;

		if (result.success && result.board) {
			goto(`/boards/${result.board.id}`);
		} else {
			error = result.error || 'Failed to create board';
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !creating) {
			handleCreateBoard();
		}
	}
</script>

<svelte:head>
	<title>Bingo Board - Turn your 2026 goals into a bingo board</title>
</svelte:head>

{#if !$isAuthInitialized}
	<!-- Loading state -->
	<div class="min-h-screen bg-gray-50 flex items-center justify-center">
		<div class="text-center">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"
			></div>
			<p class="text-gray-600">Loading...</p>
		</div>
	</div>
{:else}
	<!-- Landing page with inline board creation -->
	<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
		<div class="max-w-2xl w-full">
			<div class="text-center mb-8">
				<h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
					Turn your 2026 goals into a bingo board
				</h1>
				<p class="text-lg sm:text-xl text-gray-600">
					Track visually. Share progress. Celebrate bingos.
				</p>
			</div>

			<div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
				<div class="space-y-6">
					<!-- Board Name -->
					<div>
						<label for="board-name" class="block text-sm font-medium text-gray-700 mb-2">
							What's your board called?
						</label>
						<input
							bind:this={nameInput}
							id="board-name"
							type="text"
							bind:value={boardName}
							onfocus={handleFocus}
							onkeydown={handleKeyDown}
							placeholder="My 2026 Goals"
							disabled={creating}
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>

					<!-- Error Message -->
					{#if error}
						<div
							role="alert"
							class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
						>
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

					<!-- Create Button -->
					<button
						onclick={handleCreateBoard}
						disabled={creating}
						class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
					>
						{#if creating}
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
							Creating your 5×5 board...
						{:else}
							Create 5×5 Board
						{/if}
					</button>

					<p class="text-xs text-gray-500 text-center">
						No sign-up required. Your board is saved automatically.
					</p>
				</div>
			</div>

			<!-- Footer -->
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-600">
					Already have an account?
					<a href="/auth/login" class="text-blue-600 hover:text-blue-700 font-medium">
						Sign in
					</a>
				</p>
			</div>
		</div>
	</div>
{/if}
