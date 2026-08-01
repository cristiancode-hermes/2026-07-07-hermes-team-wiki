import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700 p-6  hover: transition-">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center text-xl" [class]="iconBg()">
          {{ icon() }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-secondary-500 dark:text-secondary-400 truncate">{{ label() }}</p>
          <p class="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mt-0.5">
            @if (loading()) {
              <span class="inline-block w-16 h-7 rounded bg-secondary-200 dark:bg-secondary-300 animate-pulse"></span>
            } @else {
              {{ value() }}
            }
          </p>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  readonly icon = input<string>('📊');
  readonly label = input<string>('');
  readonly value = input<string | number>('');
  readonly loading = input(false);

  protected iconBg = () => 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400';
}
