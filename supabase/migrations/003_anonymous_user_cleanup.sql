-- =====================================================
-- Anonymous User Cleanup (pg_cron)
-- =====================================================
-- Installs a scheduled pg_cron job that deletes orphaned
-- anonymous Supabase auth users (and their cascaded data)
-- that have been inactive for 30+ days.
--
-- Cascade chain already established in 001_initial_schema:
--   auth.users → boards (ON DELETE CASCADE)
--   boards     → goals  (ON DELETE CASCADE)
--
-- auth.identities, auth.sessions, auth.mfa_factors, and
-- other Supabase auth internals all have ON DELETE CASCADE
-- FKs referencing auth.users, so deleting from auth.users
-- will automatically clean up those rows. No orphans remain.
--
-- PREREQUISITE: pg_cron must be enabled in the Supabase
-- dashboard (Database → Extensions → pg_cron) before
-- applying this migration. It cannot be enabled via SQL
-- on managed Supabase instances.
-- =====================================================

-- Enable pg_cron extension (safe to run if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- postgres already owns the cron schema; this grant is a no-op
-- GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_anonymous_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- prevent search_path hijacking (privilege escalation fix)
AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  -- Note: last_sign_in_at only updates on explicit sign-in; token-refresh
  -- sessions may appear inactive even if the user is still active. This is
  -- an acceptable trade-off for anonymous user cleanup — if users are truly
  -- anonymous and haven't signed in for 30 days, they are considered expired.
  --
  -- Batch delete with LIMIT 1000 to avoid table lock on large datasets.
  -- auth.users ON DELETE CASCADE handles cleanup of auth.identities,
  -- auth.sessions, auth.mfa_factors, etc.
  DELETE FROM auth.users
  WHERE id IN (
    SELECT id FROM auth.users
    WHERE is_anonymous = true
      AND last_sign_in_at < now() - interval '30 days'
    LIMIT 1000
  );

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RAISE LOG 'Anonymous user cleanup: deleted % rows', rows_deleted;
END;
$$;

-- =====================================================
-- SCHEDULE DAILY CLEANUP JOB
-- =====================================================
-- Runs at 3am UTC daily — a low-traffic window.
-- Idempotent: unschedule first if job already exists.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-anonymous-users') THEN
    PERFORM cron.unschedule('cleanup-anonymous-users');
  END IF;
END $$;

SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 3 * * *',
  $$SELECT public.cleanup_anonymous_users()$$
);
