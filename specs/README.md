# Feature Specifications

This directory contains feature specs for AI-assisted development.

## Purpose

Feature specs provide structured, implementation-ready documentation that AI coding assistants can follow to build features consistently and correctly.

## How to Use

### Creating a New Spec

1. Copy `_TEMPLATE.md` to a new file
2. Name it: `NNNN-feature-name.md` (e.g., `0002-email-reminders.md`)
3. Fill in all sections
4. Mark status as "Ready for Implementation"

### Implementing a Spec

When asking an AI assistant to implement a feature:

```
Implement the feature spec in specs/0001-order-history.md

Follow the technical design exactly. Create tests for each test case listed.
```

### Spec Lifecycle

```
Draft → Ready for Implementation → In Progress → Complete
```

- **Draft**: Still being refined
- **Ready**: Fully specified, can be implemented
- **In Progress**: Currently being built
- **Complete**: Implemented and tested

## Spec Quality Checklist

A good spec should:

- [ ] Have a clear one-liner description
- [ ] Define explicit scope (in/out)
- [ ] List acceptance criteria in Gherkin format
- [ ] Specify exact files to create/modify
- [ ] Include API contracts (request/response)
- [ ] Define all UI states
- [ ] List test cases
- [ ] Address edge cases

## Files

| File | Description |
|------|-------------|
| `_TEMPLATE.md` | Copy this for new specs |
| `0001-order-history.md` | Example spec (not yet implemented) |

## Naming Convention

```
NNNN-short-description.md

NNNN = Sequential number (0001, 0002, etc.)
short-description = Kebab-case feature name
```

## Tips for Writing Specs

1. **Be specific**: "Add a button" → "Add a pill-shaped button with text 'SAVE' below the form"

2. **Use Gherkin**: Acceptance criteria in Given/When/Then format are unambiguous

3. **Include code snippets**: Show the expected component structure, API response format

4. **Define states**: Every UI component has states (loading, error, empty, success)

5. **List edge cases**: What happens with empty data? Invalid input? Network failure?

6. **Keep scope small**: One spec = one feature. Break large features into multiple specs.
