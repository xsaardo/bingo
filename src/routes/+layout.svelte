<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';
	import { currentBackground, themeStore } from '$lib/stores/theme';

	let { children } = $props();

	// Initialize auth and theme on app startup
	onMount(() => {
		authStore.init();
		themeStore.init();
	});

	const themeClass = $derived(`theme-${$currentBackground}`);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<div class="{themeClass} min-h-screen">
	{@render children()}
</div>
