export interface LoanRequest {
    userId: number;
    startDate: string;
    dueDate: string;
    bookIds: number[];
}