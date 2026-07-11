import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { LoanService } from '../../services/loan/loan.service';
import { Book } from '../../models/book/book.model';
import { BookRequest } from '../../models/book/book.request.model';

@Component({
  selector: 'app-book-details',
  imports: [
    ReactiveFormsModule,
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
  private readonly _editingBook = signal(false);
  private readonly _selectedBookToDelete = signal<Book | null>(null);

  public readonly currentUser;

  public readonly selectedBook;
  public readonly loading;
  public readonly error;
  public readonly updatingBookId;
  public readonly deletingBookId;
  public readonly actionError;

  public readonly loans;
  public readonly loanLoading;
  public readonly loanError;

  public readonly invalidBookId = this._invalidBookId.asReadonly();
  public readonly pendingLoanError = this._pendingLoanError.asReadonly();
  public readonly editingBook = this._editingBook.asReadonly();
  public readonly selectedBookToDelete = this._selectedBookToDelete.asReadonly();

  public readonly bookForm;

  public readonly isAdmin;

  public readonly hasActiveLoan = computed(() =>
    this.loans().some((loan) => loan.status === 'ACTIVE')
  );

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _authService: AuthService,
    private readonly _bookService: BookService,
    private readonly _loanService: LoanService,
    private readonly _router: Router,
    private readonly _formBuilder: FormBuilder
  ) {
    this.currentUser = this._authService.currentUser;

    this.selectedBook = this._bookService.selectedBook;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;
    this.updatingBookId = this._bookService.updatingBookId;
    this.deletingBookId = this._bookService.deletingBookId;
    this.actionError = this._bookService.actionError;

    this.loans = this._loanService.loans;
    this.loanLoading = this._loanService.loading;
    this.loanError = this._loanService.error;

    this.isAdmin = computed(() =>
      this.currentUser()?.role === 'ADMIN'
    );

    this.bookForm = this._formBuilder.nonNullable.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      isbn: ['', [Validators.required]],
      publishedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1)]],
      pages: [1, [Validators.required, Validators.min(1)]],
    });
  }

  public ngOnInit(): void {
    this._bookService.clearActionError();
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

  public startBookEdition(book: Book): void {
    this._bookService.clearActionError();
    this._selectedBookToDelete.set(null);

    this.bookForm.setValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      pages: book.pages,
    });

    this._editingBook.set(true);
  }

  public cancelBookEdition(): void {
    this._editingBook.set(false);
    this.bookForm.reset();
  }

  public updateBook(bookId: number): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookForm.getRawValue();

    const bookRequest: BookRequest = {
      title: formValue.title.trim(),
      author: formValue.author.trim(),
      isbn: formValue.isbn.trim(),
      publishedYear: formValue.publishedYear,
      pages: formValue.pages,
    };

    this._bookService.updateBook(bookId, bookRequest);
    this._editingBook.set(false);
  }

  public requestBookDeletion(book: Book): void {
    this._bookService.clearActionError();
    this._editingBook.set(false);
    this._selectedBookToDelete.set(book);
  }

  public cancelBookDeletion(): void {
    this._selectedBookToDelete.set(null);
  }

  public confirmBookDeletion(bookId: number): void {
    this._bookService.deleteBook(bookId);
    this._selectedBookToDelete.set(null);
  }

  public hasFieldError(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);

    return !!field && field.invalid && field.touched;
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