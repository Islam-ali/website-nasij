
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCheckboxComponent,
  UiInputDirective,
  UiPasswordComponent
} from '../../shared/ui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    UiButtonComponent, 
    UiCheckboxComponent, 
    UiInputDirective, 
    UiPasswordComponent, 
    FormsModule
  ],
  providers: [LoginService]
})
export class LoginComponent {
  email: string = '';

  password: string = '';

  checked: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private toastService: UiToastService) { }

  onSubmit() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loginService.saveToken(response.data.token);
        this.loginService.saveUser(response.data.user);
        this.loginService.getUser().subscribe({
          next: (user) => {
            this.loginService.user.next(user);
          },
          error: (error) => {
            this.toastService.error(error.error.message, 'Error');
          }
        })

        this.router.navigate(['/']);
      },
      error: (error) => {
        // toast error
        this.toastService.error(error.error.message, 'Error');
      }
    })
  }
}
