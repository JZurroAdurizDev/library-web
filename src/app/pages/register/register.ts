import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthResponse } from '../../models/auth/auth.response.model';
import { AuthenticatedUser } from '../../models/auth/authenticated.user.model';
import { Register as RegisterModel } from '../../models/auth/register.model';
import { AuthApiService } from '../../services/auth/auth-api.service';
import { AuthService } from '../../services/auth/auth.service';

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

  public readonly loading = signal<boolean>(false);

  public readonly errorMessage = signal<string>('');

  constructor(
    private readonly _authApiService: AuthApiService,
    private readonly _authService: AuthService,
    private readonly _router: Router
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
    if (this.loading()) {
      return;
    }

    this.errorMessage.set('');

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
    this.loading.set(true);

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

        this.finishRegistration();
      },
      error: (error: HttpErrorResponse) => {
        this.handleRegistrationError(error);
      }
    });
  }

  private finishRegistration(): void {
    this.loading.set(false);
    this._router.navigate(['/dashboard']);
  }

  private handleRegistrationError(error: HttpErrorResponse): void {
    this.loading.set(false);

    if (error.status === 409) {
      this.errorMessage.set(
        'Ya existe una cuenta con el DNI o correo electrónico introducido.'
      );
      return;
    }

    this.errorMessage.set(
      'No se pudo completar el registro. Inténtalo de nuevo.'
    );

    console.error(error);
  }
}