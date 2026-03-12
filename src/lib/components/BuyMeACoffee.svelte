<script lang="ts">
  import { env } from '$env/dynamic/public';

  const bmcUrl = env.PUBLIC_BMC_URL;
</script>

{#if bmcUrl}
  <a
    href={bmcUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-yellow-400 p-4 shadow-lg transition-transform hover:scale-105 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
    style="clip-path: polygon(30% 2%, 70% 0%, 95% 15%, 100% 50%, 92% 82%, 65% 100%, 25% 98%, 5% 80%, 0% 45%, 8% 15%);"
    aria-label="Buy me a coffee"
  >
    <img
      src="/coffeecup.jpeg"
      alt="coffee cup"
      class="h-10 w-10 object-contain mix-blend-multiply"
    />
  </a>
{/if}
