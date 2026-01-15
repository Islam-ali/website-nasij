import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../services/review.service';
import { IReview } from '../../../interfaces/review.interface';
import { BaseResponse } from '../../../core/models/baseResponse';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { BusinessProfileService } from '../../../services/business-profile.service';
import { IBusinessProfile } from '../../../interfaces/business-profile.interface';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HeaderAlignment } from '../../../interfaces/product-feature.interface';
@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, SafePipe, TranslateModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit, OnDestroy {
  reviews: IReview[] = [];
  loading = false;
  domain = environment.domain;
  businessProfile: IBusinessProfile | null = null;
  private destroy$ = new Subject<void>();
  constructor(private reviewService: ReviewService, private businessProfileService: BusinessProfileService) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadBusinessProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadBusinessProfile(): void {
    this.businessProfileService.getBusinessProfile$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.businessProfile = profile;
        },
        error: (error) => {
        }
      });
  }
  loadReviews(): void {
    this.loading = true;
    this.reviewService.getActiveReviews().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: BaseResponse<IReview[]>) => {
        // Sort: pinned first (by order), then by creation date
        this.reviews = response.data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          if (a.isPinned && b.isPinned) {
            return (a.order || 0) - (b.order || 0);
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
      },
      error: (error) => {
      }
    });
  }

  getImageUrl(filePath: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${this.domain}/${filePath}`;
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
  getHeaderAlignmentClass(): string {
    const alignment = this.businessProfile?.headerAlignment || HeaderAlignment.CENTER;
    switch (alignment) {
      case HeaderAlignment.START:
        return 'text-start';
      case HeaderAlignment.CENTER:
        return 'text-center';
      case HeaderAlignment.END:
        return 'text-end';
    }
  }
}

