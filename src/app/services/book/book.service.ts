import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { BookApiService } from './book-api.service';
import { Book } from '../../models/book/book.model';
import { BookSearchParams } from '../../models/book/book.search.params.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  
  private readonly _books = signal<Book[]>([]);
  readonly books = this._books.asReadonly();

  private readonly _selectedBook = signal<Book | null>(null);
  readonly selectedBook = this._selectedBook.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

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
        this._error.set(err.message);
        this._loading.set(false);
      },
    });
  }

  public clearSelectedBook(): void {
    this._selectedBook.set(null);
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
        this._error.set(err.message);
        this._loading.set(false);
      },
    });
  }
}