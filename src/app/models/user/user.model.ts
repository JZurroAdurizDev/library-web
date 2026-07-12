export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: number;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}