import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageVersion } from '../../core/models';
import { AvatarComponent } from '../shared/avatar.component';
import { BadgeComponent, BadgeVariant } from '../shared/badge.component';

@Component({
  selector: 'app-version-card',
  standalone: true,
  imports: [DatePipe, AvatarComponent, BadgeComponent],
  template: `
    <div class="flex items-start gap-4 p-4 bg-secondary-100 dark:bg-secondary-200 rounded-md border border-secondary-200 dark:border-secondary-700 hover: transition-">
      <div class="shrink-0">
        <app-avatar [name]="version().authorName || '?'" size="sm" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <app-badge [variant]="badgeVariant()">v{{ version().versionNumber }}</app-badge>
          <span class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ version().authorName || 'Unknown' }}</span>
        </div>
        @if (version().summary) {
          <p class="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{{ version().summary }}</p>
        }
        <div class="flex items-center gap-3 mt-2 text-xs text-secondary-400">
          <span>{{ version().createdAt | date:'MMM d, y h:mm a' }}</span>
          @if (version().changeStats) {
            <span>{{ version().changeStats }}</span>
          }
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
})
export class VersionCardComponent {
  readonly version = input.required<PageVersion>();

  protected badgeVariant = (): BadgeVariant => {
    const v = this.version().versionNumber;
    if (v === 1) return 'success';
    return 'secondary';
  };
}
