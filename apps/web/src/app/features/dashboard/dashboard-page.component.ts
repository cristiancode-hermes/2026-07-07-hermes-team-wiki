import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats, Page, Activity } from '../../core/models';
import { KpiCardComponent } from '../shared/kpi-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, DatePipe, KpiCardComponent, EmptyStateComponent, ErrorStateComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Dashboard</h1>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Overview of your wiki</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card icon="📄" label="Total Pages" [value]="stats()?.totalPages ?? 0" [loading]="statsLoading()" />
        <app-kpi-card icon="📁" label="Spaces" [value]="stats()?.totalSpaces ?? 0" [loading]="statsLoading()" />
        <app-kpi-card icon="💬" label="Comments" [value]="stats()?.totalComments ?? 0" [loading]="statsLoading()" />
        <app-kpi-card icon="👥" label="Members" [value]="stats()?.totalMembers ?? 0" [loading]="statsLoading()" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Pages -->
        <div class="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
          <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Recent Pages</h2>
          </div>
          <div class="p-5">
            @if (pagesLoading()) {
              <app-skeleton-loader />
            } @else if (pagesError()) {
              <app-error-state [message]="pagesError()" (retry)="loadRecentPages()" />
            } @else if (recentPages().length === 0) {
              <app-empty-state icon="📄" title="No pages yet" description="Start by creating your first page" actionLabel="Create Page" [routerLink]="['/pages/new']" />
            } @else {
              <div class="space-y-3">
                @for (page of recentPages(); track page.id) {
                  <a [routerLink]="['/pages', page.id]" class="block p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700">
                    <p class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ page.title }}</p>
                    <div class="flex items-center gap-2 mt-1 text-xs text-secondary-500">
                      <span>{{ page.spaceName }}</span>
                      <span>·</span>
                      <span>{{ page.updatedAt | date:'MMM d, y' }}</span>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
          <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Activity</h2>
          </div>
          <div class="p-5">
            @if (activityLoading()) {
              <app-skeleton-loader />
            } @else if (activityError()) {
              <app-error-state [message]="activityError()" (retry)="loadActivity()" />
            } @else if (activities().length === 0) {
              <app-empty-state icon="📊" title="No activity yet" description="Activity will appear here as your team uses the wiki" />
            } @else {
              <div class="flow-root">
                <ul class="divide-y divide-secondary-100 dark:divide-secondary-700">
                  @for (activity of activities(); track $index) {
                    <li class="py-3 flex items-start gap-3">
                      <span class="mt-0.5 text-base">{{ activityIcon(activity.type) }}</span>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm text-secondary-700 dark:text-secondary-300">
                          <span class="font-medium">{{ activity.userName }}</span>
                          <span class="text-secondary-500"> {{ activityVerb(activity.type) }} </span>
                          <span class="font-medium">{{ activity.title }}</span>
                        </p>
                        <p class="text-xs text-secondary-400 mt-0.5">{{ activity.date | date:'MMM d, y h:mm a' }}</p>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPageComponent {
  private dashboardService = inject(DashboardService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly statsLoading = signal(true);
  protected readonly statsError = signal<string | null>(null);

  protected readonly recentPages = signal<Page[]>([]);
  protected readonly pagesLoading = signal(true);
  protected readonly pagesError = signal<string | null>(null);

  protected readonly activities = signal<Activity[]>([]);
  protected readonly activityLoading = signal(true);
  protected readonly activityError = signal<string | null>(null);

  constructor() {
    this.loadStats();
    this.loadRecentPages();
    this.loadActivity();
  }

  private loadStats(): void {
    this.statsLoading.set(true);
    this.statsError.set(null);
    this.dashboardService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.statsLoading.set(false); },
      error: (e) => { this.statsError.set(e.message); this.statsLoading.set(false); },
    });
  }

  protected loadRecentPages(): void {
    this.pagesLoading.set(true);
    this.pagesError.set(null);
    this.dashboardService.getRecentPages().subscribe({
      next: (p) => { this.recentPages.set(p); this.pagesLoading.set(false); },
      error: (e) => { this.pagesError.set(e.message); this.pagesLoading.set(false); },
    });
  }

  protected loadActivity(): void {
    this.activityLoading.set(true);
    this.activityError.set(null);
    this.dashboardService.getActivity().subscribe({
      next: (a) => { this.activities.set(a); this.activityLoading.set(false); },
      error: (e) => { this.activityError.set(e.message); this.activityLoading.set(false); },
    });
  }

  protected activityIcon(type: string): string {
    switch (type) {
      case 'edit': return '✏️';
      case 'comment': return '💬';
      case 'create': return '✨';
      default: return '📌';
    }
  }

  protected activityVerb(type: string): string {
    switch (type) {
      case 'edit': return 'edited';
      case 'comment': return 'commented on';
      case 'create': return 'created';
      default: return 'updated';
    }
  }
}
