import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SearchGlobalComponent } from '../shared/search-global.component';
import { ThemeToggleComponent } from '../shared/theme-toggle.component';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, SearchGlobalComponent, ThemeToggleComponent, AvatarComponent],
  template: `
    <header class="sticky top-0 z-30 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
      <div class="flex items-center justify-between h-14 px-4 lg:px-6">
        <div class="flex items-center gap-4">
          <a routerLink="/dashboard" class="flex items-center gap-2 shrink-0">
            <span class="text-xl">📝</span>
            <span class="font-semibold text-secondary-900 dark:text-secondary-100 hidden sm:inline">Team Wiki</span>
          </a>
        </div>

        <div class="flex items-center gap-3 flex-1 justify-center max-w-xl mx-4">
          <app-search-global />
        </div>

        <div class="flex items-center gap-2">
          <app-theme-toggle [isDark]="themeService.isDark()" (toggle)="themeService.toggle()" />

          @if (authService.currentUser(); as user) {
            <div class="relative" #menuContainer>
              <button
                (click)="menuOpen.set(!menuOpen())"
                class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <app-avatar [name]="user.name" [src]="user.avatarUrl" size="sm" />
                <span class="hidden sm:inline text-sm font-medium text-secondary-700 dark:text-secondary-300">{{ user.name }}</span>
              </button>

              @if (menuOpen()) {
                <div class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 py-1 z-50">
                  <a routerLink="/settings" (click)="menuOpen.set(false)" class="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700">
                    Settings
                  </a>
                  @if (authService.isAdmin()) {
                    <a routerLink="/admin" (click)="menuOpen.set(false)" class="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700">
                      Admin
                    </a>
                  }
                  <hr class="my-1 border-secondary-200 dark:border-secondary-700">
                  <button
                    (click)="authService.logout()"
                    class="w-full text-left px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  >
                    Sign out
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  protected themeService = inject(ThemeService);
  protected menuOpen = signal(false);
  private router = inject(Router);
}
