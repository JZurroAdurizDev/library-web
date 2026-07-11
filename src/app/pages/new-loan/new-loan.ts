import { Component, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { LoanService } from '../../services/loan/loan.service';
import { LoanRequest } from '../../models/loan/loan.request.model';

@Component({
  selector: 'app-new-loan',
  imports: [],
  templateUrl: './new-loan.html',
  styleUrl: './new-loan.css',
})
export class NewLoan {
  private readonly pendingLoanBookIdsKey = 'pendingLoanBookIds';

  private readonly _selectedBookIds = signal<number[]>([]);
  private readonly _missingUser = signal(false);

  public readonly currentUser;
  public readonly books;
  public readonly loading;
  public readonly error;

  public readonly loans;
  public readonly createdLoan;
  public readonly loanLoading;
  public readonly loanError;

  public readonly selectedBookIds = this._selectedBookIds.asReadonly();
  public readonly missingUser = this._missingUser.asReadonly();

  public readonly selectedBooks = computed(() =>
    this.books().filter((book) =>
      this.selectedBookIds().includes(book.bookId)
    )
  );

  public readonly hasSelectedBooks = computed(() =>
    this.selectedBookIds().length > 0
  );

  public readonly activeLoans = computed(() =>
    this.loans().filter((loan) => loan.status === 'ACTIVE')
  );

  public readonly hasActiveLoan = computed(() =>
    this.activeLoans().length > 0
  );

  public readonly startDate = computed(() => this.getTodayDate());
  public readonly dueDate = computed(() => this.getDueDate());

  constructor(
    private readonly _authService: AuthService,
    private readonly _bookService: BookService,
    private readonly _loanService: LoanService,
    private readonly _router: Router
  ) {
    this.currentUser = this._authService.currentUser;

    this.books = this._bookService.books;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;

    this.loans = this._loanService.loans;
    this.createdLoan = this._loanService.createdLoan;
    this.loanLoading = this._loanService.loading;
    this.loanError = this._loanService.error;

    effect(() => {
      const createdLoan = this.createdLoan();

      if (!createdLoan) {
        return;
      }

      this.clearPendingLoanSelection();
      this._loanService.clearCreatedLoan();
      this._router.navigate(['/dashboard/my-loans']);
    });
  }

  public ngOnInit(): void {
    this.loadPendingLoanSelection();
    this.loadBooks();
    this.loadActiveLoans();
    this._loanService.clearCreatedLoan();
  }

  public loadBooks(): void {
    this._bookService.loadBooks();
  }

  public loadActiveLoans(): void {
    const user = this.currentUser();

    if (!user) {
      this._missingUser.set(true);
      return;
    }

    this._missingUser.set(false);

    this._loanService.searchLoans({
      userId: user.id,
      status: 'ACTIVE',
    });
  }

  public removeSelectedBook(bookId: number): void {
    this._selectedBookIds.update((selectedBookIds) =>
      selectedBookIds.filter((selectedBookId) => selectedBookId !== bookId)
    );

    this.savePendingLoanSelection();
  }

  public createLoan(): void {
    const user = this.currentUser();

    if (!user) {
      this._missingUser.set(true);
      return;
    }

    if (!this.hasSelectedBooks()) {
      return;
    }

    if (this.hasActiveLoan()) {
      return;
    }

    const loanRequest: LoanRequest = {
      userId: user.id,
      startDate: this.startDate(),
      dueDate: this.dueDate(),
      bookIds: this.selectedBookIds(),
    };

    this._missingUser.set(false);
    this._loanService.createLoan(loanRequest);
  }

  public cancel(): void {
    this.clearPendingLoanSelection();
    this._router.navigate(['/dashboard/my-loans']);
  }

  public navigateToMyLoans(): void {
    this._router.navigate(['/dashboard/my-loans']);
  }

  private loadPendingLoanSelection(): void {
    const storedBookIds = sessionStorage.getItem(this.pendingLoanBookIdsKey);

    if (!storedBookIds) {
      this._selectedBookIds.set([]);
      return;
    }

    try {
      const parsedBookIds = JSON.parse(storedBookIds);

      if (!Array.isArray(parsedBookIds)) {
        this._selectedBookIds.set([]);
        return;
      }

      const validBookIds = parsedBookIds.filter((bookId) =>
        Number.isInteger(bookId)
      );

      this._selectedBookIds.set(validBookIds);
    } catch {
      this._selectedBookIds.set([]);
    }
  }

  private savePendingLoanSelection(): void {
    sessionStorage.setItem(
      this.pendingLoanBookIdsKey,
      JSON.stringify(this.selectedBookIds())
    );
  }

  private clearPendingLoanSelection(): void {
    sessionStorage.removeItem(this.pendingLoanBookIdsKey);
    this._selectedBookIds.set([]);
  }

  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  private getDueDate(): string {
    const dueDate = new Date();

    dueDate.setDate(dueDate.getDate() + 30);

    return this.formatDate(dueDate);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}