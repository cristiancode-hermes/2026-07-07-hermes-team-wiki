import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats, Activity, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getRecentPages(): Observable<Page[]> {
    return this.api.get<Page[]>('/dashboard/recent');
  }

  getActivity(): Observable<Activity[]> {
    return this.api.get<Activity[]>('/dashboard/activity');
  }
}
