<script lang="ts">
	interface Props {
		error: string | null;
		onDismiss?: () => void;
		showIcon?: boolean;
	}

	let { error = null, onDismiss, showIcon = true }: Props = $props();
</script>

{#if error}
	<div
		role="alert"
		aria-live="polite"
		class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start animate-in slide-in-from-top-2 duration-200"
	>
		{#if showIcon}
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
		{/if}
		<p class="text-sm text-red-800 flex-1">{error}</p>
		{#if onDismiss}
			<button
				onclick={onDismiss}
				class="ml-2 text-red-600 hover:text-red-800 transition-colors"
				aria-label="Dismiss error"
			>
				<svg
					class="w-5 h-5"
					aria-hidden="true"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
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
{/if}
