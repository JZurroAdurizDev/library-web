export interface AuthenticatedUser {
    id: number;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}