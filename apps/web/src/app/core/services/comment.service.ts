import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Comment } from '../models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = inject(ApiService);

  getComments(pageId: string): Observable<Comment[]> {
    return this.api.get<Comment[]>(`/pages/${pageId}/comments`);
  }

  addComment(pageId: string, content: string): Observable<Comment> {
    return this.api.post<Comment>(`/pages/${pageId}/comments`, { content });
  }

  updateComment(pageId: string, commentId: string, content: string): Observable<Comment> {
    return this.api.put<Comment>(`/pages/${pageId}/comments/${commentId}`, { content });
  }

  deleteComment(pageId: string, commentId: string): Observable<void> {
    return this.api.delete<void>(`/pages/${pageId}/comments/${commentId}`);
  }
}
