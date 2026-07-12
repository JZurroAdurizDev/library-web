import { Component, computed } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';
import { LoanService } from '../../services/loan/loan.service';
import { Book } from '../../models/book/book.model';
import { Loan } from '../../models/loan/loan.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public readonly currentUser;
  public readonly loans;
  public readonly loading;
  public readonly error;

  public readonly userLoans;
  public readonly totalLoans;
  public readonly recentBooks;

  constructor(
    private readonly _authService: AuthService,
    private readonly _loanService: LoanService
  ) {
    this.currentUser = this._authService.currentUser;

    this.loans = this._loanService.loans;
    this.loading = this._loanService.loading;
    this.error = this._loanService.error;

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

    this.recentBooks = computed(() => {
      const recentLoans = this.getRecentLoans();

      return this.getUniqueBooksFromLoans(recentLoans).slice(0, 5);
    });
  }

  public ngOnInit(): void {
    this.loadDashboardData();
  }

  public loadDashboardData(): void {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    this._loanService.searchLoans({
      userId: user.id,
    });
  }

  private getRecentLoans(): Loan[] {
    return [...this.userLoans()].sort((firstLoan, secondLoan) =>
      secondLoan.startDate.localeCompare(firstLoan.startDate)
    );
  }

  private getUniqueBooksFromLoans(loans: Loan[]): Book[] {
    const booksById = new Map<number, Book>();

    loans.forEach((loan) => {
      loan.books.forEach((book) => {
        if (!booksById.has(book.bookId)) {
          booksById.set(book.bookId, book);
        }
      });
    });

    return Array.from(booksById.values());
  }
}