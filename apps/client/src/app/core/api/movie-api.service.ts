import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';

import { IMovie, IMovieDocument } from '@src/app/core/models/movie.model';
import { environment } from '@src/environments/environment';

const MOVIE_BASE_URL = `${environment.apiUrl}/movies`;

@Injectable({ providedIn: 'root' })
export class MovieApiService {
  private readonly http = inject(HttpClient);

  search(query: string, limit?: number): Observable<IMovie[]> {
    return this.http.get<IMovie[]>(`${MOVIE_BASE_URL}/search`, {
      params: limit ? { query, limit } : { query },
    });
  }

  getById(id: string): Observable<IMovieDocument> {
    return this.http.get<IMovieDocument>(`${MOVIE_BASE_URL}/${id}`);
  }

  // No batch endpoint server-side; resolves each id individually (fine for the small lists this app expects).
  getManyById(ids: string[]): Observable<IMovieDocument[]> {
    if (ids.length === 0) {
      return of([]);
    }
    return forkJoin(ids.map((id) => this.getById(id)));
  }
}
