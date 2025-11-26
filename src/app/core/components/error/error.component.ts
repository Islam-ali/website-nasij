import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiButtonComponent } from '../../../shared/ui';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule, UiButtonComponent],
  template: `
    <div class="error-container">
      <div class="error-content">
        <h1>Oops!</h1>
        <h2>Something went wrong</h2>
        <p>We're sorry, but we couldn't load the page you requested.</p>
        <ui-button variant="primary" routerLink="/">
          <i class="pi pi-home mr-2"></i>
          Go to Home
        </ui-button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      text-align: center;
    }
    .error-content {
      max-width: 500px;
      padding: 2rem;
      border-radius: 8px;
      background: var(--surface-card);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 6rem;
      margin: 0;
      color: var(--primary-color);
    }
    h2 {
      margin-top: 0;
      color: var(--text-color);
    }
    p {
      margin-bottom: 2rem;
      color: var(--text-color-secondary);
    }
  `]
})
export class ErrorComponent {
  constructor() {}
}
