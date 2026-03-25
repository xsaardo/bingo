<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated, isAnonymous } from '$lib/stores/auth';
  import MagicLinkForm from '$lib/components/MagicLinkForm.svelte';
  import Logo from '$lib/components/Logo.svelte';

  // Redirect to dashboard if already logged in as a real user
  onMount(() => {
    if ($isAuthenticated && !$isAnonymous) {
      goto('/dashboard');
    }
  });

  // Also watch for auth state changes
  $: if ($isAuthenticated && !$isAnonymous) {
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Sign In - Bingoals</title>
  <meta property="og:title" content="Sign In — Bingoals" />
  <meta name="description" content="Sign in to Bingoals to access your goal boards." />
  <meta property="og:description" content="Sign in to Bingoals to access your goal boards." />
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4" style="background:#EDE8DF">
  <div class="w-full max-w-md">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex mb-4">
        <Logo size="4rem" />
      </div>
      <h1 class="text-3xl font-bold mb-2 uppercase tracking-tight" style="color:#1E2A1A">
        Welcome to BINGOALS
      </h1>
      <p style="color:#1E2A1A;opacity:0.7">Sign in to create and manage your bingo boards</p>
    </div>

    <!-- Login Form Card -->
    <div class="card-organic p-8">
      <MagicLinkForm />
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center">
      <p class="text-sm" style="color:#1E2A1A;opacity:0.6">
        New to Bingo Board? Don't worry, we'll create your account automatically when you sign in.
      </p>
    </div>

    <!-- Test Page Link (for development) -->
    {#if import.meta.env.DEV}
      <div class="mt-4 text-center">
        <a href="/test-auth" class="text-sm text-gray-500 hover:text-gray-700">
          Debug: Test Auth Page
        </a>
      </div>
    {/if}
  </div>
</main>
