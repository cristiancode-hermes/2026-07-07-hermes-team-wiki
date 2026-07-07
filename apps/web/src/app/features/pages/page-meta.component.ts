import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Page } from '../../core/models';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-page-meta',
  standalone: true,
  imports: [DatePipe, AvatarComponent],
  template: `
    @if (page(); as p) {
      <div class="flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
        @if (p.authorName) {
          <div class="flex items-center gap-2">
            <app-avatar [name]="p.authorName" size="sm" />
            <span class="font-medium text-secondary-700 dark:text-secondary-300">{{ p.authorName }}</span>
          </div>
        }
        <span>Updated {{ p.updatedAt | date:'MMM d, y h:mm a' }}</span>
        <span>v{{ p.versionNumber }}</span>
      </div>
    }
  `,
})
export class PageMetaComponent {
  readonly page = input<Page | null>(null);
}
