import { Component, inject, input, output, signal } from '@angular/core';
import { PageVersion } from '../../core/models';
import { VersionCardComponent } from './version-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-version-list',
  standalone: true,
  imports: [VersionCardComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    @if (loading()) {
      <div class="space-y-3">
        @for (_ of [1,2,3]; track _) {
          <div class="animate-pulse h-24 bg-secondary-100 dark:bg-secondary-200 rounded-md"></div>
        }
      </div>
    } @else if (error()) {
      <app-error-state [message]="error()" (retry)="retry.emit()" />
    } @else if (versions().length === 0) {
      <app-empty-state icon="🕐" title="No version history" description="This page hasn't been edited yet" />
    } @else {
      <div class="space-y-3">
        @for (version of versions(); track version.id) {
          <div class="relative">
            <app-version-card [version]="version">
              <div actions class="flex gap-2">
                <button
                  (click)="revert.emit(version)"
                  class="px-3 py-1.5 text-xs font-medium rounded-md border border-secondary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  Revert
                </button>
              </div>
            </app-version-card>
          </div>
        }
      </div>
    }
  `,
})
export class VersionListComponent {
  readonly versions = input<PageVersion[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly revert = output<PageVersion>();
  readonly retry = output<void>();
}
