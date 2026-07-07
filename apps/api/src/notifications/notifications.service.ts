import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface WikiNotification {
  type: 'page_created' | 'page_updated' | 'page_deleted' | 'comment_added';
  organizationId: string;
  pageId: string;
  pageTitle: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private subjects = new Map<string, Subject<WikiNotification>>();

  private getSubject(organizationId: string): Subject<WikiNotification> {
    if (!this.subjects.has(organizationId)) {
      this.subjects.set(organizationId, new Subject<WikiNotification>());
    }
    return this.subjects.get(organizationId)!;
  }

  emit(notification: WikiNotification) {
    const subject = this.getSubject(notification.organizationId);
    subject.next(notification);
  }

  getStream(organizationId: string): Observable<WikiNotification> {
    return this.getSubject(organizationId).asObservable();
  }
}
