<script lang="ts">
	import { goto } from '$app/navigation';
	import { authError, authStore, isAuthInitialized } from '$lib/stores/auth';
	import { boardsStore } from '$lib/stores/boards';
	import UserMenu from '$lib/components/UserMenu.svelte';

	let boardName = $state('My 2026 Goals');
	let creating = $state(false);
	let error = $state('');
	let nameInput = $state<HTMLInputElement>();
	let buttonWidth = $state(0);
	let buttonHeight = $state(0);

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

	async function retryAuth() {
		await authStore.init();
	}
</script>

<svelte:head>
	<title>Bingo Board - Turn your 2026 goals into a bingo board</title>
</svelte:head>

{#if !$isAuthInitialized}
	<!-- Loading state -->
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"
			></div>
			<p class="text-gray-600">Loading...</p>
		</div>
	</div>
{:else if $authError}
	<!-- Auth init failed -->
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<p data-testid="auth-error-message" class="text-red-600 mb-4">{$authError}</p>
			<button
				data-testid="auth-retry-button"
				onclick={retryAuth}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Try again
			</button>
		</div>
	</div>
{:else}
	<!-- Landing page with inline board creation -->
	<div class="min-h-screen flex flex-col">
		<!-- Header -->
		<header class="bg-transparent">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<a href="/" class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<svg class="w-6 h-6" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect x="1" y="1" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="4,1.8 4.529,3.272 6.092,3.320 4.856,4.278 5.293,5.780 4,4.9 2.707,5.780 3.144,4.278 1.908,3.320 3.471,3.272" fill="#2563eb"/>
								<rect x="8" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="15" y="1" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="1" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="8" y="8" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="11,8.8 11.529,10.272 13.092,10.320 11.856,11.278 12.293,12.780 11,11.9 9.707,12.780 10.144,11.278 8.908,10.320 10.471,10.272" fill="#2563eb"/>
								<rect x="15" y="8" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="1" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="8" y="15" width="6" height="6" rx="1.5" stroke="white" stroke-width="1.5"/>
								<rect x="15" y="15" width="6" height="6" rx="1.5" fill="white"/>
								<polygon points="18,15.8 18.529,17.272 20.092,17.320 18.856,18.278 19.293,19.780 18,18.9 16.707,19.780 17.144,18.278 15.908,17.320 17.471,17.272" fill="#2563eb"/>
							</svg>
						</div>
						<h1 class="text-xl font-bold text-gray-900">BINGOAL</h1>
					</a>
					<UserMenu />
				</div>
			</div>
		</header>

		<div class="flex-1 flex items-center justify-center p-4">
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
					<div
						class="relative wiggle-on-hover"
						bind:clientWidth={buttonWidth}
						bind:clientHeight={buttonHeight}
					>
						<button
							data-testid="create-board-button"
							onclick={handleCreateBoard}
							disabled={creating}
							class="w-full py-4 bg-white hover:bg-blue-50 text-blue-700 text-lg font-semibold rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{#if creating}
								<svg
									class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700"
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
								Click here to get started!
							{/if}
						</button>
						{#if buttonWidth > 0}
							<svg
								data-testid="hand-drawn-border"
								class="absolute pointer-events-none"
								style="top: -8px; left: -8px; overflow: visible;"
								width={buttonWidth + 16}
								height={buttonHeight + 16}
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<filter
										id="hand-drawn"
										x="-4"
										y="-4"
										width={buttonWidth + 24}
										height={buttonHeight + 24}
										filterUnits="userSpaceOnUse"
									>
										<feTurbulence
											type="fractalNoise"
											baseFrequency="0.025"
											numOctaves="3"
											result="noise"
											seed="3"
										/>
										<feDisplacementMap
											in="SourceGraphic"
											in2="noise"
											scale="4"
											xChannelSelector="R"
											yChannelSelector="G"
										/>
									</filter>
								</defs>
								<rect
									x="5"
									y="5"
									width={buttonWidth + 6}
									height={buttonHeight + 6}
									fill="none"
									stroke="#1d4ed8"
									stroke-width="2.5"
									rx="12"
									filter="url(#hand-drawn)"
								/>
							</svg>
						{/if}
					</div>

					<p class="text-xs text-gray-500 text-center">
						No sign-up required. Your board is saved automatically.
					</p>
				</div>
			</div>

			</div>
		</div>
		<footer class="py-6 text-center text-sm text-gray-400">
			<p>© {new Date().getFullYear()} Bingoal &middot;
				<a href="/privacy" class="hover:text-gray-600 transition-colors">Privacy</a>
				&middot;
				<a href="/terms" class="hover:text-gray-600 transition-colors">Terms</a>
			</p>
		</footer>
	</div>
{/if}

<style>
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0deg);
		}
		20% {
			transform: rotate(-1.5deg);
		}
		50% {
			transform: rotate(1.5deg);
		}
		80% {
			transform: rotate(-0.8deg);
		}
	}

	.wiggle-on-hover:hover {
		animation: wiggle 0.35s ease-in-out;
	}
</style>
