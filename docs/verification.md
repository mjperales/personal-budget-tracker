# Verification Requirements

All work must pass these verification steps before being marked complete.

## Required Commands

Run these commands from the repository root:

```bash
pnpm typecheck    # TypeScript compilation
pnpm lint         # ESLint checks
pnpm test         # All tests pass
pnpm build        # Production builds
```

## What Each Command Validates

### `pnpm typecheck`

**Validates:** TypeScript compilation across all packages

**Checks:**
- Type correctness in all `.ts` and `.tsx` files
- Import/export types resolve correctly
- No implicit `any` types
- Strict null checks pass

**When to run:**
- After adding/modifying TypeScript code
- Before committing
- If IDE shows type errors

**Expected output:**
```
Scope: 2 of 3 workspace projects
apps/api typecheck$ tsc --noEmit
apps/web typecheck$ tsc --noEmit
apps/api typecheck: Done
apps/web typecheck: Done
```

**Common failures:**
- Missing type definitions for dependencies
- Incorrect import paths
- Type mismatches between API and web

---

### `pnpm lint`

**Validates:** Code style and potential errors

**Checks:**
- ESLint rules (TypeScript, React, accessibility)
- Import ordering
- Unused variables
- Console statements in production code

**When to run:**
- After making changes
- Before committing
- Use `pnpm lint:fix` to auto-fix issues

**Expected output:**
```
> eslint .

(no output = success)
```

**Common failures:**
- Unused imports or variables (prefix with `_` if intentional)
- Missing dependencies in useEffect
- Accessibility violations

---

### `pnpm test`

**Validates:** All unit and integration tests pass

**Checks:**
- API routes work correctly (Supertest)
- Services return expected data
- React components render and behave correctly (RTL)
- User interactions trigger expected outcomes

**When to run:**
- After implementing features
- After bug fixes
- Before committing
- Use `pnpm test:watch` during development

**Expected output:**
```
 ✓ |@budget-tracker/api| src/routes/health.routes.test.ts (1 test)
 ✓ |web| src/App.test.tsx (4 tests)

 Test Files  2 passed (2)
      Tests  5 passed (5)
```

**Test-specific commands:**
```bash
pnpm test                    # Run all tests once
pnpm test:watch              # Watch mode (re-run on changes)
pnpm test:coverage           # Generate coverage report
pnpm --filter @budget-tracker/api test    # API tests only
pnpm --filter @budget-tracker/web test    # Web tests only
```

**Common failures:**
- Async state updates not awaited in tests
- Mock setups incorrect
- Component dependencies missing in test environment

---

### `pnpm build`

**Validates:** Production builds succeed

**Checks:**
- TypeScript compiles to JavaScript (API)
- Vite bundles React app (web)
- No build-time errors
- All imports resolve

**When to run:**
- Before deploying
- To verify production build works
- After adding new dependencies

**Expected output:**
```
Scope: 2 of 3 workspace projects
apps/api build$ tsc
apps/web build$ tsc && vite build
apps/api build: Done
apps/web build: vite v6.4.3 building for production...
apps/web build: ✓ built in 662ms
apps/web build: Done
```

**Output locations:**
- API: `apps/api/dist/`
- Web: `apps/web/dist/`

**Common failures:**
- Dynamic imports not configured correctly
- Environment variables used in build not available
- CSS/asset imports broken

---

## Optional Verification

### Coverage Reports

```bash
pnpm test:coverage
```

Generates coverage reports in `coverage/` directories.

**Target thresholds** (aspirational):
- Lines: 80%+
- Functions: 80%+
- Branches: 70%+

Don't obsess over 100% coverage. Focus on testing behavior.

---

### Docker Validation

Verify the application works in Docker:

```bash
# Build and start containers
docker compose up --build

# Verify web accessible at http://localhost:8080
# Verify API accessible at http://localhost:3000/api/health

# Stop containers
docker compose down
```

**When to run:**
- Before releasing
- After modifying Docker configuration
- To test production-like environment

**Common issues:**
- Port conflicts (another service using 8080 or 3000)
- Build context incorrect in Dockerfile
- nginx proxy configuration broken

---

### End-to-End Tests

```bash
pnpm --filter @budget-tracker/web test:e2e
```

Runs Playwright tests (when they exist).

**When to run:**
- Before major releases
- After implementing critical user flows
- Not required for every change

---

## Verification Checklist

Before marking work complete:

- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm lint` passes with no errors  
- [ ] `pnpm test` passes with all tests green
- [ ] `pnpm build` completes successfully
- [ ] New features have tests
- [ ] Tests meaningfully validate behavior
- [ ] No `console.log` statements in committed code
- [ ] `.env.example` updated if new variables added

Optional (recommended):
- [ ] Coverage maintained or improved
- [ ] Docker containers build and run
- [ ] Manual testing of changed functionality

---

## What to Do When Verification Fails

1. **Read the error message carefully**
   - Most errors indicate exactly what's wrong

2. **Run the specific failing check**
   ```bash
   pnpm --filter @budget-tracker/api test  # Just API tests
   pnpm typecheck                          # Just type errors
   ```

3. **Fix the issue**
   - Don't skip checks
   - Don't comment out failing tests
   - Fix the root cause

4. **Re-run verification**
   ```bash
   pnpm typecheck && pnpm lint && pnpm test && pnpm build
   ```

5. **Commit only when all checks pass**

---

## Integration with Git Hooks

Consider adding a pre-commit hook (optional):

```bash
# .husky/pre-commit (if using husky)
pnpm typecheck
pnpm lint
pnpm test
```

This catches issues before they're committed.
