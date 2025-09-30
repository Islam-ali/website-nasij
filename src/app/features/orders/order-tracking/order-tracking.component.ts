import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { TimelineService, OrderWithTimelines } from '../services/timeline.service';
import { Order } from '../../../core/models/order.model';
import { BaseResponse } from '../../../core/models/baseResponse';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    TimelineModule,
    ToastModule,
    TranslateModule,
    MultiLanguagePipe 
  ],
  providers: [MessageService],
  templateUrl: './order-tracking.component.html',
  styles: [`
    ::ng-deep .p-timeline {
      .p-timeline-event-marker {
        border: 3px solid #e5e7eb !important;
        background: white !important;
        width: 3rem !important;
        height: 3rem !important;
      }
      
      .p-timeline-event-connector {
        background: #e5e7eb !important;
        width: 3px !important;
      }
      
      .p-timeline-event-content {
        padding: 0 !important;
        background: transparent !important;
        border: none !important;
        margin-right: 2rem !important;
      }
    }
    
    .dark ::ng-deep .p-timeline {
      .p-timeline-event-marker {
        border-color: #374151 !important;
        background: #1f2937 !important;
      }
      
      .p-timeline-event-connector {
        background: #374151 !important;
      }
    }
  `]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  orderNumber: string = '';
  order: Order | null = null;
  orderTimelines: OrderWithTimelines | null = null;
  loading: boolean = false;
  error: string | null = null;
  showResults: boolean = false;
  isRTL: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private timelineService: TimelineService,
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
    this.orderTimelines = null;
    this.showResults = false;

    this.orderService.getOrderByNumber(this.orderNumber.trim()).subscribe({
      next: (order: BaseResponse<Order>) => {
        this.order = order.data;
        this.loadOrderTimelines(order.data.id);
        this.showResults = true;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'لم يتم العثور على طلب بهذا الرقم';
        console.error('Error fetching order:', error);
      }
    });
  }

  private loadOrderTimelines(orderId: string): void {
    this.timelineService.getOrderTimelines(orderId).subscribe({
      next: (timelines: BaseResponse<OrderWithTimelines>) => {
        this.orderTimelines = timelines.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching timelines:', error);
        this.loading = false;
        // لا نعرض خطأ إذا لم توجد timelines، الطلب موجود
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

  getTimelineIcon(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'order-placed': 'fas fa-shopping-cart',
      'order-confirmed': 'fas fa-check-circle',
      'order-shipped': 'fas fa-truck',
      'order-delivered': 'fas fa-home',
      'payment-received': 'fas fa-credit-card',
      'customer-called': 'fas fa-phone',
      'order-processing': 'fas fa-clock',
      'order-completed': 'fas fa-check-circle',
      'order-cancelled': 'fas fa-times-circle'
    };
    return iconMap[icon] || 'fas fa-clipboard-list';
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
    this.orderTimelines = null;
    this.error = null;
    this.showResults = false;
  }

  // Convert timeline data to PrimeNG Timeline format
  getTimelineEvents(): any[] {
    if (!this.orderTimelines || !this.orderTimelines.timelines) {
      return [];
    }

    return this.orderTimelines.timelines.map((entry, index) => ({
      status: entry.timeline.name,
      date: this.formatDateTime(entry.dateTime),
      icon: this.getTimelineIcon(entry.timeline.icon),
      color: this.getTimelineColor(index),
      note: entry.note || ''
    }));
  }

  getTimelineColor(index: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
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

}