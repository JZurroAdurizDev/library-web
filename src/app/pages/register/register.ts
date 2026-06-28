import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthResponse } from '../../models/auth.response.model';
import { AuthenticatedUser } from '../../models/authenticated.user.model';
import { Register as RegisterModel } from '../../models/register.model';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  constructor(
    private readonly _authApiService: AuthApiService,
    private readonly _authService: AuthService
  ) {}

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  public registerForm = new FormGroup(
    {
      dni: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^\d{8}[A-Z]$/)
        ]
      }),

      firstName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }),

      lastName: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }),

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
          Validators.required,
          Validators.minLength(6)
        ]
      }),

      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      })
    },
    {
      validators: [
        this.passwordsMatchValidator.bind(this)
      ]
    }
  );

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const registerData: RegisterModel = this.getRegisterData();

    this.registerUser(registerData);
  }

  private getRegisterData(): RegisterModel {
    const formValue = this.registerForm.getRawValue();

    return {
      dni: formValue.dni,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password
    };
  }

  private registerUser(registerData: RegisterModel): void {
    this._authApiService.register(registerData).subscribe({
      next: (response: AuthResponse) => {
        this.startRegisteredUserSession(response.expiresIn);
      },
      error: (error: HttpErrorResponse) => {
        this.handleRegistrationError(error);
      }
    });
  }

  private startRegisteredUserSession(expiresIn: number): void {
    this._authApiService.authenticatedUser().subscribe({
      next: (user: AuthenticatedUser) => {
        this._authService.startSession(
          user,
          expiresIn
        );
      },
      error: (error: HttpErrorResponse) => {
        this.handleRegistrationError(error);
      }
    });
  }

  private handleRegistrationError(error: HttpErrorResponse): void {
    console.error(error);
  }
}