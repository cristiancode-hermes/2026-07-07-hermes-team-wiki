import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span class="text-5xl mb-4">⚠️</span>
      <h3 class="text-lg font-semibold text-danger-700 dark:text-danger-400">Something went wrong</h3>
      @if (message()) {
        <p class="mt-2 text-sm text-secondary-500 dark:text-secondary-400 max-w-sm">{{ message() }}</p>
      }
      @if (showRetry()) {
        <button
          (click)="retry.emit()"
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-ink hover:bg-primary-700 transition-colors"
        >
          Try again
        </button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input<string | null>('');
  readonly showRetry = input(true);
  readonly retry = output<void>();
}
