import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { LoanApiService } from './loan-api.service';
import { Loan } from '../../models/loan/loan.model';
import { LoanRequest } from '../../models/loan/loan.request.model';
import { LoanSearchParams } from '../../models/loan/loan.search.params.model';
import { PatchLoanRequest } from '../../models/loan/patch.loan.request.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly _loans = signal<Loan[]>([]);
  readonly loans = this._loans.asReadonly();

  private readonly _createdLoan = signal<Loan | null>(null);
  readonly createdLoan = this._createdLoan.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _updatingLoanId = signal<number | null>(null);
  readonly updatingLoanId = this._updatingLoanId.asReadonly();

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
        this._error.set(err.message);
        this._loading.set(false);
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
        this._actionError.set(err.message);
        this._updatingLoanId.set(null);
      },
    });
  }

  public closeLoan(loanId: number): void {
    this.patchLoan(loanId, {
      status: 'CLOSED',
    });
  }

  public clearCreatedLoan(): void {
    this._createdLoan.set(null);
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
        this._error.set(err.message);
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
  }
}