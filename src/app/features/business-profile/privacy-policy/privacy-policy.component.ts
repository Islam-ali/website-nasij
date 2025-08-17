import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { SafePipe } from '../../../core/pipes/safe.pipe';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    SafePipe
  ],
  providers: [MessageService],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  businessProfile: IBusinessProfile | null = null;
  loading = true;

  constructor(
    private businessProfileService: BusinessProfileService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBusinessProfile();
  }

  private loadBusinessProfile(): void {
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (businessProfile) => {
        this.businessProfile = businessProfile;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading business profile:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load privacy policy'
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/business-profile']);
  }
} 