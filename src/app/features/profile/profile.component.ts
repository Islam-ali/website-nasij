import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule,
    FormsModule
  ],
  template: `
    <div class="p-4">
      <p-card header="My Profile">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="name">Full Name</label>
              <input id="name" type="text" pInputText [(ngModel)]="profile.name" />
            </div>
            <div class="field mt-3">
              <label for="email">Email</label>
              <input id="email" type="email" pInputText [(ngModel)]="profile.email" />
            </div>
            <div class="field mt-3">
              <label for="phone">Phone</label>
              <input id="phone" type="tel" pInputText [(ngModel)]="profile.phone" />
            </div>
            <div class="mt-4">
              <button pButton label="Save Changes" (click)="saveProfile()"></button>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <h4>Change Password</h4>
            <div class="field">
              <label for="currentPassword">Current Password</label>
              <input id="currentPassword" type="password" pInputText [(ngModel)]="password.current" />
            </div>
            <div class="field">
              <label for="newPassword">New Password</label>
              <input id="newPassword" type="password" pInputText [(ngModel)]="password.new" />
            </div>
            <div class="field">
              <label for="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" type="password" pInputText [(ngModel)]="password.confirm" />
            </div>
            <div class="mt-3">
              <button pButton label="Change Password" (click)="changePassword()"></button>
            </div>
          </div>
        </div>
      </p-card>
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

  constructor(private messageService: MessageService) {}

  saveProfile() {
    // TODO: Implement profile update logic
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile updated successfully!'
    });
  }

  changePassword() {
    // TODO: Implement password change logic
    if (this.password.new !== this.password.confirm) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'New passwords do not match!'
      });
      return;
    }
    
    // Reset form
    this.password = { current: '', new: '', confirm: '' };
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password changed successfully!'
    });
  }
}
