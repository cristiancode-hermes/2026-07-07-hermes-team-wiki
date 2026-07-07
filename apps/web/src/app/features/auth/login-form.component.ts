import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="handleLogin()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
        <input
          type="email"
          [ngModel]="email()"
          (ngModelChange)="email.set($event)"
          name="email"
          required
          class="w-full rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          placeholder="you@company.com"
          autocomplete="email"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Password</label>
        <input
          type="password"
          [ngModel]="password()"
          (ngModelChange)="password.set($event)"
          name="password"
          required
          minlength="6"
          class="w-full rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>

      @if (error()) {
        <p class="text-sm text-danger-600 dark:text-danger-400">{{ error() }}</p>
      }

      <button
        type="submit"
        [disabled]="loading() || !isValid()"
        class="w-full rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition-colors flex items-center justify-center gap-2"
      >
        @if (loading()) {
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        }
        {{ loading() ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  `,
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly isValid = computed(() => {
    return this.email().includes('@') && this.password().length >= 6;
  });

  async handleLogin(): Promise<void> {
    if (!this.isValid() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(this.email(), this.password());
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
