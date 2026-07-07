# API Reference — Hermes Team Wiki

## Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/auth/register` | No | `{ name, email, password, organizationName }` | `{ user, token, organization }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ user, token, organization }` |
| GET | `/api/auth/me` | JWT | — | User profile with organization |

## Spaces — `/api/spaces`

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/spaces` | `Space[]` with `pageCount` |
| GET | `/api/spaces/:id` | Space with pages and authors |
| POST | `/api/spaces` | Created space + home page |
| PUT | `/api/spaces/:id` | Updated space |
| DELETE | `/api/spaces/:id` | `{ deleted: true }` |

## Pages — `/api/pages`

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/pages/:id` | Page with author, space, parent, children |
| POST | `/api/pages` | Created page + version 1 |
| PUT | `/api/pages/:id` | Updated page + new version auto-created |
| DELETE | `/api/pages/:id` | `{ deleted: true }` |
| GET | `/api/pages/:id/versions` | PageVersion[] (chronological) |
| GET | `/api/pages/:id/versions/:vid` | Single version |
| POST | `/api/pages/:id/revert/:vid` | Reverted page (new version created) |

## Comments — `/api/pages/:pageId/comments`

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `.../comments` | Comment[] for page |
| POST | `.../comments` | Created comment |
| PUT | `/api/comments/:id` | Updated comment |
| DELETE | `/api/comments/:id` | `{ deleted: true }` |

## Search — `/api/search`

| Method | Query Params | Response |
|--------|-------------|----------|
| GET | `?q=...&spaceId=&limit=10` | SearchResult[] with highlighted snippets |

## Dashboard — `/api/dashboard`

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/dashboard/stats` | `{ totalPages, totalSpaces, totalComments, totalMembers }` |
| GET | `/api/dashboard/recent` | Recent pages with author and space |
| GET | `/api/dashboard/activity` | Activity timeline (edits + comments) |

## Organization — `/api/org`

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/org/members` | User[] with roles |
| PUT | `/api/org/members/:userId` | Updated user role |
| DELETE | `/api/org/members/:userId` | Member removed |

All endpoints require JWT Bearer token except auth/register and auth/login.
Scoped by organization — users only see their organization's data.
