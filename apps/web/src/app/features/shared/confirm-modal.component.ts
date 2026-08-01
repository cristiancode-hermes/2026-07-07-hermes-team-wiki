import { Component, input, output, model } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 modal-overlay" (click)="cancel.emit()"></div>
        <div class="relative bg-secondary-100 dark:bg-secondary-200 rounded-md  max-w-md w-full p-6 z-10">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">{{ icon() }}</span>
            <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{{ title() }}</h3>
          </div>
          <p class="text-sm text-secondary-600 dark:text-secondary-400">{{ message() }}</p>
          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="cancel.emit()"
              class="rounded-md border border-secondary-300 dark:border-secondary-600 px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
            >
              {{ cancelLabel() }}
            </button>
            <button
              (click)="confirm.emit()"
              class="rounded-md px-4 py-2 text-sm font-medium text-ink transition-colors"
              [class]="confirmClass()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly isOpen = model(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly icon = input('⚠️');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly variant = input<'danger' | 'primary' | 'warning'>('danger');
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected confirmClass = () =>
    this.variant() === 'danger'
      ? 'bg-danger-600 hover:bg-danger-700'
      : 'bg-primary-600 hover:bg-primary-700';
}
