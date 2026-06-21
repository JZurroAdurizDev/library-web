import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

/**
 * Validates that the password and password confirmation values match.
 */
function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password: string = control.get('password')?.value;
  const confirmPassword: string = control.get('confirmPassword')?.value;

  /*
   * Required validators are responsible for handling empty fields.
   */
  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

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

  /**
   * Registration form containing the account data and the frontend-only
   * password confirmation field.
   */
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
        passwordsMatchValidator
      ]
    }
  );

  /**
   * Validates the registration form before the future API request.
   */
  public onSubmit(): void {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    /*
     * API integration and RegisterModel creation will be implemented
     * in the authentication feature.
     */
  }
}