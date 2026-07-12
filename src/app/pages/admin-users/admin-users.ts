import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { User, UserRole } from '../../models/user/user.model';
import { UserSearchParams } from '../../models/user/user.search.params.model';

type UserSearchField = 'dni' | 'firstName' | 'lastName' | 'email';

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
  private readonly _searchActive = signal(false);
  private readonly _searchError = signal<string | null>(null);
  private readonly _currentPage = signal(1);

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
  public readonly searchActive = this._searchActive.asReadonly();
  public readonly searchError = this._searchError.asReadonly();
  public readonly currentPage = this._currentPage.asReadonly();

  public readonly itemsPerPage = 10;

  public readonly userForm;
  public readonly searchForm;

  public readonly totalUsers;
  public readonly adminUsers;
  public readonly regularUsers;
  public readonly totalPages;
  public readonly paginatedUsers;

  public readonly hasUsers = computed(() =>
    this.users().length > 0
  );

  public readonly searchSummary = computed(() => {
    if (!this.searchActive()) {
      return 'Mostrando todos los usuarios registrados.';
    }

    const formValue = this.searchForm.getRawValue();
    const searchValue = formValue.value.trim();

    if (!searchValue) {
      return 'Mostrando resultados de búsqueda.';
    }

    return `Mostrando resultados para "${searchValue}".`;
  });

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

    this.searchForm = this._formBuilder.nonNullable.group({
      field: ['email' as UserSearchField],
      value: [''],
    });

    this.totalUsers = computed(() =>
      this.users().length
    );

    this.adminUsers = computed(() =>
      this.users().filter((user) => user.role === 'ADMIN').length
    );

    this.regularUsers = computed(() =>
      this.users().filter((user) => user.role === 'USER').length
    );

    this.totalPages = computed(() => {
      const totalUsers = this.users().length;

      if (totalUsers === 0) {
        return 1;
      }

      return Math.ceil(totalUsers / this.itemsPerPage);
    });

    this.paginatedUsers = computed(() => {
      const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;

      return this.users().slice(startIndex, endIndex);
    });
  }

  public ngOnInit(): void {
    this._userService.clearActionError();
    this.loadUsers();
  }

  public loadUsers(): void {
    this._currentPage.set(1);
    this._searchActive.set(false);
    this._searchError.set(null);
    this._selectedUserToEdit.set(null);
    this._selectedUserToDelete.set(null);
    this._userService.loadUsers();
  }

  public searchUsers(): void {
    this._searchError.set(null);
    this._selectedUserToEdit.set(null);
    this._selectedUserToDelete.set(null);

    const formValue = this.searchForm.getRawValue();
    const searchField = formValue.field;
    const searchValue = formValue.value.trim();

    if (!searchValue) {
      this._searchError.set('Introduce un valor de búsqueda.');
      return;
    }

    const searchParams = this.buildSearchParams(searchField, searchValue);

    this._currentPage.set(1);
    this._searchActive.set(true);
    this._userService.searchUsers(searchParams);
  }

  public clearSearch(): void {
    this.searchForm.setValue({
      field: 'email',
      value: '',
    });

    this.loadUsers();
  }

  public previousPage(): void {
    if (this.currentPage() === 1) {
      return;
    }

    this._currentPage.update((currentPage) => currentPage - 1);
  }

  public nextPage(): void {
    if (this.currentPage() === this.totalPages()) {
      return;
    }

    this._currentPage.update((currentPage) => currentPage + 1);
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

  private buildSearchParams(
    searchField: UserSearchField,
    searchValue: string
  ): UserSearchParams {
    if (searchField === 'dni') {
      return {
        dni: searchValue,
      };
    }

    if (searchField === 'firstName') {
      return {
        firstName: searchValue,
      };
    }

    if (searchField === 'lastName') {
      return {
        lastName: searchValue,
      };
    }

    return {
      email: searchValue,
    };
  }
}