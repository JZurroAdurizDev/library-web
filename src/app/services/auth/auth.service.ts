import { Injectable, signal } from '@angular/core';

import { AuthenticatedUser } from '../../models/auth/authenticated.user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _authenticatedUser =
    signal<AuthenticatedUser | null>(null);

  public readonly currentUser =
    this._authenticatedUser.asReadonly();

  public isLoggedIn(): boolean {
    return this._authenticatedUser() !== null;
  }

  public setAuthenticatedUser(user: AuthenticatedUser): void {
    this._authenticatedUser.set(user);
  }

  public clearAuthenticatedUser(): void {
    this._authenticatedUser.set(null);
  }

  public startSession(user: AuthenticatedUser, expiresIn: number): void {
    this._authenticatedUser.set(user);
    setTimeout(() => {
      this.clearAuthenticatedUser();
    }, expiresIn);
  }
}