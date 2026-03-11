/**
 * Goal Suggestions API
 *
 * POST /api/suggest-goals
 *
 * Accepts a list of existing goal titles as context and returns a list of
 * suggested goal titles the user might want to add to their bingo board.
 *
 * Request body:
 *   { existingGoals: string[] }
 *
 * Response:
 *   200 { suggestions: string[] }
 *   400 { error: string }
 *   500 { error: string }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SUGGESTIONS_POOL = [
  'Run a 5K race',
  'Read 12 books this year',
  'Learn a new language',
  'Cook a new recipe every week',
  'Meditate daily for 30 days',
  'Learn to play a musical instrument',
  'Complete a home improvement project',
  'Start a journaling practice',
  'Travel to a new country',
  'Learn to paint or draw',
  'Run a half marathon',
  'Complete a coding project',
  'Grow your own vegetables',
  'Take a photography course',
  'Learn to swim or improve your technique',
  'Do a digital detox for a week',
  'Volunteer for a cause you care about',
  'Learn a new dance style',
  'Complete a 30-day fitness challenge',
  'Write and publish a blog post',
  'Take an online course and earn a certificate',
  'Practice gratitude daily',
  'Save a set amount of money',
  'Learn to make bread from scratch',
  'Reconnect with an old friend',
  'Attend a live concert or show',
  'Learn basic first aid',
  'Declutter and donate unused items',
  'Try a new sport',
  'Create a morning routine and stick to it'
];

// Note: this endpoint is intentionally unauthenticated (serves anonymous users browsing goal suggestions).
// It accesses only a static in-memory pool — no DB or AI cost — so no rate limiting is applied.
// If this ever calls an external API or DB, add rate limiting before shipping.
export const POST: RequestHandler = async ({ request }) => {
  let body: { existingGoals?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { existingGoals } = body;

  if (!Array.isArray(existingGoals)) {
    return json({ error: '`existingGoals` must be an array' }, { status: 400 });
  }

  if (existingGoals.length > 100) {
    return json({ error: '`existingGoals` must contain at most 100 items' }, { status: 400 });
  }

  // Simple prefix-based dedup (MVP): compares first 10 chars of suggestion vs existing goals.
  // Intentionally naive — avoids adding a full fuzzy-match dependency for a static suggestion pool.
  const existingLower = (existingGoals as unknown[])
    .filter((g): g is string => typeof g === 'string')
    .map((g) => g.toLowerCase());
  const filtered = SUGGESTIONS_POOL.filter((suggestion) => {
    const suggestionLower = suggestion.toLowerCase();
    return !existingLower.some(
      (existing) =>
        existing.length > 5 &&
        (existing.includes(suggestionLower.slice(0, 10)) ||
          suggestionLower.includes(existing.slice(0, 10)))
    );
  });

  // Return up to 8 suggestions, shuffled for variety
  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 8);

  return json({ suggestions: shuffled });
};
