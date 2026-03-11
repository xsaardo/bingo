-- =====================================================
-- Board Font Preference
-- =====================================================
-- Adds a `font` column to the boards table so users can
-- choose between the default system font and the custom
-- Chanellie font per board.
-- =====================================================

ALTER TABLE public.boards
  ADD COLUMN IF NOT EXISTS font text NOT NULL DEFAULT 'default'
  CHECK (font IN ('default', 'chanellie'));
