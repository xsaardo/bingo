// ABOUTME: Unit tests for date formatting utilities
// ABOUTME: Validates formatRelativeTime produces compact relative timestamps

import assert from 'node:assert/strict';
import { formatRelativeTime } from '../src/lib/utils/dates';

function isoAgo(ms: number): string {
	return new Date(Date.now() - ms).toISOString();
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Test: recent timestamps use minutes
{
	const result = formatRelativeTime(isoAgo(2 * MINUTE));
	assert.ok(result.includes('m'), `Expected minutes format, got: "${result}"`);
	assert.ok(result.includes('ago'), `Expected "ago" suffix, got: "${result}"`);
}

// Test: hour-scale timestamps use hours
{
	const result = formatRelativeTime(isoAgo(1 * HOUR));
	assert.ok(result.includes('h'), `Expected hours format, got: "${result}"`);
	assert.ok(result.includes('ago'), `Expected "ago" suffix, got: "${result}"`);
}

// Test: day-scale timestamps use days
{
	const result = formatRelativeTime(isoAgo(5 * DAY));
	assert.ok(result.includes('d'), `Expected days format, got: "${result}"`);
	assert.ok(result.includes('ago'), `Expected "ago" suffix, got: "${result}"`);
}

// Test: does not include the word "about"
{
	const result = formatRelativeTime(isoAgo(3 * HOUR));
	assert.ok(!result.includes('about'), `Should not include "about", got: "${result}"`);
}

// Test: does not include full word "minutes" or "hours"
{
	const minuteResult = formatRelativeTime(isoAgo(5 * MINUTE));
	assert.ok(!minuteResult.includes('minutes'), `Should abbreviate "minutes", got: "${minuteResult}"`);
	assert.ok(!minuteResult.includes('minute'), `Should abbreviate "minute", got: "${minuteResult}"`);

	const hourResult = formatRelativeTime(isoAgo(2 * HOUR));
	assert.ok(!hourResult.includes('hours'), `Should abbreviate "hours", got: "${hourResult}"`);
	assert.ok(!hourResult.includes('hour'), `Should abbreviate "hour", got: "${hourResult}"`);
}

console.log('All formatRelativeTime tests passed');
