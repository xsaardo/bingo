<script lang="ts">
	import { env } from '$env/dynamic/public';

	const bmcUrl = env.PUBLIC_BMC_URL;
</script>

{#if bmcUrl}
	<a
		href={bmcUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-105 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
		aria-label="Buy me a coffee"
	>
		<span class="text-lg">☕</span>
		<span>Buy me a coffee</span>
	</a>
{/if}
