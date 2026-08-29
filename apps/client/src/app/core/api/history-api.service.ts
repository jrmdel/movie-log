import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  ESortOrder,
  ICreateHistory,
  IHistoryDocument,
  IHistoryQuery,
  IHistoryWithMovie,
  IUpdateHistory,
} from '@src/app/core/models/history.model';
import { environment } from '@src/environments/environment';
import { IMovieDocument } from '@src/app/core/models/movie.model';

const HISTORY_BASE_URL = `${environment.apiUrl}/history`;
const RECENTLY_WATCHED_LIMIT = 5;

@Injectable({ providedIn: 'root' })
export class HistoryApiService {
  private readonly http = inject(HttpClient);

  readonly recentlyWatched = signal<IMovieDocument[]>([]);
  readonly isInitialized = signal<boolean>(false);

  clearCache(): void {
    this.recentlyWatched.set([]);
    this.isInitialized.set(false);
  }

  fetchRecentlyWatched(): Observable<IMovieDocument[]> {
    return this.getAllWithMovies({
      limit: RECENTLY_WATCHED_LIMIT,
      sortOrder: ESortOrder.DESC,
    }).pipe(
      map((entries) => entries.map((entry) => entry.movie)),
      tap((movies) => {
        this.recentlyWatched.set(movies);
        this.isInitialized.set(true);
      }),
    );
  }

  getAll(query?: IHistoryQuery): Observable<IHistoryDocument[]> {
    return this.http.get<IHistoryDocument[]>(HISTORY_BASE_URL, {
      params: this.buildQueryParams(query),
    });
  }

  // Returns each entry with its movie embedded, avoiding a follow-up bulk movie fetch.
  getAllWithMovies(query?: IHistoryQuery): Observable<IHistoryWithMovie[]> {
    return this.http.get<IHistoryWithMovie[]>(`${HISTORY_BASE_URL}/movies`, {
      params: this.buildQueryParams(query),
    });
  }

  getById(id: string): Observable<IHistoryDocument> {
    return this.http.get<IHistoryDocument>(`${HISTORY_BASE_URL}/${id}`);
  }

  create(dto: ICreateHistory): Observable<IHistoryDocument> {
    return this.http.post<IHistoryDocument>(HISTORY_BASE_URL, dto);
  }

  update(id: string, dto: IUpdateHistory): Observable<IHistoryDocument> {
    return this.http.patch<IHistoryDocument>(`${HISTORY_BASE_URL}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${HISTORY_BASE_URL}/${id}`);
  }

  private buildQueryParams(query?: IHistoryQuery): HttpParams {
    let params = new HttpParams();
    if (query?.movieId) {
      params = params.set('movieId', query.movieId);
    }
    if (query?.limit !== undefined) {
      params = params.set('limit', query.limit);
    }
    if (query?.skip !== undefined) {
      params = params.set('skip', query.skip);
    }
    if (query?.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }
    return params;
  }
}
