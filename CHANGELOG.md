# Changelog

All notable changes to KWI Bagel Thursdays will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Admin dashboard for viewing orders
- Email notifications before deadline
- Historical analytics

---

## [1.0.0] - 2026-01-27

### Added
- Initial release of KWI Bagel Thursdays
- Bagel selection with 10 bagel types (Plain, Everything, Sesame, Poppy Seed, Onion, Egg, Egg Everything, Cinnamon Raisin, Pumpernickel, Other)
- Custom bagel input for "Other" selection
- User name input with localStorage persistence
- Real-time countdown timer to Wednesday noon deadline
- Live tally board with Supabase real-time updates
- Spread request system with Reddit-style upvoting
- Rotating bagel facts carousel
- Responsive design for mobile and desktop
- KWI brand styling (colors, typography, logo)

### Technical
- Next.js 16 with App Router
- TypeScript throughout
- Tailwind CSS v4 with CSS variables
- Supabase PostgreSQL database
- Real-time subscriptions for live updates
- Vitest unit tests (129 passing)
- Playwright E2E test setup

### Database
- `bagel_submissions` table with user_name support
- `spread_requests` table for spread preferences
- `spread_upvotes` table for voting system
- Row Level Security policies
- Database functions for aggregations

---

## [0.3.0] - 2026-01-27

### Added
- Spread request upvoting system
- Heart icons for voting (red when selected)
- Real-time spread updates
- Migration 002: spread_upvotes table
- Migration 003: fixed spread constraints

### Changed
- Users can now submit multiple spread requests
- Spread constraint changed from one-per-user to one-per-spread-name-per-user

### Fixed
- Spread overwriting issue when submitting multiple spreads

---

## [0.2.0] - 2026-01-27

### Added
- User name input field
- Name stored in localStorage (remembered across weeks)
- Name stored in database with submission
- Privacy: names not displayed publicly
- Migration 001: user_name column

### Changed
- Removed autocomplete feature for privacy
- Updated form validation to require name

---

## [0.1.0] - 2026-01-27

### Added
- Project scaffolding with Next.js 16
- Supabase integration
- Basic database schema
- BagelSelector component with SVG icons
- Countdown timer component
- BagelFacts carousel component
- TallyBoard with real-time updates
- API routes for bagels and spreads
- Unit test suite with Vitest
- E2E test setup with Playwright

### UI/UX
- KWI brand colors (#1C6BE0 primary blue)
- Inter font family
- Pill-shaped buttons
- Card-based layout
- Mobile-responsive design

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2026-01-27 | Production release with all core features |
| 0.3.0 | 2026-01-27 | Spread upvoting system |
| 0.2.0 | 2026-01-27 | User name tracking |
| 0.1.0 | 2026-01-27 | Initial development |
