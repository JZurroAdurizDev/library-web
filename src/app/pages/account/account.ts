import { HttpErrorResponse } from '@angular/common/http';
import {
  Component, Signal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthenticatedUser } from '../../models/auth/authenticated.user.model';
import { AuthApiService } from '../../services/auth/auth-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [
    RouterLink
  ],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {

  public readonly currentUser: Signal<AuthenticatedUser | null>;

  public readonly loading = signal<boolean>(false);

  public readonly errorMessage = signal<string>('');

  constructor(
    private readonly _authApiService: AuthApiService,
    private readonly _authService: AuthService,
    private readonly _router: Router
  ) {
    this.currentUser = this._authService.currentUser;
  }

  /**
   * Starts the logout process.
   */
  public onLogout(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.logoutUser();
  }

  /**
   * Sends the logout request to Library API.
   */
  private logoutUser(): void {
    this._authApiService.logout().subscribe({
      next: () => {
        this.finishLogout();
      },
      error: (error: HttpErrorResponse) => {
        this.handleLogoutError(error);
      }
    });
  }

  /**
   * Clears the local authentication state and returns to the home page.
   */
  private finishLogout(): void {
    this._authService.clearAuthenticatedUser();
    this.loading.set(false);

    this._router.navigate(['/']);
  }

  /**
   * Handles errors produced during logout.
   */
  private handleLogoutError(error: HttpErrorResponse): void {
    this.loading.set(false);

    this.errorMessage.set(
      'No se pudo cerrar la sesión. Inténtalo de nuevo.'
    );

    console.error(error);
  }
}