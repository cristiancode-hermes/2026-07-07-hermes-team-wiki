# 📚 Hermes Team Wiki

**A multi-tenant collaborative wiki for teams** — Markdown editor, version history, full-text search, and team spaces.

## Features

- **Multi-tenant auth** — Organization registration + JWT login
- **Spaces** — Organize content into themed spaces (Engineering, Marketing, HR, etc.)
- **Markdown editor** — Split-pane editor with live preview and formatting toolbar
- **Page hierarchy** — Parent/child pages with expandable tree navigation
- **Version history** — Every edit creates a version; view diffs and revert
- **Full-text search** — FTS5-powered global search with Ctrl+K shortcut
- **Comments** — Discuss pages without editing them
- **Dashboard** — KPIs, recent pages, team activity timeline
- **Dark mode** — Full dark theme with localStorage persistence
- **Responsive** — Desktop 3-column layout → mobile drawer sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (signals, zoneless, Tailwind CSS v4) |
| Backend | NestJS 11 (modular, JWT auth, Swagger) |
| Database | TypeORM + better-sqlite3 (dev) / PostgreSQL (prod) |
| Search | FTS5 full-text search (SQLite) |
| Auth | JWT with Passport.js + bcryptjs |

## Prerequisites

- Node.js 22+
- npm 10+

## Quick Start

```bash
# 1. Install dependencies
cd apps/api && npm install
cd ../web && npm install
cd ../..

# 2. Start the backend (seeds automatically on first run)
cd apps/api && npm run start:dev

# 3. In another terminal, start the frontend
cd apps/web && npm start
```

Open http://localhost:4200 — the database auto-seeds with demo data.

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| ana@acme.com | password123 | Admin |
| carlos@acme.com | password123 | Editor |
| maria@acme.com | password123 | Editor |

## Manual Seed

```bash
cd apps/api
npm run build
npm run seed
```

## Project Structure

```
hermes-team-wiki/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/         # Registration, login, JWT strategy
│   │   │   ├── comments/     # Page comments
│   │   │   ├── dashboard/    # Aggregation KPIs
│   │   │   ├── entities/     # TypeORM entities (6)
│   │   │   ├── notifications/# SSE endpoint
│   │   │   ├── org/          # Member management
│   │   │   ├── pages/        # Page CRUD + version history
│   │   │   ├── search/       # FTS5 full-text search
│   │   │   ├── seed/         # Demo data seeder
│   │   │   ├── spaces/       # Space CRUD
│   │   │   └── common/       # Global filter, FTS5 service
│   │   └── package.json
│   └── web/          # Angular 22 frontend
│       └── src/app/
│           ├── core/         # Auth, guards, interceptors, services
│           ├── features/     # Pages (auth, dashboard, spaces, pages, search, settings)
│           └── shared/       # Reusable components
├── docs/             # Documentation
└── README.md
```

## API Documentation

Once the backend is running, visit http://localhost:3000/api/docs for Swagger UI.

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```
JWT_SECRET=your-secret-key
DATABASE_PATH=data/wiki.db
PORT=3000
```

## Roadmap

- [ ] SSE real-time notifications on page changes
- [ ] Page export to PDF
- [ ] @mentions with notifications
- [ ] Image/file attachments
- [ ] Page templates (meeting notes, decision doc)
- [ ] PostgreSQL/Neon production deployment
