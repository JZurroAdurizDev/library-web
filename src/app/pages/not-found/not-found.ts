import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  public readonly currentUser;

  constructor(private readonly _authService: AuthService) {
    this.currentUser = this._authService.currentUser;
  }

  public getHomePath(): string {
    if (this._authService.isLoggedIn()) {
      return '/dashboard';
    }

    return '/home';
  }

  public getHomeText(): string {
    if (this._authService.isLoggedIn()) {
      return 'panel principal';
    }

    return 'página de inicio';
  }
}