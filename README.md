# Personal Budget Tracker

A full-stack personal budget tracking application built with modern web technologies.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **API**: Express + TypeScript
- **Web**: React + Vite + Tailwind CSS v4
- **Testing**: Vitest + Supertest + React Testing Library + Playwright
- **Deployment**: Docker + Docker Compose

## Features

### Core Functionality

- **Transaction Management**: Add, delete, and track income and expense transactions
- **Financial Summary**: Real-time overview of income, expenses, and balance
- **Transaction History**: Browse, filter, and search through all transactions
- **Smart Filtering**: Filter by transaction type and category, search by description

### Spending Insights (Meaningful Improvement)

The application includes a **Spending Insights** feature that goes beyond the core specification by helping users understand where their money is going:

- **Expense Aggregation**: Automatically groups and sums expenses by category
- **Top Category Identification**: Highlights the highest spending category with amount and percentage
- **Visual Breakdown**: Displays all spending categories with proportional bars showing relative spending
- **Accessible Design**: Information is conveyed through text and structure, not just visuals

**Why This Feature?**

The core application makes it easy to record and find transactions. Spending Insights adds value by helping users understand their spending patterns. I chose category-based spending analysis because:

1. It provides useful information even with a small transaction history
2. It keeps the feature appropriately scoped for a take-home assignment
3. It focuses on the most common question users have: "Where is my money going?"

**Technical Approach**:

- Financial aggregation happens on the API (`GET /api/v1/insights/spending-by-category`)
- Frontend focuses on presentation and accessibility
- Insights use the existing transaction store (no new persistence layer)
- Visualization built with HTML/CSS (no charting library dependency)
- Insights intentionally represent all transactions, not just filtered results

## Architecture Decisions

### Persistence

This implementation uses an **in-memory store** for transaction data. This is an intentional design choice aligned with take-home assignment requirements, which explicitly allow in-memory storage.

Benefits of this approach:
- Focuses implementation on API design, validation, and business logic
- Simplifies testing (easy to reset/seed data)
- No database setup or migration complexity
- Fast development iteration

The storage layer is encapsulated in `apps/api/src/stores/` so persistence could be replaced later if needed.

### API Versioning

All API routes use the `/api/v1` prefix:

```
GET    /api/v1/transactions
POST   /api/v1/transactions
PUT    /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
GET    /api/v1/summary
GET    /api/v1/insights/spending-by-category
GET    /api/v1/health
```

This versioning strategy:
- Makes API evolution explicit
- Allows introducing breaking changes via `/api/v2` without affecting existing clients
- Is an intentional architectural choice beyond assignment requirements

## Project Structure

```
personal-budget-tracker/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # React SPA
├── packages/
│   └── shared/       # Shared types and schemas
└── ...
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker (optional, for containerized development)

### Installation

```bash
pnpm install
```

### Development

```bash
# Start both API and web in development mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build
```

### Mock Data

The API includes sample transaction data for testing and demonstration. To enable mock data seeding:

```bash
# In apps/api/.env
SEED_DATA=true
```

Then start the server:

```bash
pnpm dev
```

The API will automatically load 20 sample transactions on startup. See `apps/api/src/data/README.md` for details.

### Docker

```bash
# Start with Docker Compose
docker compose up

# Access the application
# Web: http://localhost:8080
# API: http://localhost:3000
```

## Documentation

- See `AGENTS.md` for coding agent instructions
- See `docs/` for detailed documentation

## License

Private project - All rights reserved
