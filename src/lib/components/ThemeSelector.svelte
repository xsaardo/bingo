<script lang="ts">
	import { currentTheme, themes, setTheme, type ThemeName } from '$lib/stores/theme';

	let isOpen = $state(false);
	let theme = $derived($currentTheme);

	function selectTheme(themeName: ThemeName) {
		setTheme(themeName);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}
</script>

<div class="relative">
	<button
		onclick={toggleDropdown}
		class="flex items-center gap-2 px-4 py-2 {theme.colors.buttonSecondary} {theme.colors
			.buttonSecondaryHover} {theme.colors.text} {theme.styles
			.borderRadius} border-2 {theme.colors.squareBorder} transition-colors {theme.fonts.body}"
		aria-label="Select theme"
	>
		<span class="text-xl">{theme.icon}</span>
		<span class="text-sm">{theme.displayName}</span>
		<svg
			class="w-4 h-4 ml-1 transform transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-56 {theme.colors.cardBg} border-2 {theme.colors
				.cardBorder} {theme.styles.borderRadius} {theme.styles.shadow} z-50 overflow-hidden"
		>
			{#each Object.values(themes) as themeOption}
				<button
					onclick={() => selectTheme(themeOption.name)}
					class="w-full flex items-center gap-3 px-4 py-3 {theme.colors.text} hover:bg-opacity-80 {themeOption.name ===
					theme.name
						? theme.colors.squareCompleted
						: 'hover:' + theme.colors.buttonSecondary} transition-colors text-left {theme.fonts
						.body}"
				>
					<span class="text-2xl">{themeOption.icon}</span>
					<div class="flex-1">
						<div class="font-semibold">{themeOption.displayName}</div>
					</div>
					{#if themeOption.name === theme.name}
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Close dropdown when clicking outside -->
{#if isOpen}
	<button
		class="fixed inset-0 z-40"
		onclick={() => (isOpen = false)}
		aria-label="Close theme selector"
	></button>
{/if}
