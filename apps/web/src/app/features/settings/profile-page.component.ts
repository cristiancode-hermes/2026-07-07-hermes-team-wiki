import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrgService } from '../../core/services/org.service';
import { User } from '../../core/models';
import { AvatarComponent } from '../shared/avatar.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, AvatarComponent, ErrorStateComponent],
  template: `
    <div class="max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage your profile</p>
      </div>

      @if (saved()) {
        <div class="rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 p-4 text-sm text-success-700 dark:text-success-300">
          Profile updated successfully
        </div>
      }

      @if (user(); as user) {
        <div class="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
          <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Profile</h2>
          </div>
          <form (ngSubmit)="saveProfile()" class="p-5 space-y-4">
            <div class="flex items-center gap-4">
              <app-avatar [name]="user.name" size="lg" />
              <div>
                <p class="font-medium text-secondary-900 dark:text-secondary-100">{{ user.name }}</p>
                <p class="text-sm text-secondary-500">{{ user.email }}</p>
                <p class="text-xs text-secondary-400 mt-0.5">Role: {{ user.role }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Name</label>
              <input
                type="text"
                [ngModel]="name()"
                (ngModelChange)="name.set($event)"
                name="name"
                class="w-full rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            @if (error()) {
              <p class="text-sm text-danger-600">{{ error() }}</p>
            }

            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="saving()"
                class="rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 transition-colors"
              >
                @if (saving()) { Saving... } @else { Save Changes }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ProfilePageComponent {
  private authService = inject(AuthService);
  private orgService = inject(OrgService);

  protected readonly user = this.authService.currentUser;
  protected readonly name = signal('');
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saved = signal(false);

  constructor() {
    const u = this.user();
    if (u) {
      this.name.set(u.name);
    }
  }

  protected saveProfile(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.orgService.updateProfile({ name: this.name().trim() } as Partial<User>).subscribe({
      next: (user) => {
        this.authService.currentUser.set(user);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e) => { this.error.set(e.message); this.saving.set(false); },
    });
  }
}
