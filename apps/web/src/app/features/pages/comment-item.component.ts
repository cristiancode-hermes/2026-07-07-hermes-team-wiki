import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comment } from '../../core/models';
import { AvatarComponent } from '../shared/avatar.component';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [DatePipe, AvatarComponent],
  template: `
    <div class="flex gap-3 py-3">
      <app-avatar [name]="comment().authorName || '?'" size="sm" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ comment().authorName || 'Unknown' }}</span>
          <span class="text-xs text-secondary-400">{{ comment().createdAt | date:'MMM d, y h:mm a' }}</span>
          @if (comment().isEdited) {
            <span class="text-xs text-secondary-400 italic">(edited)</span>
          }
        </div>
        <p class="text-sm text-secondary-700 dark:text-secondary-300 mt-1">{{ comment().content }}</p>
        <div class="flex items-center gap-2 mt-1">
          @if (editable()) {
            <button (click)="edit.emit(comment())" class="text-xs text-secondary-400 hover:text-primary-500 transition-colors">Edit</button>
            <button (click)="delete.emit(comment().id)" class="text-xs text-secondary-400 hover:text-danger-500 transition-colors">Delete</button>
          }
        </div>
      </div>
    </div>
  `,
})
export class CommentItemComponent {
  readonly comment = input.required<Comment>();
  readonly editable = input(false);
  readonly edit = output<Comment>();
  readonly delete = output<string>();
}
