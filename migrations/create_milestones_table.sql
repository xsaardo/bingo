-- Create milestones table
-- Run this in your Supabase SQL editor after add_date_fields.sql

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  position INTEGER NOT NULL,
  CONSTRAINT positive_position CHECK (position >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_position ON milestones(goal_id, position);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the migration)
DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can delete their own milestones" ON milestones;

-- Users can view their own milestones (via goals -> boards -> users)
CREATE POLICY "Users can view their own milestones"
  ON milestones FOR SELECT
  USING (
    goal_id IN (
      SELECT g.id FROM goals g
      INNER JOIN boards b ON g.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Users can insert their own milestones
CREATE POLICY "Users can insert their own milestones"
  ON milestones FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT g.id FROM goals g
      INNER JOIN boards b ON g.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Users can update their own milestones
CREATE POLICY "Users can update their own milestones"
  ON milestones FOR UPDATE
  USING (
    goal_id IN (
      SELECT g.id FROM goals g
      INNER JOIN boards b ON g.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Users can delete their own milestones
CREATE POLICY "Users can delete their own milestones"
  ON milestones FOR DELETE
  USING (
    goal_id IN (
      SELECT g.id FROM goals g
      INNER JOIN boards b ON g.board_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );
