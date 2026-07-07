import { inject } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { AuthenticatedUser } from '../models/auth/authenticated.user.model';
import { AuthApiService } from '../services/auth/auth-api.service';
import { AuthService } from '../services/auth/auth.service';

export function authInitializer():
    Observable<AuthenticatedUser | null> {

    const authApiService: AuthApiService = inject(AuthApiService);
    const authService: AuthService = inject(AuthService);

    return authApiService.authenticatedUser().pipe(
    tap((user: AuthenticatedUser) => {
        authService.setAuthenticatedUser(user);
    }),
    catchError(() => {
        authService.clearAuthenticatedUser();
        return of(null);
    })
    );
}