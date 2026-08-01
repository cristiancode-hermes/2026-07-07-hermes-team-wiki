import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PageService } from '../../core/services/page.service';
import { Page } from '../../core/models';
import { MarkdownViewerComponent } from '../shared/markdown-viewer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb.component';
import { PageActionsComponent } from './page-actions.component';
import { PageMetaComponent } from './page-meta.component';
import { CommentsSectionComponent } from './comments-section.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-page-view-page',
  standalone: true,
  imports: [
    DatePipe, RouterLink,
    MarkdownViewerComponent, BreadcrumbComponent,
    PageActionsComponent, PageMetaComponent,
    CommentsSectionComponent, ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-secondary-200 dark:bg-secondary-300 rounded w-1/2"></div>
        <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-1/3"></div>
        <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-3/4 mt-8"></div>
        <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-full"></div>
        <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-5/6"></div>
      </div>
    } @else if (error()) {
      <app-error-state [message]="error()" (retry)="loadPage()" />
    } @else if (page(); as p) {
      <div class="space-y-6">
        <app-breadcrumb [items]="breadcrumbItems()" />

        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h1 class="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{{ p.title }}</h1>
            <div class="mt-2">
              <app-page-meta [page]="p" />
            </div>
          </div>
          <app-page-actions [pageId]="p.id" />
        </div>

        <div class="bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700  p-6 lg:p-8">
          <app-markdown-viewer [content]="p.content" />
        </div>

        <div class="mt-8">
          <app-comments-section [pageId]="p.id" />
        </div>
      </div>
    }
  `,
})
export class PageViewPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pageService = inject(PageService);

  protected readonly page = signal<Page | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Page' },
  ]);

  ngOnInit(): void {
    this.loadPage();
  }

  protected loadPage(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);
    this.pageService.getPage(id).subscribe({
      next: (p) => {
        this.page.set(p);
        this.breadcrumbItems.set([
          { label: 'Dashboard', path: '/dashboard' },
          ...(p.spaceName ? [{ label: p.spaceName, path: `/spaces/${p.spaceId}` }] : []),
          { label: p.title },
        ]);
        this.loading.set(false);
      },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }
}
