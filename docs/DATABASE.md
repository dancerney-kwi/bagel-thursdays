# Database Schema Documentation

## KWI Bagel Thursdays

**Database**: PostgreSQL (via Supabase)
**Last Updated**: January 2026

---

## 1. Overview

The database consists of three main tables:
1. `bagel_submissions` - Weekly bagel orders
2. `spread_requests` - User-submitted spread preferences
3. `spread_upvotes` - Votes on spread requests

---

## 2. Tables

### 2.1 bagel_submissions

Stores individual bagel preferences for each user per week.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `browser_id` | TEXT | NOT NULL | Anonymous user identifier |
| `user_name` | TEXT | | User's name (First Last Initial) |
| `bagel_type` | TEXT | NOT NULL | Selected bagel type ID |
| `custom_bagel` | TEXT | | Custom bagel text (if type='other') |
| `week_id` | TEXT | NOT NULL | Week identifier (e.g., '2026-W04') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Constraints**:
- `unique_browser_week`: UNIQUE(browser_id, week_id) - One submission per user per week

**Indexes**:
- `idx_submissions_week_id` on week_id
- `idx_submissions_bagel_type` on bagel_type

**Triggers**:
- `update_bagel_submissions_updated_at` - Auto-updates `updated_at` on UPDATE

---

### 2.2 spread_requests

Stores spread preferences requested by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `browser_id` | TEXT | NOT NULL | User who created request |
| `spread_name` | TEXT | NOT NULL | Name of the spread |
| `week_id` | TEXT | NOT NULL | Week identifier |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |

**Constraints**:
- `unique_spread_name_browser_week`: UNIQUE(spread_name, browser_id, week_id) - User can't request same spread twice per week

**Indexes**:
- `idx_spreads_week_id` on week_id

---

### 2.3 spread_upvotes

Stores user votes on spread requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `spread_request_id` | UUID | NOT NULL, FK | Reference to spread_requests |
| `browser_id` | TEXT | NOT NULL | User who upvoted |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Vote timestamp |

**Constraints**:
- `unique_upvote_browser_spread`: UNIQUE(spread_request_id, browser_id) - One vote per user per spread

**Foreign Keys**:
- `spread_request_id` → `spread_requests(id)` ON DELETE CASCADE

---

## 3. Views

### 3.1 bagel_tallies

Aggregates bagel counts by week and type.

```sql
CREATE OR REPLACE VIEW bagel_tallies AS
SELECT
  week_id,
  bagel_type,
  COUNT(*)::INTEGER as count
FROM bagel_submissions
GROUP BY week_id, bagel_type
ORDER BY count DESC;
```

**Usage**: Quick lookup of tallies without running aggregation each time.

---

## 4. Functions

### 4.1 get_current_week_tallies

Returns bagel counts for a specific week.

```sql
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
```

**Parameters**:
- `current_week_id` (TEXT): Week identifier (e.g., '2026-W04')

**Returns**: Table with bagel_type and count columns

---

### 4.2 get_spreads_with_upvotes

Returns spread requests with vote counts and user vote status.

```sql
CREATE OR REPLACE FUNCTION get_spreads_with_upvotes(
  current_week_id TEXT,
  current_browser_id TEXT
)
RETURNS TABLE (
  id UUID,
  spread_name TEXT,
  upvote_count BIGINT,
  user_has_upvoted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.spread_name,
    COUNT(su.id) as upvote_count,
    EXISTS (
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
```

**Parameters**:
- `current_week_id` (TEXT): Week identifier
- `current_browser_id` (TEXT): Current user's browser ID

**Returns**: Spreads with vote counts and whether current user has voted

---

### 4.3 update_updated_at_column

Trigger function to auto-update `updated_at` timestamps.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Row Level Security (RLS)

All tables have RLS enabled with permissive policies for this internal application.

### bagel_submissions

```sql
-- Anyone can read (for public tally)
CREATE POLICY "Allow public read access to submissions"
  ON bagel_submissions FOR SELECT USING (true);

-- Anyone can insert (anonymous submissions)
CREATE POLICY "Allow public insert access to submissions"
  ON bagel_submissions FOR INSERT WITH CHECK (true);

-- Anyone can update (for changing order)
CREATE POLICY "Allow users to update own submissions"
  ON bagel_submissions FOR UPDATE USING (true) WITH CHECK (true);
```

### spread_requests

```sql
CREATE POLICY "Allow public read access to spread requests"
  ON spread_requests FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to spread requests"
  ON spread_requests FOR INSERT WITH CHECK (true);
```

### spread_upvotes

```sql
CREATE POLICY "Allow public read access to spread upvotes"
  ON spread_upvotes FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to spread upvotes"
  ON spread_upvotes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to spread upvotes"
  ON spread_upvotes FOR DELETE USING (true);
```

---

## 6. Real-time Subscriptions

Tables are enabled for Supabase real-time:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bagel_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE spread_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE spread_upvotes;
```

**Client Usage**:
```typescript
supabase
  .channel('changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bagel_submissions',
    filter: `week_id=eq.${weekId}`
  }, callback)
  .subscribe();
```

---

## 7. Migrations

Migrations are stored in `supabase/migrations/` and should be run in order.

### Migration 001: Add User Name

Adds `user_name` column to bagel_submissions.

```sql
ALTER TABLE bagel_submissions
ADD COLUMN IF NOT EXISTS user_name TEXT;
```

### Migration 002: Add Spread Upvotes

Creates the upvoting system:
- Creates `spread_upvotes` table
- Creates `get_spreads_with_upvotes` function
- Adds RLS policies
- Enables real-time

### Migration 003: Fix Spread Constraints

Fixes constraints to allow multiple spread requests per user:

```sql
-- Remove old constraint
ALTER TABLE spread_requests
DROP CONSTRAINT IF EXISTS unique_spread_browser_week;

-- Add new constraint (same spread name per user per week)
ALTER TABLE spread_requests
ADD CONSTRAINT unique_spread_name_browser_week
  UNIQUE (spread_name, browser_id, week_id);
```

---

## 8. Week ID Format

Week IDs follow ISO 8601 format: `YYYY-Www`

Examples:
- `2026-W01` - First week of 2026
- `2026-W04` - Fourth week of 2026

Generated in code:
```typescript
import { format } from 'date-fns';
const weekId = format(date, "yyyy-'W'ww");
```

---

## 9. Common Queries

### Get current week tallies
```sql
SELECT * FROM get_current_week_tallies('2026-W04');
```

### Get all submissions for a week
```sql
SELECT * FROM bagel_submissions
WHERE week_id = '2026-W04'
ORDER BY created_at;
```

### Get spread requests with votes
```sql
SELECT * FROM get_spreads_with_upvotes('2026-W04', 'browser-id-123');
```

### Check if user submitted this week
```sql
SELECT EXISTS (
  SELECT 1 FROM bagel_submissions
  WHERE browser_id = 'browser-id-123'
  AND week_id = '2026-W04'
);
```

---

## 10. Setup Instructions

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql`
3. Run migrations in order:
   - `supabase/migrations/001_add_user_name.sql`
   - `supabase/migrations/002_add_spread_upvotes.sql`
   - `supabase/migrations/003_fix_spread_constraints.sql`
4. Verify tables in Table Editor
5. Check Functions in Database → Functions
