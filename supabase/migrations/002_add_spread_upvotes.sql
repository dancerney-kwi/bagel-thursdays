-- Migration: Add spread upvotes table
-- Run this in Supabase SQL Editor

-- Spread upvotes table
CREATE TABLE IF NOT EXISTS spread_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spread_request_id UUID REFERENCES spread_requests(id) ON DELETE CASCADE,
  browser_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One upvote per browser per spread request
  CONSTRAINT unique_upvote_browser_spread UNIQUE (spread_request_id, browser_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_upvotes_spread_id ON spread_upvotes(spread_request_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_browser_id ON spread_upvotes(browser_id);

-- Enable RLS
ALTER TABLE spread_upvotes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read upvotes
CREATE POLICY "Allow public read access to upvotes"
  ON spread_upvotes
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert upvotes
CREATE POLICY "Allow public insert access to upvotes"
  ON spread_upvotes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can delete their own upvotes (for toggle)
CREATE POLICY "Allow users to delete own upvotes"
  ON spread_upvotes
  FOR DELETE
  USING (true);

-- Enable realtime for upvotes
ALTER PUBLICATION supabase_realtime ADD TABLE spread_upvotes;

-- Function to get spread requests with upvote counts for a week
CREATE OR REPLACE FUNCTION get_spreads_with_upvotes(current_week_id TEXT, current_browser_id TEXT)
RETURNS TABLE (
  id UUID,
  spread_name TEXT,
  upvote_count INTEGER,
  user_has_upvoted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.spread_name,
    COALESCE(COUNT(su.id), 0)::INTEGER as upvote_count,
    EXISTS(
      SELECT 1 FROM spread_upvotes su2
      WHERE su2.spread_request_id = sr.id
      AND su2.browser_id = current_browser_id
    ) as user_has_upvoted
  FROM spread_requests sr
  LEFT JOIN spread_upvotes su ON sr.id = su.spread_request_id
  WHERE sr.week_id = current_week_id
  GROUP BY sr.id, sr.spread_name
  ORDER BY upvote_count DESC, sr.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
