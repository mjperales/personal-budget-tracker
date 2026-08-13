# Transaction API Implementation

## Overview

A complete REST API for personal budget transaction management, following best practices for API design, validation, testing, and error handling.

## Endpoints

### Health Check

```http
GET /api/v1/health
```

**Response** (200 OK):
```json
{
  "data": {
    "status": "ok"
  }
}
```

### List Transactions

```http
GET /api/v1/transactions
```

**Query Parameters** (all optional):
- `type`: Filter by transaction type (`income` or `expense`)
- `category`: Filter by category (case-insensitive)
- `search`: Search in transaction descriptions (case-insensitive)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "date": "2026-08-12",
      "description": "Groceries",
      "amount": 75.50,
      "type": "expense",
      "category": "Food"
    }
  ]
}
```

### Create Transaction

```http
POST /api/v1/transactions
Content-Type: application/json
```

**Request Body**:
```json
{
  "date": "2026-08-12",
  "description": "Salary",
  "amount": 5000,
  "type": "income",
  "category": "Employment"
}
```

**Validation Rules**:
- `date`: Required, ISO 8601 date string (YYYY-MM-DD)
- `description`: Required, non-empty string
- `amount`: Required, positive number
- `type`: Required, must be "income" or "expense"
- `category`: Required, non-empty string

**Response** (201 Created):
```json
{
  "data": {
    "id": "generated-uuid",
    "date": "2026-08-12",
    "description": "Salary",
    "amount": 5000,
    "type": "income",
    "category": "Employment"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid",
    "details": {
      "amount": {
        "_errors": ["Amount must be greater than 0"]
      }
    }
  }
}
```

### Update Transaction

```http
PUT /api/v1/transactions/:id
Content-Type: application/json
```

**Request Body**: Same as create, all fields required

**Response** (200 OK):
```json
{
  "data": {
    "id": "same-uuid",
    "date": "2026-08-13",
    "description": "Updated description",
    "amount": 100,
    "type": "expense",
    "category": "Food"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

### Delete Transaction

```http
DELETE /api/v1/transactions/:id
```

**Response** (204 No Content): Empty body

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

### Financial Summary

```http
GET /api/v1/summary
```

**Response** (200 OK):
```json
{
  "data": {
    "income": 6000,
    "expenses": 1800,
    "balance": 4200
  }
}
```

## Architecture

### In-Memory Storage

Transactions are stored in memory using `TransactionStore`:

```typescript
// apps/api/src/stores/transaction-store.ts
class TransactionStore {
  private transactions: Transaction[] = [];

  getAll(filters?: TransactionFilters): Transaction[]
  create(input: CreateTransactionInput): Transaction
  findById(id: string): Transaction | undefined
  update(id: string, input: CreateTransactionInput): Transaction | null
  delete(id: string): boolean
  reset(): void
}
```

**Benefits**:
- Fast development iteration
- Simplified testing (easy reset)
- No database setup required
- Encapsulated for future replacement

### Data Model

```typescript
// apps/api/src/models/transaction.ts
export type Transaction = {
  id: string;              // Auto-generated UUID
  date: string;            // ISO 8601 date (YYYY-MM-DD)
  description: string;     // Required, non-empty
  amount: number;          // Required, positive
  type: 'income' | 'expense';
  category: string;        // Required, non-empty
};
```

### Validation

Zod schemas enforce all validation rules:

```typescript
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
});
```

### Error Handling

All errors follow standardized format using `AppError`:

```typescript
// Known errors
throw Errors.notFound('Transaction');
throw Errors.validation(zodError.format());

// Caught by middleware
{
  error: {
    code: 'NOT_FOUND',
    message: 'Transaction not found',
    details: {}
  }
}
```

## Testing

Comprehensive test coverage using Vitest + Supertest:

```typescript
// apps/api/src/routes/transactions.routes.test.ts

describe('GET /api/v1/transactions', () => {
  it('returns empty array when no transactions exist');
  it('returns all transactions');
  it('filters transactions by type');
  it('filters transactions by category');
  it('searches transactions by description');
  it('combines multiple filters');
});

describe('POST /api/v1/transactions', () => {
  it('creates a new transaction');
  it('validates required fields');
  it('validates amount must be positive');
  it('validates type must be income or expense');
  it('validates date format');
});

describe('PUT /api/v1/transactions/:id', () => {
  it('updates an existing transaction');
  it('returns 404 for non-existent transaction');
  it('validates update data');
});

describe('DELETE /api/v1/transactions/:id', () => {
  it('deletes an existing transaction');
  it('returns 404 for non-existent transaction');
});

// apps/api/src/routes/summary.routes.test.ts

describe('GET /api/v1/summary', () => {
  it('returns zero values when no transactions exist');
  it('calculates income total');
  it('calculates expenses total');
  it('calculates balance correctly');
});
```

All tests passing:
```
✓ src/routes/health.routes.test.ts (3 tests)
✓ src/routes/summary.routes.test.ts (4 tests)
✓ src/routes/transactions.routes.test.ts (17 tests)
```

## Design Patterns

### Factory Pattern
- `createApp()` for testable Express instances

### Repository Pattern
- `TransactionStore` encapsulates data access

### Dependency Injection
- Stores can be replaced for testing
- `beforeEach(() => transactionStore.reset())`

### Centralized Error Handling
- Custom `AppError` class
- Error handler middleware
- Consistent error responses

### Response Helpers
- `success()`, `created()`, `noContent()`
- Standardized response shapes
- Never call `res.json()` directly

## Future Enhancements

If this were to evolve beyond a take-home assignment:

1. **Database Persistence**
   - Replace in-memory store with PostgreSQL/SQLite
   - Keep same store interface
   - Add database migrations

2. **Authentication**
   - JWT-based auth
   - Protect all transaction endpoints
   - User-specific data isolation

3. **Pagination**
   - Add `?page=1&limit=20` to GET /transactions
   - Return total count and page info

4. **Advanced Filtering**
   - Date ranges: `?startDate=2026-01-01&endDate=2026-12-31`
   - Amount ranges: `?minAmount=100&maxAmount=1000`
   - Multiple categories: `?categories=Food,Transportation`

5. **Sorting**
   - `?sortBy=date&order=desc`
   - Default: most recent first

6. **Validation Refinements**
   - Category from predefined list
   - Future date prevention
   - Max amount limits

7. **Performance**
   - Indexing (if using database)
   - Response caching
   - Rate limiting

## Running

```bash
# Development
pnpm dev

# Tests
pnpm test

# Docker
docker compose up
```

API available at:
- Local: `http://localhost:3000/api/v1`
- Docker: `http://localhost:3000/api/v1`
