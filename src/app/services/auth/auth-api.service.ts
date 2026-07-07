import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AuthResponse } from '../../models/auth/auth.response.model';
import { AuthenticatedUser } from '../../models/auth/authenticated.user.model';
import { Login } from '../../models/auth/login.model';
import { Logout } from '../../models/auth/logout.model';
import { Register } from '../../models/auth/register.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private readonly authUrl: string = `${environment.apiUrl}/auth`;
  private readonly usersUrl: string = `${environment.apiUrl}/users`;

  constructor(private readonly _http: HttpClient) {}

  public login(loginData: Login): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(
      `${this.authUrl}/login`,
      loginData
    );
  }

  public register(registerData: Register): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(
      `${this.authUrl}/register`,
      registerData
    );
  }

  public authenticatedUser(): Observable<AuthenticatedUser> {
    return this._http.get<AuthenticatedUser>(
      `${this.usersUrl}/me`
    );
  }

  public logout(): Observable<Logout> {
    return this._http.post<Logout>(
      `${this.authUrl}/logout`,
      {}
    );
  }
}