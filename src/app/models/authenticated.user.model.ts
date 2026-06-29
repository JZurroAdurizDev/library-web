export type UserRole = 'USER' | 'ADMIN';

export interface AuthenticatedUser {
    id: number;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}