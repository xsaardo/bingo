-- Add trigger to update parent goal's last_updated_at when milestones change
-- This ensures that any milestone operation (insert, update, delete) automatically
-- updates the parent goal's timestamp without manual intervention in application code

-- =====================================================
-- FUNCTION: Update Parent Goal Timestamp
-- =====================================================
-- This function is triggered when milestones are inserted, updated, or deleted
-- It automatically updates the parent goal's last_updated_at field

CREATE OR REPLACE FUNCTION update_parent_goal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent goal's last_updated_at
  -- Use COALESCE to handle both NEW (insert/update) and OLD (delete) cases
  UPDATE goals
  SET last_updated_at = NOW()
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Milestone Changes Update Goal Timestamp
-- =====================================================
-- Drop existing trigger if it exists (to allow re-running migration)
DROP TRIGGER IF EXISTS milestone_updates_goal_timestamp ON milestones;

-- Create trigger that fires after any milestone change
CREATE TRIGGER milestone_updates_goal_timestamp
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_goal_timestamp();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- To verify the trigger works, run these queries after migration:
--
-- 1. Check trigger exists:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name = 'milestone_updates_goal_timestamp';
--
-- 2. Test the trigger:
-- -- Insert a test milestone and check if parent goal's last_updated_at changes
-- -- (Replace with actual goal_id from your database)
-- SELECT last_updated_at FROM goals WHERE id = 'your-goal-id';
-- INSERT INTO milestones (goal_id, title, position) VALUES ('your-goal-id', 'Test', 0);
-- SELECT last_updated_at FROM goals WHERE id = 'your-goal-id';
-- -- The timestamp should be different
--
-- -- Clean up test data
-- DELETE FROM milestones WHERE title = 'Test';
