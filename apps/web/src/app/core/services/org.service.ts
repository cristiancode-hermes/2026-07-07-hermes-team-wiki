import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Organization } from '../models';

@Injectable({ providedIn: 'root' })
export class OrgService {
  private api = inject(ApiService);

  getMembers(): Observable<User[]> {
    return this.api.get<User[]>('/org/members');
  }

  updateMemberRole(userId: string, role: string): Observable<User> {
    return this.api.put<User>(`/org/members/${userId}`, { role });
  }

  removeMember(userId: string): Observable<void> {
    return this.api.delete<void>(`/org/members/${userId}`);
  }

  getOrg(): Observable<Organization> {
    return this.api.get<Organization>('/org');
  }

  updateOrg(data: Partial<Organization>): Observable<Organization> {
    return this.api.put<Organization>('/org', data);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/auth/profile', data);
  }
}
