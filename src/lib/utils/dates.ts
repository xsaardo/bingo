// ABOUTME: Date formatting utilities for displaying relative and absolute timestamps
// ABOUTME: Provides compact relative time strings like "2h ago" for UI display

import { formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const distance = formatDistanceToNow(date, { addSuffix: true });

	return distance
		.replace(/about /g, '')
		.replace(/ minutes?/g, 'm')
		.replace(/ hours?/g, 'h')
		.replace(/ days?/g, 'd')
		.replace(/ weeks?/g, 'w')
		.replace(/ months?/g, 'mo');
}
