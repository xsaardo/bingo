// ABOUTME: Server-side loader for shared board pages so crawlers see real content.
// ABOUTME: Fetches the public board via Supabase; respects RLS (is_public = true).

import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { PageServerLoad } from './$types';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const { data, error: dbError } = await supabase
    .from('boards')
    .select(
      `
				id,
				name,
				size,
				is_public,
				font,
				created_at,
				updated_at,
				goals (
					id,
					position,
					title,
					completed
				)
			`
    )
    .eq('id', params.id)
    .single();

  if (dbError || !data || !data.is_public) {
    throw error(404, 'Board not found or not public');
  }

  setHeaders({
    'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
  });

  const goals = (data.goals || []).sort((a, b) => a.position - b.position);
  const completedCount = goals.filter((g) => g.completed).length;

  return {
    board: {
      id: data.id,
      name: data.name,
      size: data.size,
      font: data.font,
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        completed: g.completed,
        position: g.position
      })),
      completedCount,
      totalCount: goals.length,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  };
};
