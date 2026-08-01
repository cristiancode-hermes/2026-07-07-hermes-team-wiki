import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SpaceService } from '../../core/services/space.service';
import { Space } from '../../core/models';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader.component';
import { BadgeComponent } from '../shared/badge.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { SpaceFormModalComponent } from './space-form-modal.component';

@Component({
  selector: 'app-space-list-page',
  standalone: true,
  imports: [RouterLink, DatePipe, EmptyStateComponent, ErrorStateComponent, SkeletonLoaderComponent, BadgeComponent, ConfirmModalComponent, SpaceFormModalComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Spaces</h1>
          <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Organize your wiki into spaces</p>
        </div>
        <button
          (click)="showCreateModal.set(true)"
          class="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-ink text-sm font-medium px-4 py-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Space
        </button>
      </div>

      @if (loading()) {
        <div class="grid gap-4">
          @for (_ of [1,2,3]; track _) {
            <div class="animate-pulse bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700 p-5">
              <div class="h-5 bg-secondary-200 dark:bg-secondary-300 rounded w-1/3 mb-3"></div>
              <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()" (retry)="loadSpaces()" />
      } @else if (spaces().length === 0) {
        <app-empty-state
          icon="📁"
          title="No spaces yet"
          description="Create your first space to start organizing pages"
          actionLabel="Create Space"
          (action)="showCreateModal.set(true)"
        />
      } @else {
        <div class="grid gap-4">
          @for (space of spaces(); track space.id) {
            <a
              [routerLink]="['/spaces', space.id]"
              class="block bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700 p-5 hover: hover:border-primary-300 dark:hover:border-primary-700 transition-all"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ space.icon || '📁' }}</span>
                  <div>
                    <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{{ space.name }}</h3>
                    @if (space.description) {
                      <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">{{ space.description }}</p>
                    }
                    <div class="flex items-center gap-2 mt-2">
                      <app-badge variant="primary">{{ space.pageCount ?? 0 }} pages</app-badge>
                      <span class="text-xs text-secondary-400">Created {{ space.createdAt | date:'MMM d, y' }}</span>
                    </div>
                  </div>
                </div>
                <button
                  (click)="$event.preventDefault(); $event.stopPropagation(); deleteTarget.set(space)"
                  class="p-1 text-secondary-400 hover:text-danger-500 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </a>
          }
        </div>
      }
    </div>

    @if (showCreateModal()) {
      <app-space-form-modal
        [(isOpen)]="showCreateModal"
        (saved)="loadSpaces()"
      />
    }

    @if (deleteTarget(); as target) {
      <app-confirm-modal
        [isOpen]="true"
        title="Delete Space"
        [message]="'Are you sure you want to delete ' + target.name + '? This will also delete all pages in this space.'"
        confirmLabel="Delete"
        variant="danger"
        (confirm)="deleteSpace(target.id)"
        (cancel)="deleteTarget.set(null)"
      />
    }
  `,
})
export class SpaceListPageComponent {
  private spaceService = inject(SpaceService);

  protected readonly spaces = signal<Space[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showCreateModal = signal(false);
  protected readonly deleteTarget = signal<Space | null>(null);

  constructor() {
    this.loadSpaces();
  }

  protected loadSpaces(): void {
    this.loading.set(true);
    this.error.set(null);
    this.spaceService.getSpaces().subscribe({
      next: (spaces) => { this.spaces.set(spaces); this.loading.set(false); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  protected deleteSpace(id: string): void {
    this.spaceService.deleteSpace(id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.loadSpaces();
      },
    });
  }
}
