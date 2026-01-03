import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-failure.component.html',
  styleUrls: ['./payment-failure.component.scss']
})
export class PaymentFailureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  orderId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.orderId.set(orderId);
      }
    });
  }

  retryPayment(): void {
    const orderId = this.orderId();
    if (orderId) {
      this.router.navigate(['/payment/paymob'], {
        queryParams: {
          orderId: orderId,
          amount: this.route.snapshot.queryParams['amount'],
          currency: this.route.snapshot.queryParams['currency'] || 'EGP'
        }
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  contactSupport(): void {
    // You can implement support contact logic here
    window.location.href = 'mailto:support@example.com';
  }
}


