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
-- PREREQUISITE: pg_cron must be enabled in the Supabase
-- dashboard (Database → Extensions → pg_cron) before
-- applying this migration. It cannot be enabled via SQL
-- on managed Supabase instances.
-- =====================================================

-- Enable pg_cron extension (safe to run if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant cron usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_anonymous_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  DELETE FROM auth.users
  WHERE is_anonymous = true
    AND last_sign_in_at < now() - interval '30 days';

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RAISE LOG 'Anonymous user cleanup: deleted % rows', rows_deleted;
END;
$$;

-- =====================================================
-- SCHEDULE DAILY CLEANUP JOB
-- =====================================================
-- Runs at 3am UTC daily — a low-traffic window.

SELECT cron.schedule(
  'cleanup-anonymous-users',
  '0 3 * * *',
  $$SELECT cleanup_anonymous_users()$$
);
