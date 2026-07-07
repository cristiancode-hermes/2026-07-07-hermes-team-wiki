import { Component, inject, signal, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '../../core/models';
import { PageService } from '../../core/services/page.service';

@Component({
  selector: 'app-page-actions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center gap-2">
      <button
        (click)="toggleFavorite()"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors"
        [class]="isFavorited() ? 'bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-900/20 dark:border-accent-800 dark:text-accent-400' : 'border-secondary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'"
      >
        <svg class="w-4 h-4" [class.fill-current]="isFavorited()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        {{ isFavorited() ? 'Favorited' : 'Favorite' }}
      </button>

      <a
        [routerLink]="['/pages', pageId(), 'edit']"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-secondary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </a>

      <a
        [routerLink]="['/pages', pageId(), 'history']"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-secondary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
      </a>
    </div>
  `,
})
export class PageActionsComponent {
  private pageService = inject(PageService);

  readonly pageId = input.required<string>();
  readonly isFavorited = input(false);

  toggleFavorite(): void {
    this.pageService.toggleFavorite(this.pageId()).subscribe();
  }
}
