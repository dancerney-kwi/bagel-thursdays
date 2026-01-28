# KWI Bagel Thursdays

An internal web application for KWI employees to submit weekly bagel preferences for Thursday delivery.

## Overview

KWI Bagel Thursdays eliminates food waste by collecting precise bagel orders before the Thursday catering delivery. Users select their preferred bagel type via an interactive interface, optionally request spreads, and view real-time tallies of all submissions.

## Features

- **Bagel Selection**: Interactive grid with realistic bagel illustrations
- **Name-Based Tracking**: Users enter their name (stored locally) for order history
- **Real-Time Tallies**: Live count of all bagel selections (anonymous view)
- **Spread Requests**: Reddit-style upvoting system for spread preferences
- **Countdown Timer**: Live countdown to the Wednesday noon deadline
- **Bagel Facts**: Rotating carousel of fun bagel trivia
- **Privacy-Focused**: Names stored locally, public views are anonymous

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.5 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Real-time) |
| State | Zustand |
| Testing | Vitest + React Testing Library + Playwright |
| Fonts | Inter (Google Fonts) |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bagel-thursdays
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Initialize the database**

   In Supabase SQL Editor, run these files in order:
   1. `supabase/schema.sql` - Base schema
   2. `supabase/migrations/001_add_user_name.sql` - User name field
   3. `supabase/migrations/002_add_spread_upvotes.sql` - Upvoting system
   4. `supabase/migrations/003_fix_spread_constraints.sql` - Constraint fixes

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with interactive UI |

## Project Structure

```
bagel-thursdays/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── bagels/          # POST/GET bagel submissions
│   │   └── spreads/         # Spread requests & upvotes
│   ├── components/          # React components
│   │   ├── BagelFacts/      # Rotating fun facts carousel
│   │   ├── BagelSelector/   # Bagel type selection grid
│   │   ├── Countdown/       # Live countdown timer
│   │   ├── SpreadRequests/  # Spread voting interface
│   │   └── TallyBoard/      # Aggregated results display
│   ├── globals.css          # Global styles & CSS variables
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main page component
├── docs/                     # Project documentation
│   ├── PRD.md               # Product Requirements Document
│   ├── ARCHITECTURE.md      # Technical architecture
│   └── DATABASE.md          # Database schema reference
├── lib/                      # Shared code
│   ├── constants/           # Configuration & constants
│   │   ├── bagels.ts        # Bagel type definitions
│   │   ├── config.ts        # Schedule & UI config
│   │   └── facts.ts         # Bagel facts content
│   ├── supabase/            # Database utilities
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── types.ts         # Generated types
│   ├── types.ts             # Shared TypeScript types
│   └── utils/               # Utility functions
│       ├── dates.ts         # Date/time helpers
│       └── storage.ts       # localStorage helpers
├── public/                   # Static assets
│   └── images/
│       ├── bagels/          # Bagel SVG illustrations
│       ├── kwi-logo.png     # KWI logo
│       └── kwi-logo.svg     # KWI logo (vector)
├── supabase/                 # Database schema
│   ├── schema.sql           # Initial schema
│   └── migrations/          # Incremental changes
├── __tests__/               # Test suites
│   ├── unit/                # Component & utility tests
│   ├── e2e/                 # End-to-end tests
│   └── mocks/               # Test mocks
├── .env.local               # Environment variables (not committed)
├── CHANGELOG.md             # Version history
└── CONTRIBUTING.md          # Contribution guidelines
```

## Schedule

| Event | Day | Time (EST) |
|-------|-----|------------|
| Week Opens | Friday | 12:00 AM |
| **Order Deadline** | Wednesday | 12:00 PM |
| Bagel Delivery | Thursday | Morning |
| System Reset | Friday | 12:00 AM |

## Brand Guidelines

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | `#1C6BE0` | Buttons, accents, links |
| Red | `#EF4444` | Heart icons (upvotes) |
| Foreground | `#1A1A1A` | Body text |
| Gray | `#6B7280` | Secondary text |
| Background | `#FFFFFF` | Page background |

### Typography
- **Font Family**: Inter
- **Headings**: font-black (900), tracking-tight
- **Body**: font-medium (500)
- **Buttons**: font-semibold (600), uppercase, tracking-wider

## Documentation

### For Humans
| Document | Description |
|----------|-------------|
| [Product Requirements](docs/PRD.md) | Features, user stories, acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | Technical design & decisions |
| [Database Schema](docs/DATABASE.md) | Tables, relationships, migrations |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history |

### For AI Assistants
| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant context - code conventions, patterns, quick reference |
| [specs/](specs/) | Feature specifications for implementation |
| [specs/_TEMPLATE.md](specs/_TEMPLATE.md) | Template for new feature specs |

## Deployment

The application is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## License

Internal use only - KWI proprietary.
