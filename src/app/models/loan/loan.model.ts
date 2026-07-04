import { Book } from '../book/book.model';

export type LoanStatus = 'ACTIVE' | 'CLOSED';

export interface Loan {
    loanId: number;
    userId: number;
    startDate: string;
    dueDate: string;
    closedAt: string | null;
    status: LoanStatus;
    books: Book[];
}