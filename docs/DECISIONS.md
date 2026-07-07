# Decisions — Hermes Team Wiki

## ADR-1: FTS5 over LIKE search for full-text search

**Context:** Pages need full-text search across titles and content. LIKE '%term%' is slow and doesn't rank results.
**Decision:** Use SQLite FTS5 virtual table with auto-sync triggers.
**Consequence:** Fast relevance-ranked search with snippet highlighting. Only works on SQLite; PostgreSQL needs pg_trgm or pgvector.

## ADR-2: Multi-tenant via organizationId column

**Context:** Multiple organizations share the same database. Need data isolation.
**Decision:** Every entity has an `organizationId` column; every query filters by it from JWT.
**Consequence:** Simple, transparent, and database-agnostic. Requires discipline in every service method.

## ADR-3: Version history via PageVersion entity

**Context:** Wiki pages need version tracking for undo/history.
**Decision:** Separate `page_versions` table stores snapshots on every update. Revert creates a new version (immutable history).
**Consequence:** No data loss. Users can always see what changed and revert to any point.

## ADR-4: better-sqlite3 over SQL.js for dev

**Context:** Need a zero-config database for development.
**Decision:** Use `better-sqlite3` (native C module) for synchronous, faster SQLite access.
**Consequence:** Faster than sql.js. Requires native compilation. PostgreSQL in production.

## ADR-5: Standalone Angular components with signals

**Context:** Angular 22 recommends standalone components and zoneless change detection.
**Decision:** All components are standalone. `input()/output()/model()` instead of decorators. Signals for all state.
**Consequence:** Cleaner code, smaller bundles, no NgModules. Learning curve for zoneless patterns.

## ADR-6: Explicit seed via onModuleInit

**Context:** Need demo data for development without manual setup.
**Decision:** SeedService checks `if (orgCount > 0) return` on onModuleInit to auto-seed fresh databases.
**Consequence:** Works on first run, skips on subsequent runs. Manual re-seed requires deleting the DB file.

## ADR-7: CSS variable dark mode over Tailwind dark: prefix

**Context:** Dark mode must work across all components without adding `dark:` to every class.
**Decision:** Swap CSS variable values in `.dark` class. Primary/accent colors stay constant; secondary palette inverts.
**Consequence:** No `dark:` prefixes. One-line `.dark` class on `<html>` toggles theme.
