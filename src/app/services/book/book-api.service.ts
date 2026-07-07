import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Book } from '../../models/book/book.model';
import { BookRequest } from '../../models/book/book.request.model';
import { BookSearchParams } from '../../models/book/book.search.params.model';
import { PatchBookRequest } from '../../models/book/patch.book.request.model';

@Injectable({
  providedIn: 'root',
})
export class BookApiService {

  private readonly booksUrl: string = `${environment.apiUrl}/books`;

  constructor(private readonly _http: HttpClient) {}

  public getAllBooks(): Observable<Book[]> {
    return this._http.get<Book[]>(this.booksUrl);
  }

  public getBookById(bookId: number): Observable<Book> {
    return this._http.get<Book>(`${this.booksUrl}/${bookId}`);
  }

  public searchBooks(searchParams: BookSearchParams): Observable<Book[]> {
    let queryParams = new HttpParams();

    if (searchParams.title) {
      queryParams = queryParams.set('title', searchParams.title);
    }

    if (searchParams.author) {
      queryParams = queryParams.set('author', searchParams.author);
    }

    if (searchParams.year !== undefined) {
      queryParams = queryParams.set('year', searchParams.year.toString());
    }

    if (searchParams.isbn) {
      queryParams = queryParams.set('isbn', searchParams.isbn);
    }

    if (queryParams.keys().length === 0) {
      return this.getAllBooks();
    }

    return this._http.get<Book[]>(`${this.booksUrl}/search`, {
      params: queryParams,
    });
  }

  public createBook(bookData: BookRequest): Observable<Book> {
    return this._http.post<Book>(this.booksUrl, bookData);
  }

  public updateBook(bookId: number, bookData: BookRequest): Observable<Book> {
    return this._http.put<Book>(`${this.booksUrl}/${bookId}`, bookData);
  }

  public patchBook(bookId: number, bookData: PatchBookRequest): Observable<Book> {
    return this._http.patch<Book>(`${this.booksUrl}/${bookId}`, bookData);
  }

  public deleteBook(bookId: number): Observable<void> {
    return this._http.delete<void>(`${this.booksUrl}/${bookId}`);
  }
}