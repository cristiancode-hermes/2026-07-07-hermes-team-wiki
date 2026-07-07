import { Component, inject, input, signal } from '@angular/core';
import { CommentService } from '../../core/services/comment.service';
import { AuthService } from '../../core/services/auth.service';
import { Comment } from '../../core/models';
import { CommentItemComponent } from './comment-item.component';
import { CommentFormComponent } from './comment-form.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ErrorStateComponent } from '../shared/error-state.component';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommentItemComponent, CommentFormComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
      <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
        <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Comments</h3>
      </div>
      <div class="p-5">
        @if (loading()) {
          <div class="text-center text-sm text-secondary-500 py-4">Loading comments...</div>
        } @else if (error()) {
          <app-error-state [message]="error()" (retry)="loadComments()" />
        } @else if (comments().length === 0) {
          <app-empty-state icon="💬" title="No comments yet" description="Be the first to comment" />
        } @else {
          <div class="divide-y divide-secondary-100 dark:divide-secondary-700">
            @for (comment of comments(); track comment.id) {
              <app-comment-item
                [comment]="comment"
                [editable]="isEditable(comment)"
                (delete)="deleteComment(pageId(), $event)"
              />
            }
          </div>
        }

        <div class="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <app-comment-form (submitted)="addComment(pageId(), $event)" />
        </div>
      </div>
    </div>
  `,
})
export class CommentsSectionComponent {
  private commentService = inject(CommentService);
  private authService = inject(AuthService);

  readonly pageId = input.required<string>();

  protected readonly comments = signal<Comment[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Will be loaded when pageId is available via a different mechanism
  }

  protected loadComments(): void {
    if (!this.pageId()) return;
    this.loading.set(true);
    this.error.set(null);
    this.commentService.getComments(this.pageId()).subscribe({
      next: (comments) => { this.comments.set(comments); this.loading.set(false); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  protected addComment(pageId: string, content: string): void {
    this.commentService.addComment(pageId, content).subscribe({
      next: (comment) => {
        this.comments.update(comments => [...comments, comment]);
      },
    });
  }

  protected deleteComment(pageId: string, commentId: string): void {
    this.commentService.deleteComment(pageId, commentId).subscribe({
      next: () => {
        this.comments.update(comments => comments.filter(c => c.id !== commentId));
      },
    });
  }

  protected isEditable(comment: Comment): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === comment.authorId || this.authService.isAdmin();
  }
}
