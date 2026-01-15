import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { Order, OrderItem } from '../../../core/models/order.model';
import { BaseResponse } from '../../../core/models/baseResponse';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { environment } from '../../../../environments/environment';
import { CurrencyPipe } from '../../../core/pipes';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TranslateModule,
    MultiLanguagePipe ,
    CurrencyPipe
  ],
  templateUrl: './order-tracking.component.html'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  orderNumber: string = '';
  order: Order | null = null;
  loading: boolean = false;
  error: string | null = null;
  showResults: boolean = false;
  isRTL: boolean = true;
  readonly statusSteps: string[] = ['pending', 'confirmed', 'shipped', 'delivered'];
  private readonly statusIconMap: Record<string, string> = {
    pending: 'pi pi-hourglass',
    confirmed: 'pi pi-verified',
    received: 'pi pi-inbox',
    processing: 'pi pi-cog',
    shipped: 'pi pi-send',
    delivered: 'pi pi-check-circle',
    cancelled: 'pi pi-times',
    postponed: 'pi pi-history',
    returned: 'pi pi-undo'
  };
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private router: Router,
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
      }
    });
  }

  getPaymentMethodText(paymentMethod: string): string {
    return this.translateService.instant(`orderTracking.payment.${paymentMethod}`);
  }

  getSkuForItem(item: OrderItem): string | null {
    if (item?.itemId && this.isProductWithSku(item.itemId)) {
      return item.itemId.sku ?? null;
    }
    return null;
  }

  shouldShowTimeline(): boolean {
    if (!this.order) {
      return false;
    }
    return this.statusSteps.includes(this.order.status);
  }

  getCurrentStatusIndex(): number {
    if (!this.order) {
      return -1;
    }
    return this.statusSteps.indexOf(this.order.status);
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) {
      return false;
    }
    const currentIndex = this.getCurrentStatusIndex();
    const stepIndex = this.statusSteps.indexOf(step);
    if (currentIndex === -1 || stepIndex === -1) {
      return false;
    }
    return stepIndex < currentIndex;
  }

  isStepActive(step: string): boolean {
    if (!this.order) {
      return false;
    }
    const currentIndex = this.getCurrentStatusIndex();
    const stepIndex = this.statusSteps.indexOf(step);
    return currentIndex !== -1 && stepIndex === currentIndex;
  }

  getStatusIcon(step: string): string {
    return this.statusIconMap[step] || 'pi pi-circle';
  }

  getAmountPaid(): number {
    if (!this.order) {
      return 0;
    }
    return this.order.amountPaid ?? this.order.total ?? 0;
  }

  getOutstandingAmount(): number {
    if (!this.order) {
      return 0;
    }
    const total = this.order.total ?? 0;
    const amountPaid = this.getAmountPaid();
    return Math.max(total - amountPaid, 0);
  }

  getShippingAmount(): number {
    if (!this.order) {
      return 0;
    }
    const orderAny = this.order as any;
    return this.order.shipping ?? orderAny?.shippingCost ?? 0;
  }

  getSubtotal(): number {
    if (!this.order) {
      return 0;
    }
    const orderAny = this.order as any;
    return this.order.subtotal ?? (orderAny?.subtotal ?? 0);
  }

  getTaxAmount(): number {
    if (!this.order) {
      return 0;
    }
    const orderAny = this.order as any;
    return this.order.tax ?? orderAny?.tax ?? 0;
  }

  hasOutstandingBalance(): boolean {
    return this.order ? this.getOutstandingAmount() > 0 : false;
  }

  getDiscountAmount(): number {
    if (!this.order) {
      return 0;
    }
    const orderAny = this.order as any;
    return orderAny?.discount ?? 0;
  }

  hasDiscount(): boolean {
    return this.getDiscountAmount() > 0;
  }

  private isProductWithSku(item: OrderItem['itemId']): item is OrderItem['itemId'] & { sku?: string } {
    return !!item && 'sku' in item && typeof (item as any).sku === 'string' && (item as any).sku.length > 0;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      pending: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      confirmed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      received: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      processing: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      shipped: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      delivered: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      cancelled: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      postponed: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200',
      returned: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
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