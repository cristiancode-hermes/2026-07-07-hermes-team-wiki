import { Component, inject, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchResult } from '../../core/models';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <a
      [routerLink]="['/pages', result().id]"
      class="block bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
    >
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{{ result().title }}</h3>
          <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">{{ result().snippet }}</p>
          <div class="flex items-center gap-2 mt-2 text-xs text-secondary-400">
            <span class="font-medium text-primary-600 dark:text-primary-400">{{ result().spaceName }}</span>
            <span>·</span>
            <span>{{ result().updatedAt | date:'MMM d, y' }}</span>
          </div>
        </div>
      </div>
    </a>
  `,
})
export class SearchResultItemComponent {
  readonly result = input.required<SearchResult>();
}
