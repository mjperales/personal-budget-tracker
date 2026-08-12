# Refactor Checklist

Use when improving code structure **without changing behavior**.

If behavior changes, use [feature.md](./feature.md) instead.

## Pre-refactor Safety

### Establish Baseline

- [ ] All existing tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] Commit current working state (safety checkpoint)

**Why**: You need a clean baseline to detect if refactoring introduces issues.

### Scope the Refactor

- [ ] Identify exact files that will change
- [ ] List which tests must still pass
- [ ] Confirm behavior stays identical (no feature additions)
- [ ] Estimate: small (1-2 files) or large (3+ files)?

**Large refactors**: Break into smaller incremental changes, commit after each.

## Plan Refactor

- [ ] Define what's changing:
  - Extract function/component?
  - Rename for clarity?
  - Reorganize file structure?
  - Simplify logic?

- [ ] Ensure behavior stays identical
- [ ] List any types that will change
- [ ] Plan incremental steps (if large refactor)

## Apply Refactor

### Work Incrementally

- [ ] Make changes one logical step at a time
- [ ] Run tests after each step: `pnpm test`
- [ ] Keep tests passing between changes
- [ ] Commit each working increment

**Don't**: Make 10 changes, then try to fix all broken tests at once.
**Do**: Change one thing, verify tests pass, commit, repeat.

### Update Related Code

- [ ] Update imports if files moved
- [ ] Update type definitions if structure changed
- [ ] Update path aliases if locations changed
- [ ] Update tests if test setup changed (but NOT test assertions)

## Verify No Behavior Change

Run after each increment:

```bash
pnpm typecheck          # Types still valid
pnpm lint               # No new warnings
pnpm test               # All tests pass
```

**Critical rule**: Existing tests must pass **without modification**.

If tests need changes, you're changing behavior (not refactoring).

### Test Coverage

- [ ] Run: `pnpm test:coverage`
- [ ] Verify coverage not reduced
- [ ] No new uncovered code introduced

## Manual Verification

API refactor:
- [ ] Start API: `pnpm --filter @budget-tracker/api dev`
- [ ] Test endpoints via curl or Postman
- [ ] Verify responses unchanged

Web refactor:
- [ ] Start web: `pnpm --filter @budget-tracker/web dev`
- [ ] Manually test affected UI
- [ ] Verify visual appearance unchanged
- [ ] Test keyboard navigation still works

## Update Documentation

- [ ] Update JSDoc comments if signatures changed
- [ ] Update README if architecture changed
- [ ] Update docs/conventions.md if patterns changed
- [ ] No user-facing docs need updates (behavior unchanged)

## Final Verification

Run complete verification suite:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Checklist:
- [ ] All tests pass without modification
- [ ] No TypeScript errors
- [ ] Test coverage maintained or improved
- [ ] Code is cleaner/more maintainable
- [ ] Performance not degraded
- [ ] Build size not increased significantly

## Summary

**STOP**: Before marking done, document:

### What Was Refactored
List specific files and what changed.

### Why
What improved? (readability, maintainability, performance, reusability)

### Verification
How did you confirm behavior unchanged?

### Follow-up
Any additional refactors identified but not done?

**Example**:
```
Refactored transaction validation logic:
- Extracted validation to transactionSchema.ts from routes
- Centralized in one place for reuse
- All 12 existing tests pass unchanged
- Improved: Easier to maintain validation rules
- Follow-up: Consider extracting other schemas similarly
```

---

## When NOT to Refactor

Avoid refactoring if:
- Tests don't exist (write tests first)
- You don't understand the code (investigate first)
- Deadline pressure (schedule it for later)
- Fixing a bug at the same time (fix bug first, refactor after)

**Refactoring and feature work don't mix well.**

Do one or the other, not both in the same change.
