import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  UiToastService, 
} from '../../../shared/ui';

import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [
    CommonModule,
    SafePipe,
    MultiLanguagePipe,
    TranslateModule
  ],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {
  businessProfile: IBusinessProfile | null = null;
  loading = true;

  constructor(
    private businessProfileService: BusinessProfileService,
    private toastService: UiToastService,
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
        this.toastService.error('Failed to load terms of service', 'Error');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/business-profile']);
  }
} 