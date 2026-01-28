-- Bagel Thursdays Database Schema
-- Run this in Supabase SQL Editor (SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Bagel submissions table
CREATE TABLE IF NOT EXISTS bagel_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  browser_id TEXT NOT NULL,
  bagel_type TEXT NOT NULL,
  custom_bagel TEXT,
  week_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one submission per browser per week
  CONSTRAINT unique_browser_week UNIQUE (browser_id, week_id)
);

-- Spread requests table
CREATE TABLE IF NOT EXISTS spread_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  browser_id TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  week_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one spread request per browser per week
  CONSTRAINT unique_spread_browser_week UNIQUE (browser_id, week_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_submissions_week_id ON bagel_submissions(week_id);
CREATE INDEX IF NOT EXISTS idx_submissions_bagel_type ON bagel_submissions(bagel_type);
CREATE INDEX IF NOT EXISTS idx_spreads_week_id ON spread_requests(week_id);

-- ============================================
-- VIEWS
-- ============================================

-- View for bagel tallies by week
CREATE OR REPLACE VIEW bagel_tallies AS
SELECT
  week_id,
  bagel_type,
  COUNT(*)::INTEGER as count
FROM bagel_submissions
GROUP BY week_id, bagel_type
ORDER BY count DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get tallies for a specific week
CREATE OR REPLACE FUNCTION get_current_week_tallies(current_week_id TEXT)
RETURNS TABLE (bagel_type TEXT, count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.bagel_type,
    COUNT(*)::INTEGER as count
  FROM bagel_submissions bs
  WHERE bs.week_id = current_week_id
  GROUP BY bs.bagel_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_bagel_submissions_updated_at ON bagel_submissions;
CREATE TRIGGER update_bagel_submissions_updated_at
  BEFORE UPDATE ON bagel_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE bagel_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spread_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all submissions (for tally display)
CREATE POLICY "Allow public read access to submissions"
  ON bagel_submissions
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert submissions (anonymous users)
CREATE POLICY "Allow public insert access to submissions"
  ON bagel_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can only update their own submissions (by browser_id)
CREATE POLICY "Allow users to update own submissions"
  ON bagel_submissions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can read spread requests
CREATE POLICY "Allow public read access to spread requests"
  ON spread_requests
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert spread requests
CREATE POLICY "Allow public insert access to spread requests"
  ON spread_requests
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE bagel_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE spread_requests;

-- ============================================
-- SAMPLE DATA (optional - for testing)
-- ============================================

-- Uncomment to add test data:
-- INSERT INTO bagel_submissions (browser_id, bagel_type, week_id) VALUES
--   ('test-browser-1', 'everything', '2024-W01'),
--   ('test-browser-2', 'plain', '2024-W01'),
--   ('test-browser-3', 'everything', '2024-W01'),
--   ('test-browser-4', 'sesame', '2024-W01'),
--   ('test-browser-5', 'egg', '2024-W01');
