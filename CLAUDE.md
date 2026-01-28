# CLAUDE.md - AI Assistant Context

> This file provides context for AI coding assistants working on this project.

## Project Overview

**KWI Bagel Thursdays** is an internal web app for collecting weekly bagel orders from employees. Users select a bagel type, enter their name, and submit before Wednesday noon. The app shows real-time tallies and allows spread request voting.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | - |
| State | Zustand | 5.x |
| Testing | Vitest + Playwright | - |

## Project Structure

```
app/
├── api/                    # API routes (server-side)
│   ├── bagels/route.ts    # GET tallies, POST submission
│   └── spreads/           # Spread CRUD + upvotes
├── components/            # React components
│   ├── ComponentName/
│   │   └── index.tsx      # One component per folder
├── globals.css            # CSS variables, Tailwind
├── layout.tsx             # Root layout
└── page.tsx               # Main page

lib/
├── constants/             # Config, bagel types, facts
├── supabase/              # Database clients
├── types.ts               # Shared TypeScript types
└── utils/                 # Helper functions

public/images/
├── bagels/*.svg           # Bagel illustrations
└── kwi-logo.png           # Brand logo

supabase/
├── schema.sql             # Base schema
└── migrations/*.sql       # Incremental changes

__tests__/
├── unit/                  # Vitest tests
├── e2e/                   # Playwright tests
└── mocks/                 # Test mocks
```

## Code Conventions

### Components

```typescript
// Always use 'use client' only when needed (hooks, browser APIs)
'use client';

// Imports: React, then external, then internal (@/...)
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getBrowserId } from '@/lib/utils/storage';

// Props interface above component
interface ComponentNameProps {
  prop: string;
  onAction: () => void;
}

// Export default function component
export default function ComponentName({ prop, onAction }: ComponentNameProps) {
  // Hooks first
  const [state, setState] = useState('');

  // Effects next
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field1, field2 } = body;

    // Validate
    if (!field1) {
      return NextResponse.json(
        { error: 'Missing required field: field1' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Database operation
    const { data, error } = await supabase
      .from('table_name')
      .insert({ field1, field2 })
      .select()
      .single();

    if (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'Operation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Styling (Tailwind)

```typescript
// Use className with template literals for conditional styles
className={`
  base-classes here
  ${condition ? 'true-classes' : 'false-classes'}
`}

// Color variables (defined in globals.css)
// Primary blue: text-primary, bg-primary, border-primary
// Red (hearts): text-red, bg-red, fill-red
// Text: text-foreground (black), text-gray (secondary)

// Common patterns:
// Cards: rounded-2xl border border-gray-light/20 bg-white p-6 shadow-lg shadow-black/5
// Inputs: rounded-xl border-2 border-gray-light/30 bg-gray-light/5 px-4 py-3
// Buttons: rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider
```

### TypeScript

```typescript
// Define types in lib/types.ts for shared types
// Use interface for object shapes, type for unions/primitives

// Supabase tables not in generated types - use 'as any'
const { data } = await supabase
  .from('table_name' as any)
  .select('*');

// RPC calls
const { data } = await supabase
  .rpc('function_name', { param: value } as any);
```

## Database

### Tables

| Table | Purpose | Key Constraint |
|-------|---------|----------------|
| `bagel_submissions` | Weekly orders | UNIQUE(browser_id, week_id) |
| `spread_requests` | Spread suggestions | UNIQUE(spread_name, browser_id, week_id) |
| `spread_upvotes` | Votes on spreads | UNIQUE(spread_request_id, browser_id) |

### Key Functions

```sql
-- Get bagel tallies
SELECT * FROM get_current_week_tallies('2026-W04');

-- Get spreads with user vote status
SELECT * FROM get_spreads_with_upvotes('2026-W04', 'browser-id');
```

### Adding Migrations

1. Create `supabase/migrations/00X_description.sql`
2. Use idempotent SQL (`IF NOT EXISTS`, `IF EXISTS`)
3. Update `docs/DATABASE.md`

## Testing

### Unit Tests (Vitest)

```typescript
// __tests__/unit/components/Component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '@/app/components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('expected')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('result')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:e2e      # Playwright
```

## Common Tasks

### Adding a New Bagel Type

1. Add to `lib/constants/bagels.ts`:
   ```typescript
   { id: 'new-type', name: 'New Type', imageFile: 'new-type.svg' }
   ```
2. Create SVG in `public/images/bagels/new-type.svg`
3. Add to `BagelTypeId` union in `lib/types.ts`

### Adding a New Component

1. Create `app/components/ComponentName/index.tsx`
2. Add `'use client'` if using hooks/browser APIs
3. Export as default
4. Add tests in `__tests__/unit/components/ComponentName.test.tsx`

### Adding an API Endpoint

1. Create `app/api/endpoint/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `createAdminClient()` for database access
4. Return `NextResponse.json()`

### Modifying the Database

1. Create migration file in `supabase/migrations/`
2. Test SQL in Supabase SQL Editor
3. Update `docs/DATABASE.md`
4. Update TypeScript types if needed

## Brand Guidelines

### Colors
| Name | Hex | Tailwind |
|------|-----|----------|
| Primary Blue | #1C6BE0 | `text-primary`, `bg-primary` |
| Red (hearts) | #EF4444 | `text-red`, `bg-red` |
| Foreground | #1A1A1A | `text-foreground` |
| Gray | #6B7280 | `text-gray` |

### Typography
- Font: Inter
- Headings: `font-black tracking-tight`
- Accent pattern: "Word **Accent**" where Accent is `text-primary`
- Body: `text-foreground` (black, not gray)
- Helper text: `text-gray text-xs`

### Buttons
- Shape: `rounded-full` (pill)
- Text: `uppercase tracking-wider font-semibold`
- Primary: `bg-primary text-white`
- With arrow: Include `→` icon

## Current State

### Working Features
- ✅ Bagel selection and submission
- ✅ User name input (stored locally + DB)
- ✅ Countdown timer
- ✅ Real-time tally board
- ✅ Spread requests with upvoting
- ✅ Bagel facts carousel

### Known Issues
- None currently tracked

### Out of Scope
- User authentication
- Admin dashboard
- Email notifications
- Payment processing

## When Making Changes

1. **Read first**: Always read relevant files before modifying
2. **Match patterns**: Follow existing code style in the file
3. **Test**: Run `npm run test` before committing
4. **Types**: Update TypeScript types when changing data structures
5. **Docs**: Update CHANGELOG.md for notable changes

## File Reference

| Need to... | Look at... |
|------------|------------|
| Add bagel type | `lib/constants/bagels.ts`, `lib/types.ts` |
| Change schedule | `lib/constants/config.ts` |
| Modify form | `app/page.tsx` |
| Update tallies | `app/components/TallyBoard/index.tsx` |
| Change spreads | `app/components/SpreadRequests/index.tsx` |
| Database query | `app/api/*/route.ts` |
| Add CSS variable | `app/globals.css` |
