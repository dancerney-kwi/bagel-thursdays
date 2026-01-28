-- Migration: Add user_name to bagel_submissions
-- Run this in Supabase SQL Editor

-- Add user_name column to bagel_submissions
ALTER TABLE bagel_submissions
ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);

-- Create index for querying by user name
CREATE INDEX IF NOT EXISTS idx_submissions_user_name ON bagel_submissions(user_name);

-- Optional: View to see submission history by user
CREATE OR REPLACE VIEW user_submission_history AS
SELECT
  user_name,
  bagel_type,
  custom_bagel,
  week_id,
  created_at
FROM bagel_submissions
WHERE user_name IS NOT NULL
ORDER BY user_name, created_at DESC;

-- Function to get unique user names for autocomplete
CREATE OR REPLACE FUNCTION get_known_users()
RETURNS TABLE (user_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT bs.user_name
  FROM bagel_submissions bs
  WHERE bs.user_name IS NOT NULL AND bs.user_name != ''
  ORDER BY bs.user_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
