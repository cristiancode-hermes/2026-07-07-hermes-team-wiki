import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { redirectIfAuthenticated } from './core/guards/redirect-if-authenticated.guard';

export const routes: Routes = [
  // Auth — without sidebar
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth-page.component').then(m => m.AuthPageComponent),
    canActivate: [redirectIfAuthenticated],
  },
  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
    canActivate: [authGuard],
  },
  // Spaces
  {
    path: 'spaces',
    loadComponent: () => import('./features/spaces/space-list-page.component').then(m => m.SpaceListPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'spaces/:id',
    loadComponent: () => import('./features/spaces/space-detail-page.component').then(m => m.SpaceDetailPageComponent),
    canActivate: [authGuard],
  },
  // Pages
  {
    path: 'pages/new',
    loadComponent: () => import('./features/pages/page-editor-page.component').then(m => m.PageEditorPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pages/:id',
    loadComponent: () => import('./features/pages/page-view-page.component').then(m => m.PageViewPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pages/:id/edit',
    loadComponent: () => import('./features/pages/page-editor-page.component').then(m => m.PageEditorPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pages/:id/history',
    loadComponent: () => import('./features/pages/page-history-page.component').then(m => m.PageHistoryPageComponent),
    canActivate: [authGuard],
  },
  // Search
  {
    path: 'search',
    loadComponent: () => import('./features/search/search-results-page.component').then(m => m.SearchResultsPageComponent),
    canActivate: [authGuard],
  },
  // Settings
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/settings/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [authGuard, adminGuard],
  },
  // Default
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
