import { writable } from 'svelte/store';
import type { Board } from '$lib/types';

export const boardStore = writable<Board | null>(null);
