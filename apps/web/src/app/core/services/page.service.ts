import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Page, PageVersion } from '../models';

@Injectable({ providedIn: 'root' })
export class PageService {
  private api = inject(ApiService);

  getPage(id: string): Observable<Page> {
    return this.api.get<Page>(`/pages/${id}`);
  }

  getPageVersions(id: string): Observable<PageVersion[]> {
    return this.api.get<PageVersion[]>(`/pages/${id}/versions`);
  }

  getVersion(id: string, versionId: string): Observable<PageVersion> {
    return this.api.get<PageVersion>(`/pages/${id}/versions/${versionId}`);
  }

  createPage(data: Partial<Page>): Observable<Page> {
    return this.api.post<Page>('/pages', data);
  }

  updatePage(id: string, data: Partial<Page>): Observable<Page> {
    return this.api.put<Page>(`/pages/${id}`, data);
  }

  deletePage(id: string): Observable<void> {
    return this.api.delete<void>(`/pages/${id}`);
  }

  revertToVersion(id: string, versionId: string): Observable<Page> {
    return this.api.post<Page>(`/pages/${id}/revert`, { versionId });
  }

  toggleFavorite(id: string): Observable<{ favorited: boolean }> {
    return this.api.post<{ favorited: boolean }>(`/pages/${id}/favorite`);
  }
}
