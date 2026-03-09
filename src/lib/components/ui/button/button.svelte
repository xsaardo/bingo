<script module lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';

  export const buttonVariants = tv({
    base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--primary-foreground)] shadow hover:bg-[var(--primary)]/90',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:bg-[var(--destructive)]/90',
        outline:
          'border border-[var(--border)] bg-[var(--background)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm hover:bg-[var(--secondary)]/80',
        ghost: 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  });

  export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
</script>

<script lang="ts">
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils.js';

  type BaseProps = {
    variant?: ButtonVariantProps['variant'];
    size?: ButtonVariantProps['size'];
    class?: string;
  };

  type ButtonElementProps = BaseProps &
    HTMLButtonAttributes & {
      href?: undefined;
    };

  type AnchorElementProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
    };

  type Props = ButtonElementProps | AnchorElementProps;

  let {
    variant = 'default',
    size = 'default',
    class: className,
    href,
    type = 'button',
    children,
    ...restProps
  }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class={cn(buttonVariants({ variant, size }), className)}
    {...restProps as HTMLAnchorAttributes}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    class={cn(buttonVariants({ variant, size }), className)}
    {...restProps as HTMLButtonAttributes}
  >
    {@render children?.()}
  </button>
{/if}
