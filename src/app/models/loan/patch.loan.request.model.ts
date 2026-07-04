import { LoanStatus } from './loan.model';

export interface PatchLoanRequest {
    startDate?: string;
    dueDate?: string;
    status?: LoanStatus;
}