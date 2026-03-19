// ABOUTME: Playwright global teardown — runs once after all tests complete.
// ABOUTME: Deletes all boards owned by the test user to prevent accumulation across CI runs.
import { createClient } from '@supabase/supabase-js';

export default async function globalTeardown() {
  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'test-password-123';

  if (!url || !key) {
    console.warn('[teardown] Missing Supabase env vars — skipping board cleanup.');
    return;
  }

  const supabase = createClient(url, key);

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.warn('[teardown] Sign in failed — skipping board cleanup:', signInError.message);
    return;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('boards').delete().eq('user_id', user.id);
  if (error) {
    console.warn('[teardown] Board cleanup failed:', error.message);
  } else {
    console.log(`[teardown] Cleaned up boards for ${user.email}`);
  }
}
