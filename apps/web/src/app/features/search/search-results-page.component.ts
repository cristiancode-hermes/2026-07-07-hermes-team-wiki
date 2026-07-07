import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SearchService } from '../../core/services/search.service';
import { SearchResult } from '../../core/models';
import { SearchResultItemComponent } from './search-result-item.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader.component';

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [RouterLink, DatePipe, SearchResultItemComponent, EmptyStateComponent, ErrorStateComponent, SkeletonLoaderComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Search Results</h1>
        @if (query()) {
          <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            Results for "{{ query() }}"
            @if (!loading()) {
              — {{ results().length }} found
            }
          </p>
        }
      </div>

      @if (loading()) {
        <div class="grid gap-4">
          @for (_ of [1,2,3]; track _) {
            <div class="animate-pulse bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-5">
              <div class="h-5 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-3"></div>
              <div class="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <app-error-state [message]="error()" (retry)="doSearch()" />
      } @else if (!query()) {
        <app-empty-state icon="🔍" title="Search pages" description="Enter a search term to find pages across all spaces" />
      } @else if (results().length === 0) {
        <app-empty-state icon="🔍" title="No results found" description="Try different keywords or check your spelling" />
      } @else {
        <div class="grid gap-4">
          @for (result of results(); track result.id) {
            <app-search-result-item [result]="result" />
          }
        </div>
      }
    </div>
  `,
})
export class SearchResultsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);

  protected readonly query = signal('');
  protected readonly results = signal<SearchResult[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || '';
      this.query.set(q);
      if (q) {
        this.doSearch();
      }
    });
  }

  protected doSearch(): void {
    const q = this.query();
    if (!q) return;

    this.loading.set(true);
    this.error.set(null);
    this.searchService.search(q).subscribe({
      next: (results) => { this.results.set(results); this.loading.set(false); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }
}
