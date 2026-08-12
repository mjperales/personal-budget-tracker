# Bug Fix Checklist

Use when fixing a bug in existing code.

## Understand the Bug

- [ ] Reproduce the bug reliably
- [ ] Document steps to reproduce
- [ ] Identify affected file(s): API, web, or both?
- [ ] Determine root cause (not just symptom)
- [ ] Check if bug exists in similar code

## Before Fixing

### Write a Failing Test

**Critical**: Write the test BEFORE fixing the bug.

API bug:
- [ ] Add failing test to `apps/api/src/routes/*.test.ts` or `*.service.test.ts`
- [ ] Run: `pnpm --filter @budget-tracker/api test`
- [ ] Confirm test fails as expected

Web bug:
- [ ] Add failing test to `apps/web/src/components/*.test.tsx`
- [ ] Run: `pnpm --filter @budget-tracker/web test`
- [ ] Confirm test fails as expected

Document expected vs actual behavior in test description.

## Apply Fix

- [ ] Make minimal change to fix root cause
- [ ] Avoid refactoring unless necessary for the fix
- [ ] Update types if interface changed
- [ ] Keep changes focused on the bug

**One file at a time**: If bug spans multiple files, fix incrementally and test after each change.

## Update Tests

- [ ] Verify failing test now passes
- [ ] Add regression test if not already covered
- [ ] Ensure existing tests still pass
- [ ] Run: `pnpm test` (all tests)

## Verification

Run from repository root:

```bash
pnpm typecheck          # TypeScript compiles
pnpm lint               # No new linting errors
pnpm test               # All tests pass (including new ones)
pnpm build              # Builds succeed
```

Manual verification:
- [ ] Bug no longer reproduces
- [ ] No regressions in related functionality
- [ ] No accessibility violations introduced (web)

## Edge Cases

- [ ] Test with missing/null data
- [ ] Test with invalid input
- [ ] Test boundary conditions
- [ ] Consider: does this bug exist elsewhere?

## Summary

**STOP**: Before marking done, document:

### Root Cause
Explain what caused the bug (not just what was broken).

### What Changed
List files and line numbers modified.

### Verification
How did you confirm the fix works?

### Residual Risk
Any edge cases not covered? Related bugs found?

**Example**:
```
Fixed null reference error in TransactionList:
- Root cause: Missing null check when transactions array is empty
- Changed: apps/web/src/components/TransactionList.tsx line 23
- Added: Test for empty array case
- Verified: Manual test + new unit test passes
- Risk: Low - isolated change, existing tests still pass
```

---

## When to Escalate

Stop and ask for guidance if:
- Root cause is unclear after investigation
- Fix requires breaking API changes
- Fix requires database migration
- Multiple unrelated bugs discovered during investigation

Don't guess or make broad changes without understanding the issue.
