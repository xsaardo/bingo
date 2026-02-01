// ABOUTME: Date formatting utilities for the application
// ABOUTME: Provides functions to format dates in user-friendly relative formats

import { formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const distance = formatDistanceToNow(date, { addSuffix: true });

	// Simplify output: "about 2 hours ago" → "2h ago"
	return distance
		.replace(/about /g, '')
		.replace(/ minutes?/g, 'm')
		.replace(/ hours?/g, 'h')
		.replace(/ days?/g, 'd')
		.replace(/ months?/g, 'mo');
}
