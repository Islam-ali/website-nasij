import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OrderStatus } from '../../checkout/models/order.enum';

interface Order {
  id: string;
  date: Date;
  total: number;
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CardModule, 
    ButtonModule,
    TableModule,
    TagModule
  ],
  template: `
    <div class="p-4">
      <p-card header="My Orders">
        <p-table [value]="orders" [paginator]="true" [rows]="5" [showCurrentPageReport]="true" 
                [rowsPerPageOptions]="[5,10,25,50]" [paginator]="true" 
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-order>
            <tr>
              <td>{{order.id}}</td>
              <td>{{order.date | date:'mediumDate'}}</td>
              <td>{{order.items.length}} item(s)</td>
              <td>{{order.total | currency:'USD'}}</td>
              <td>
                <p-tag [severity]="getSeverity(order.status)" [value]="order.status"></p-tag>
              </td>
              <td>
                <button pButton pRipple 
                        icon="pi pi-eye" 
                        class="p-button-rounded p-button-text"
                        [routerLink]="['/orders', order.id]">
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No orders found.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .order-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  ngOnInit() {
    // TODO: Load orders from service
    setTimeout(() => {
      this.orders = this.getMockOrders();
      this.loading = false;
    }, 1000);
  }

  getSeverity(status: OrderStatus) {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CANCELLED:
        return 'danger';
      case OrderStatus.PROCESSING:
        return 'info';
      default:
        return null;
    }
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: 'ORD-001',
        date: new Date(2023, 5, 15),
        total: 199.99,
        status: OrderStatus.DELIVERED,
        items: [
          { name: 'Product 1', quantity: 2, price: 99.99 }
        ]
      },
      {
        id: 'ORD-002',
        date: new Date(2023, 5, 10),
        total: 149.99,
        status: OrderStatus.PROCESSING,
        items: [
          { name: 'Product 2', quantity: 1, price: 149.99 }
        ]
      }
    ];
  }
}
