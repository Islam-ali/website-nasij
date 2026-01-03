import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../../checkout/services/checkout.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private translate = inject(TranslateService);

  orderId = signal<string | null>(null);
  orderNumber = signal<string>('');
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.orderId.set(orderId);
        this.loadOrderDetails(orderId);
      } else {
        this.loading.set(false);
      }
    });
  }

  private async loadOrderDetails(orderId: string): Promise<void> {
    try {
      const order = await this.checkoutService.getOrder(orderId).toPromise();
      if (order) {
        this.orderNumber.set(order.orderNumber || order._id || '');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      this.loading.set(false);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  viewOrder(): void {
    const orderId = this.orderId();
    if (orderId) {
      this.router.navigate(['/orders', orderId]);
    }
  }
}


