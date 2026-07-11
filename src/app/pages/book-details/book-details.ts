import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { LoanService } from '../../services/loan/loan.service';

@Component({
  selector: 'app-book-details',
  imports: [
    RouterLink
  ],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
})
export class BookDetails {
  private readonly pendingLoanBookIdsKey = 'pendingLoanBookIds';
  private readonly maxPendingLoanBooks = 5;
  private readonly _invalidBookId = signal(false);
  private readonly _pendingLoanError = signal<string | null>(null);

  public readonly currentUser;

  public readonly selectedBook;
  public readonly loading;
  public readonly error;

  public readonly loans;
  public readonly loanLoading;
  public readonly loanError;

  public readonly invalidBookId = this._invalidBookId.asReadonly();
  public readonly pendingLoanError = this._pendingLoanError.asReadonly();

  public readonly hasActiveLoan = computed(() =>
    this.loans().some((loan) => loan.status === 'ACTIVE')
  );

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _bookService: BookService,
    private readonly _loanService: LoanService,
    private readonly _router: Router
  ) {
    this.currentUser = this._authService.currentUser;

    this.selectedBook = this._bookService.selectedBook;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;

    this.loans = this._loanService.loans;
    this.loanLoading = this._loanService.loading;
    this.loanError = this._loanService.error;
  }

  public ngOnInit(): void {
    this.loadBookDetails();
    this.loadActiveLoans();
  }

  public loadBookDetails(): void {
    const bookId = Number(this._activatedRoute.snapshot.paramMap.get('id'));

    if (Number.isNaN(bookId)) {
      this._invalidBookId.set(true);
      return;
    }

    this._invalidBookId.set(false);
    this._bookService.loadBookById(bookId);
  }

  public loadActiveLoans(): void {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    this._loanService.searchLoans({
      userId: user.id,
      status: 'ACTIVE',
    });
  }

  public requestLoan(bookId: number): void {
    const pendingBookIds = this.getPendingLoanBookIds();

    this._pendingLoanError.set(null);

    if (this.hasActiveLoan()) {
      this._pendingLoanError.set(
        'Ya tienes un préstamo activo. Debes devolverlo antes de iniciar una nueva solicitud.'
      );

      return;
    }

    if (pendingBookIds.includes(bookId)) {
      this._router.navigate(['/dashboard/my-loans/new']);
      return;
    }

    if (pendingBookIds.length >= this.maxPendingLoanBooks) {
      this._pendingLoanError.set(
        `No puedes seleccionar más de ${this.maxPendingLoanBooks} libros para un mismo préstamo.`
      );

      return;
    }

    pendingBookIds.push(bookId);

    sessionStorage.setItem(
      this.pendingLoanBookIdsKey,
      JSON.stringify(pendingBookIds)
    );

    this._router.navigate(['/dashboard/my-loans/new']);
  }

  public navigateToMyLoans(): void {
    this._router.navigate(['/dashboard/my-loans']);
  }

  private getPendingLoanBookIds(): number[] {
    const storedBookIds = sessionStorage.getItem(this.pendingLoanBookIdsKey);

    if (!storedBookIds) {
      return [];
    }

    try {
      const parsedBookIds = JSON.parse(storedBookIds);

      if (!Array.isArray(parsedBookIds)) {
        return [];
      }

      return parsedBookIds.filter((bookId) =>
        Number.isInteger(bookId)
      );
    } catch {
      return [];
    }
  }
}