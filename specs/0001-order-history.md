# Feature Spec: Order History

> Example spec demonstrating the format for future features.

## Status

- [x] Draft
- [ ] Ready for Implementation
- [ ] In Progress
- [ ] Complete

## Overview

**One-liner**: Allow users to view their past bagel orders.

**Problem**: Users can't remember what they ordered in previous weeks and have no way to see their order history.

**Solution**: Add an expandable "My Order History" section that shows the user's past submissions (stored locally and fetched from DB).

## Scope

### In Scope
- Display user's past orders (bagel type, date)
- Show last 10 weeks of history
- Collapsible/expandable section
- Works with existing browser_id system

### Out of Scope
- Editing past orders
- Exporting history
- Sharing history
- Cross-device sync (browser_id is per-device)

### Appetite
Medium (half day)

## Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | User can view their past orders | Must |
| FR-2 | Orders show bagel type and week | Must |
| FR-3 | Section is collapsed by default | Should |
| FR-4 | Shows "No history yet" if empty | Must |
| FR-5 | Limited to last 10 weeks | Should |

### Non-Functional Requirements

- **Performance**: Load history in <500ms
- **Accessibility**: Expandable section keyboard accessible
- **Security**: Only shows orders matching user's browser_id

## User Stories

```
As an employee
I want to see my past bagel orders
So that I can remember what I've ordered and try something different
```

## Acceptance Criteria

### AC-1: View History
```gherkin
Given I have submitted orders in previous weeks
When I expand the "My Order History" section
Then I see a list of my past orders with bagel type and week
```

### AC-2: Empty State
```gherkin
Given I have never submitted an order
When I expand the "My Order History" section
Then I see "No order history yet"
```

### AC-3: Collapsed Default
```gherkin
Given I am on the main page
When the page loads
Then the history section is collapsed
```

## Technical Design

### Files to Create
| File | Purpose |
|------|---------|
| `app/components/OrderHistory/index.tsx` | History list component |

### Files to Modify
| File | Changes |
|------|---------|
| `app/page.tsx` | Add OrderHistory component |
| `app/api/bagels/route.ts` | Add GET endpoint for user history |

### Database Changes
```sql
-- No schema changes needed
-- Query existing bagel_submissions table
```

### API Changes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bagels/history` | GET | Get user's past orders by browser_id |

**Request**: `GET /api/bagels/history?browser_id=xxx`

**Response**:
```json
{
  "history": [
    { "week_id": "2026-W04", "bagel_type": "everything", "custom_bagel": null },
    { "week_id": "2026-W03", "bagel_type": "plain", "custom_bagel": null }
  ]
}
```

### Component Structure
```typescript
// app/components/OrderHistory/index.tsx
'use client';

interface OrderHistoryProps {
  browserId: string;
}

interface HistoryItem {
  week_id: string;
  bagel_type: string;
  custom_bagel: string | null;
}

export default function OrderHistory({ browserId }: OrderHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history when expanded
  // Render collapsible section
}
```

## UI/UX

### Wireframe
```
┌─────────────────────────────────────────┐
│ My Order History              [▼ Expand]│
├─────────────────────────────────────────┤
│ (when expanded)                         │
│                                         │
│  Week 4, 2026    Everything Bagel       │
│  Week 3, 2026    Plain Bagel            │
│  Week 2, 2026    Sesame Bagel           │
│                                         │
└─────────────────────────────────────────┘
```

### States
- **Collapsed**: Shows header with expand button
- **Loading**: Shows spinner while fetching
- **Empty**: "No order history yet"
- **Populated**: List of past orders

## Test Cases

### Unit Tests
| Test | Expected |
|------|----------|
| Renders collapsed by default | Section content not visible |
| Expands on click | Section content becomes visible |
| Shows loading state | Spinner visible while fetching |
| Shows empty state | Message shown when no history |
| Shows history items | List of orders rendered |

### Integration Tests
| Test | Expected |
|------|----------|
| API returns user's orders | Only orders with matching browser_id |
| API limits to 10 weeks | Max 10 items returned |

## Edge Cases

| Case | Handling |
|------|----------|
| No browser_id | Don't render component |
| API error | Show "Unable to load history" |
| Very long custom_bagel text | Truncate with ellipsis |

## Rollback Plan

1. Remove OrderHistory component from page.tsx
2. Delete OrderHistory component folder
3. Remove /api/bagels/history route

## Implementation Checklist

- [ ] Create OrderHistory component
- [ ] Add /api/bagels/history endpoint
- [ ] Add component to page.tsx
- [ ] Write unit tests
- [ ] Test manually (with/without history)
- [ ] Update CHANGELOG.md

## Notes

- Consider caching history in localStorage to reduce API calls
- Future enhancement: Add "Reorder" button to quickly select same bagel
