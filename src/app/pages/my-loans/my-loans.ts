import { Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { LoanService } from '../../services/loan/loan.service';
import { LoanStatus } from '../../models/loan/loan.model';
import { LoanSearchParams } from '../../models/loan/loan.search.params.model';

type LoanSearchStatus = LoanStatus | 'ALL';

@Component({
  selector: 'app-my-loans',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css',
})
export class MyLoans {
  private readonly pendingLoanBookIdsKey = 'pendingLoanBookIds';

  private readonly _missingUser = signal(false);
  private readonly _pendingLoanBookCount = signal(0);
  private readonly _searchActive = signal(false);
  private readonly _searchError = signal<string | null>(null);

  public readonly currentUser;
  public readonly loans;
  public readonly loading;
  public readonly error;
  public readonly updatingLoanId;
  public readonly actionError;

  public readonly missingUser = this._missingUser.asReadonly();
  public readonly pendingLoanBookCount = this._pendingLoanBookCount.asReadonly();
  public readonly searchActive = this._searchActive.asReadonly();
  public readonly searchError = this._searchError.asReadonly();

  public readonly userLoans;
  public readonly totalLoans;
  public readonly activeLoans;
  public readonly closedLoans;

  public readonly searchForm;

  public readonly hasPendingLoanSelection = computed(() =>
    this.pendingLoanBookCount() > 0
  );

  public readonly searchSummary = computed(() => {
    if (!this.searchActive()) {
      return 'Mostrando tus préstamos activos.';
    }

    return 'Mostrando préstamos filtrados según la búsqueda actual.';
  });

  constructor(
    private readonly _authService: AuthService,
    private readonly _loanService: LoanService,
    private readonly _router: Router,
    private readonly _formBuilder: FormBuilder
  ) {
    this.currentUser = this._authService.currentUser;
    this.loans = this._loanService.loans;
    this.loading = this._loanService.loading;
    this.error = this._loanService.error;
    this.updatingLoanId = this._loanService.updatingLoanId;
    this.actionError = this._loanService.actionError;

    this.searchForm = this._formBuilder.nonNullable.group({
      status: ['ACTIVE' as LoanSearchStatus],
      startDate: [''],
      dueDate: [''],
    });

    this.userLoans = computed(() => {
      const user = this.currentUser();

      if (!user) {
        return [];
      }

      return this.loans().filter((loan) =>
        loan.userId === user.id
      );
    });

    this.totalLoans = computed(() =>
      this.userLoans().length
    );

    this.activeLoans = computed(() =>
      this.userLoans().filter((loan) => loan.status === 'ACTIVE').length
    );

    this.closedLoans = computed(() =>
      this.userLoans().filter((loan) => loan.status === 'CLOSED').length
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
    this._searchActive.set(false);
    this._searchError.set(null);

    this._loanService.searchLoans({
      userId: user.id,
      status: 'ACTIVE',
    });
  }

  public searchLoans(): void {
    this._searchError.set(null);

    const user = this.currentUser();

    if (!user) {
      this._missingUser.set(true);
      return;
    }

    const formValue = this.searchForm.getRawValue();

    const searchParams: LoanSearchParams = {
      userId: user.id,
    };

    if (formValue.status !== 'ALL') {
      searchParams.status = formValue.status;
    }

    if (formValue.startDate) {
      searchParams.startDate = formValue.startDate;
    }

    if (formValue.dueDate) {
      searchParams.dueDate = formValue.dueDate;
    }

    this._missingUser.set(false);
    this._searchActive.set(true);
    this._loanService.searchLoans(searchParams);
  }

  public clearSearch(): void {
    this.searchForm.setValue({
      status: 'ACTIVE',
      startDate: '',
      dueDate: '',
    });

    this.loadUserLoans();
  }

  public closeLoan(loanId: number): void {
    this._loanService.closeLoan(loanId);
  }

  public navigateToNewLoan(): void {
    this._router.navigate(['/dashboard/books']);
  }

  public continueLoanRequest(): void {
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