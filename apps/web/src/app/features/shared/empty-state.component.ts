import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span class="text-5xl mb-4">{{ icon() }}</span>
      <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-2 text-sm text-secondary-500 dark:text-secondary-400 max-w-sm">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-ink hover:bg-primary-700 transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<string>('📄');
  readonly title = input<string>('No data found');
  readonly description = input<string>('');
  readonly actionLabel = input<string>('');
  readonly action = output<void>();
}
