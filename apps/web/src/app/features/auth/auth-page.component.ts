import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginFormComponent } from './login-form.component';
import { RegisterFormComponent } from './register-form.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [LoginFormComponent, RegisterFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <span class="text-4xl">📝</span>
          <h1 class="mt-3 text-2xl font-bold text-secondary-900 dark:text-secondary-100">Team Wiki</h1>
          <p class="mt-1 text-sm text-secondary-500">Your team's knowledge base</p>
        </div>

        <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div class="flex border-b border-secondary-200 dark:border-secondary-700 mb-6">
            <button
              (click)="tab.set('login')"
              class="flex-1 pb-3 text-sm font-medium transition-colors border-b-2"
              [class]="tab() === 'login' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'"
            >
              Sign In
            </button>
            <button
              (click)="tab.set('register')"
              class="flex-1 pb-3 text-sm font-medium transition-colors border-b-2"
              [class]="tab() === 'register' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'"
            >
              Create Account
            </button>
          </div>

          @switch (tab()) {
            @case ('login') {
              <app-login-form />
            }
            @case ('register') {
              <app-register-form />
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class AuthPageComponent {
  protected tab = signal<'login' | 'register'>('login');
}
