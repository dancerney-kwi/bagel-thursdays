# Architecture Document

## KWI Bagel Thursdays

**Version**: 1.0.0
**Last Updated**: January 2026

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Next.js   │  │ localStorage│  │   Supabase Client   │  │
│  │  React App  │  │  (browser)  │  │   (real-time sub)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          │ API Routes     │ nanoid + name       │ WebSocket
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Vercel)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    API Routes                        │    │
│  │  /api/bagels     /api/spreads    /api/spreads/[id]  │    │
│  └──────────────────────────┬──────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────┘
                              │ Supabase Admin Client
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase (Cloud)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │
│  │ PostgreSQL │  │  Real-time │  │  Row Level Security│     │
│  │  Database  │  │   Engine   │  │       (RLS)        │     │
│  └────────────┘  └────────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 16 | App Router, RSC, API routes, Vercel deployment |
| Language | TypeScript | Type safety, IDE support, maintainability |
| Styling | Tailwind CSS v4 | Utility-first, CSS variables, fast iteration |
| Database | Supabase | PostgreSQL, real-time, free tier, easy setup |
| State | Zustand | Lightweight, simple API, no boilerplate |
| Testing | Vitest + Playwright | Fast unit tests, E2E coverage |

---

## 2. Frontend Architecture

### 2.1 Component Structure

```
app/
├── page.tsx                 # Main page (client component)
├── layout.tsx               # Root layout (fonts, metadata)
├── globals.css              # CSS variables, Tailwind config
└── components/
    ├── BagelFacts/          # Rotating facts carousel
    │   └── index.tsx
    ├── BagelSelector/       # Bagel selection grid
    │   └── index.tsx
    ├── Countdown/           # Timer component
    │   └── index.tsx
    ├── SpreadRequests/      # Spread voting UI
    │   └── index.tsx
    └── TallyBoard/          # Aggregated results
        └── index.tsx
```

### 2.2 Component Responsibilities

| Component | Responsibility | State |
|-----------|----------------|-------|
| `page.tsx` | Page layout, form state, submission logic | Local (useState) |
| `Countdown` | Timer logic, cycle state detection | Local |
| `BagelSelector` | Bagel grid, selection handling | Props (controlled) |
| `BagelFacts` | Fact rotation, visibility detection | Local |
| `TallyBoard` | Fetch & display tallies, real-time sub | Local + Supabase |
| `SpreadRequests` | CRUD spreads, upvoting, real-time | Local + Supabase |

### 2.3 State Management

**Local State (useState)**:
- Form inputs (name, selected bagel, custom bagel)
- UI state (loading, errors, submitted)
- Component-specific state

**localStorage**:
- `bagel-thursdays-browser-id`: Unique browser identifier (nanoid)
- `bagel-thursdays-user-name`: Remembered user name
- `bagel-thursdays-submission-{weekId}`: Submission record per week

**Server State (Supabase real-time)**:
- Bagel tallies (via subscription)
- Spread requests (via subscription)
- Upvote counts (via subscription)

### 2.4 Data Flow

```
User Action → Component Handler → API Route → Supabase
                                      ↓
                              Real-time Broadcast
                                      ↓
                            Supabase Subscription
                                      ↓
                            Component State Update
                                      ↓
                                  Re-render
```

---

## 3. Backend Architecture

### 3.1 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bagels` | GET | Get tallies for current week |
| `/api/bagels` | POST | Submit bagel preference |
| `/api/spreads` | GET | Get spreads with upvote counts |
| `/api/spreads` | POST | Create new spread request |
| `/api/spreads/[id]/upvote` | POST | Toggle upvote on spread |

### 3.2 API Route Structure

```typescript
// Example: /api/bagels/route.ts

export async function GET(request: NextRequest) {
  // 1. Create Supabase admin client
  // 2. Extract query params (week_id, browser_id)
  // 3. Call database function/query
  // 4. Return JSON response
}

export async function POST(request: NextRequest) {
  // 1. Create Supabase admin client
  // 2. Parse request body
  // 3. Validate input
  // 4. Check for existing submission
  // 5. Insert/update record
  // 6. Return success/error response
}
```

### 3.3 Supabase Clients

**Browser Client** (`lib/supabase/client.ts`):
- Uses `createBrowserClient` from `@supabase/ssr`
- Public anon key only
- Used for real-time subscriptions

**Server Client** (`lib/supabase/server.ts`):
- Uses `createClient` from `@supabase/supabase-js`
- Service role key for admin operations
- Bypasses RLS for server-side operations

---

## 4. Database Architecture

### 4.1 Schema Overview

```
┌──────────────────────┐     ┌──────────────────────┐
│  bagel_submissions   │     │   spread_requests    │
├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ id (PK)              │
│ browser_id           │     │ browser_id           │
│ user_name            │     │ spread_name          │
│ bagel_type           │     │ week_id              │
│ custom_bagel         │     │ created_at           │
│ week_id              │     └──────────┬───────────┘
│ created_at           │                │
│ updated_at           │                │ 1:N
└──────────────────────┘                │
                                        ▼
                              ┌──────────────────────┐
                              │   spread_upvotes     │
                              ├──────────────────────┤
                              │ id (PK)              │
                              │ spread_request_id(FK)│
                              │ browser_id           │
                              │ created_at           │
                              └──────────────────────┘
```

### 4.2 Key Constraints

| Table | Constraint | Purpose |
|-------|------------|---------|
| bagel_submissions | UNIQUE(browser_id, week_id) | One submission per user per week |
| spread_requests | UNIQUE(spread_name, browser_id, week_id) | Prevent duplicate spread requests |
| spread_upvotes | UNIQUE(spread_request_id, browser_id) | One vote per user per spread |

### 4.3 Database Functions

| Function | Purpose |
|----------|---------|
| `get_current_week_tallies(week_id)` | Aggregate bagel counts |
| `get_spreads_with_upvotes(week_id, browser_id)` | Spreads with vote counts & user vote status |
| `update_updated_at_column()` | Trigger for updated_at timestamps |

---

## 5. Security

### 5.1 Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Anyone can read (for tallies/display)
CREATE POLICY "Allow public read" ON table FOR SELECT USING (true);

-- Anyone can insert (anonymous submissions)
CREATE POLICY "Allow public insert" ON table FOR INSERT WITH CHECK (true);
```

### 5.2 API Security

- **Input Validation**: All inputs validated server-side
- **SQL Injection**: Prevented via parameterized queries (Supabase client)
- **XSS**: React's default escaping + no dangerouslySetInnerHTML
- **CSRF**: API routes don't use cookies for auth

### 5.3 Data Privacy

- No authentication required
- Browser ID (nanoid) provides anonymous identification
- User names stored but never exposed publicly
- No sensitive PII collected

---

## 6. Performance

### 6.1 Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Static Generation | Non-dynamic pages pre-rendered |
| Code Splitting | Automatic via Next.js |
| Image Optimization | SVG bagel icons (small, scalable) |
| Real-time Efficiency | Supabase subscriptions vs polling |
| CSS | Tailwind purges unused styles |

### 6.2 Caching Strategy

- **Static Assets**: Long cache headers (images, fonts)
- **API Responses**: No caching (real-time data)
- **Database**: Supabase connection pooling

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
         ┌─────────┐
         │   E2E   │  ← Playwright (critical paths)
         ├─────────┤
        /           \
       /  Integration \  ← API route tests
      /─────────────────\
     /                   \
    /    Unit Tests       \  ← Vitest + RTL (components, utils)
   /───────────────────────\
```

### 7.2 Test Coverage

| Area | Tool | Coverage Target |
|------|------|-----------------|
| Components | Vitest + RTL | 80%+ |
| Utilities | Vitest | 90%+ |
| API Routes | Vitest | 80%+ |
| E2E Flows | Playwright | Critical paths |

### 7.3 Test Files

```
__tests__/
├── unit/
│   ├── components/
│   │   ├── BagelFacts.test.tsx
│   │   ├── BagelSelector.test.tsx
│   │   └── Countdown.test.tsx
│   └── utils/
│       ├── dates.test.ts
│       └── storage.test.ts
├── e2e/
│   └── sample.spec.ts
└── mocks/
    ├── supabase.ts
    ├── storage.ts
    └── realtime.ts
```

---

## 8. Deployment

### 8.1 Infrastructure

```
┌─────────────────────┐
│   GitHub Repo       │
│   (source code)     │
└──────────┬──────────┘
           │ Push/PR
           ▼
┌─────────────────────┐
│      Vercel         │
│  (build & deploy)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Vercel Edge       │
│   (CDN + Functions) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Supabase        │
│   (Database)        │
└─────────────────────┘
```

### 8.2 Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Server-side admin key |

### 8.3 Deployment Process

1. Push to `main` branch
2. Vercel auto-deploys
3. Preview deployments for PRs
4. Manual promotion if needed

---

## 9. Monitoring & Logging

### 9.1 Current Implementation

- **Console Logging**: `console.error` for API errors
- **Vercel Logs**: Automatic request/response logging

### 9.2 Future Considerations

- Error tracking service (Sentry)
- Analytics (Vercel Analytics)
- Database monitoring (Supabase dashboard)

---

## 10. Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Next.js over plain React | SSR, API routes, Vercel integration | Jan 2026 |
| Supabase over Firebase | PostgreSQL, simpler pricing, real-time | Jan 2026 |
| Browser ID over auth | Simplicity, no login friction | Jan 2026 |
| Tailwind v4 | CSS variables, modern syntax | Jan 2026 |
| SVG bagel icons | Scalable, small file size, customizable | Jan 2026 |
