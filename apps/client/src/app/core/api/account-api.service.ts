import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IAccountLogin,
  IBaseAccount,
  IChangePassword,
  ICreateAccount,
  ILoginResponse,
  IUpdateAccount,
} from '@src/app/core/models/account.model';
import { environment } from '@src/environments/environment';

const ACCOUNT_BASE_URL = `${environment.apiUrl}/account`;

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);

  register(dto: ICreateAccount): Observable<void> {
    return this.http.post<void>(`${ACCOUNT_BASE_URL}/register`, dto);
  }

  login(dto: IAccountLogin): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${ACCOUNT_BASE_URL}/login`, dto);
  }

  refresh(refreshToken: string): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${ACCOUNT_BASE_URL}/refresh`, { refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${ACCOUNT_BASE_URL}/logout`, { refreshToken });
  }

  getMe(): Observable<IBaseAccount> {
    return this.http.get<IBaseAccount>(`${ACCOUNT_BASE_URL}/me`);
  }

  updateMe(dto: IUpdateAccount): Observable<IBaseAccount> {
    return this.http.patch<IBaseAccount>(`${ACCOUNT_BASE_URL}/me`, dto);
  }

  changePassword(dto: IChangePassword): Observable<void> {
    return this.http.patch<void>(`${ACCOUNT_BASE_URL}/me/password`, dto);
  }

  deleteMe(): Observable<void> {
    return this.http.delete<void>(`${ACCOUNT_BASE_URL}/me`);
  }
}
