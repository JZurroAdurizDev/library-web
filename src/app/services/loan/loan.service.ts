import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { LoanApiService } from './loan-api.service';
import { Loan } from '../../models/loan/loan.model';
import { LoanRequest } from '../../models/loan/loan.request.model';
import { LoanSearchParams } from '../../models/loan/loan.search.params.model';
import { UpdateLoanRequest } from '../../models/loan/update.loan.request.model';
import { PatchLoanRequest } from '../../models/loan/patch.loan.request.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly _loans = signal<Loan[]>([]);
  readonly loans = this._loans.asReadonly();

  private readonly _selectedLoan = signal<Loan | null>(null);
  readonly selectedLoan = this._selectedLoan.asReadonly();

  private readonly _createdLoan = signal<Loan | null>(null);
  readonly createdLoan = this._createdLoan.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _updatingLoanId = signal<number | null>(null);
  readonly updatingLoanId = this._updatingLoanId.asReadonly();

  private readonly _deletingLoanId = signal<number | null>(null);
  readonly deletingLoanId = this._deletingLoanId.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _actionError = signal<string | null>(null);
  readonly actionError = this._actionError.asReadonly();

  constructor(private readonly _loanApiService: LoanApiService) {}

  public loadLoans(): void {
    this.handleLoansRequest(
      this._loanApiService.getAllLoans()
    );
  }

  public searchLoans(searchParams: LoanSearchParams): void {
    this.handleLoansRequest(
      this._loanApiService.searchLoans(searchParams)
    );
  }

  public loadLoanById(loanId: number): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedLoan.set(null);

    this._loanApiService.getLoanById(loanId).subscribe({
      next: (loan) => {
        this._selectedLoan.set(loan);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo cargar el préstamo.'));
        this._loading.set(false);
      },
    });
  }

  public createLoan(loanData: LoanRequest): void {
    this._loading.set(true);
    this._error.set(null);
    this._createdLoan.set(null);

    this._loanApiService.createLoan(loanData).subscribe({
      next: (createdLoan) => {
        this._createdLoan.set(createdLoan);

        this._loans.update((loans) => [
          ...loans,
          createdLoan,
        ]);

        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudo crear el préstamo.'));
        this._loading.set(false);
      },
    });
  }

  public updateLoan(loanId: number, loanData: UpdateLoanRequest): void {
    this._updatingLoanId.set(loanId);
    this._actionError.set(null);

    this._loanApiService.updateLoan(loanId, loanData).subscribe({
      next: (updatedLoan) => {
        this.updateLoanState(updatedLoan);
        this._updatingLoanId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el préstamo.'));
        this._updatingLoanId.set(null);
      },
    });
  }

  public patchLoan(loanId: number, loanData: PatchLoanRequest): void {
    this._updatingLoanId.set(loanId);
    this._actionError.set(null);

    this._loanApiService.patchLoan(loanId, loanData).subscribe({
      next: (updatedLoan) => {
        this.updateLoanState(updatedLoan);
        this._updatingLoanId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo actualizar el préstamo.'));
        this._updatingLoanId.set(null);
      },
    });
  }

  public closeLoan(loanId: number): void {
    this.patchLoan(loanId, {
      status: 'CLOSED',
    });
  }

  public deleteLoan(loanId: number): void {
    this._deletingLoanId.set(loanId);
    this._actionError.set(null);

    this._loanApiService.deleteLoan(loanId).subscribe({
      next: () => {
        this._loans.update((loans) =>
          loans.filter((loan) => loan.loanId !== loanId)
        );

        if (this.selectedLoan()?.loanId === loanId) {
          this._selectedLoan.set(null);
        }

        this._deletingLoanId.set(null);
      },
      error: (err) => {
        this._actionError.set(this.getErrorMessage(err, 'No se pudo eliminar el préstamo.'));
        this._deletingLoanId.set(null);
      },
    });
  }

  public clearSelectedLoan(): void {
    this._selectedLoan.set(null);
  }

  public clearCreatedLoan(): void {
    this._createdLoan.set(null);
  }

  public clearActionError(): void {
    this._actionError.set(null);
  }

  private handleLoansRequest(loansRequest$: Observable<Loan[]>): void {
    this._loading.set(true);
    this._error.set(null);

    loansRequest$.subscribe({
      next: (loans) => {
        this._loans.set(loans);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(this.getErrorMessage(err, 'No se pudieron cargar los préstamos.'));
        this._loading.set(false);
      },
    });
  }

  private updateLoanState(updatedLoan: Loan): void {
    this._loans.update((loans) =>
      loans.map((loan) =>
        loan.loanId === updatedLoan.loanId ? updatedLoan : loan
      )
    );

    if (this.selectedLoan()?.loanId === updatedLoan.loanId) {
      this._selectedLoan.set(updatedLoan);
    }
  }

  private getErrorMessage(err: any, fallbackMessage: string): string {
    return err.error?.message ?? err.message ?? fallbackMessage;
  }
}