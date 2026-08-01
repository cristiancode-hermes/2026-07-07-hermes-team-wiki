import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../core/services/page.service';
import { SpaceService } from '../../core/services/space.service';
import { Page, Space } from '../../core/models';
import { MarkdownEditorComponent } from '../shared/markdown-editor.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-page-editor-page',
  standalone: true,
  imports: [FormsModule, MarkdownEditorComponent, BreadcrumbComponent, ErrorStateComponent],
  template: `
    <div class="space-y-6">
      <app-breadcrumb [items]="breadcrumbItems()" />

      @if (loadError()) {
        <app-error-state [message]="loadError()" />
      } @else {
        <div class="flex items-start justify-between">
          <div class="flex-1 max-w-2xl">
            <input
              type="text"
              [ngModel]="title()"
              (ngModelChange)="title.set($event)"
              placeholder="Page title..."
              class="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-primary-500 focus:outline-none pb-2 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400"
            />
          </div>

          <div class="flex items-center gap-3 shrink-0 ml-4">
            <button
              (click)="cancel()"
              class="rounded-md border border-secondary-300 dark:border-secondary-600 px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="save()"
              [disabled]="!title().trim() || saving()"
              class="rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-ink text-sm font-medium px-6 py-2 transition-colors flex items-center gap-2"
            >
              @if (saving()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              }
              {{ saving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        @if (error()) {
          <p class="text-sm text-danger-600 dark:text-danger-400">{{ error() }}</p>
        }

        <app-markdown-editor [(value)]="content" />
      }
    </div>
  `,
})
export class PageEditorPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pageService = inject(PageService);
  private spaceService = inject(SpaceService);

  protected readonly title = signal('');
  protected readonly content = signal('');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly isEdit = signal(false);
  protected readonly pageId = signal<string | null>(null);

  protected readonly breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'New Page' },
  ]);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    const spaceId = this.route.snapshot.queryParamMap.get('spaceId');

    if (id) {
      this.isEdit.set(true);
      this.pageId.set(id);
      this.loadPage(id);
    }

    if (spaceId) {
      this.breadcrumbItems.set([
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Space', path: `/spaces/${spaceId}` },
        { label: 'New Page' },
      ]);
    }
  }

  private loadPage(id: string): void {
    this.pageService.getPage(id).subscribe({
      next: (page) => {
        this.title.set(page.title);
        this.content.set(page.content);
        this.breadcrumbItems.set([
          { label: 'Dashboard', path: '/dashboard' },
          ...(page.spaceName ? [{ label: page.spaceName, path: `/spaces/${page.spaceId}` }] : []),
          { label: `Edit: ${page.title}` },
        ]);
      },
      error: (e) => this.loadError.set(e.message),
    });
  }

  protected save(): void {
    if (!this.title().trim() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const data = {
      title: this.title().trim(),
      content: this.content(),
      spaceId: this.route.snapshot.queryParamMap.get('spaceId') || undefined,
    };

    const obs = this.isEdit()
      ? this.pageService.updatePage(this.pageId()!, data)
      : this.pageService.createPage(data);

    obs.subscribe({
      next: (page) => {
        this.saving.set(false);
        this.router.navigate(['/pages', page.id]);
      },
      error: (e) => {
        this.error.set(e.message || 'Failed to save page');
        this.saving.set(false);
      },
    });
  }

  protected cancel(): void {
    if (this.isEdit() && this.pageId()) {
      this.router.navigate(['/pages', this.pageId()]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
