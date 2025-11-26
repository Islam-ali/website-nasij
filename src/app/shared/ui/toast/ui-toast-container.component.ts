import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, computed, effect, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { UiToastService } from './ui-toast.service';

type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

@Component({
  selector: 'ui-toast-container',
  standalone: true,
  imports: [CommonModule, NgClass],
  template: `
    <section
      class="fixed z-[1200] pointer-events-none flex flex-col gap-3 p-4"
      [ngClass]="positionClass()"
    >
      @for (toast of toasts(); track toast.id) {
        <article
          class="toast-card pointer-events-auto w-96 rounded-2xl shadow-2xl backdrop-blur-xl border-2 overflow-hidden animate-slide-in group"
          [ngClass]="severityClasses[toast.severity]"
          role="alert"
        >
          <!-- Background Gradient -->
          <div class="absolute inset-0 opacity-10" [ngClass]="backgroundGradients[toast.severity]"></div>
          
          <!-- Content -->
          <div class="relative flex gap-4 p-5">
            <!-- Icon Container -->
            <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" 
                 [ngClass]="iconContainerClasses[toast.severity]">
              <i [class]="iconClasses[toast.severity]" class="text-xl"></i>
            </div>
            
            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              @if (toast.summary) {
                <p class="font-bold text-base mb-1.5" [ngClass]="summaryTextClasses[toast.severity]">
                  {{ toast.summary }}
                </p>
              }
              <p class="text-sm leading-relaxed" [ngClass]="detailTextClasses[toast.severity]">
                {{ toast.detail }}
              </p>
            </div>
            
            <!-- Close Button -->
            <button
              type="button"
              class="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 group-hover:scale-110"
              (click)="dismiss(toast.id)"
              [attr.aria-label]="'Close'"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div class="h-1 w-full bg-black/5 dark:bg-white/5 overflow-hidden">
            <div 
              class="h-full transition-all ease-linear progress-bar"
              [ngClass]="progressBarClasses[toast.severity]"
              [style.animation-duration]="toast.life + 'ms'"
            ></div>
          </div>
        </article>
      }
    </section>
  `,
  styles: [`
    :host {
      position: relative;
      z-index: 1200;
    }
    
    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes slide-in-left {
      from {
        opacity: 0;
        transform: translateX(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    
    @keyframes slide-in-bottom {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    
    .toast-card {
      animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: all 0.3s ease;
    }
    
    .toast-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .progress-bar {
      animation: progress linear;
      animation-fill-mode: forwards;
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToastContainerComponent {
  @Input() position: ToastPosition = 'top-right';
  private readonly toastService = inject(UiToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly toasts = this.toastService.messages;

  readonly severityClasses = {
    info: 'bg-blue-50/95 dark:bg-blue-950/95 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50/95 dark:bg-green-950/95 border-green-200 dark:border-green-800',
    warn: 'bg-amber-50/95 dark:bg-amber-950/95 border-amber-200 dark:border-amber-800',
    error: 'bg-red-50/95 dark:bg-red-950/95 border-red-200 dark:border-red-800',
  };

  readonly backgroundGradients = {
    info: 'bg-gradient-to-br from-blue-400 to-blue-600',
    success: 'bg-gradient-to-br from-green-400 to-green-600',
    warn: 'bg-gradient-to-br from-amber-400 to-amber-600',
    error: 'bg-gradient-to-br from-red-400 to-red-600',
  };

  readonly iconContainerClasses = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warn: 'bg-amber-500 text-white',
    error: 'bg-red-500 text-white',
  };

  readonly iconClasses = {
    info: 'pi pi-info-circle',
    success: 'pi pi-check-circle',
    warn: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
  };

  readonly summaryTextClasses = {
    info: 'text-blue-900 dark:text-blue-100',
    success: 'text-green-900 dark:text-green-100',
    warn: 'text-amber-900 dark:text-amber-100',
    error: 'text-red-900 dark:text-red-100',
  };

  readonly detailTextClasses = {
    info: 'text-blue-800 dark:text-blue-200',
    success: 'text-green-800 dark:text-green-200',
    warn: 'text-amber-800 dark:text-amber-200',
    error: 'text-red-800 dark:text-red-200',
  };

  readonly progressBarClasses = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warn: 'bg-amber-500',
    error: 'bg-red-500',
  };

  readonly positionClass = computed(() => {
    switch (this.position) {
      case 'top-left':
        return 'top-4 left-4 items-start';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end';
      case 'bottom-left':
        return 'bottom-4 left-4 items-start';
      default:
        return 'top-4 right-4 items-end';
    }
  });

  constructor() {
    // Use effect to trigger change detection when signal changes
    effect(() => {
      // Read the signal to track changes
      this.toasts();
      // Mark for check to update view
      this.cdr.markForCheck();
    });
  }

  dismiss(id: string) {
    this.toastService.remove(id);
    this.cdr.markForCheck();
  }
}

