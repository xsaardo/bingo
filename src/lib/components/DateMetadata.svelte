<!-- ABOUTME: Displays startedAt, completedAt, and lastUpdatedAt dates for a goal -->
<!-- ABOUTME: Formats absolute dates and relative timestamps in a compact layout -->

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

<div class="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
	<span class="text-lg">📅</span>
	<div class="flex-1 space-y-1">
		{#if startedAt}
			<div class="flex justify-between">
				<span>Started:</span>
				<span class="font-medium">{format(new Date(startedAt), 'MMM d, yyyy')}</span>
			</div>
		{/if}

		{#if completedAt}
			<div class="flex justify-between">
				<span>Completed:</span>
				<span class="font-medium text-green-600">
					{format(new Date(completedAt), 'MMM d, yyyy')}
				</span>
			</div>
		{/if}

		<div class="flex justify-between">
			<span>Last updated:</span>
			<span class="font-medium">{formatRelativeTime(lastUpdatedAt)}</span>
		</div>
	</div>
</div>
