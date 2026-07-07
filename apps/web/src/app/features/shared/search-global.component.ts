import { Component, signal, inject, HostListener, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { SearchResult } from '../../core/models';

@Component({
  selector: 'app-search-global',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <div class="relative">
      <button
        (click)="open()"
        class="flex items-center gap-2 w-full sm:w-64 px-3 py-2 text-sm rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 hover:border-secondary-400 dark:hover:border-secondary-500 transition-colors text-left"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="flex-1">Search pages...</span>
        <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs border border-secondary-300 dark:border-secondary-600 rounded bg-secondary-50 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400">Ctrl+K</kbd>
      </button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-50 flex items-start justify-center pt-20" (click)="close()">
          <div class="fixed inset-0 bg-black/40" (click)="close()"></div>
          <div class="relative w-full max-w-2xl mx-4 bg-white dark:bg-secondary-800 rounded-xl shadow-2xl overflow-hidden z-10" (click)="$event.stopPropagation()">
            <div class="flex items-center border-b border-secondary-200 dark:border-secondary-700">
              <svg class="w-5 h-5 ml-4 text-secondary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                [ngModel]="query()"
                (ngModelChange)="query.set($event); doSearch()"
                type="text"
                placeholder="Search pages..."
                class="flex-1 px-3 py-3 text-sm bg-transparent border-0 focus:outline-none text-secondary-900 dark:text-secondary-100 placeholder-secondary-400"
                #searchInput
              />
              <button (click)="close()" class="mr-3 p-1 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300">
                <kbd class="px-1.5 py-0.5 text-xs border border-secondary-300 dark:border-secondary-600 rounded text-secondary-500">ESC</kbd>
              </button>
            </div>

            <div class="max-h-96 overflow-y-auto">
              @if (loading()) {
                <div class="p-4 text-center text-sm text-secondary-500">Searching...</div>
              } @else if (error()) {
                <div class="p-4 text-center text-sm text-danger-500">{{ error() }}</div>
              } @else if (results().length === 0 && query()) {
                <div class="p-4 text-center text-sm text-secondary-500">No results found</div>
              } @else {
                @for (result of results(); track result.id) {
                  <a
                    [routerLink]="['/pages', result.id]"
                    (click)="close()"
                    class="block px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors border-b border-secondary-100 dark:border-secondary-700/50 last:border-0"
                  >
                    <div class="flex items-start gap-3">
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ result.title }}</p>
                        <p class="text-xs text-secondary-500 mt-0.5 line-clamp-2">{{ result.snippet }}</p>
                        <p class="text-xs text-secondary-400 mt-1">
                          <span class="font-medium">{{ result.spaceName }}</span>
                          <span class="mx-1">·</span>
                          {{ result.updatedAt | date:'mediumDate' }}
                        </p>
                      </div>
                    </div>
                  </a>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SearchGlobalComponent {
  private searchService = inject(SearchService);

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly results = signal<SearchResult[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  @HostListener('document:keydown.control.k', ['$event'])
  handleKeydown(event: Event): void {
    event.preventDefault();
    this.open();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  open(): void {
    this.isOpen.set(true);
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('[placeholder="Search pages..."]');
      input?.focus();
    });
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
  }

  doSearch(): void {
    const q = this.query().trim();
    if (!q) {
      this.results.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.searchService.search(q).subscribe({
      next: (res) => {
        this.results.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Search failed');
        this.loading.set(false);
      },
    });
  }
}
