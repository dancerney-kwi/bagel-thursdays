# Feature Spec: [Feature Name]

> Copy this template to create a new feature spec.
> Name the file: `NNNN-feature-name.md` (e.g., `0001-admin-dashboard.md`)

## Status

- [ ] Draft
- [ ] Ready for Implementation
- [ ] In Progress
- [ ] Complete

## Overview

**One-liner**: [What does this feature do in one sentence?]

**Problem**: [What problem does this solve?]

**Solution**: [High-level approach]

## Scope

### In Scope
- [What this feature WILL do]
- [Specific capabilities]

### Out of Scope
- [What this feature will NOT do]
- [Explicit exclusions]

### Appetite
[How much time/effort to invest: Small (1-2 hours), Medium (half day), Large (1+ days)]

## Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | [Requirement description] | Must |
| FR-2 | [Requirement description] | Should |
| FR-3 | [Requirement description] | Could |

### Non-Functional Requirements

- **Performance**: [Any performance requirements]
- **Accessibility**: [A11y requirements]
- **Security**: [Security considerations]

## User Stories

```
As a [user type]
I want to [action]
So that [benefit]
```

## Acceptance Criteria

### AC-1: [Criteria Name]
```gherkin
Given [precondition]
When [action]
Then [expected result]
```

### AC-2: [Criteria Name]
```gherkin
Given [precondition]
When [action]
Then [expected result]
```

## Technical Design

### Files to Create
| File | Purpose |
|------|---------|
| `path/to/file.tsx` | [Description] |

### Files to Modify
| File | Changes |
|------|---------|
| `path/to/file.tsx` | [What changes] |

### Database Changes
```sql
-- Migration: XXX_description.sql
[SQL if needed]
```

### API Changes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/endpoint` | POST | [Description] |

### Component Structure
```
ComponentName/
├── index.tsx        # Main component
├── SubComponent.tsx # If needed
└── types.ts         # Local types if needed
```

## UI/UX

### Wireframe
```
[ASCII wireframe or link to design]
┌─────────────────────┐
│                     │
│                     │
└─────────────────────┘
```

### States
- **Default**: [Description]
- **Loading**: [Description]
- **Error**: [Description]
- **Empty**: [Description]
- **Success**: [Description]

## Test Cases

### Unit Tests
| Test | Expected |
|------|----------|
| [Test description] | [Expected outcome] |

### Integration Tests
| Test | Expected |
|------|----------|
| [Test description] | [Expected outcome] |

## Edge Cases

| Case | Handling |
|------|----------|
| [Edge case] | [How to handle] |

## Rollback Plan

[How to revert if something goes wrong]

## Implementation Checklist

- [ ] Create/modify files per Technical Design
- [ ] Write unit tests
- [ ] Test manually
- [ ] Update CHANGELOG.md
- [ ] Update documentation if needed

## Notes

[Any additional context, decisions, or considerations]
