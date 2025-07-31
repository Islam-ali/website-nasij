import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <button pButton pRipple 
                label="Go to Home" 
                icon="pi pi-home" 
                routerLink="/"
                class="p-button-primary">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      text-align: center;
    }
    .not-found-content {
      max-width: 600px;
      padding: 2rem;
    }
    .error-code {
      font-size: 8rem;
      font-weight: bold;
      color: var(--primary-color);
      line-height: 1;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 2.5rem;
      margin: 0 0 1rem 0;
      color: var(--text-color);
    }
    p {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    @media (max-width: 600px) {
      .error-code {
        font-size: 6rem;
      }
      h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor() {}
}
