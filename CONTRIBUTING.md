# Contributing to KWI Bagel Thursdays

Thank you for your interest in contributing to Bagel Thursdays!

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase account (for database)

### Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd bagel-thursdays
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials.

4. Start development server
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types in `lib/types.ts` for shared types
- Use explicit return types for functions
- Prefer `interface` over `type` for object shapes

### React Components

- Use functional components with hooks
- Place components in `app/components/ComponentName/index.tsx`
- Keep components focused on a single responsibility
- Use `'use client'` directive only when necessary

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme (see `globals.css`)
- Use CSS variables for theme colors
- Responsive design: mobile-first approach

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BagelSelector` |
| Files | kebab-case or PascalCase | `bagel-selector.tsx` |
| Functions | camelCase | `handleSubmit` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS` |
| Types/Interfaces | PascalCase | `BagelType` |

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(spreads): add upvote toggle functionality
fix(countdown): correct timezone handling for EST
docs(readme): add deployment instructions
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Push and create a PR
6. Fill out the PR template
7. Request review

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Writing Tests

- Place tests in `__tests__/` directory
- Mirror the source file structure
- Name test files `*.test.ts` or `*.test.tsx`
- Use descriptive test names

Example:
```typescript
describe('BagelSelector', () => {
  it('should highlight selected bagel', () => {
    // ...
  });

  it('should show custom input when Other is selected', () => {
    // ...
  });
});
```

## Database Changes

### Making Schema Changes

1. Create a new migration file in `supabase/migrations/`
2. Name it with sequence number: `004_description.sql`
3. Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS`)
4. Update `docs/DATABASE.md`
5. Test locally before committing

### Migration Template

```sql
-- Migration: Description
-- Date: YYYY-MM-DD

-- Add new column
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS column_name TYPE;

-- Create new table
CREATE TABLE IF NOT EXISTS new_table (
  -- columns
);

-- Add constraint
ALTER TABLE table_name
ADD CONSTRAINT constraint_name ...;
```

## Documentation

### Updating Docs

When making changes, update relevant documentation:

- `README.md` - User-facing setup/usage
- `docs/PRD.md` - Feature requirements
- `docs/ARCHITECTURE.md` - Technical design
- `docs/DATABASE.md` - Schema changes
- `CHANGELOG.md` - Version history

### Adding Inline Comments

Add comments for:
- Complex business logic
- Non-obvious implementation details
- TODO items (include ticket reference if applicable)

## Troubleshooting

### Common Issues

**Supabase connection errors**
- Verify `.env.local` has correct credentials
- Check Supabase project is active

**TypeScript errors with Supabase**
- Use `as any` for RPC calls not in generated types
- Regenerate types if schema changed

**Real-time not updating**
- Verify table is in `supabase_realtime` publication
- Check browser console for WebSocket errors

### Getting Help

- Check existing issues and PRs
- Review documentation in `/docs`
- Ask in team Slack channel

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Write clear PR descriptions
- Respond to feedback promptly
- Update tests for new code

### For Reviewers

- Be constructive and specific
- Approve when satisfied (don't block on minor issues)
- Focus on:
  - Correctness
  - Performance
  - Security
  - Maintainability
