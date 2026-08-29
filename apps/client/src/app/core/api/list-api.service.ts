import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  IAddMovieToList,
  ICreateList,
  IListDocument,
  IUpdateList,
} from '@src/app/core/models/list.model';
import { environment } from '@src/environments/environment';

const LIST_BASE_URL = `${environment.apiUrl}/lists`;

@Injectable({ providedIn: 'root' })
export class ListApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<IListDocument[]> {
    return this.http.get<IListDocument[]>(LIST_BASE_URL);
  }

  getWatchlist(): Observable<IListDocument> {
    return this.http.get<IListDocument>(`${LIST_BASE_URL}/watchlist`);
  }

  getFavorites(): Observable<IListDocument> {
    return this.http.get<IListDocument>(`${LIST_BASE_URL}/favorites`);
  }

  getById(id: string): Observable<IListDocument> {
    return this.http.get<IListDocument>(`${LIST_BASE_URL}/${id}`);
  }

  create(dto: ICreateList): Observable<IListDocument> {
    return this.http.post<IListDocument>(LIST_BASE_URL, dto);
  }

  update(id: string, dto: IUpdateList): Observable<IListDocument> {
    return this.http.patch<IListDocument>(`${LIST_BASE_URL}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${LIST_BASE_URL}/${id}`);
  }

  addMovie(id: string, dto: IAddMovieToList): Observable<IListDocument> {
    return this.http.post<IListDocument>(`${LIST_BASE_URL}/${id}/movies`, dto);
  }

  removeMovie(id: string, movieId: string): Observable<IListDocument> {
    return this.http.delete<IListDocument>(`${LIST_BASE_URL}/${id}/movies/${movieId}`);
  }
}
