import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCardComponent, 
  UiSpinnerComponent
} from '../../../shared/ui';

import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    UiButtonComponent,
    UiCardComponent,
    UiSpinnerComponent,
    SafePipe,
    MultiLanguagePipe,
    TranslateModule
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
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
        console.error('Error loading business profile:', error);
        this.toastService.error('Failed to load privacy policy', 'Error');
        this.loading = false;
      }
    });
  }


} 