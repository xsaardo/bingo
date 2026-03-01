<!-- ABOUTME: shadcn-svelte-style Button prototype component (see SHADCN_INVESTIGATION.md) -->
<!-- ABOUTME: Demonstrates CSS variable theming, variant/size props, Svelte 5 runes API -->

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
	type Size = 'default' | 'sm' | 'lg' | 'icon';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		class?: string;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		children,
		...restProps
	}: Props = $props();

	// Base classes shared by all variants
	const base =
		'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

	const variantClasses: Record<Variant, string> = {
		default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
		destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
		outline:
			'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-600',
		ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-indigo-600',
		link: 'text-indigo-600 underline-offset-4 hover:underline focus-visible:ring-indigo-600'
	};

	const sizeClasses: Record<Size, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-8 rounded-md px-3 text-xs',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
</script>

<button class={classes} {...restProps}>
	{@render children?.()}
</button>
