import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LoanService } from '../../services/loan/loan.service';
import { Loan } from '../../models/loan/loan.model';

@Component({
  selector: 'app-admin-loans',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-loans.html',
  styleUrl: './admin-loans.css',
})
export class AdminLoans {
  private readonly _selectedLoanToEdit = signal<Loan | null>(null);
  private readonly _selectedLoanToDelete = signal<Loan | null>(null);
  private readonly _formError = signal<string | null>(null);

  public readonly loans;
  public readonly loading;
  public readonly error;
  public readonly updatingLoanId;
  public readonly deletingLoanId;
  public readonly actionError;

  public readonly selectedLoanToEdit = this._selectedLoanToEdit.asReadonly();
  public readonly selectedLoanToDelete = this._selectedLoanToDelete.asReadonly();
  public readonly formError = this._formError.asReadonly();

  public readonly loanForm;

  public readonly totalLoans;
  public readonly activeLoans;
  public readonly closedLoans;

  public readonly hasLoans = computed(() =>
    this.loans().length > 0
  );

  constructor(
    private readonly _loanService: LoanService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.loans = this._loanService.loans;
    this.loading = this._loanService.loading;
    this.error = this._loanService.error;
    this.updatingLoanId = this._loanService.updatingLoanId;
    this.deletingLoanId = this._loanService.deletingLoanId;
    this.actionError = this._loanService.actionError;

    this.loanForm = this._formBuilder.nonNullable.group({
      startDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
    });

    this.totalLoans = computed(() => this.loans().length);

    this.activeLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'ACTIVE').length
    );

    this.closedLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'CLOSED').length
    );
  }

  public ngOnInit(): void {
    this._loanService.clearActionError();
    this.loadLoans();
  }

  public loadLoans(): void {
    this._loanService.loadLoans();
  }

  public startLoanEdition(loan: Loan): void {
    this._loanService.clearActionError();
    this._formError.set(null);
    this._selectedLoanToDelete.set(null);

    this.loanForm.setValue({
      startDate: loan.startDate,
      dueDate: loan.dueDate,
    });

    this._selectedLoanToEdit.set(loan);
  }

  public cancelLoanEdition(): void {
    this._selectedLoanToEdit.set(null);
    this._formError.set(null);
    this.loanForm.reset();
  }

  public updateLoanDates(loanId: number): void {
    this._formError.set(null);

    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      this._formError.set('Completa las fechas correctamente antes de guardar los cambios.');
      return;
    }

    const formValue = this.loanForm.getRawValue();

    if (formValue.dueDate < formValue.startDate) {
      this._formError.set('La fecha de devolución no puede ser anterior a la fecha de inicio.');
      return;
    }

    this._loanService.patchLoan(loanId, {
      startDate: formValue.startDate,
      dueDate: formValue.dueDate,
    });

    this._selectedLoanToEdit.set(null);
    this.loanForm.reset();
  }

  public closeLoan(loanId: number): void {
    this._loanService.clearActionError();
    this._formError.set(null);
    this._loanService.closeLoan(loanId);
  }

  public requestLoanDeletion(loan: Loan): void {
    this._loanService.clearActionError();
    this._formError.set(null);
    this._selectedLoanToEdit.set(null);
    this._selectedLoanToDelete.set(loan);
  }

  public cancelLoanDeletion(): void {
    this._selectedLoanToDelete.set(null);
  }

  public confirmLoanDeletion(loanId: number): void {
    this._loanService.deleteLoan(loanId);
    this._selectedLoanToDelete.set(null);
  }

  public hasFieldError(fieldName: string): boolean {
    const field = this.loanForm.get(fieldName);

    return !!field && field.invalid && field.touched;
  }

  public getLoanStatusText(status: string): string {
    if (status === 'ACTIVE') {
      return 'Activo';
    }

    return 'Cerrado';
  }

  public getClosedAtText(closedAt: string | null): string {
    if (!closedAt) {
      return 'Pendiente';
    }

    return closedAt;
  }

  public getBookTitles(loan: Loan): string {
    if (loan.books.length === 0) {
      return 'Sin libros asociados';
    }

    return loan.books
      .map((book) => book.title)
      .join(', ');
  }
}