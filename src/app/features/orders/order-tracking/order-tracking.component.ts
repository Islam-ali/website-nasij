import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { Order } from '../../../core/models/order.model';
import { BaseResponse } from '../../../core/models/baseResponse';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TranslateModule,
    MultiLanguagePipe 
  ],
  providers: [MessageService],
  templateUrl: './order-tracking.component.html'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  orderNumber: string = '';
  order: Order | null = null;
  loading: boolean = false;
  error: string | null = null;
  showResults: boolean = false;
  isRTL: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isRTL = this.translateService.currentLang === 'ar';
      });
    
    // Initialize RTL state
    this.isRTL = this.translateService.currentLang === 'ar';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  searchOrder(): void {
    if (!this.orderNumber.trim()) {
      this.error = 'يرجى إدخال رقم الطلب';
      return;
    }

    this.loading = true;
    this.error = null;
    this.order = null;
    this.showResults = false;

    this.orderService.getOrderByNumber(this.orderNumber.trim()).subscribe({
      next: (order: BaseResponse<Order>) => {
        this.order = order.data;
        this.loading = false;
        this.showResults = true;
      },
      error: (error) => {
        this.loading = false;
        this.error = this.translateService.instant('orderTracking.orderNotFound');
        console.error('Error fetching order:', error);
      }
    });
  }

  getPaymentMethodText(paymentMethod: string): string {
    return this.translateService.instant(`orderTracking.payment.${paymentMethod}`);
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'received': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'processing': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'shipped': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'postponed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'returned': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }

  formatDateTime(dateTime: Date | string): string {
    const date = new Date(dateTime);
    const locale = this.translateService.currentLang === 'ar' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearSearch(): void {
    this.orderNumber = '';
    this.order = null;
    this.error = null;
    this.showResults = false;
  }

  onImageError(event: any): void {
    // Hide the image and show the fallback icon
    const img = event.target;
    if (img) {
      img.style.display = 'none';
    }
  }

  onImageLoad(event: any): void {
    // Image loaded successfully, ensure it's visible
    const img = event.target;
    if (img) {
      img.style.display = 'block';
    }
  }

  getImageUrl(filePath: string): string {
    return `${environment.domain}/${filePath}`;
  }

}