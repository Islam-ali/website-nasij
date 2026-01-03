import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiButtonComponent } from '../../../shared/ui';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, UiButtonComponent],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <h2>Oops! The page you're looking for doesn't exist.</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <div class="action-buttons">
          <ui-button variant="primary" routerLink="/">
            <i class="pi pi-home mr-2"></i>
            Go to Home
          </ui-button>
          <ui-button variant="secondary" routerLink="/shop">
            <i class="pi pi-shopping-bag mr-2"></i>
            Browse Products
          </ui-button>
        </div>
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
      max-width: 700px;
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
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }
    h2 {
      font-size: 1.5rem;
      margin: 0 0 1rem 0;
      color: var(--text-color-secondary);
      font-weight: 400;
    }
    h3 {
      font-size: 1.25rem;
      margin: 1.5rem 0 1rem 0;
      color: var(--text-color);
    }
    p {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .helpful-links {
      margin: 2rem 0;
      text-align: left;
    }
    .helpful-links ul {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }
    .helpful-links li {
      margin: 0.75rem 0;
    }
    .helpful-links a {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 1rem;
      transition: color 0.3s;
    }
    .helpful-links a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }
    @media (max-width: 600px) {
      .error-code {
        font-size: 6rem;
      }
      h1 {
        font-size: 2rem;
      }
      h2 {
        font-size: 1.25rem;
      }
      .helpful-links {
        text-align: center;
      }
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor() {}
}
