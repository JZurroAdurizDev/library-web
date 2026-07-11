import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { UserApiService } from './user-api.service';
import { User } from '../../models/user/user.model';
import { UserRequest } from '../../models/user/user.request.model';
import { UserSearchParams } from '../../models/user/user.search.params.model';
import { UpdateUserRequest } from '../../models/user/update.user.request.model';
import { PatchUserRequest } from '../../models/user/patch.user.request.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  private readonly _selectedUser = signal<User | null>(null);
  readonly selectedUser = this._selectedUser.asReadonly();

  private readonly _createdUser = signal<User | null>(null);
  readonly createdUser = this._createdUser.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _updatingUserId = signal<number | null>(null);
  readonly updatingUserId = this._updatingUserId.asReadonly();

  private readonly _deletingUserId = signal<number | null>(null);
  readonly deletingUserId = this._deletingUserId.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _actionError = signal<string | null>(null);
  readonly actionError = this._actionError.asReadonly();

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

  public loadUserById(userId: number): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedUser.set(null);

    this._userApiService.getUserById(userId).subscribe({
      next: (user) => {
        this._selectedUser.set(user);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo cargar el usuario.'));
        this._loading.set(false);
      },
    });
  }

  public createUser(userData: UserRequest): void {
    this._loading.set(true);
    this._error.set(null);
    this._createdUser.set(null);

    this._userApiService.createUser(userData).subscribe({
      next: (createdUser) => {
        this._createdUser.set(createdUser);

        this._users.update((users) => [
          ...users,
          createdUser,
        ]);

        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo crear el usuario.'));
        this._loading.set(false);
      },
    });
  }

  public updateUser(userId: number, userData: UpdateUserRequest): void {
    this._updatingUserId.set(userId);
    this._actionError.set(null);

    this._userApiService.updateUser(userId, userData).subscribe({
      next: (updatedUser) => {
        this.updateUserState(updatedUser);
        this._updatingUserId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el usuario.'));
        this._updatingUserId.set(null);
      },
    });
  }

  public patchUser(userId: number, userData: PatchUserRequest): void {
    this._updatingUserId.set(userId);
    this._actionError.set(null);

    this._userApiService.patchUser(userId, userData).subscribe({
      next: (updatedUser) => {
        this.updateUserState(updatedUser);
        this._updatingUserId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el usuario.'));
        this._updatingUserId.set(null);
      },
    });
  }

  public deleteUser(userId: number): void {
    this._deletingUserId.set(userId);
    this._actionError.set(null);

    this._userApiService.deleteUser(userId).subscribe({
      next: () => {
        this._users.update((users) =>
          users.filter((user) => user.id !== userId)
        );

        if (this.selectedUser()?.id === userId) {
          this._selectedUser.set(null);
        }

        this._deletingUserId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo eliminar el usuario.'));
        this._deletingUserId.set(null);
      },
    });
  }

  public clearSelectedUser(): void {
    this._selectedUser.set(null);
  }

  public clearCreatedUser(): void {
    this._createdUser.set(null);
  }

  public clearActionError(): void {
    this._actionError.set(null);
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
        this._error.set(this.getErrorMessage(err, 'No se pudieron cargar los usuarios.'));
        this._loading.set(false);
      },
    });
  }

  private updateUserState(updatedUser: User): void {
    this._users.update((users) =>
      users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );

    if (this.selectedUser()?.id === updatedUser.id) {
      this._selectedUser.set(updatedUser);
    }
  }

  private getErrorMessage(err: any, fallbackMessage: string): string {
    return err.error?.message ?? err.message ?? fallbackMessage;
  }
}