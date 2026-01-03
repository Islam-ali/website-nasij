import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../services/review.service';
import { IReview } from '../../../interfaces/review.interface';
import { BaseResponse } from '../../../core/models/baseResponse';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';
import { SafePipe } from '../../../core/pipes/safe.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, SafePipe, TranslateModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviews: IReview[] = [];
  loading = false;
  domain = environment.domain;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
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
        console.error('Error loading reviews:', error);
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
}

