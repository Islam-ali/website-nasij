import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCardComponent, 
  UiInputDirective
} from '../../shared/ui';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UiButtonComponent,
    UiCardComponent,
    UiInputDirective,
    FormsModule
  ],
  template: `
    <div class="p-4">
      <ui-card>
        <div class="mb-6">
          <h2 class="text-2xl font-bold">My Profile</h2>
        </div>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="name">Full Name</label>
              <input id="name" type="text" uiInput="md" [(ngModel)]="profile.name" />
            </div>
            <div class="field mt-3">
              <label for="email">Email</label>
              <input id="email" type="email" uiInput [(ngModel)]="profile.email" />
            </div>
            <div class="field mt-3">
              <label for="phone">Phone</label>
              <input id="phone" type="tel" uiInput [(ngModel)]="profile.phone" />
            </div>
            <div class="mt-4">
              <ui-button variant="primary" (click)="saveProfile()">Save Changes</ui-button>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <h4>Change Password</h4>
            <div class="field">
              <label for="currentPassword">Current Password</label>
              <input id="currentPassword" type="password" uiInput [(ngModel)]="password.current" />
            </div>
            <div class="field">
              <label for="newPassword">New Password</label>
              <input id="newPassword" type="password" uiInput [(ngModel)]="password.new" />
            </div>
            <div class="field">
              <label for="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" type="password" uiInput [(ngModel)]="password.confirm" />
            </div>
            <div class="mt-3">
              <ui-button variant="primary" (click)="changePassword()">Change Password</ui-button>
            </div>
          </div>
        </div>
      </ui-card>
    </div>
  `,
  styles: [`
    .field {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
    }
  `]
})
export class ProfileComponent {
  profile = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  constructor(private toastService: UiToastService) {}

  saveProfile() {
    // TODO: Implement profile update logic
    this.toastService.success('Profile updated successfully!', 'Success');
  }

  changePassword() {
    // TODO: Implement password change logic
    if (this.password.new !== this.password.confirm) {
      this.toastService.error('New passwords do not match!', 'Error');
      return;
    }
    
    // Reset form
    this.password = { current: '', new: '', confirm: '' };
    
    this.toastService.success('Password changed successfully!', 'Success');
  }
}
