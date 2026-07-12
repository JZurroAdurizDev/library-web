import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { BookApiService } from './book-api.service';
import { Book } from '../../models/book/book.model';
import { BookRequest } from '../../models/book/book.request.model';
import { BookSearchParams } from '../../models/book/book.search.params.model';
import { PatchBookRequest } from '../../models/book/patch.book.request.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  
  private readonly _books = signal<Book[]>([]);
  readonly books = this._books.asReadonly();

  private readonly _selectedBook = signal<Book | null>(null);
  readonly selectedBook = this._selectedBook.asReadonly();

  private readonly _createdBook = signal<Book | null>(null);
  readonly createdBook = this._createdBook.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _updatingBookId = signal<number | null>(null);
  readonly updatingBookId = this._updatingBookId.asReadonly();

  private readonly _deletingBookId = signal<number | null>(null);
  readonly deletingBookId = this._deletingBookId.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _actionError = signal<string | null>(null);
  readonly actionError = this._actionError.asReadonly();

  constructor(private readonly _bookApiService: BookApiService) {}

  public loadBooks(): void {
    this.handleBooksRequest(
      this._bookApiService.getAllBooks()
    );
  }

  public searchBooks(searchParams: BookSearchParams): void {
    this.handleBooksRequest(
      this._bookApiService.searchBooks(searchParams)
    );
  }

  public loadBookById(bookId: number): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedBook.set(null);

    this._bookApiService.getBookById(bookId).subscribe({
      next: (book) => {
        this._selectedBook.set(book);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo cargar el libro.'));
        this._loading.set(false);
      },
    });
  }

  public createBook(bookData: BookRequest): void {
    this._loading.set(true);
    this._error.set(null);
    this._createdBook.set(null);

    this._bookApiService.createBook(bookData).subscribe({
      next: (createdBook) => {
        this._createdBook.set(createdBook);

        this._books.update((books) => [
          ...books,
          createdBook,
        ]);

        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo crear el libro.'));
        this._loading.set(false);
      },
    });
  }

  public updateBook(bookId: number, bookData: BookRequest): void {
    this._updatingBookId.set(bookId);
    this._actionError.set(null);

    this._bookApiService.updateBook(bookId, bookData).subscribe({
      next: (updatedBook) => {
        this.updateBookState(updatedBook);
        this._updatingBookId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el libro.'));
        this._updatingBookId.set(null);
      },
    });
  }

  public patchBook(bookId: number, bookData: PatchBookRequest): void {
    this._updatingBookId.set(bookId);
    this._actionError.set(null);

    this._bookApiService.patchBook(bookId, bookData).subscribe({
      next: (updatedBook) => {
        this.updateBookState(updatedBook);
        this._updatingBookId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el libro.'));
        this._updatingBookId.set(null);
      },
    });
  }

  public deleteBook(bookId: number): void {
    this._deletingBookId.set(bookId);
    this._actionError.set(null);

    this._bookApiService.deleteBook(bookId).subscribe({
      next: () => {
        this._books.update((books) =>
          books.filter((book) => book.bookId !== bookId)
        );

        if (this.selectedBook()?.bookId === bookId) {
          this._selectedBook.set(null);
        }

        this._deletingBookId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo eliminar el libro.'));
        this._deletingBookId.set(null);
      },
    });
  }

  public clearSelectedBook(): void {
    this._selectedBook.set(null);
  }

  public clearCreatedBook(): void {
    this._createdBook.set(null);
  }

  public clearActionError(): void {
    this._actionError.set(null);
  }

  private handleBooksRequest(booksRequest$: Observable<Book[]>): void {
    this._loading.set(true);
    this._error.set(null);

    booksRequest$.subscribe({
      next: (books) => {
        this._books.set(books);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudieron cargar los libros.'));
        this._loading.set(false);
      },
    });
  }

  private updateBookState(updatedBook: Book): void {
    this._books.update((books) =>
      books.map((book) =>
        book.bookId === updatedBook.bookId ? updatedBook : book
      )
    );

    if (this.selectedBook()?.bookId === updatedBook.bookId) {
      this._selectedBook.set(updatedBook);
    }
  }

  private getErrorMessage(err: any, fallbackMessage: string): string {
    return err.error?.message ?? err.message ?? fallbackMessage;
  }
}