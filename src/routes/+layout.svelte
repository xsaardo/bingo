<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { authStore } from '$lib/stores/auth';
  import { currentBackground, themeStore } from '$lib/stores/theme';
  import { Toaster } from 'svelte-sonner';

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
  <meta
    name="description"
    content="Turn your goals into a bingo board. Track progress, celebrate wins, and stay motivated."
  />
  <meta
    property="og:description"
    content="Turn your goals into a bingo board. Track progress, celebrate wins, and stay motivated."
  />
</svelte:head>

<div class="{themeClass} min-h-screen">
  {@render children()}
</div>

<Toaster richColors closeButton toastOptions={{ style: "font-family: 'Geist Mono', monospace;" }} />
