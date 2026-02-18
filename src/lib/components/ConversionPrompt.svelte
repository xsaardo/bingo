<!-- ABOUTME: Prompts anonymous users to sign up when they want advanced features -->
<!-- ABOUTME: Shows non-blocking modal with context-specific messaging based on trigger -->

<script lang="ts">
	import { currentUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	interface Props {
		trigger: 'share' | 'notes' | 'milestones';
		isOpen: boolean;
		onDismiss: () => void;
	}

	let { trigger, isOpen, onDismiss }: Props = $props();

	// Check if user is anonymous
	const isAnonymous = $derived($currentUser?.is_anonymous === true);

	// Get context-specific messaging
	const heading = $derived(
		trigger === 'share'
			? 'Sign up to share your board'
			: trigger === 'notes'
				? 'Sign up to save detailed notes'
				: 'Sign up to track milestones'
	);

	const description = $derived(
		trigger === 'share'
			? 'Create an account to share your board on TikTok, Instagram, and more. Your progress will be saved across all devices.'
			: 'Create an account to save your progress notes and access your board from any device.'
	);

	function handleSignUp() {
		// Redirect to login page with intent parameter
		goto('/auth/login?intent=upgrade');
	}

	function handleDismiss() {
		onDismiss();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleDismiss();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleDismiss();
		}
	}
</script>

{#if isOpen && isAnonymous}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="conversion-heading"
		tabindex="-1"
	>
		<div
			class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up sm:animate-scale-in"
		>
			<!-- Icon -->
			<div class="flex justify-center mb-4">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
					{#if trigger === 'share'}
						<svg
							class="w-8 h-8 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
					{:else}
						<svg
							class="w-8 h-8 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					{/if}
				</div>
			</div>

			<!-- Content -->
			<h3 id="conversion-heading" class="text-xl font-bold text-gray-900 text-center mb-2">
				{heading}
			</h3>
			<p class="text-gray-600 text-center mb-6">
				{description}
			</p>

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row gap-3">
				<button
					onclick={handleSignUp}
					class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
				>
					Sign Up with Email
				</button>
				<button
					onclick={handleDismiss}
					class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
				>
					Maybe Later
				</button>
			</div>

			<p class="text-xs text-gray-500 text-center mt-4">
				Already have an account?
				<a href="/auth/login" class="text-blue-600 hover:text-blue-700 font-medium">Sign in</a>
			</p>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

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

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
