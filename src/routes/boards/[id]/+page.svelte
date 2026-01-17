<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import ThemeSelector from '$lib/components/ThemeSelector.svelte';
	import BingoBoard from '$lib/components/BingoBoard.svelte';
	import { currentBoardStore, currentBoard, currentBoardLoading } from '$lib/stores/currentBoard';
	import { currentTheme } from '$lib/stores/theme';

	const boardId = $derived($page.params.id);
	let theme = $derived($currentTheme);

	// Load board when component mounts
	onMount(async () => {
		const result = await currentBoardStore.loadBoard(boardId);

		// If board not found, redirect to dashboard
		if (!result.success) {
			setTimeout(() => {
				goto('/dashboard');
			}, 2000);
		}

		// Cleanup when leaving
		return () => {
			currentBoardStore.clear();
		};
	});
</script>

<svelte:head>
	<title>{$currentBoard?.name || 'Board'} - Bingo Board</title>
</svelte:head>

<AuthGuard>
	<div class="min-h-screen {theme.colors.background}">
		<!-- Header -->
		<header class="{theme.colors.cardBg} border-b-2 {theme.colors.cardBorder}">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-4">
						<!-- Back Button -->
						<a
							href="/dashboard"
							class="p-2 {theme.colors.textMuted} hover:{theme.colors.text} {theme.colors.buttonSecondaryHover} {theme.styles.borderRadius} transition-colors"
							title="Back to dashboard"
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</a>

						<!-- Board Info -->
						<div>
							{#if $currentBoard}
								<h1 class="text-xl {theme.fonts.heading} {theme.colors.text}">{$currentBoard.name}</h1>
								<p class="text-sm {theme.colors.textMuted} {theme.fonts.body}">
									{$currentBoard.size}×{$currentBoard.size} grid • {$currentBoard.goals.length} goals
									• {$currentBoard.goals.filter((g) => g.completed).length} completed
								</p>
							{:else}
								<div class="h-6 w-48 {theme.colors.squareCompleted} rounded animate-pulse"></div>
							{/if}
						</div>
					</div>

					<div class="flex items-center space-x-4">
						<ThemeSelector />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{#if $currentBoardLoading}
				<!-- Loading State -->
				<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadow} border-2 {theme.colors.cardBorder} p-12 text-center">
					<div
						class="animate-spin rounded-full h-12 w-12 border-b-4 {theme.colors.buttonPrimary} mx-auto mb-4"
					></div>
					<p class="{theme.colors.textMuted} {theme.fonts.body}">Loading board...</p>
				</div>
			{:else if !$currentBoard}
				<!-- Board Not Found -->
				<div class="{theme.colors.cardBg} {theme.styles.borderRadius} {theme.styles.shadow} border-2 {theme.colors.cardBorder} p-12 text-center">
					<div
						class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
					>
						<svg
							class="w-8 h-8 text-red-600"
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
					</div>
					<h2 class="text-2xl {theme.fonts.heading} {theme.colors.text} mb-2">Board Not Found</h2>
					<p class="{theme.colors.textMuted} mb-6 {theme.fonts.body}">
						This board doesn't exist or you don't have access to it.
					</p>
					<p class="text-sm {theme.colors.textMuted} {theme.fonts.body}">Redirecting to dashboard...</p>
				</div>
			{:else}
				<!-- BingoBoard Component -->
				<div class="max-w-4xl mx-auto">
					<BingoBoard />
				</div>
			{/if}
		</main>
	</div>
</AuthGuard>
