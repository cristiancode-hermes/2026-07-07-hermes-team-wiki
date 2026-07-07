# Architecture — Hermes Team Wiki

## System Diagram

```mermaid
graph TD
    Browser[Angular SPA<br/>localhost:4200] -->|HTTP API| API[NestJS API<br/>localhost:3000]
    API -->|TypeORM| SQLite[better-sqlite3]

    subgraph Frontend
        A[Auth Module] --> D[Dashboard]
        A --> S[Spaces Module]
        A --> P[Pages Module]
        P --> C[Comments]
        P --> V[Versions]
        G[Search Global] --> API
    end

    subgraph Backend
        Auth[Auth Module] -->|JWT| Org[Org Module]
        Spaces[Spaces Module] --> Pages[Pages Module]
        Pages --> Comments[Comments Module]
        Pages --> Versions[PageVersion]
        Search[Search Module] -->|FTS5| SQLite
        Dashboard[Dashboard Module] -->|Aggregation| SQLite
    end
```

## Data Flow

1. User registers organization → creates org + admin user + default "General" space
2. User creates spaces → each space auto-generates a home page
3. User creates pages with Markdown content → each save creates a new PageVersion
4. Users can comment on pages → comments are scoped by organization
5. Full-text search uses SQLite FTS5 virtual table with auto-sync triggers
6. Dashboard aggregates KPIs via raw SQL queries

## Design Decisions

- **Monorepo with two independent apps** — Simpler than Nx workspace for daily builds
- **TypeORM with better-sqlite3** — Zero-config dev setup, PostgreSQL-compatible schema
- **FTS5 over LIKE search** — Native full-text indexing with relevance ranking and snippets
- **Multi-tenant via organizationId** — Every query filters by org; JWT contains orgId

## Key Principles

- **Multi-tenant isolation** — Every query must include `organizationId` from JWT
- **Signals everywhere** — No Zone.js, no @Input/@Output decorators
- **Standalone components** — No NgModules in Angular
- **Thin controllers** — Business logic lives in services
