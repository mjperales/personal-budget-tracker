# Personal Budget Tracker

A full-stack personal budget tracking application built with modern web technologies.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **API**: Express + TypeScript + Drizzle ORM
- **Web**: React + Vite + Tailwind CSS v4
- **Testing**: Vitest + Supertest + React Testing Library + Playwright
- **Deployment**: Docker + Docker Compose

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
