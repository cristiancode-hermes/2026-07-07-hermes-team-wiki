import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from '../../core/services/page.service';
import { PageVersion } from '../../core/models';
import { VersionListComponent } from './version-list.component';
import { DiffViewerComponent } from '../shared/diff-viewer.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';

@Component({
  selector: 'app-page-history-page',
  standalone: true,
  imports: [VersionListComponent, DiffViewerComponent, BreadcrumbComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <app-breadcrumb [items]="breadcrumbItems()" />

      <div>
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Page History</h1>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">View and revert to previous versions</p>
      </div>

      @if (selectedVersion()) {
        <div class="bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700  p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
              Changes in v{{ selectedVersion()?.versionNumber }}
            </h3>
            <button
              (click)="selectedVersion.set(null)"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Close
            </button>
          </div>
          @if (currentContent() !== null) {
            <app-diff-viewer [oldContent]="selectedVersion()?.content || ''" [newContent]="currentContent() || ''" />
          }
        </div>
      }

      @if (showRevertModal()) {
        <app-confirm-modal
          [isOpen]="true"
          title="Revert to this version"
          [message]="'Are you sure you want to revert to version v' + (revertTarget()?.versionNumber ?? '') + '? Current changes will be lost.'"
          confirmLabel="Revert"
          variant="warning"
          (confirm)="confirmRevert()"
          (cancel)="showRevertModal.set(false)"
        />
      }

      <app-version-list
        [versions]="versions()"
        [loading]="loading()"
        [error]="error()"
        (revert)="promptRevert($event)"
        (retry)="loadVersions()"
      />
    </div>
  `,
})
export class PageHistoryPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pageService = inject(PageService);

  protected readonly versions = signal<PageVersion[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly currentContent = signal<string | null>(null);
  protected readonly selectedVersion = signal<PageVersion | null>(null);
  protected readonly revertTarget = signal<PageVersion | null>(null);
  protected readonly showRevertModal = signal(false);

  protected readonly breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'History' },
  ]);

  private pageId: string;

  constructor() {
    this.pageId = this.route.snapshot.paramMap.get('id')!;
    this.loadVersions();
    this.loadCurrentPage();
  }

  private loadCurrentPage(): void {
    this.pageService.getPage(this.pageId).subscribe({
      next: (page) => this.currentContent.set(page.content),
    });
  }

  protected loadVersions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pageService.getPageVersions(this.pageId).subscribe({
      next: (versions) => {
        this.versions.set(versions);
        this.loading.set(false);
      },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  protected promptRevert(version: PageVersion): void {
    this.revertTarget.set(version);
    this.showRevertModal.set(true);
  }

  protected confirmRevert(): void {
    const target = this.revertTarget();
    if (!target) return;

    this.pageService.revertToVersion(this.pageId, target.id).subscribe({
      next: (page) => {
        this.showRevertModal.set(false);
        this.revertTarget.set(null);
        this.router.navigate(['/pages', this.pageId]);
      },
    });
  }
}
