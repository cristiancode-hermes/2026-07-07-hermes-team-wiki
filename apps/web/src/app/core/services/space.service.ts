import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Space, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private api = inject(ApiService);

  getSpaces(): Observable<Space[]> {
    return this.api.get<Space[]>('/spaces');
  }

  getSpace(id: string): Observable<Space> {
    return this.api.get<Space>(`/spaces/${id}`);
  }

  getSpacePages(spaceId: string): Observable<Page[]> {
    return this.api.get<Page[]>(`/spaces/${spaceId}/pages`);
  }

  createSpace(data: Partial<Space>): Observable<Space> {
    return this.api.post<Space>('/spaces', data);
  }

  updateSpace(id: string, data: Partial<Space>): Observable<Space> {
    return this.api.put<Space>(`/spaces/${id}`, data);
  }

  deleteSpace(id: string): Observable<void> {
    return this.api.delete<void>(`/spaces/${id}`);
  }
}
