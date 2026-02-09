// ABOUTME: Date formatting utilities for the application
// ABOUTME: Provides functions to format dates in user-friendly relative formats

import { formatDistanceToNowStrict } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const distance = formatDistanceToNowStrict(date, { addSuffix: true });

	// Abbreviate units: "10 seconds ago" → "10s ago", "2 minutes ago" → "2m ago"
	return distance
		.replace(/ seconds?/g, 's')
		.replace(/ minutes?/g, 'm')
		.replace(/ hours?/g, 'h')
		.replace(/ days?/g, 'd')
		.replace(/ months?/g, 'mo')
		.replace(/ years?/g, 'y');
}
