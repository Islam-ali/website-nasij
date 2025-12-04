import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ILoginCredentials } from '../../models/auth.interface';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCardComponent, 
  UiCheckboxComponent,
  UiInputDirective,
  UiPasswordComponent
} from '../../../../shared/ui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: UiToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
   if(isPlatformBrowser(this.platformId)) {
    // Check for saved credentials if "remember me" was checked
    const savedEmail = localStorage.getItem('saved_email');
      if (savedEmail) {
        this.loginForm.patchValue({
          email: savedEmail,
          rememberMe: true
        });
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const credentials: ILoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Save email if "remember me" is checked
    if(isPlatformBrowser(this.platformId)) {
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem('saved_email', credentials.email);
    } else {
      localStorage.removeItem('saved_email');
    }
    }
    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastService.success('Welcome back!', 'Login Successful');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Invalid email or password', 'Login Failed');
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
