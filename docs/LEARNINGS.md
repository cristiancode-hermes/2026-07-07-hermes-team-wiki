# Lessons Learned — Hermes Team Wiki

## 1. TypeORM 1.0 + TypeScript 5.9: decorator compat

**Issue:** TypeScript 5.9 with `isolatedModules: true` and `emitDecoratorMetadata: true` requires `import type` for types used in decorated method signatures. We disabled `isolatedModules` to fix.
**Lesson:** When using TypeORM with NestJS 11 + TypeScript 5.9, set `isolatedModules: false` in tsconfig to avoid TS1272 errors.

## 2. Angular 22 + TS 5.9 module resolution

**Issue:** Angular 22 with `module: "preserve"` needs `moduleResolution: "bundler"` to resolve `@angular/common/http` imports.
**Fix:** Add `"moduleResolution": "bundler"` to `tsconfig.json`.

## 3. NestJS build: SWC vs TSC

**Lesson:** `nest build` (SWC) works where `nest build --tsc` sometimes fails on decorator compatibility. Use `nest build` for development velocity, `--tsc` for strict type checking.

## 4. CSS variable dark mode is clean

**Lesson:** Swapping CSS variable values in `.dark` class eliminates Tailwind `dark:` prefixes. Very maintainable.

## 5. FTS5 with SQLite works well for dev

**Lesson:** SQLite FTS5 virtual table with auto-sync triggers provides production-quality search for development. PostgreSQL migration needs pg_trgm or pgvector.

## 6. Multi-tenant scoping is cross-cutting

**Lesson:** Every query must filter by organizationId. No exceptions. JWT carries orgId; services always receive it as first parameter.
