import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { BookService } from '../../services/book/book.service';

@Component({
  selector: 'app-book-details',
  imports: [
    RouterLink
  ],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
})
export class BookDetails {
  private readonly _invalidBookId = signal(false);

  public readonly selectedBook;
  public readonly loading;
  public readonly error;
  public readonly invalidBookId = this._invalidBookId.asReadonly();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _bookService: BookService
  ) {
    this.selectedBook = this._bookService.selectedBook;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;

    this.loadBookDetails();
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
}