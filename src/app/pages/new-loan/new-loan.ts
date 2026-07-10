import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { LoanService } from '../../services/loan/loan.service';
import { Book } from '../../models/book/book.model';
import { LoanRequest } from '../../models/loan/loan.request.model';

@Component({
  selector: 'app-new-loan',
  imports: [],
  templateUrl: './new-loan.html',
  styleUrl: './new-loan.css',
})
export class NewLoan {
  private readonly _selectedBooks = signal<Book[]>([]);
  private readonly _missingUser = signal(false);
  private readonly _creatingLoan = signal(false);
  private readonly _creationError = signal<string | null>(null);

  public readonly currentUser;
  public readonly books;
  public readonly loading;
  public readonly error;

  public readonly selectedBooks = this._selectedBooks.asReadonly();
  public readonly missingUser = this._missingUser.asReadonly();
  public readonly creatingLoan = this._creatingLoan.asReadonly();
  public readonly creationError = this._creationError.asReadonly();

  public readonly selectedBookIds = computed(() =>
    this.selectedBooks().map((book) => book.bookId)
  );

  public readonly hasSelectedBooks = computed(() =>
    this.selectedBooks().length > 0
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
  }

  public ngOnInit(): void {
    this.loadBooks();
  }

  public loadBooks(): void {
    this._bookService.loadBooks();
  }

  public isBookSelected(bookId: number): boolean {
    return this.selectedBookIds().includes(bookId);
  }

  public toggleBookSelection(book: Book): void {
    if (this.isBookSelected(book.bookId)) {
      this.removeSelectedBook(book.bookId);
      return;
    }

    this._selectedBooks.update((selectedBooks) => [
      ...selectedBooks,
      book,
    ]);
  }

  public removeSelectedBook(bookId: number): void {
    this._selectedBooks.update((selectedBooks) =>
      selectedBooks.filter((book) => book.bookId !== bookId)
    );
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

    const loanRequest: LoanRequest = {
      userId: user.id,
      startDate: this.startDate(),
      dueDate: this.dueDate(),
      bookIds: this.selectedBookIds(),
    };

    this._creatingLoan.set(true);
    this._creationError.set(null);
    this._missingUser.set(false);

    this._loanService.createLoan(loanRequest).subscribe({
      next: () => {
        this._creatingLoan.set(false);
        this._router.navigate(['/dashboard/my-loans']);
      },
      error: (err) => {
        this._creationError.set(err.message);
        this._creatingLoan.set(false);
      },
    });
  }

  public cancel(): void {
    this._router.navigate(['/dashboard/my-loans']);
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