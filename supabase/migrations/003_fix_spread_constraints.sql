-- Migration: Fix spread constraints
-- Run this in Supabase SQL Editor

-- Remove the constraint that limits one spread per user per week
-- Users should be able to add multiple spread requests
ALTER TABLE spread_requests
DROP CONSTRAINT IF EXISTS unique_spread_browser_week;

-- Instead, prevent the same user from requesting the exact same spread name twice in a week
ALTER TABLE spread_requests
ADD CONSTRAINT unique_spread_name_browser_week UNIQUE (spread_name, browser_id, week_id);

-- Ensure spread_upvotes constraints are correct
-- Drop and recreate to ensure clean state
ALTER TABLE spread_upvotes
DROP CONSTRAINT IF EXISTS unique_upvote_browser_spread;

ALTER TABLE spread_upvotes
ADD CONSTRAINT unique_upvote_browser_spread UNIQUE (spread_request_id, browser_id);
