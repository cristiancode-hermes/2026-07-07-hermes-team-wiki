# Frontend Architecture — Hermes Team Wiki

## Signal Architecture

All component state uses signals exclusively:

```typescript
// Local state pattern (every page component)
const data = signal<T | null>(null);
const loading = signal(true);
const error = signal<string | null>(null);

// Template pattern
@if (loading()) { <skeleton /> }
@else if (error()) { <error [message]="error()" /> }
@else if (!data()) { <empty /> }
@else { <content /> }
```

## Key Patterns

- **Zoneless change detection**: `provideZonelessChangeDetection()` in app.config
- **Signal-based inputs**: `input()`, `input.required()`, `model()` for two-way binding
- **Outputs**: `output<T>()` for event emission
- **Computed values**: `computed(() => ...)` for derived state
- **New control flow**: `@if/@else/@for/@switch` — no structural directives
- **HTTP**: `HttpClient` via `fetch()` API, no Observables in templates

## Component Tree

```
AppComponent
├── HeaderComponent (logo, search, user menu, theme toggle)
├── SidebarComponent (spaces list, page tree)
├── RouterOutlet (lazy-loaded pages)
└── (no NgModules — all standalone)
```

## Lazy-Loaded Routes

| Path | Component |
|------|-----------|
| /login | AuthPageComponent |
| /dashboard | DashboardPageComponent |
| /spaces | SpaceListPageComponent |
| /spaces/:id | SpaceDetailPageComponent |
| /pages/new | PageEditorPageComponent |
| /pages/:id | PageViewPageComponent |
| /pages/:id/edit | PageEditorPageComponent |
| /pages/:id/history | PageHistoryPageComponent |
| /search | SearchResultsPageComponent |
| /settings | ProfilePageComponent |
| /admin | AdminPanelComponent |

## Shared Components

Located in `shared/`: MarkdownViewer, MarkdownEditor, EditorToolbar, ConfirmModal, KpiCard, EmptyState, ErrorState, SkeletonLoader, Badge, Avatar, SearchGlobal, DiffViewer, ThemeToggle, PageTree, TreeNode, Breadcrumb.
