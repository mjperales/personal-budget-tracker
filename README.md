# Personal Budget Tracker

A full-stack personal budget tracking application built with modern web technologies.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **API**: Express + TypeScript
- **Web**: React + Vite + Tailwind CSS v4
- **Testing**: Vitest + Supertest + React Testing Library + Playwright
- **Deployment**: Docker + Docker Compose

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
