<script lang="ts">
  import { env } from '$env/dynamic/public';
  import Logo from '$lib/components/Logo.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';

  const bmcUrl = env.PUBLIC_BMC_URL;
</script>

<svelte:head>
  <title>About — Bingoals</title>
  <meta property="og:title" content="About — Bingoals" />
  <meta
    name="description"
    content="Learn about Bingoals — a simple tool for tracking goals as a bingo board."
  />
  <meta
    property="og:description"
    content="Learn about Bingoals — a simple tool for tracking goals as a bingo board."
  />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center space-x-3">
          <Logo />
          <h1 class="text-xl font-bold text-gray-900">BINGOALS</h1>
        </a>
        <UserMenu />
      </div>
    </div>
  </header>

  <!-- Content -->
  <main class="flex-1 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">About Bingoals</h1>

        <div class="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Bingoals is a simple, fun way to set and track your goals for the year. Turn your
              resolutions and aspirations into a bingo board — complete goals, mark them off, and
              aim for bingo.
            </p>
            <p class="mt-4">
              Whether it's fitness milestones, creative projects, travel adventures, or personal
              growth, Bingoals helps you visualize your year at a glance and celebrate every win
              along the way.
            </p>
          </section>

          {#if bmcUrl}
            <section>
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Support</h2>
              <p>
                If you're enjoying Bingoals and want to say thanks, you can
                <a
                  href={bmcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-700 underline">buy me a coffee</a
                >. It means a lot!
              </p>
            </section>
          {/if}

          <section>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Feedback</h2>
            <p>
              Have a suggestion, found a bug, or just want to say hi? We'd love to hear from you.
              Reach out at
              <a
                href="mailto:hello@gobingoals.app"
                class="text-blue-600 hover:text-blue-700 underline">hello@gobingoals.app</a
              >.
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-6 text-center text-sm text-gray-400">
    <p>
      © {new Date().getFullYear()} Bingoals &middot;
      <a href="/privacy" class="hover:text-gray-600 transition-colors">Privacy</a>
      &middot;
      <a href="/terms" class="hover:text-gray-600 transition-colors">Terms</a>
    </p>
  </footer>
</div>
