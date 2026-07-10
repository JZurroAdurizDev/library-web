import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookService } from '../../services/book/book.service';

@Component({
  selector: 'app-books',
  imports: [
    RouterLink
  ],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books {
  private readonly _currentPage = signal(1);

  public readonly books;
  public readonly loading;
  public readonly error;

  public readonly currentPage = this._currentPage.asReadonly();
  public readonly itemsPerPage = 20;

  public readonly totalPages = computed(() => {
    const totalBooks = this.books().length;

    if (totalBooks === 0) {
      return 1;
    }

    return Math.ceil(totalBooks / this.itemsPerPage);
  });

  public readonly paginatedBooks = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.books().slice(startIndex, endIndex);
  });

  constructor(private readonly _bookService: BookService) {
    this.books = this._bookService.books;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  public loadBooks(): void {
    this._currentPage.set(1);
    this._bookService.loadBooks();
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
}