import { Component, computed, signal } from '@angular/core';

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
  private readonly _missingUser = signal(false);

  public readonly currentUser;
  public readonly loans;
  public readonly loading;
  public readonly error;
  public readonly missingUser = this._missingUser.asReadonly();

  public readonly totalLoans;
  public readonly activeLoans;
  public readonly closedLoans;

  constructor(
    private readonly _authService: AuthService,
    private readonly _loanService: LoanService
  ) {
    this.currentUser = this._authService.currentUser;
    this.loans = this._loanService.loans;
    this.loading = this._loanService.loading;
    this.error = this._loanService.error;

    this.totalLoans = computed(() => this.loans().length);

    this.activeLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'ACTIVE').length
    );

    this.closedLoans = computed(() =>
      this.loans().filter((loan) => loan.status === 'CLOSED').length
    );

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

  public getLoanStatusText(status: LoanStatus): string {
    if (status === 'ACTIVE') {
      return 'Activo';
    }

    return 'Cerrado';
  }
}