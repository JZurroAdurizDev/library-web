import { Component, Signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthenticatedUser } from '../../models/authenticated.user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  public readonly currentUser: Signal<AuthenticatedUser | null>;

  constructor(
    private readonly _authService: AuthService
  ) {
    this.currentUser = this._authService.currentUser;
  }
}