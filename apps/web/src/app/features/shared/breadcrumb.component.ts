import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
      @for (item of items(); track $index; let last = $last) {
        @if (!last && item.path) {
          <a [routerLink]="item.path" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
            {{ item.label }}
          </a>
        } @else {
          <span [class]="last ? 'text-secondary-900 dark:text-secondary-100 font-medium truncate' : 'truncate'">
            {{ item.label }}
          </span>
        }
        @if (!last) {
          <svg class="w-4 h-4 shrink-0 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
