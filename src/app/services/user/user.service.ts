import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { UserApiService } from './user-api.service';
import { User } from '../../models/user/user.model';
import { UserSearchParams } from '../../models/user/user.search.params.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  constructor(private readonly _userApiService: UserApiService) {}

  public loadUsers(): void {
    this.handleUsersRequest(
      this._userApiService.getAllUsers()
    );
  }

  public searchUsers(searchParams: UserSearchParams): void {
    this.handleUsersRequest(
      this._userApiService.searchUsers(searchParams)
    );
  }

  private handleUsersRequest(usersRequest$: Observable<User[]>): void {
    this._loading.set(true);
    this._error.set(null);

    usersRequest$.subscribe({
      next: (users) => {
        this._users.set(users);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.message);
        this._loading.set(false);
      },
    });
  }
}