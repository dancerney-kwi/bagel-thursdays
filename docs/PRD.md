# Product Requirements Document (PRD)

## KWI Bagel Thursdays

**Version**: 1.2.0
**Last Updated**: January 29, 2026
**Status**: Active Development

---

## 1. Overview

### 1.1 Problem Statement

KWI provides weekly bagel catering for employees on Thursdays. Currently, orders are collected manually, leading to:
- Food waste from over-ordering
- Missed preferences for popular items
- No data on employee preferences over time
- Manual coordination overhead

### 1.2 Solution

A lightweight web application that:
- Collects individual bagel preferences before a set deadline
- Provides real-time visibility into order tallies
- Allows employees to request and vote on spread options
- Resets automatically each week

### 1.3 Target Users

- **Primary**: KWI office employees (50-100 users)
- **Secondary**: Office manager/admin who places the bagel order

### 1.4 Success Metrics

| Metric | Target |
|--------|--------|
| Weekly participation rate | >70% of employees |
| Submission before deadline | >90% on-time |
| Food waste reduction | 30% fewer unused bagels |

---

## 2. Features

### 2.1 Core Features

#### F1: Bagel Selection
Users can select their preferred bagel type from a visual grid.

**Requirements**:
- Display all available bagel types with illustrations
- Support "Other" option with custom text input
- One selection per user per week
- Visual feedback for selected item

**Bagel Types**:
| ID | Name | Description |
|----|------|-------------|
| plain | Plain | Classic plain bagel |
| everything | Everything | Topped with everything seasoning |
| sesame | Sesame | Covered in sesame seeds |
| poppy-seed | Poppy Seed | Covered in poppy seeds |
| onion | Onion | Topped with dried onion |
| egg | Egg | Yellow egg bagel |
| egg-everything | Egg Everything | Egg bagel with everything topping |
| cinnamon-raisin | Cinnamon Raisin | Sweet with cinnamon and raisins |
| pumpernickel | Pumpernickel | Dark pumpernickel bread |
| other | Other | Custom preference (text input) |

#### F2: User Identification
Users enter their name for order tracking.

**Requirements**:
- Text input for name (First Name Last Initial format)
- Name stored in localStorage (persists across weeks)
- Name stored in database with submission
- Names NOT displayed publicly (privacy)
- Max length: 50 characters

**Privacy Note**: User names are stored locally and in the database but are never displayed to other users. The public tally view is completely anonymous.

#### F3: Countdown Timer
Display time remaining until the order deadline.

**Requirements**:
- Show days, hours, minutes, seconds
- Update every second
- Display different layouts based on cycle state:
  - **Collecting** (orders open):
    - "Time remaining to submit your order" (above countdown)
    - Countdown to Wednesday 12PM cutoff
    - "Orders close Wednesday at 12:00 PM EST" (below)
  - **Closed** (after cutoff):
    - "Orders closed! Bagels arriving Thursday morning" (top)
    - "Next week's submissions open in:" (above countdown)
    - Countdown to Friday midnight reset
    - "Orders close Wednesday at 12:00 PM EST" (below)
- Form inputs disabled when orders are closed
- "Orders Closed" message shown on submit button when closed

#### F4: Real-Time Tally
Display aggregated bagel counts with statistics.

**Requirements**:
- Show count for each bagel type
- Update in real-time via Supabase subscriptions
- Sort by count (highest first)
- Anonymous view (no names shown)
- Visually represent proportions with progress bars

**Weekly Statistics**:
- Total orders count
- Dozens ordered (count ÷ 12, displayed as decimal, e.g., "1.5 dozen")

**Year-to-Date Statistics**:
- Total bagels ordered for current year
- Total dozens ordered for current year
- Auto-resets on January 1st each year (queries by year prefix in week_id)

#### F5: Spread Requests
Allow users to request and upvote spread preferences.

**Requirements**:
- Text input to request a new spread
- Display all requests for current week
- Heart-based upvote system (Reddit-style)
- Toggle upvote on/off
- Sort by upvote count
- Max spread name length: 50 characters
- Prevent duplicate spread names (case-insensitive)
- Users can submit multiple spread requests
- Upvoted hearts display in red (#EF4444)

**Disclaimer**: "Spread requests will be considered but are not guaranteed."

#### F6: Bagel Facts
Display rotating fun facts about bagels.

**Requirements**:
- Carousel of 10+ bagel facts
- Auto-rotate every 12 seconds
- Fade transition between facts
- Pause rotation when tab is hidden

### 2.2 Schedule Configuration

| Parameter | Value |
|-----------|-------|
| Order Cutoff | Wednesday 12:00 PM EST |
| Week Reset | Friday 12:00 AM EST |
| Timezone | America/New_York |

### 2.3 Non-Functional Requirements

#### Performance
- Page load: <2 seconds on 3G
- Real-time updates: <500ms latency
- Support 100 concurrent users

#### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader compatible
- Minimum contrast ratios

#### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 3. User Stories

### 3.1 Submission Flow

```
US-1: As an employee, I want to select my bagel preference so that I get the bagel I want on Thursday.

Acceptance Criteria:
- [ ] I can see all bagel options with images
- [ ] I can click to select one bagel type
- [ ] If I select "Other", I can enter custom text
- [ ] I see visual confirmation of my selection
- [ ] I can change my selection before submitting
```

```
US-2: As an employee, I want to enter my name so that my order is associated with me.

Acceptance Criteria:
- [ ] I see a name input field
- [ ] My name is remembered for next week
- [ ] I see guidance on name format
- [ ] I'm informed my name won't be public
```

```
US-3: As an employee, I want to submit my order so that it's recorded for the week.

Acceptance Criteria:
- [ ] Submit button is disabled until I select a bagel and enter my name
- [ ] I see a loading state during submission
- [ ] I see confirmation after successful submission
- [ ] I cannot submit again for the same week
- [ ] I see my submitted choice displayed
```

### 3.2 Viewing & Interaction

```
US-4: As an employee, I want to see the countdown timer so I know when to submit by.

Acceptance Criteria:
- [ ] I see days, hours, minutes, seconds remaining
- [ ] Timer updates in real-time
- [ ] I see the deadline time clearly stated
- [ ] Timer shows different message when orders are closed
```

```
US-5: As an employee, I want to see the current tally so I know what others are ordering.

Acceptance Criteria:
- [ ] I see counts for each bagel type
- [ ] Tally updates in real-time
- [ ] I do NOT see any names
- [ ] Bagels are sorted by popularity
```

```
US-6: As an employee, I want to request a spread so the office considers stocking it.

Acceptance Criteria:
- [ ] I can enter a spread name
- [ ] I see existing requests
- [ ] I can upvote requests I like
- [ ] I can remove my upvote
- [ ] Upvoted items show red heart
- [ ] Requests are sorted by votes
```

### 3.3 Administrative

```
US-7: As an office manager, I want to see aggregated orders so I can place the bagel order.

Acceptance Criteria:
- [ ] Tally shows exact counts needed
- [ ] Custom "Other" entries are visible
- [ ] Spread requests with votes are visible
```

---

## 4. UI/UX Specifications

### 4.1 Brand Guidelines

**Logo**: KWI logo (blue spiral dots + "KWI" text)
- Display prominently at top, centered
- Size: 320x100px

**Colors**:
| Name | Hex | CSS Variable |
|------|-----|--------------|
| Primary Blue | #1C6BE0 | `--color-primary` |
| Red (Hearts) | #EF4444 | `--color-red` |
| Foreground | #1A1A1A | `--color-foreground` |
| Gray | #6B7280 | `--color-gray` |
| Gray Light | #9CA3AF | `--color-gray-light` |
| Background | #FFFFFF | `--color-background` |

**Typography**:
- Font: Inter (Google Fonts)
- Weights: 400, 500, 600, 700, 800, 900
- Headings: font-black (900), tracking-tight
- Section titles: "Word **Accent**" pattern (accent in primary blue)
- Body text: Black (#1A1A1A), not gray
- Instructional text (under inputs): Gray, smaller size

**Buttons**:
- Style: Pill-shaped (rounded-full)
- Primary: Blue background, white text
- Text: Uppercase, tracking-wider, font-semibold
- Include arrow icon (→) where appropriate
- Shadow: shadow-lg with primary color tint

**Cards**:
- Background: White
- Border: 1px gray-light/20
- Border radius: 2xl (1rem)
- Shadow: shadow-lg shadow-black/5
- Padding: p-6 (sm: p-8)

### 4.2 Page Layout

**Desktop Layout (lg breakpoint, 1024px+)**:
Order form and tally board sit side-by-side so users can see what others are ordering while making their selection.

```
┌───────────────────────────────────────────────────────┐
│                    [KWI LOGO]                         │
│                  Bagel Thursdays                      │
│           Submit your weekly bagel preference         │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │              COUNTDOWN TIMER                    │  │
│  │            00 : 00 : 00 : 00                    │  │
│  └─────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │         🥯 [Bagel fact rotates...]              │  │
│  └─────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────┐ │
│  │ Your Name               │  │ Current Tally       │ │
│  │ [________________]      │  │                     │ │
│  │                         │  │ 12 orders (1 dozen) │ │
│  │ Select Your Bagel       │  │                     │ │
│  │ [3-col bagel grid]      │  │ Everything ████ 5   │ │
│  │                         │  │ Plain ██ 3          │ │
│  │ [   SUBMIT ORDER   →]   │  │ ...                 │ │
│  │                         │  │                     │ │
│  │                         │  │ 2026 Year to Date   │ │
│  │                         │  │ 156 bagels          │ │
│  │                         │  │ (13 dozen)          │ │
│  └─────────────────────────┘  └─────────────────────┘ │
├───────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │ Spread Requests                                 │  │
│  │ [________________] [Request]                    │  │
│  │ Scallion CC        ❤️ 5                         │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

**Mobile Layout**: Stacks vertically (tally below order form).

### 4.3 Component Specifications

#### Bagel Selector Grid
- Mobile: 2 columns
- Desktop (side-by-side mode): 3 columns
- Card per bagel with:
  - SVG illustration (64x64)
  - Name label below
  - Selection checkbox indicator (top-right)
- Selected state: Blue border, light blue background, shadow

#### Countdown Timer
- Large numbers: font-black, text-primary
- Labels: uppercase, tracking-wider, font-semibold
- Separators: Colon between units

---

## 5. Data Requirements

### 5.1 Data Model

See [DATABASE.md](DATABASE.md) for complete schema.

**Key Entities**:
- `bagel_submissions`: User orders
- `spread_requests`: Spread suggestions
- `spread_upvotes`: Votes on spreads

### 5.2 Data Retention

- Submissions retained indefinitely (historical data)
- Could implement archival after 1 year (future)

### 5.3 Privacy

- Browser IDs (nanoid) for anonymous tracking
- User names stored but never displayed publicly
- No authentication required
- No PII beyond optional name

---

## 6. Future Considerations

### Phase 2 (Potential)
- Admin dashboard for order management
- Email notifications before deadline
- Historical order analytics
- User accounts (optional)
- Multiple office location support

### Out of Scope
- Payment processing
- Delivery tracking
- Inventory management
- User authentication

---

## 8. Development Tools

### Debug Mode (Development Only)

For testing the app at different time states without changing system clock:

**Usage**: Add `?debug_time=` parameter to URL

| Scenario | URL Parameter |
|----------|---------------|
| Wednesday morning (open) | `?debug_time=2026-01-28T10:00:00` |
| Wednesday afternoon (closed) | `?debug_time=2026-01-28T14:00:00` |
| Thursday (closed) | `?debug_time=2026-01-29T10:00:00` |
| Friday morning (open) | `?debug_time=2026-01-30T09:00:00` |

- Only works when `NODE_ENV=development`
- Yellow banner displays simulated time
- Affects countdown display and form enabled/disabled state

---

## 9. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Initial | Initial PRD |
| 1.1.0 | Jan 29, 2026 | Update | Added closed state countdown behavior, form disabling when closed, debug mode documentation |
| 1.2.0 | Jan 29, 2026 | Update | Side-by-side layout for order form + tally on desktop, dozens count display, year-to-date statistics with auto-reset |
