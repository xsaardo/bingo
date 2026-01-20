-- =====================================================
-- Bingo App - Initial Database Schema
-- =====================================================
-- This migration creates the core tables for multi-user
-- board persistence with Row Level Security (RLS)
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BOARDS TABLE
-- =====================================================
-- Stores bingo boards owned by users
-- Each user can have multiple boards

CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL CHECK (size IN (3, 4, 5)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient user board queries
CREATE INDEX idx_boards_user_id ON boards(user_id, created_at DESC);

-- =====================================================
-- GOALS TABLE
-- =====================================================
-- Stores individual goals/squares for each board
-- Position determines placement on the grid (0-indexed)

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  notes TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure each board position is unique
  UNIQUE(board_id, position)
);

-- Index for efficient board goal queries
CREATE INDEX idx_goals_board_id ON goals(board_id, position);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- These policies ensure users can only access their own data

-- Enable RLS on both tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BOARDS POLICIES
-- =====================================================

-- Policy: Users can view their own boards
CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own boards
CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own boards
CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own boards
CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- GOALS POLICIES
-- =====================================================

-- Policy: Users can view goals in their own boards
CREATE POLICY "Users can view goals in own boards"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Policy: Users can insert goals in their own boards
CREATE POLICY "Users can insert goals in own boards"
  ON goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Policy: Users can update goals in their own boards
CREATE POLICY "Users can update goals in own boards"
  ON goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Policy: Users can delete goals in their own boards
CREATE POLICY "Users can delete goals in own boards"
  ON goals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for boards table
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for goals table
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANTS (Optional - Supabase handles this automatically)
-- =====================================================
-- These are typically not needed as Supabase handles permissions,
-- but included for completeness if running migrations manually

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON boards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify setup:

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Enable Magic Link authentication in Supabase dashboard
-- 2. Test authentication flow
-- 3. Implement frontend stores and components
