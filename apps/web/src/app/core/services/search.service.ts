import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchResult } from '../models';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = inject(ApiService);

  search(query: string): Observable<SearchResult[]> {
    return this.api.get<SearchResult[]>('/search', { q: query });
  }
}
