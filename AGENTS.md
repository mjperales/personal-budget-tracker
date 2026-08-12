# AI Agent Instructions

## Purpose

This file provides strategic guidance for AI agents working in this codebase. It defines responsibilities, boundaries, and points to detailed technical documentation.

## What This Repository Is

A full-stack personal budget tracking application built as a **pnpm monorepo**:
- Express + TypeScript REST API with Drizzle ORM
- React + Vite SPA with Tailwind CSS v4
- Testable architecture with comprehensive testing (Vitest, Supertest, RTL, Playwright)
- Docker support for local development and deployment
- Type-safe development with strict TypeScript

**Think of this as:** A production-ready foundation for a personal finance application with clean separation between API and web layers.

**Full context:** See [docs/architecture.md](docs/architecture.md)

## Core Principles

1. **Type safety**: Strict TypeScript everywhere, explicit types over inference
2. **Testability**: All code must be testable; use dependency injection where needed
3. **Accessibility**: Web UI must meet WCAG standards from the start
4. **Separation of concerns**: Clear boundaries between API, web, and shared packages
5. **Validation**: Use Zod for runtime validation at API boundaries

## Agent Responsibilities

**When working in this repository:**
- **Prefer existing repository patterns** over inventing new ones
- **Be explicit about assumptions and limitations**
- Ask clarifying questions when requirements are ambiguous
- Always run verification steps before marking work complete

**Map to Repository Instructions:**

| Task Type | Primary Reference | Supporting Docs |
|-----------|-------------------|-----------------|
| Add new feature | [docs/checklists/feature.md](docs/checklists/feature.md) | [docs/conventions.md](docs/conventions.md), [docs/architecture.md](docs/architecture.md) |
| Fix bugs | [docs/checklists/bug-fix.md](docs/checklists/bug-fix.md) | [docs/conventions.md](docs/conventions.md) |
| Refactor code | [docs/checklists/refactor.md](docs/checklists/refactor.md) | [docs/conventions.md](docs/conventions.md) |
| Understand architecture | [docs/architecture.md](docs/architecture.md) | - |
| Learn coding standards | [docs/conventions.md](docs/conventions.md) | - |
| Verification requirements | [docs/verification.md](docs/verification.md) | - |

**Agents must NOT:**
- Skip required tests or verification steps
- Add features without corresponding tests
- Bypass TypeScript strict mode checks
- Make breaking changes to API contracts without discussion

## Safety & Quality Guardrails

**Design Principles:**
- **Prefer clarity over cleverness**: Simple, obvious code over elegant complexity
- **Prefer explicit over implicit**: Types, configurations, and dependencies should be obvious
- **Prefer testability**: Design for testing; avoid hard-to-test patterns
- **Flag uncertainty instead of guessing**: Ask questions when requirements are unclear

**Never:**
- Skip verification steps (lint, typecheck, test, build)
- Add dependencies without understanding their purpose
- Store secrets in code or version control
- Modify shared workspace configuration without considering impact on all packages

**Full coding rules:** See [docs/conventions.md](docs/conventions.md)

## Scope Boundaries

**API** (`apps/api/`): Express backend, database layer, business logic
- Routes define HTTP endpoints
- Services contain business logic and ORM operations
- Middleware handles cross-cutting concerns
- Config uses Zod for environment validation

**Web** (`apps/web/`): React frontend, UI components, API client
- Components are focused and testable
- API calls go through the client abstraction
- Tailwind v4 for styling (CSS-first approach)
- shadcn/ui for base components (add via CLI, customize as needed)

**Shared** (`packages/shared/`): Types and schemas used by both API and web (create when needed)

## Default Verifications

All tasks must pass verification before marking complete. See [docs/verification.md](docs/verification.md).

Quick checklist:
```bash
pnpm typecheck  # TypeScript compilation
pnpm lint       # ESLint checks
pnpm test       # All tests pass
pnpm build      # Production builds
```

## Change Discipline

**For code changes:**
1. Read the relevant checklist before starting (see Agent Responsibilities table)
2. Follow the conventions in [docs/conventions.md](docs/conventions.md)
3. Write tests alongside implementation
4. Run all verification commands per [docs/verification.md](docs/verification.md)
5. Ensure all checks pass before marking complete

**For documentation changes:**
- Keep documentation short, factual, and current
- Remove rules that are no longer enforced
- Avoid duplicating the same rule across multiple files
- `AGENTS.md` should change rarely and only when the mental model of the repo changes
