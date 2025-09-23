import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';

import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    AccordionModule,
    DividerModule,
    MultiLanguagePipe
  ],
  providers: [MessageService],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {
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
