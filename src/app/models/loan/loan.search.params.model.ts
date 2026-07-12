import { LoanStatus } from './loan.model';

export interface LoanSearchParams {
    userId?: number;
    status?: LoanStatus;
    startDate?: string;
    dueDate?: string;
}