<script lang="ts">
  import { Toaster as Sonner } from 'svelte-sonner';
  import type { ToasterProps } from 'svelte-sonner';

  let { theme = 'light' as ToasterProps['theme'], ...restProps }: ToasterProps = $props();
</script>

<Sonner {theme} toastOptions={{ style: "font-family: 'Geist Mono', monospace;" }} {...restProps} />
