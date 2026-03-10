<script lang="ts">
  import { themeStore, currentBackground } from '$lib/stores/theme';
  import type { BackgroundTheme } from '$lib/types';

  const backgrounds: { id: BackgroundTheme; label: string; preview: string }[] = [
    { id: 'horse', label: 'Horses', preview: '#c8b8a2' },
    {
      id: 'gradient-blue',
      label: 'Blue',
      preview: 'linear-gradient(135deg, #dbeafe, #ffffff)'
    },
    {
      id: 'gradient-purple',
      label: 'Purple',
      preview: 'linear-gradient(135deg, #ede9fe, #fce7f3)'
    },
    {
      id: 'gradient-warm',
      label: 'Warm',
      preview: 'linear-gradient(135deg, #fef3c7, #fdf2f8)'
    },
    { id: 'solid-white', label: 'White', preview: '#ffffff' }
  ];
</script>

<div class="mb-4">
  <h2 class="text-sm font-semibold text-gray-700 mb-2">Background</h2>
  <div class="flex gap-2 flex-wrap">
    {#each backgrounds as bg}
      <button
        onclick={() => themeStore.setBackground(bg.id)}
        class="w-10 h-10 rounded-lg border-2 transition-all {$currentBackground === bg.id
          ? 'border-blue-500 scale-110 shadow-md'
          : 'border-transparent hover:border-gray-300'}"
        style="background: {bg.preview};"
        title={bg.label}
        aria-label={bg.label}
        aria-pressed={$currentBackground === bg.id}
      ></button>
    {/each}
  </div>
</div>
