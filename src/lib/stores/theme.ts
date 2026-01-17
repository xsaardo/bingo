import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeName = 'original' | 'soft' | 'retro' | 'gameboy' | 'arcade';

export interface Theme {
	name: ThemeName;
	displayName: string;
	icon: string;
	colors: {
		background: string;
		cardBg: string;
		cardBorder: string;
		squareDefault: string;
		squareBorder: string;
		squareHover: string;
		squareCompleted: string;
		squareCompletedBorder: string;
		squareBingo: string;
		squareBingoBorder: string;
		bingoBanner: string;
		bingoBannerBorder: string;
		bingoText: string;
		buttonPrimary: string;
		buttonPrimaryHover: string;
		buttonSecondary: string;
		buttonSecondaryHover: string;
		text: string;
		textMuted: string;
	};
	fonts: {
		heading: string;
		body: string;
	};
	styles: {
		borderRadius: string;
		shadow: string;
		shadowLg: string;
	};
}

export const themes: Record<ThemeName, Theme> = {
	original: {
		name: 'original',
		displayName: 'Original',
		icon: '🎨',
		colors: {
			background: 'bg-gray-50',
			cardBg: 'bg-white',
			cardBorder: 'border-gray-200',
			squareDefault: 'bg-white',
			squareBorder: 'border-gray-300',
			squareHover: 'hover:border-blue-400',
			squareCompleted: 'bg-green-50',
			squareCompletedBorder: 'border-green-400',
			squareBingo: 'bg-gradient-to-br from-yellow-100 to-green-100',
			squareBingoBorder: 'border-yellow-500',
			bingoBanner: 'bg-gradient-to-r from-yellow-100 to-green-100',
			bingoBannerBorder: 'border-yellow-500',
			bingoText: 'text-yellow-800',
			buttonPrimary: 'bg-blue-600',
			buttonPrimaryHover: 'hover:bg-blue-700',
			buttonSecondary: 'bg-gray-200',
			buttonSecondaryHover: 'hover:bg-gray-300',
			text: 'text-gray-900',
			textMuted: 'text-gray-600'
		},
		fonts: {
			heading: 'font-bold',
			body: 'font-normal'
		},
		styles: {
			borderRadius: 'rounded-lg',
			shadow: 'shadow-md',
			shadowLg: 'shadow-lg'
		}
	},
	soft: {
		name: 'soft',
		displayName: 'Soft & Elegant',
		icon: '🌸',
		colors: {
			background: 'bg-orange-50',
			cardBg: 'bg-white',
			cardBorder: 'border-orange-100',
			squareDefault: 'bg-white',
			squareBorder: 'border-stone-200',
			squareHover: 'hover:border-rose-300',
			squareCompleted: 'bg-green-50',
			squareCompletedBorder: 'border-green-300',
			squareBingo: 'bg-gradient-to-br from-rose-100 to-green-100',
			squareBingoBorder: 'border-rose-300',
			bingoBanner: 'bg-gradient-to-r from-rose-100 via-purple-100 to-green-100',
			bingoBannerBorder: 'border-rose-300',
			bingoText: 'text-rose-700',
			buttonPrimary: 'bg-rose-400',
			buttonPrimaryHover: 'hover:bg-rose-500',
			buttonSecondary: 'bg-stone-200',
			buttonSecondaryHover: 'hover:bg-stone-300',
			text: 'text-stone-700',
			textMuted: 'text-stone-500'
		},
		fonts: {
			heading: 'font-semibold',
			body: 'font-normal'
		},
		styles: {
			borderRadius: 'rounded-2xl',
			shadow: 'shadow-sm',
			shadowLg: 'shadow-xl'
		}
	},
	retro: {
		name: 'retro',
		displayName: 'Retro 8-bit',
		icon: '🎮',
		colors: {
			background: 'bg-slate-900',
			cardBg: 'bg-slate-800',
			cardBorder: 'border-cyan-400',
			squareDefault: 'bg-slate-700',
			squareBorder: 'border-cyan-500',
			squareHover: 'hover:border-pink-500',
			squareCompleted: 'bg-green-600',
			squareCompletedBorder: 'border-green-400',
			squareBingo: 'bg-gradient-to-br from-yellow-400 to-pink-500',
			squareBingoBorder: 'border-yellow-300',
			bingoBanner: 'bg-gradient-to-r from-purple-600 to-pink-600',
			bingoBannerBorder: 'border-yellow-400',
			bingoText: 'text-yellow-200',
			buttonPrimary: 'bg-cyan-500',
			buttonPrimaryHover: 'hover:bg-cyan-400',
			buttonSecondary: 'bg-slate-600',
			buttonSecondaryHover: 'hover:bg-slate-500',
			text: 'text-cyan-100',
			textMuted: 'text-cyan-300'
		},
		fonts: {
			heading: 'font-retro',
			body: 'font-pixel'
		},
		styles: {
			borderRadius: 'rounded-none',
			shadow: 'shadow-none border-2',
			shadowLg: 'shadow-none border-4'
		}
	},
	gameboy: {
		name: 'gameboy',
		displayName: 'Game Boy',
		icon: '💚',
		colors: {
			background: 'bg-[#9BBC0F]',
			cardBg: 'bg-[#8BAC0F]',
			cardBorder: 'border-[#306230]',
			squareDefault: 'bg-[#9BBC0F]',
			squareBorder: 'border-[#306230]',
			squareHover: 'hover:border-[#0F380F]',
			squareCompleted: 'bg-[#0F380F]',
			squareCompletedBorder: 'border-[#0F380F]',
			squareBingo: 'bg-[#306230]',
			squareBingoBorder: 'border-[#0F380F]',
			bingoBanner: 'bg-[#0F380F]',
			bingoBannerBorder: 'border-[#0F380F]',
			bingoText: 'text-[#9BBC0F]',
			buttonPrimary: 'bg-[#306230]',
			buttonPrimaryHover: 'hover:bg-[#0F380F]',
			buttonSecondary: 'bg-[#8BAC0F]',
			buttonSecondaryHover: 'hover:bg-[#306230]',
			text: 'text-[#0F380F]',
			textMuted: 'text-[#306230]'
		},
		fonts: {
			heading: 'font-retro',
			body: 'font-pixel'
		},
		styles: {
			borderRadius: 'rounded-sm',
			shadow: 'shadow-none border-2',
			shadowLg: 'shadow-none border-4'
		}
	},
	arcade: {
		name: 'arcade',
		displayName: 'Arcade',
		icon: '🕹️',
		colors: {
			background: 'bg-red-950',
			cardBg: 'bg-red-900',
			cardBorder: 'border-yellow-400',
			squareDefault: 'bg-red-800',
			squareBorder: 'border-yellow-500',
			squareHover: 'hover:border-cyan-400',
			squareCompleted: 'bg-green-600',
			squareCompletedBorder: 'border-green-400',
			squareBingo: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600',
			squareBingoBorder: 'border-yellow-300',
			bingoBanner: 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600',
			bingoBannerBorder: 'border-yellow-300',
			bingoText: 'text-yellow-100',
			buttonPrimary: 'bg-yellow-500',
			buttonPrimaryHover: 'hover:bg-yellow-400',
			buttonSecondary: 'bg-red-700',
			buttonSecondaryHover: 'hover:bg-red-600',
			text: 'text-yellow-100',
			textMuted: 'text-yellow-300'
		},
		fonts: {
			heading: 'font-retro',
			body: 'font-retro'
		},
		styles: {
			borderRadius: 'rounded',
			shadow: 'shadow-lg shadow-yellow-900/50',
			shadowLg: 'shadow-2xl shadow-yellow-900/70'
		}
	}
};

// Load saved theme from localStorage or default to 'original'
const savedTheme = browser ? (localStorage.getItem('bingo-theme') as ThemeName) || 'original' : 'original';

export const currentTheme = writable<Theme>(themes[savedTheme]);

// Save theme to localStorage when it changes
if (browser) {
	currentTheme.subscribe((theme) => {
		localStorage.setItem('bingo-theme', theme.name);
	});
}

export function setTheme(themeName: ThemeName) {
	currentTheme.set(themes[themeName]);
}
