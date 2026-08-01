import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SpaceService } from '../../core/services/space.service';
import { Space, Page } from '../../core/models';
import { BreadcrumbComponent } from '../shared/breadcrumb.component';
import { PageTreeComponent } from '../shared/page-tree.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader.component';

@Component({
  selector: 'app-space-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe, BreadcrumbComponent, PageTreeComponent, EmptyStateComponent, ErrorStateComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      @if (loading()) {
        <app-skeleton-loader />
      } @else if (error()) {
        <app-error-state [message]="error()" (retry)="loadSpace()" />
      } @else if (space(); as space) {
        <app-breadcrumb [items]="breadcrumbItems()" />

        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <span class="text-3xl">{{ space.icon || '📁' }}</span>
            <div>
              <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{{ space.name }}</h1>
              @if (space.description) {
                <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{{ space.description }}</p>
              }
            </div>
          </div>

          <a
            [routerLink]="['/pages/new']"
            [queryParams]="{ spaceId: space.id }"
            class="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-ink text-sm font-medium px-4 py-2 transition-colors shrink-0"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Page
          </a>
        </div>

        <div class="bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700 ">
          <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Pages</h2>
          </div>
          <div class="p-5">
            @if (pagesLoading()) {
              <app-skeleton-loader />
            } @else if (pagesError()) {
              <app-error-state [message]="pagesError()" (retry)="loadPages()" />
            } @else if (pages().length === 0) {
              <app-empty-state
                icon="📄"
                title="No pages in this space"
                description="Create the first page for this space"
                actionLabel="Create Page"
                [routerLink]="['/pages/new']"
                [queryParams]="{ spaceId: space.id }"
              />
            } @else {
              <app-page-tree [pages]="pages()" />
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SpaceDetailPageComponent {
  private route = inject(ActivatedRoute);
  private spaceService = inject(SpaceService);

  protected readonly space = signal<Space | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly pages = signal<Page[]>([]);
  protected readonly pagesLoading = signal(true);
  protected readonly pagesError = signal<string | null>(null);

  protected readonly breadcrumbItems = signal([{ label: 'Spaces', path: '/spaces' }, { label: '...' }]);

  constructor() {
    const spaceId = this.route.snapshot.paramMap.get('id')!;
    if (spaceId) {
      this.loadSpace(spaceId);
      this.loadPages(spaceId);
    }
  }

  protected loadSpace(id?: string): void {
    const spaceId = id || this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.error.set(null);
    this.spaceService.getSpace(spaceId).subscribe({
      next: (space) => {
        this.space.set(space);
        this.breadcrumbItems.set([
          { label: 'Spaces', path: '/spaces' },
          { label: space.name },
        ]);
        this.loading.set(false);
      },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  protected loadPages(id?: string): void {
    const spaceId = id || this.route.snapshot.paramMap.get('id')!;
    this.pagesLoading.set(true);
    this.pagesError.set(null);
    this.spaceService.getSpacePages(spaceId).subscribe({
      next: (pages) => { this.pages.set(pages); this.pagesLoading.set(false); },
      error: (e) => { this.pagesError.set(e.message); this.pagesLoading.set(false); },
    });
  }
}
