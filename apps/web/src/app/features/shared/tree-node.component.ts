import { Component, input, output } from '@angular/core';
import { Page } from '../../core/models';

@Component({
  selector: 'app-tree-node',
  standalone: true,
  template: `
    <div class="select-none">
      <button
        (click)="toggle.emit()"
        class="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors text-left"
        [class]="active() ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-800 dark:hover:text-secondary-200'"
      >
        @if (node().children?.length > 0) {
          <svg class="w-3.5 h-3.5 shrink-0 transition-transform" [class.rotate-90]="expanded()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        } @else {
          <span class="w-3.5 shrink-0"></span>
        }
        <svg class="w-4 h-4 shrink-0 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="truncate">{{ node().title }}</span>
      </button>

      @if (expanded() && node().children?.length > 0) {
        <div class="ml-4 border-l border-secondary-200 dark:border-secondary-700 pl-2">
          @for (child of node().children; track child.id) {
            <app-tree-node
              [node]="child"
              [active]="activeId() === child.id"
              [expanded]="expandedIds().includes(child.id)"
              (toggle)="childToggle.emit(child.id)"
            />
          }
        </div>
      }
    </div>
  `,
})
export class TreeNodeComponent {
  readonly node = input.required<Page>();
  readonly active = input(false);
  readonly activeId = input<string>('');
  readonly expanded = input(false);
  readonly expandedIds = input<string[]>([]);
  readonly toggle = output<void>();
  readonly childToggle = output<string>();
}
