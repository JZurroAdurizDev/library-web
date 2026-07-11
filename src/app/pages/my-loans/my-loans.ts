import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { LoanService } from '../../services/loan/loan.service';
import { LoanStatus } from '../../models/loan/loan.model';

@Component({
  selector: 'app-my-loans',
  imports: [],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css',
})
export class MyLoans {
  private readonly pendingLoanBookIdsKey = 'pendingLoanBookIds';
  private readonly _missingUser = signal(false);
  private readonly _pendingLoanBookCount = signal(0);

  public readonly currentUser;
  public readonly loans;
  public readonly loading;
  public readonly error;
  public readonly updatingLoanId;
  public readonly actionError;

  public readonly missingUser = this._missingUser.asReadonly();
  public readonly pendingLoanBookCount = this._pendingLoanBookCount.asReadonly();

  public readonly totalLoans;
  public readonly activeLoans;
  public readonly closedLoans;

  public readonly hasPendingLoanSelection = computed(() =>
    this.pendingLoanBookCount() > 0
  );

  constructor(
    private readonly _authService: AuthService,
    private readonly _loanService: LoanService,
    private readonly _router: Router
  ) {
    this.currentUser = this._authService.currentUser;
    this.loans = this._loanService.loans;
    this.loading = this._loanService.loading;
    this.error = this._loanService.error;
    this.updatingLoanId = this._loanService.updatingLoanId;
    this.actionError = this._loanService.actionError;

    this.totalLoans = computed(() => this.loans().length);

    this.activeLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'ACTIVE').length
    );

    this.closedLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'CLOSED').length
    );
  }

  public ngOnInit(): void {
    this.loadPendingLoanSelection();
    this.loadUserLoans();
  }

  public loadUserLoans(): void {
    const user = this.currentUser();

    if (!user) {
      this._missingUser.set(true);
      return;
    }

    this._missingUser.set(false);

    this._loanService.searchLoans({
      userId: user.id,
    });
  }

  public closeLoan(loanId: number): void {
    this._loanService.closeLoan(loanId);
  }

  public navigateToNewLoan(): void {
    this._router.navigate(['/dashboard/my-loans/new']);
  }

  public getLoanStatusText(status: LoanStatus): string {
    if (status === 'ACTIVE') {
      return 'Activo';
    }

    return 'Cerrado';
  }

  private loadPendingLoanSelection(): void {
    const storedBookIds = sessionStorage.getItem(this.pendingLoanBookIdsKey);

    if (!storedBookIds) {
      this._pendingLoanBookCount.set(0);
      return;
    }

    try {
      const parsedBookIds = JSON.parse(storedBookIds);

      if (!Array.isArray(parsedBookIds)) {
        this._pendingLoanBookCount.set(0);
        return;
      }

      const validBookIds = parsedBookIds.filter((bookId) =>
        Number.isInteger(bookId)
      );

      this._pendingLoanBookCount.set(validBookIds.length);
    } catch {
      this._pendingLoanBookCount.set(0);
    }
  }
}