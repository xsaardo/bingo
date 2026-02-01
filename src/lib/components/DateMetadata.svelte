<!-- ABOUTME: Displays date metadata (started, completed, last updated) for a goal -->
<!-- ABOUTME: Conditionally shows dates based on availability, uses relative time for recency -->

<script lang="ts">
	import { format } from 'date-fns';
	import { formatRelativeTime } from '$lib/utils/dates';

	interface Props {
		startedAt: string | null;
		completedAt: string | null;
		lastUpdatedAt: string;
	}

	let { startedAt, completedAt, lastUpdatedAt }: Props = $props();
</script>

<div class="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3" data-testid="date-metadata">
	<span class="text-lg">📅</span>
	<div class="flex-1 space-y-1">
		{#if startedAt}
			<div class="flex justify-between" data-testid="date-started">
				<span>Started:</span>
				<span class="font-medium">{format(new Date(startedAt), 'MMM d, yyyy')}</span>
			</div>
		{/if}

		{#if completedAt}
			<div class="flex justify-between" data-testid="date-completed">
				<span>Completed:</span>
				<span class="font-medium text-green-600">
					{format(new Date(completedAt), 'MMM d, yyyy')}
				</span>
			</div>
		{/if}

		<div class="flex justify-between" data-testid="date-last-updated">
			<span>Last updated:</span>
			<span class="font-medium">{formatRelativeTime(lastUpdatedAt)}</span>
		</div>
	</div>
</div>
