# Personal Budget Tracker — Writeup

## What I Built and Notable Decisions

I built a full-stack budget tracking application using React + TypeScript and Express + TypeScript in a pnpm monorepo. Users can add and delete transactions, view their financial summary, filter transaction history, and analyze spending by category.

Key implementation decisions include using an **in-memory store** rather than a database. The assignment allowed this, and it kept focus on API design and business logic rather than ORM configuration. The store is encapsulated for easy replacement later.

I implemented **API versioning** (`/api/v1`) and standardized responses (`{ data: ... }` for success, `{ error: ... }` for failures) with centralized error handling. Financial calculations stay server-side—the summary and insights endpoints handle aggregation while the frontend manages presentation and interaction.

For filtering, I chose **server-side implementation** via query parameters rather than client-side filtering. This scales better and avoids duplicating logic. The responsive transaction display uses semantic HTML tables (desktop) and cards (mobile) without TanStack Table, keeping dependencies minimal.

All components follow **accessibility-first patterns**: proper headings, ARIA labels, semantic HTML, and screen-reader support. I used `vitest-axe` for automated compliance testing.

The project includes **agentic documentation** (`AGENTS.md`, architecture docs, checklists) to provide AI agents with clear context about coding standards, verification requirements, and design principles.

## How I Used AI

I used ChatGPT to refine prompts before providing them to Cursor, which helped clarify requirements and scope boundaries. I then worked with Cursor incrementally, breaking the project into phases (monorepo setup, API foundation, React app, CRUD operations, filtering, insights) rather than generating everything at once.

This approach let me review implementations between phases. For example, the initial plan included SQLite and Drizzle ORM, but I decided the in-memory store better fit the assignment scope and had Cursor remove those dependencies.

AI excelled at boilerplate, test generation, and following established patterns. It handled TypeScript strict mode, Zod validation, and comprehensive test coverage reliably.

For architectural decisions, I asked Cursor for recommendations and evaluated trade-offs. When implementing the transaction table, I requested recommendations between semantic HTML tables and TanStack Table—Cursor explained both approaches, and I chose the simpler HTML solution. For the insights visualization, I selected CSS-based horizontal bars rather than adding a charting library because they were straightforward to implement and easier to make accessible.

Generated code required review for architecture and product fit. I remained responsible for evaluating proposals and choosing appropriate abstractions based on assignment scope and maintainability.

## Enhancement: Spending Insights

The required enhancement is **Spending Insights**, which aggregates expenses by category, identifies the top spending category, and displays category totals with percentages and visual bars.

I chose this feature because the core application records transactions, but insights make that data useful by answering "Where is my money going?" Category-based analysis provides value even with small transaction histories and fits a take-home assignment better than complex analytics.

Technically, aggregation happens server-side at `GET /api/v1/insights/spending-by-category`. The API filters to expenses, groups by category, calculates percentages, and sorts by amount. The frontend handles accessible presentation—visual bars are marked `aria-hidden` so screen readers use text values instead.

## What I Would Do Next

With more time, I would prioritize:

**Persistent storage** (PostgreSQL or SQLite) to make this production-ready. The encapsulated store design makes this swap straightforward.

**Transaction editing** to complete CRUD operations. Users can currently only add or delete.

**Date-range insights** by adding query parameters to the insights endpoint, enabling month-over-month analysis.

**Pagination** for transaction history to handle larger datasets efficiently.

These improvements build naturally on the existing architecture without major refactoring.
