# Coding Conventions

## File Naming and Organization

### API (`apps/api/src/`)

```
routes/
  resource.routes.ts       # Plural resource name, e.g., transactions.routes.ts
  resource.routes.test.ts  # Colocated test

services/
  resource.service.ts      # Business logic for resource
  resource.service.test.ts # Colocated test

middleware/
  kebab-case.ts           # e.g., error-handler.ts, auth.ts
```

### Web (`apps/web/src/`)

```
components/
  ComponentName.tsx        # Component implementation
  ComponentName.types.ts   # Component-specific types
  ComponentName.test.tsx   # Colocated test
  
  ui/                      # Reusable UI primitives
    Button.tsx
    Button.types.ts
    Button.test.tsx
    Card.tsx
    Card.types.ts
    Card.test.tsx

pages/
  PageName.tsx             # Page component
  PageName.test.tsx        # Page test

lib/
  kebab-case.ts           # e.g., api.ts, utils.ts, format.ts
  kebab-case.test.ts      # Colocated test
```

**Component file conventions:**
- Flat structure (no folders per component)
- Separate `.types.ts` file for component-specific types
- Colocated `.test.tsx` file for tests
- Use `ui/` subfolder for reusable primitives

## TypeScript Patterns

### Strict Mode

All packages use strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Declarations

**Prefer explicit over inferred:**
```typescript
// Good
export interface CreateTransactionInput {
  amount: number;
  category: string;
  date: string;
}

export function createTransaction(input: CreateTransactionInput): Transaction {
  // ...
}

// Avoid
export function createTransaction(input) {
  // Type inference only
}
```

**Use Zod for validation:**
```typescript
import { z } from 'zod';

const TransactionSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string().datetime(),
});

type Transaction = z.infer<typeof TransactionSchema>;
```

### Async/Await

Always use async/await, never raw Promises:
```typescript
// Good
async function fetchData() {
  const response = await apiClient('/data');
  return response;
}

// Avoid
function fetchData() {
  return apiClient('/data').then(response => response);
}
```

## API Conventions

### API Versioning

All API routes use version prefix `/api/v1`:

```typescript
// Mounted in app.ts
app.use('/api/v1', transactionsRouter);

// Results in: GET /api/v1/transactions
```

**Versioning conventions:**
- Current version: `/api/v1`
- Mount all routers under version prefix in `app.ts`
- Don't repeat version in individual route definitions
- Future versions will be `/api/v2`, etc.

### Standardized Responses

Use response helpers from `lib/responses.ts`:

```typescript
import { success, created, noContent } from '../lib/responses.js';

// 200 OK with data
success(res, { items: [] });
// → { data: { items: [] } }

// 201 Created
created(res, newTransaction);
// → { data: { ...transaction } }

// 204 No Content
noContent(res);
```

**Never** call `res.json()` directly - always use helpers.

### Route Structure

```typescript
import { Router } from 'express';
import { success, created } from '../lib/responses.js';

export const transactionsRouter = Router();

// GET /api/v1/transactions
transactionsRouter.get('/', async (req, res) => {
  const transactions = await transactionsService.list();
  success(res, transactions);
});

// POST /api/v1/transactions
transactionsRouter.post('/', async (req, res) => {
  const input = TransactionSchema.parse(req.body);
  const transaction = await transactionsService.create(input);
  created(res, transaction);
});
```

**Route conventions:**
- Use plural resource names
- Always use response helpers
- Let error handler catch all errors

### Service Layer

```typescript
// services/transactions.service.ts
export const transactionsService = {
  async list(): Promise<Transaction[]> {
    return db.select().from(transactions);
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(input)
      .returning();
    return transaction;
  },
};
```

**Service conventions:**
- Export object with methods (not class)
- Return typed data
- Throw errors for invalid operations
- Keep services focused (single responsibility)

### Error Handling

Use `AppError` from `lib/errors.ts` for known errors:

```typescript
import { Errors } from '../lib/errors.js';

// Not found
if (!transaction) {
  throw Errors.notFound('Transaction');
}

// Validation error
const result = TransactionSchema.safeParse(req.body);
if (!result.success) {
  throw Errors.validation(result.error.format());
}

// Internal error
throw Errors.internal();
```

**Available error factories:**
- `Errors.notFound(resource)` - 404 with resource name
- `Errors.validation(details)` - 400 with Zod error details
- `Errors.internal()` - 500 generic error

**Error response format:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Transaction not found",
    "details": { /* optional */ }
  }
}
```

**Never** catch and format errors manually - let the error handler middleware do it.

**Creating custom errors:**
```typescript
import { AppError } from '../lib/errors.js';

throw new AppError('INSUFFICIENT_FUNDS', 'Account balance too low', 400);
```

## React Conventions

### Component Structure

**Component file (`TransactionList.tsx`):**
```typescript
import { useState } from 'react';
import type { TransactionListProps } from './TransactionList.types';

export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <ul className="space-y-2">
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          <button onClick={() => handleSelect(transaction.id)}>
            {transaction.amount}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Types file (`TransactionList.types.ts`):**
```typescript
import type { Transaction } from '@/lib/api';

export interface TransactionListProps {
  transactions: Transaction[];
  onSelect?: (id: string) => void;
}
```

**Component conventions:**
- Use function components
- Store component-specific types in separate `.types.ts` file
- Import types using `type` keyword
- Destructure props in parameter
- Use optional chaining for optional callbacks
- Export component directly (named export)

**When to use `.types.ts` files:**
- Component props interfaces
- Component-specific type aliases
- Enums or constants used only by that component
- Helps keep component files focused on implementation

### API Calls

Use the API client abstraction:

```typescript
import { apiClient } from '@/lib/api';

async function fetchTransactions() {
  return apiClient<Transaction[]>('/transactions');
}

async function createTransaction(input: CreateTransactionInput) {
  return apiClient<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

### Styling with Tailwind

```typescript
// Use utility classes directly
<div className="container mx-auto px-4 py-8">
  <h1 className="text-4xl font-bold text-primary-600">
    Budget Tracker
  </h1>
</div>

// Use cn() helper for conditional classes
import { cn } from '@/lib/utils';

<button className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-primary-600 text-white",
  !isActive && "bg-gray-200 text-gray-800"
)}>
  Click me
</button>
```

## Testing Patterns

### API Tests (Supertest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('GET /api/transactions', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  it('returns empty array when no transactions exist', async () => {
    const response = await request(app).get('/api/transactions');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
```

**API test conventions:**
- Use `describe` for endpoint grouping
- Create fresh app in `beforeEach`
- Test status code and body shape
- Use meaningful test descriptions

### React Tests (RTL)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionList } from './TransactionList';

describe('TransactionList', () => {
  it('renders transaction amounts', () => {
    const transactions = [
      { id: '1', amount: 50, category: 'Food', date: '2026-01-01' },
    ];
    
    render(<TransactionList transactions={transactions} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('calls onSelect when transaction is clicked', async () => {
    const onSelect = vi.fn();
    const transactions = [
      { id: '1', amount: 50, category: 'Food', date: '2026-01-01' },
    ];
    
    render(<TransactionList transactions={transactions} onSelect={onSelect} />);
    
    await userEvent.click(screen.getByText('50'));
    
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

**React test conventions:**
- Use RTL queries in priority order: `getByRole` > `getByLabelText` > `getByText`
- Avoid `getByTestId` unless necessary
- Test user-facing behavior, not implementation
- Use `userEvent` for interactions (not `fireEvent`)

### Query Priority

1. **getByRole** (most preferred - accessibility-friendly)
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByRole('textbox', { name: /amount/i })
   ```

2. **getByLabelText** (form inputs)
   ```typescript
   screen.getByLabelText(/amount/i)
   ```

3. **getByPlaceholderText**
   ```typescript
   screen.getByPlaceholderText(/enter amount/i)
   ```

4. **getByText** (non-interactive content)
   ```typescript
   screen.getByText(/total:/i)
   ```

5. **getByTestId** (last resort only)

## Import Ordering

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { z } from 'zod';

// 2. Internal absolute imports (using @/)
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

// 3. Relative imports
import { TransactionList } from './TransactionList';

// 4. Type imports (if separated)
import type { Transaction } from '@/types';

// 5. Styles
import './styles.css';
```

## Comments

**When to comment:**
- Explain **why**, not **what**
- Document non-obvious business rules
- Warn about gotchas or edge cases

**When NOT to comment:**
- Obvious code (don't narrate)
- Generated documentation (use JSDoc/TSDoc instead)
- Outdated comments (remove or update)

```typescript
// Bad: narrating the obvious
// Check if transaction exists
if (!transaction) {
  throw new Error('Not found');
}

// Good: explaining why
// We require at least 30 days of history for accurate trend analysis
if (transactions.length < 30) {
  return null;
}
```

## Environment Variables

### API (.env)

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DB_PATH=./data/budget.db

# CORS (optional)
CORS_ORIGIN=http://localhost:5173
```

### Web (.env)

```bash
# API URL (optional - defaults to /api proxy)
# VITE_API_URL=/api
```

**Conventions:**
- Always provide `.env.example` with documented variables
- Never commit `.env` to version control
- Validate with Zod in `config.ts`
- Use sensible defaults where possible

## Accessibility

### Semantic HTML

```tsx
// Good: semantic elements
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Avoid: divs for everything
<div className="nav">
  <div className="link">Dashboard</div>
</div>
```

### ARIA Labels

```tsx
// Good: meaningful labels
<button aria-label="Delete transaction">
  <TrashIcon />
</button>

// Avoid: icon without label
<button>
  <TrashIcon />
</button>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Test tab order makes sense
- Provide focus indicators (don't remove outline)

## Code Review Checklist

Before submitting work:
- [ ] Tests pass (`pnpm test`)
- [ ] Types check (`pnpm typecheck`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Tests cover new functionality
- [ ] No console.logs left in code
- [ ] Environment variables documented in `.env.example`
- [ ] Components are accessible (keyboard + screen reader)
