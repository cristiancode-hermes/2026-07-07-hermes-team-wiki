import { Component, inject, signal, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpaceService } from '../../core/services/space.service';
import { Space } from '../../core/models';

@Component({
  selector: 'app-space-form-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 modal-overlay" (click)="close()"></div>
        <div class="relative bg-secondary-100 dark:bg-secondary-200 rounded-md  max-w-lg w-full p-6 z-10">
          <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            {{ space() ? 'Edit Space' : 'Create Space' }}
          </h3>

          <form (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Icon</label>
              <input
                type="text"
                [ngModel]="icon()"
                (ngModelChange)="icon.set($event)"
                name="icon"
                class="w-full rounded-md border border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-secondary-200 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="📁"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Name *</label>
              <input
                type="text"
                [ngModel]="name()"
                (ngModelChange)="name.set($event)"
                name="name"
                required
                class="w-full rounded-md border border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-secondary-200 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                placeholder="Engineering Wiki"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Description</label>
              <textarea
                [ngModel]="description()"
                (ngModelChange)="description.set($event)"
                name="description"
                rows="3"
                class="w-full rounded-md border border-secondary-300 dark:border-secondary-600 bg-secondary-100 dark:bg-secondary-200 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                placeholder="Describe this space..."
              ></textarea>
            </div>

            @if (error()) {
              <p class="text-sm text-danger-600">{{ error() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="close()"
                class="rounded-md border border-secondary-300 dark:border-secondary-600 px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!name().trim() || saving()"
                class="rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-ink text-sm font-medium px-4 py-2 transition-colors"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  {{ space() ? 'Update' : 'Create' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class SpaceFormModalComponent {
  private spaceService = inject(SpaceService);

  readonly isOpen = model(false);
  readonly space = signal<Space | null>(null);
  readonly saved = signal(false);

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly icon = signal('📁');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  close(): void {
    this.isOpen.set(false);
    this.name.set('');
    this.description.set('');
    this.icon.set('📁');
    this.error.set(null);
    this.space.set(null);
  }

  save(): void {
    if (!this.name().trim() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);

    const data = {
      name: this.name().trim(),
      description: this.description().trim(),
      icon: this.icon() || '📁',
    };

    const obs = this.space()
      ? this.spaceService.updateSpace(this.space()!.id, data)
      : this.spaceService.createSpace(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.close();
      },
      error: (e) => {
        this.error.set(e.message || 'Failed to save space');
        this.saving.set(false);
      },
    });
  }
}
