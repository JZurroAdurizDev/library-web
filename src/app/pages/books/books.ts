import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { BookService } from '../../services/book/book.service';
import { BookSearchParams } from '../../models/book/book.search.params.model';

type BookSearchField = 'title' | 'author' | 'isbn' | 'year';

@Component({
  selector: 'app-books',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books {
  private readonly _currentPage = signal(1);
  private readonly _searchActive = signal(false);
  private readonly _searchError = signal<string | null>(null);

  public readonly currentUser;

  public readonly books;
  public readonly loading;
  public readonly error;

  public readonly currentPage = this._currentPage.asReadonly();
  public readonly searchActive = this._searchActive.asReadonly();
  public readonly searchError = this._searchError.asReadonly();

  public readonly itemsPerPage = 20;

  public readonly isAdmin;

  public readonly searchForm;

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

  public readonly searchSummary = computed(() => {
    if (!this.searchActive()) {
      return 'Mostrando el catálogo completo.';
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
    private readonly _bookService: BookService,
    private readonly _router: Router,
    private readonly _formBuilder: FormBuilder
  ) {
    this.currentUser = this._authService.currentUser;

    this.books = this._bookService.books;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;

    this.searchForm = this._formBuilder.nonNullable.group({
      field: ['title' as BookSearchField],
      value: [''],
    });

    this.isAdmin = computed(() =>
      this.currentUser()?.role === 'ADMIN'
    );
  }

  public ngOnInit(): void {
    this.loadBooks();
  }

  public loadBooks(): void {
    this._currentPage.set(1);
    this._searchActive.set(false);
    this._searchError.set(null);
    this._bookService.loadBooks();
  }

  public searchBooks(): void {
    this._searchError.set(null);

    const formValue = this.searchForm.getRawValue();
    const searchField = formValue.field;
    const searchValue = formValue.value.trim();

    if (!searchValue) {
      this._searchError.set('Introduce un valor de búsqueda.');
      return;
    }

    const searchParams = this.buildSearchParams(searchField, searchValue);

    if (!searchParams) {
      return;
    }

    this._currentPage.set(1);
    this._searchActive.set(true);
    this._bookService.searchBooks(searchParams);
  }

  public clearSearch(): void {
    this.searchForm.setValue({
      field: 'title',
      value: '',
    });

    this.loadBooks();
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

  public navigateToNewBook(): void {
    this._router.navigate(['/dashboard/books/new']);
  }

  private buildSearchParams(
    searchField: BookSearchField,
    searchValue: string
  ): BookSearchParams | null {
    if (searchField === 'title') {
      return {
        title: searchValue,
      };
    }

    if (searchField === 'author') {
      return {
        author: searchValue,
      };
    }

    if (searchField === 'isbn') {
      return {
        isbn: searchValue,
      };
    }

    const publishedYear = Number(searchValue);

    if (!Number.isInteger(publishedYear) || publishedYear < 1) {
      this._searchError.set('Introduce un año de publicación válido.');
      return null;
    }

    return {
      year: publishedYear,
    };
  }
}