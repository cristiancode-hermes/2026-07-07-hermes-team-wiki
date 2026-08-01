import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="flex gap-2">
      <input
        type="text"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        name="comment"
        [placeholder]="placeholder()"
        class="flex-1 rounded-md border border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-secondary-200 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
      />
      <button
        type="submit"
        [disabled]="!value().trim()"
        class="rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-ink text-sm font-medium px-4 py-2 transition-colors"
      >
        {{ buttonLabel() }}
      </button>
    </form>
  `,
})
export class CommentFormComponent {
  readonly value = signal('');
  readonly placeholder = input('Add a comment...');
  readonly buttonLabel = input('Send');
  readonly submitted = output<string>();

  onSubmit(): void {
    const text = this.value().trim();
    if (text) {
      this.submitted.emit(text);
      this.value.set('');
    }
  }
}
