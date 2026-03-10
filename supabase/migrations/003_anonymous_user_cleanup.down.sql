-- =====================================================
-- Rollback: Anonymous User Cleanup (pg_cron)
-- =====================================================
-- Removes the scheduled cleanup job and its function.
-- =====================================================

SELECT cron.unschedule('cleanup-anonymous-users');

DROP FUNCTION IF EXISTS cleanup_anonymous_users();
