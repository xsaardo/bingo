-- Add date metadata fields to goals table
-- Run this in your Supabase SQL editor

ALTER TABLE goals
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set last_updated_at for existing goals (use created_at as fallback)
UPDATE goals
SET last_updated_at = COALESCE(last_updated_at, created_at, NOW())
WHERE last_updated_at IS NULL;

-- Make last_updated_at NOT NULL after setting defaults
ALTER TABLE goals
ALTER COLUMN last_updated_at SET NOT NULL;

-- Add trigger to auto-update last_updated_at (optional, but recommended)
CREATE OR REPLACE FUNCTION update_goals_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS goals_last_updated_at ON goals;
CREATE TRIGGER goals_last_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_goals_last_updated_at();
