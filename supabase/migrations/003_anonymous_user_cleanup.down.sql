-- =====================================================
-- Rollback: Anonymous User Cleanup (pg_cron)
-- =====================================================
-- Removes the scheduled cleanup job and its function.
-- =====================================================

-- Guard against missing job to avoid error on re-run
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-anonymous-users') THEN
    PERFORM cron.unschedule('cleanup-anonymous-users');
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.cleanup_anonymous_users();
