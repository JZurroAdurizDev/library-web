import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { LoanApiService } from './loan-api.service';
import { Loan } from '../../models/loan/loan.model';
import { LoanRequest } from '../../models/loan/loan.request.model';
import { LoanSearchParams } from '../../models/loan/loan.search.params.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly _loans = signal<Loan[]>([]);
  readonly loans = this._loans.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

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

  public createLoan(loanData: LoanRequest): Observable<Loan> {
    return this._loanApiService.createLoan(loanData);
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
}