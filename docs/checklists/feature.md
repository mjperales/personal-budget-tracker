# Feature Development Checklist

Use when adding a new feature (API endpoint, React component, or full-stack feature).

## Pre-flight

- [ ] Read [docs/architecture.md](../architecture.md) to understand system structure
- [ ] Read [docs/conventions.md](../conventions.md) for coding standards
- [ ] Determine scope: API only, web only, or full-stack?
- [ ] List required data types and validation schemas
- [ ] Identify all states (success, loading, error, empty)

## API Feature

If implementing an API endpoint:

### 1. Define Types and Validation

- [ ] Create Zod schema in `apps/api/src/` (or `packages/shared/src/`)
- [ ] Define TypeScript types from schema
- [ ] Document validation rules

### 2. Create Database Schema (if needed)

- [ ] Add table definition to `apps/api/src/db/schema.ts`
- [ ] Run: `pnpm --filter @budget-tracker/api db:generate`
- [ ] Run: `pnpm --filter @budget-tracker/api db:migrate`

### 3. Implement Service Layer

Create in `apps/api/src/services/`:
- [ ] `resource.service.ts` with business logic
- [ ] `resource.service.test.ts` with unit tests
- [ ] Export service functions

### 4. Implement Route Layer

Create in `apps/api/src/routes/`:
- [ ] `resource.routes.ts` with Express router
- [ ] `resource.routes.test.ts` with Supertest integration tests
- [ ] Mount router in `apps/api/src/app.ts`

### 5. Write Tests

- [ ] Service tests cover business logic
- [ ] Route tests cover HTTP layer (status codes, responses)
- [ ] Run: `pnpm --filter @budget-tracker/api test`
- [ ] Verify all tests pass

---

## Web Feature

If implementing a React component:

### 1. Define Component Structure

Determine location:
- New component → `apps/web/src/components/ComponentName/`
- Utility → `apps/web/src/lib/`

### 2. Create Files

In `apps/web/src/components/ComponentName/`:
- [ ] `ComponentName.tsx`
- [ ] `ComponentName.test.tsx`
- [ ] `index.ts` (re-export)

### 3. Implement Component

Follow [docs/conventions.md](../conventions.md):
- [ ] Define Props interface
- [ ] Use semantic HTML
- [ ] Add ARIA labels where needed
- [ ] Style with Tailwind utilities

### 4. Write Tests

- [ ] Test rendering with different props
- [ ] Test user interactions (clicks, input)
- [ ] Test accessibility (vitest-axe)
- [ ] Run: `pnpm --filter @budget-tracker/web test`
- [ ] Verify all tests pass

### 5. Integrate API (if needed)

- [ ] Create API client function in `apps/web/src/lib/api.ts`
- [ ] Add error handling
- [ ] Test with mocked API responses

---

## Full-Stack Feature

If feature spans both API and web:

### 1. Start with API

- [ ] Complete "API Feature" steps above
- [ ] Verify API works via curl or Postman
- [ ] Document API response shapes

### 2. Then Build Web

- [ ] Complete "Web Feature" steps above
- [ ] Wire up API client to call backend
- [ ] Handle loading and error states

### 3. End-to-End Verification

- [ ] Start both servers: `pnpm dev`
- [ ] Test complete user flow manually
- [ ] Verify error handling works

---

## Verification

Run from repository root:

```bash
pnpm typecheck          # TypeScript compiles
pnpm lint               # No linting errors
pnpm test               # All tests pass
pnpm build              # Production builds succeed
```

- [ ] All verification steps pass
- [ ] New code has test coverage
- [ ] No console.logs left in code
- [ ] Environment variables added to `.env.example` (if any)

---

## Documentation

- [ ] Update README if user-facing feature
- [ ] Add JSDoc comments to exported functions
- [ ] Document any new environment variables

---

## Summary

**STOP**: Before marking done, summarize:

- **What was added**: List files and endpoints/components created
- **Key functionality**: What does this feature do?
- **Testing**: How was it verified?
- **Residual risks**: Any known limitations or edge cases?

**Example**: 
```
Added transaction management feature:
- API: POST /api/transactions, GET /api/transactions
- Web: TransactionList component, TransactionForm component
- Tests: 8 new tests (5 API, 3 component)
- Verified: Manual testing in dev, all tests pass
- Risks: No pagination yet (will add when >100 transactions)
```
