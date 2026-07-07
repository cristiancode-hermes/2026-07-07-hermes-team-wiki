import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SpaceService } from '../../core/services/space.service';
import { Space } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 flex flex-col h-full">
      <div class="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <a
          routerLink="/pages/new"
          class="flex items-center justify-center gap-2 w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Page
        </a>
      </div>

      <nav class="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
          class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-800 dark:hover:text-secondary-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>

        <a
          routerLink="/spaces"
          routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
          class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-800 dark:hover:text-secondary-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Spaces
        </a>
      </nav>

      <div class="p-3 border-t border-secondary-200 dark:border-secondary-700">
        <p class="text-xs text-secondary-400 dark:text-secondary-500 px-3 py-1">SPACES</p>
        @if (spaces().length > 0) {
          <div class="space-y-0.5 mt-1">
            @for (space of spaces(); track space.id) {
              <a
                [routerLink]="['/spaces', space.id]"
                class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 hover:text-secondary-800 dark:hover:text-secondary-200 transition-colors truncate"
              >
                <span>{{ space.icon || '📁' }}</span>
                <span class="truncate">{{ space.name }}</span>
              </a>
            }
          </div>
        } @else {
          <p class="px-3 py-2 text-xs text-secondary-400 dark:text-secondary-500">No spaces yet</p>
        }
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private spaceService = inject(SpaceService);
  protected readonly spaces = signal<Space[]>([]);

  constructor() {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    this.spaceService.getSpaces().subscribe({
      next: (spaces) => this.spaces.set(spaces),
      error: () => {},
    });
  }
}
