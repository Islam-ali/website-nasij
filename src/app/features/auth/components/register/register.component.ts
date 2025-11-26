import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCardComponent, 
  UiCheckboxComponent,
  UiInputDirective,
  UiPasswordComponent
} from '../../../../shared/ui';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    UiButtonComponent,
    UiCardComponent,
    UiCheckboxComponent,
    UiInputDirective,
    UiPasswordComponent
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  passwordMismatch = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: UiToastService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, acceptTerms, ...userData } = this.registerForm.value;
    
    if (userData.password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.loading = true;
    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastService.success('Your account has been created successfully!', 'Registration Successful');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'An error occurred during registration. Please try again.', 'Registration Failed');
      }
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }
}
