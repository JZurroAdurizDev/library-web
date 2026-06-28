import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthResponse } from '../../models/auth.response.model';
import { AuthenticatedUser } from '../../models/authenticated.user.model';
import { Login as LoginModel } from '../../models/login.model';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  public readonly errorMessage = signal<string>('');

  constructor(
    private readonly _authApiService: AuthApiService,
    private readonly _authService: AuthService
  ) {}

  public loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })
  });

  public onSubmit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData: LoginModel = this.getLoginData();

    this.loginUser(loginData);
  }

  private getLoginData(): LoginModel {
    return this.loginForm.getRawValue();
  }

  private loginUser(loginData: LoginModel): void {
    this._authApiService.login(loginData).subscribe({
      next: (response: AuthResponse) => {
        this.startAuthenticatedUserSession(response.expiresIn);
      },
      error: (error: HttpErrorResponse) => {
        this.handleLoginError(error);
      }
    });
  }

  private startAuthenticatedUserSession(expiresIn: number): void {
    this._authApiService.authenticatedUser().subscribe({
      next: (user: AuthenticatedUser) => {
        this._authService.startSession(
          user,
          expiresIn
        );
      },
      error: (error: HttpErrorResponse) => {
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.errorMessage.set('Correo electrónico o contraseña incorrectos.');
      return;
    }

    this.errorMessage.set('No se pudo iniciar sesión. Inténtalo de nuevo.');

    console.error(error);
  }
}