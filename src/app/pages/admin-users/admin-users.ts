import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { User, UserRole } from '../../models/user/user.model';

@Component({
  selector: 'app-admin-users',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {
  private readonly _selectedUserToEdit = signal<User | null>(null);
  private readonly _selectedUserToDelete = signal<User | null>(null);
  private readonly _formError = signal<string | null>(null);

  public readonly currentUser;

  public readonly users;
  public readonly loading;
  public readonly error;
  public readonly updatingUserId;
  public readonly deletingUserId;
  public readonly actionError;

  public readonly selectedUserToEdit = this._selectedUserToEdit.asReadonly();
  public readonly selectedUserToDelete = this._selectedUserToDelete.asReadonly();
  public readonly formError = this._formError.asReadonly();

  public readonly userForm;

  public readonly totalUsers;
  public readonly adminUsers;
  public readonly regularUsers;

  public readonly hasUsers = computed(() =>
    this.users().length > 0
  );

  constructor(
    private readonly _authService: AuthService,
    private readonly _userService: UserService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.currentUser = this._authService.currentUser;

    this.users = this._userService.users;
    this.loading = this._userService.loading;
    this.error = this._userService.error;
    this.updatingUserId = this._userService.updatingUserId;
    this.deletingUserId = this._userService.deletingUserId;
    this.actionError = this._userService.actionError;

    this.userForm = this._formBuilder.nonNullable.group({
      dni: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.totalUsers = computed(() => this.users().length);

    this.adminUsers = computed(() =>
      this.users().filter((user) => user.role === 'ADMIN').length
    );

    this.regularUsers = computed(() =>
      this.users().filter((user) => user.role === 'USER').length
    );
  }

  public ngOnInit(): void {
    this._userService.clearActionError();
    this.loadUsers();
  }

  public loadUsers(): void {
    this._userService.loadUsers();
  }

  public startUserEdition(user: User): void {
    this._userService.clearActionError();
    this._formError.set(null);
    this._selectedUserToDelete.set(null);

    this.userForm.setValue({
      dni: user.dni,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    this._selectedUserToEdit.set(user);
  }

  public cancelUserEdition(): void {
    this._selectedUserToEdit.set(null);
    this._formError.set(null);
    this.userForm.reset();
  }

  public updateUser(userId: number): void {
    this._formError.set(null);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this._formError.set('Completa todos los campos correctamente antes de guardar los cambios.');
      return;
    }

    const formValue = this.userForm.getRawValue();

    this._userService.patchUser(userId, {
      dni: formValue.dni.trim(),
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
    });

    this._selectedUserToEdit.set(null);
    this.userForm.reset();
  }

  public requestUserDeletion(user: User): void {
    this._userService.clearActionError();
    this._formError.set(null);
    this._selectedUserToEdit.set(null);
    this._selectedUserToDelete.set(user);
  }

  public cancelUserDeletion(): void {
    this._selectedUserToDelete.set(null);
  }

  public confirmUserDeletion(userId: number): void {
    if (this.isCurrentUser(userId)) {
      this._formError.set('No puedes eliminar tu propio usuario desde esta pantalla.');
      this._selectedUserToDelete.set(null);
      return;
    }

    this._userService.deleteUser(userId);
    this._selectedUserToDelete.set(null);
  }

  public isCurrentUser(userId: number): boolean {
    return this.currentUser()?.id === userId;
  }

  public hasFieldError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);

    return !!field && field.invalid && field.touched;
  }

  public getUserRoleText(role: UserRole): string {
    if (role === 'ADMIN') {
      return 'Administrador';
    }

    return 'Usuario';
  }
}