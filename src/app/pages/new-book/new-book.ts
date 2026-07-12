import { Component, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BookService } from '../../services/book/book.service';
import { BookRequest } from '../../models/book/book.request.model';

@Component({
  selector: 'app-new-book',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './new-book.html',
  styleUrl: './new-book.css',
})
export class NewBook {
  public readonly createdBook;
  public readonly loading;
  public readonly error;

  public readonly bookForm;

  constructor(
    private readonly _bookService: BookService,
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router
  ) {
    this.createdBook = this._bookService.createdBook;
    this.loading = this._bookService.loading;
    this.error = this._bookService.error;

    this.bookForm = this._formBuilder.nonNullable.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      isbn: ['', [Validators.required]],
      publishedYear: [new Date().getFullYear(), [Validators.required, Validators.min(1)]],
      pages: [1, [Validators.required, Validators.min(1)]],
    });

    effect(() => {
      const createdBook = this.createdBook();

      if (!createdBook) {
        return;
      }

      this._bookService.clearCreatedBook();
      this._router.navigate(['/dashboard/books', createdBook.bookId]);
    });
  }

  public ngOnInit(): void {
    this._bookService.clearCreatedBook();
  }

  public createBook(): void {
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

    this._bookService.createBook(bookRequest);
  }

  public cancel(): void {
    this._router.navigate(['/dashboard/books']);
  }

  public hasFieldError(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);

    return !!field && field.invalid && field.touched;
  }
}