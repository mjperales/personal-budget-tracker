# Architecture

This document describes the system architecture for agents working in this codebase.

## Tech Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Package Manager** | pnpm | Workspace management, fast installs | 9+ |
| **Backend** | Express | REST API server | 4.x |
| **Persistence** | In-memory store | Transaction storage (encapsulated) | - |
| **Frontend** | React 19 | UI framework | 19.x |
| **Build Tool** | Vite | Dev server, production builds | 6.x |
| **Styling** | Tailwind CSS v4 | Utility-first CSS (CSS-first config) | 4.0-beta |
| **Testing** | Vitest | Unit and integration tests | 3.x |
| **E2E Testing** | Playwright | End-to-end tests | Latest |
| **Type System** | TypeScript | Static typing (strict mode) | 5.7+ |
| **Validation** | Zod | Runtime schema validation | 3.x |
| **Deployment** | Docker + Compose | Containerized services | - |

## Directory Structure

```
personal-budget-tracker/
├── apps/
│   ├── api/                    # Express REST API
│   │   ├── src/
│   │   │   ├── app.ts          # App factory (testable, no listen)
│   │   │   ├── index.ts        # Server entry point
│   │   │   ├── config.ts       # Zod-validated environment config
│   │   │   ├── routes/         # Express routers (HTTP layer)
│   │   │   ├── middleware/     # CORS, error handling, etc.
│   │   │   ├── models/         # Domain models and Zod schemas
│   │   │   ├── stores/         # In-memory data stores
│   │   │   └── lib/            # Utilities (responses, errors)
│   │   └── Dockerfile          # API container
│   │
│   └── web/                    # React SPA
│       ├── src/
│       │   ├── main.tsx        # React app entry point
│       │   ├── App.tsx         # Root component
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities (API client, utils)
│       │   └── test/           # Test setup
│       ├── nginx.conf          # nginx reverse proxy config
│       ├── index.html          # HTML shell
│       └── Dockerfile          # Web container (multi-stage)
│
├── packages/
│   └── shared/                 # Shared types/schemas (create when needed)
│
├── docs/                       # Agent documentation
├── vitest.workspace.ts         # Test workspace config
├── compose.yml                 # Docker Compose orchestration
└── pnpm-workspace.yaml         # pnpm workspace definition
```

## API Architecture

### API Versioning

Current version: `/api/v1`

All routes are mounted under version prefix:
```typescript
app.use('/api/v1', healthRouter);
app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/summary', summaryRouter);
```

This allows introducing `/api/v2` without breaking existing clients.

### API Endpoints

**Health Check**
```
GET /api/v1/health
Response: { data: { status: "ok" } }
```

**Transactions**
```
GET /api/v1/transactions
Query params: ?type=income|expense&category=Food&search=groceries
Response: { data: Transaction[] }

POST /api/v1/transactions
Body: { date, description, amount, type, category }
Response: { data: Transaction }

PUT /api/v1/transactions/:id
Body: { date, description, amount, type, category }
Response: { data: Transaction }

DELETE /api/v1/transactions/:id
Response: 204 No Content
```

**Summary**
```
GET /api/v1/summary
Response: { data: { income: number, expenses: number, balance: number } }
```

### Request Flow

```
HTTP Request → CORS → JSON Parser → /api/v1 Router → Handler → Store
                                                                   ↓
HTTP Response ← Error Handler ← ← ← Response Helper ← ← ← ← ← ← Result
```

### Layering

**Response Layer** (`src/lib/responses.ts`)
- Standardized response helpers: `success()`, `created()`, `noContent()`, `error()`
- All responses follow consistent shapes: `{ data: ... }` or `{ error: ... }`
- Never call `res.json()` directly

**Route Layer** (`src/routes/`)
- Defines HTTP endpoints and methods
- Minimal logic: validate request, call store, use response helper
- Exports Express `Router` instances
- All errors bubble up to error handler

**Middleware Layer** (`src/middleware/`)
- Cross-cutting concerns: CORS, error handling, logging
- Applied globally in `app.ts`
- Error handler converts `AppError` to standardized JSON

**Model Layer** (`src/models/`)
- Domain models and validation schemas
- Uses Zod for runtime validation
- Exports TypeScript types inferred from schemas

**Store Layer** (`src/stores/`)
- In-memory data persistence
- Encapsulated, testable, and replaceable
- Simple CRUD operations
- Returns typed data or throws `AppError`

**Error Layer** (`src/lib/errors.ts`)
- `AppError` class with code, message, statusCode, details
- Error factories: `Errors.notFound()`, `Errors.validation()`, `Errors.internal()`
- Errors are caught by error handler middleware

### Testable App Factory

`createApp()` accepts optional config/db for testing:

```typescript
// Production
const app = createApp(config);

// Testing
const app = createApp(testConfig);
const response = await request(app).get('/api/health');
```

No HTTP server starts during tests → fast, isolated tests.

## Web Architecture

### Component Structure

**File Organization:**
```
components/
  TransactionHistory.tsx        # Container component
  TransactionHistory.types.ts   # Component-specific types
  TransactionHistory.test.tsx   # Component tests
  TransactionTable.tsx          # Presentation component
  TransactionTable.types.ts     # Table types
  TransactionTable.test.tsx     # Table tests
  ui/                           # Reusable primitives
    Card.tsx
    Card.types.ts
    Card.test.tsx

pages/
  BudgetTrackerPage.tsx         # Page component
  BudgetTrackerPage.test.tsx    # Page tests

lib/
  api.ts                        # API client and types
  format.ts                     # Formatting utilities
  format.test.ts                # Utility tests
  utils.ts                      # General utilities
```

**Component Patterns:**
- **Flat structure**: No folders per component
- **Separate types**: Use `.types.ts` for component-specific types
- **Container/Presentation**: Separate data fetching from rendering
- **Responsive design**: Use Tailwind breakpoints (`md:`, `lg:`) for responsive layouts
- **Shared logic**: Extract formatting and business logic to `lib/`

**Component Layers:**
- **Pages**: Top-level views mapped to URL routes
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Receive props, render UI, no API calls
- **UI Primitives** (`ui/`): Reusable, generic components (Button, Card, etc.)
- **lib/**: Utilities and API client abstraction

### API Communication

Web → Vite proxy (dev) or nginx (prod) → API (`/api/v1`)

```typescript
// lib/api.ts provides typed client
const data = await apiClient<ResponseType>('/endpoint');
```

**API client behavior:**
- Default base URL: `/api/v1`
- Automatically unwraps `{ data: ... }` responses
- Throws errors with message from `{ error: { message } }` responses
- Handles both success and error response shapes

Default base URL: `/api/v1` (works in both dev and Docker via proxy/nginx).

### Styling

Tailwind CSS v4 (CSS-first):
- `@import "tailwindcss"` in main CSS
- `@theme { }` for custom tokens
- Utility classes in JSX
- No `tailwind.config.js` required

shadcn/ui for base components:
- Add via CLI: `npx shadcn@latest add [component]`
- Customize in `components/ui/`
- Wraps Radix UI primitives

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \     Playwright (few, critical paths)
                 /      \
                /--------\
               /          \
              / Integration \  Vitest + Supertest (API), RTL (React)
             /              \
            /----------------\
           /                  \
          /       Unit         \ Vitest (services, utils, hooks)
         /                      \
        /________________________\
```

**Unit Tests** (majority)
- Services, utilities, custom hooks
- Fast, isolated, no external dependencies

**Integration Tests**
- API: Supertest hitting `createApp()` without real server
- React: RTL rendering components, testing user interactions

**E2E Tests** (minimal)
- Playwright: Critical user flows only
- Full stack (API + web) running

### Testing Philosophy

- **Test behavior, not implementation**
- **Prefer user-facing queries** (`getByRole`, `getByLabelText`)
- **Don't retest library code**
- **Write tests alongside implementation**

## Data Flow

### API Request Handling

```
Client Request
    ↓
CORS Check
    ↓
JSON Parsing
    ↓
Version Router (/api/v1)
    ↓
Route Handler
    ↓
Zod Validation (throws AppError if invalid)
    ↓
Store Layer (in-memory operations)
    ↓
Response Helper (success/created/noContent)
    ↓
{ data: ... }
```

**Error path:**
```
Any Layer throws AppError
    ↓
Error Handler Middleware
    ↓
{ error: { code, message, details? } }
```

### Web State Management

Currently: React local state (useState, useEffect)

Future considerations:
- Add context for global state when needed
- Consider React Query for server state caching
- Keep state colocated with components when possible

## Accessibility

Built in from the start:

**API Layer**: Provide semantic, structured data

**Web Layer**:
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Testing with vitest-axe

## Docker Architecture

### Development (docker compose up)

```
┌─────────────────────────────────────────┐
│          Host Machine                   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Web Container (nginx)          │  │
│  │   Port 8080 → 80                 │  │
│  │   ┌──────────────────────────┐   │  │
│  │   │  Static Files (React)    │   │  │
│  │   │  + nginx reverse proxy   │   │  │
│  │   └──────────┬───────────────┘   │  │
│  │              │                    │  │
│  │              │ /api/ → api:3000  │  │
│  └──────────────┼────────────────────┘  │
│                 │                        │
│  ┌──────────────▼──────────────────┐    │
│  │   API Container                 │    │
│  │   Port 3000 → 3000              │    │
│  │   ┌──────────────────────────┐  │    │
│  │   │  Express + tsx           │  │    │
│  │   │  (runs TS directly)      │  │    │
│  │   └──────────────────────────┘  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Key Points**:
- Web is multi-stage: build → serve
- API runs TypeScript directly via `tsx`
- nginx proxies `/api/*` to API service
- API uses in-memory storage (data resets on restart)
- Compose DNS resolves `api` hostname

## Key Design Decisions

### Why pnpm workspaces?

- Fast, efficient package management
- Proper hoisting avoids duplication
- Native monorepo support

### Why in-memory storage?

- Simplifies implementation for take-home assignment
- Focuses evaluation on API design and business logic
- Easy to replace with real database later
- Fast and testable

### Why Vite?

- Fast dev server with HMR
- Optimized production builds
- Native ESM support

### Why Tailwind v4?

- CSS-first approach (no JS config)
- Built into Vite via plugin
- Smaller bundle, faster builds

### Why Vitest?

- Native Vite integration
- Fast, parallel test execution
- Compatible with Jest ecosystem (RTL, etc.)

### Why `createApp` factory?

- Testable without starting HTTP server
- Injectable dependencies (config, db)
- Follows Express best practices

## What NOT to Do

- **Don't bypass validation**: Always validate external input with Zod
- **Don't skip tests**: Write tests alongside implementation
- **Don't hardcode configuration**: Use environment variables
- **Don't couple layers**: Keep API, web, and shared independent
- **Don't store secrets in code**: Use `.env` files (gitignored)
