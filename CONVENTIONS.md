# Shared Conventions — Hermes Team Wiki

## Naming
- All entities use camelCase for fields, PascalCase for classes
- Relations: `{ relations: { author: true, space: true } }` (object syntax, NOT array)
- FK saves: `{ entity: { id: fkId } }` not `{ entityId: fkId }`
- All service methods first param: `organizationId: string` (multi-tenant scoping)
- All queries filtered by `organizationId` — NO exceptions

## Entities
Organization, User, Space, Page, PageVersion, Comment

## API Base
- All protected endpoints use JWT Bearer token
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Spaces: GET/POST /api/spaces, GET/PUT/DELETE /api/spaces/:id
- Pages: GET/POST /api/pages, GET/PUT/DELETE /api/pages/:id
- Pages versions: GET /api/pages/:id/versions, GET .../versions/:vid, POST .../revert/:vid
- Comments: GET/POST /api/pages/:pageId/comments, PUT/DELETE /api/comments/:id
- Search: GET /api/search?q=...
- Dashboard: GET /api/dashboard/stats, /api/dashboard/recent, /api/dashboard/activity
- Org: GET /api/org/members, PUT /api/org/members/:userId, DELETE /api/org/members/:userId

## TypeORM Object Syntax (MANDATORY)
- `findOne({ where: { id }, relations: { author: true } })` NOT `['author']`
- `save({ ...entity, space: { id: spaceId } })` NOT `{ spaceId }`
- `find({ where: { organizationId }, order: { createdAt: 'DESC' }, relations: { author: true } })`

## Seed Data
- Explicit seed: `npm run seed` script, not auto-seed on module init
- All entities must have meaningful seed data (at least 1 org, 2 users, 3+ spaces, 10+ pages, 3+ comments)
- Seed checks existence before inserting (if orgCount > 0) return

## Error Handling
- NestJS: Global exception filter + ValidationPipe with whitelist: true
- Angular: All pages have loading/empty/error signal pattern
- HTTP 401 → redirect to /login
- HTTP 403 → show "Not authorized" message

## Build
- `nest build --tsc` (SWC fails on TypeORM decorators)
- `npm run build` not `npx ng build` (security scanner)
