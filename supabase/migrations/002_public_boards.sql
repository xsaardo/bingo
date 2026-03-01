-- =====================================================
-- Public Board Links
-- =====================================================
-- Allows board owners to make boards publicly viewable
-- via a shareable link without requiring authentication.
-- =====================================================

-- Add is_public flag to boards
ALTER TABLE boards ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- =====================================================
-- RLS POLICIES FOR PUBLIC ACCESS
-- =====================================================

-- Policy: Anyone can view public boards (including unauthenticated users)
CREATE POLICY "Anyone can view public boards"
  ON boards FOR SELECT
  USING (is_public = TRUE);

-- Policy: Anyone can view goals on public boards
CREATE POLICY "Anyone can view goals on public boards"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.is_public = TRUE
    )
  );

-- =====================================================
-- GRANTS FOR UNAUTHENTICATED (ANON) ACCESS
-- =====================================================
-- Without these, the anon role cannot read the tables
-- even if an RLS policy permits it.

GRANT SELECT ON boards TO anon;
GRANT SELECT ON goals TO anon;
