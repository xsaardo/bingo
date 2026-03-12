<!-- ABOUTME: Shared board card layout: white card with title and CSS grid of cells. -->
<!-- ABOUTME: Used by both the interactive board view and the exportable image board. -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    name: string;
    size: number;
    // If provided, grid uses explicit px sizing (export mode); otherwise fr units (responsive mode)
    cellSize?: number;
    cardClass?: string;
    cardStyle?: string;
    titleClass?: string;
    titleStyle?: string;
    gridClass?: string;
    gridStyle?: string;
    cell: Snippet<[index: number]>;
    footer?: Snippet;
  }

  let {
    name,
    size,
    cellSize,
    cardClass = 'bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 relative h-full flex flex-col',
    cardStyle,
    titleClass = 'font-bold text-gray-900 text-center shrink-0 pb-2 sm:pb-3 truncate',
    titleStyle = 'font-size: 1.8em',
    gridClass = 'flex-1 min-h-0',
    gridStyle,
    cell,
    footer
  }: Props = $props();

  let track = $derived(
    cellSize ? `repeat(${size}, ${cellSize}px)` : `repeat(${size}, minmax(0, 1fr))`
  );
  let computedGridStyle = $derived(
    `display: grid; grid-template-columns: ${track}; grid-template-rows: ${track};${gridStyle ? ' ' + gridStyle : ''}`
  );
</script>

<div class={cardClass} style={cardStyle}>
  <h1 class={titleClass} style={titleStyle}>{name}</h1>
  <div class={gridClass} style={computedGridStyle}>
    {#each { length: size * size } as _, index}
      {@render cell(index)}
    {/each}
  </div>
</div>
{#if footer}
  {@render footer()}
{/if}
