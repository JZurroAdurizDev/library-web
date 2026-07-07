import { LoanStatus } from './loan.model';

export interface UpdateLoanRequest {
    startDate: string;
    dueDate: string;
    status: LoanStatus;
}