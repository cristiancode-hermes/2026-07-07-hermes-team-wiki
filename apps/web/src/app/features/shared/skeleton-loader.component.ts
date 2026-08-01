import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3">
      <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-3/4"></div>
      <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-1/2"></div>
      <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-5/6"></div>
      <div class="h-4 bg-secondary-200 dark:bg-secondary-300 rounded w-2/3"></div>
    </div>
  `,
})
export class SkeletonLoaderComponent {}
