import { Injectable, computed, inject, signal } from '@angular/core';
import { AccountApiService } from '@src/app/core/api/account-api.service';
import { HistoryApiService } from '@src/app/core/api/history-api.service';
import {
  IBaseAccount,
  ICreateAccount,
  IAccountLogin,
  ILoginResponse,
} from '@src/app/core/models/account.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

const ACCESS_TOKEN_KEY = 'movie-log.accessToken';
const REFRESH_TOKEN_KEY = 'movie-log.refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accountApi = inject(AccountApiService);
  private readonly historyApi = inject(HistoryApiService);

  private readonly currentUserSignal = signal<IBaseAccount | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  register(dto: ICreateAccount): Observable<void> {
    return this.accountApi.register(dto);
  }

  login(dto: IAccountLogin): Observable<void> {
    return this.accountApi.login(dto).pipe(
      tap((tokens) => this.setTokens(tokens)),
      switchMap(() => this.accountApi.getMe()),
      tap((user) => this.currentUserSignal.set(user)),
      map(() => undefined),
    );
  }

  refresh(): Observable<ILoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.accountApi.refresh(refreshToken).pipe(tap((tokens) => this.setTokens(tokens)));
  }

  // Runs at bootstrap to restore a session from a stored refresh token, if any.
  restoreSession(): Observable<void> {
    if (!this.getRefreshToken()) {
      return of(undefined);
    }
    return this.refresh().pipe(
      switchMap(() => this.accountApi.getMe()),
      tap((user) => this.currentUserSignal.set(user)),
      map(() => undefined),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      }),
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    const request$ = refreshToken ? this.accountApi.logout(refreshToken) : of(undefined);
    return request$.pipe(
      catchError(() => of(undefined)),
      tap(() => this.clearSession()),
    );
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.historyApi.clearCache();
  }

  // Lets the profile page sync the header/username display after a successful self-service update.
  setCurrentUser(user: IBaseAccount): void {
    this.currentUserSignal.set(user);
  }

  private setTokens(tokens: ILoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}
