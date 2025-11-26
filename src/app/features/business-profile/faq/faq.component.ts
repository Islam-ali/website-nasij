import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  UiToastService, 
  UiButtonComponent, 
  UiCardComponent, 
  UiSpinnerComponent,
  UiDividerComponent
} from '../../../shared/ui';

import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    UiButtonComponent,
    UiCardComponent,
    UiSpinnerComponent,
    UiDividerComponent,
    MultiLanguagePipe,
    TranslateModule,
    TranslatePipe
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
  businessProfile: IBusinessProfile | null = null;
  loading = true;
  openAccordionIndices = new Set<number>();

  toggleAccordion(index: number): void {
    if (this.openAccordionIndices.has(index)) {
      this.openAccordionIndices.delete(index);
    } else {
      this.openAccordionIndices.add(index);
    }
  }

  isAccordionOpen(index: number): boolean {
    return this.openAccordionIndices.has(index);
  }

  constructor(
    private businessProfileService: BusinessProfileService,
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
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/business-profile']);
  }

  get hasFAQ(): boolean {
    return this.businessProfile?.faq && this.businessProfile.faq.length > 0 || false;
  }
}
