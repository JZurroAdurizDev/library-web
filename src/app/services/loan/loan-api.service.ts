import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Loan } from '../../models/loan/loan.model';
import { LoanRequest } from '../../models/loan/loan.request.model';
import { LoanSearchParams } from '../../models/loan/loan.search.params.model';
import { UpdateLoanRequest } from '../../models/loan/update.loan.request.model';
import { PatchLoanRequest } from '../../models/loan/patch.loan.request.model';

@Injectable({
  providedIn: 'root',
})
export class LoanApiService {

  private readonly loansUrl: string = `${environment.apiUrl}/loans`;

  constructor(private readonly _http: HttpClient) {}

  public getAllLoans(): Observable<Loan[]> {
    return this._http.get<Loan[]>(this.loansUrl);
  }

  public getLoanById(loanId: number): Observable<Loan> {
    return this._http.get<Loan>(`${this.loansUrl}/${loanId}`);
  }

  public searchLoans(searchParams: LoanSearchParams): Observable<Loan[]> {
    let queryParams = new HttpParams();

    if (searchParams.userId !== undefined) {
      queryParams = queryParams.set('userId', searchParams.userId.toString());
    }

    if (searchParams.status) {
      queryParams = queryParams.set('status', searchParams.status);
    }

    if (searchParams.startDate) {
      queryParams = queryParams.set('startDate', searchParams.startDate);
    }

    if (searchParams.dueDate) {
      queryParams = queryParams.set('dueDate', searchParams.dueDate);
    }

    if (queryParams.keys().length === 0) {
      return this.getAllLoans();
    }

    return this._http.get<Loan[]>(`${this.loansUrl}/search`, {
      params: queryParams,
    });
  }

  public createLoan(loanData: LoanRequest): Observable<Loan> {
    return this._http.post<Loan>(this.loansUrl, loanData);
  }

  public updateLoan(loanId: number, loanData: UpdateLoanRequest): Observable<Loan> {
    return this._http.put<Loan>(`${this.loansUrl}/${loanId}`, loanData);
  }

  public patchLoan(loanId: number, loanData: PatchLoanRequest): Observable<Loan> {
    return this._http.patch<Loan>(`${this.loansUrl}/${loanId}`, loanData);
  }

  public deleteLoan(loanId: number): Observable<void> {
    return this._http.delete<void>(`${this.loansUrl}/${loanId}`);
  }
}