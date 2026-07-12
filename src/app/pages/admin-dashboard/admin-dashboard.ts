import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { LoanService } from '../../services/loan/loan.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  public readonly currentUser;

  public readonly books;
  public readonly booksLoading;
  public readonly booksError;

  public readonly loans;
  public readonly loansLoading;
  public readonly loansError;

  public readonly users;
  public readonly usersLoading;
  public readonly usersError;

  public readonly totalBooks;
  public readonly totalLoans;
  public readonly activeLoans;
  public readonly closedLoans;
  public readonly totalUsers;
  public readonly adminUsers;
  public readonly regularUsers;

  public readonly loading;
  public readonly hasError;

  constructor(
    private readonly _authService: AuthService,
    private readonly _bookService: BookService,
    private readonly _loanService: LoanService,
    private readonly _userService: UserService
  ) {
    this.currentUser = this._authService.currentUser;

    this.books = this._bookService.books;
    this.booksLoading = this._bookService.loading;
    this.booksError = this._bookService.error;

    this.loans = this._loanService.loans;
    this.loansLoading = this._loanService.loading;
    this.loansError = this._loanService.error;

    this.users = this._userService.users;
    this.usersLoading = this._userService.loading;
    this.usersError = this._userService.error;

    this.totalBooks = computed(() => this.books().length);
    this.totalLoans = computed(() => this.loans().length);

    this.activeLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'ACTIVE').length
    );

    this.closedLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'CLOSED').length
    );

    this.totalUsers = computed(() => this.users().length);

    this.adminUsers = computed(() =>
      this.users().filter((user) => user.role === 'ADMIN').length
    );

    this.regularUsers = computed(() =>
      this.users().filter((user) => user.role === 'USER').length
    );

    this.loading = computed(() =>
      this.booksLoading() || this.loansLoading() || this.usersLoading()
    );

    this.hasError = computed(() =>
      this.booksError() !== null || this.loansError() !== null || this.usersError() !== null
    );
  }

  public ngOnInit(): void {
    this.loadAdminData();
  }

  public loadAdminData(): void {
    this._bookService.loadBooks();
    this._loanService.loadLoans();
    this._userService.loadUsers();
  }
}