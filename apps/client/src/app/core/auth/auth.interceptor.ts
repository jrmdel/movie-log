import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@src/app/core/auth/auth.service';
import { environment } from '@src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';

// Shared across requests so concurrent 401s trigger a single refresh call.
let refreshInProgress$: Observable<void> | null = null;

function refreshSession(authService: AuthService): Observable<void> {
  refreshInProgress$ ??= authService.refresh().pipe(
    map(() => undefined),
    finalize(() => {
      refreshInProgress$ = null;
    }),
    shareReplay(1),
  );
  return refreshInProgress$;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const isAuthEndpoint = ['/account/login', '/account/register', '/account/refresh'].some((path) =>
    req.url.includes(path),
  );

  const accessToken = authService.getAccessToken();
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return refreshSession(authService).pipe(
        switchMap(() => {
          const retriedToken = authService.getAccessToken();
          const retryReq = retriedToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${retriedToken}` } })
            : req;
          return next(retryReq);
        }),
        catchError((refreshError: unknown) => {
          authService.clearSession();
          void router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
