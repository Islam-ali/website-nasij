import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ProductCardComponent } from "../product-card/product-card.component";
import { TranslationService } from '../../../core/services/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() items: any[] = [];
  @Input() itemsPerView: number = 3; // Default 3 items per view
  @Input() itemsPerScroll: number = 1; // Number of items to scroll at a time
  @Input() showArrows: boolean = true;
  @Input() showIndicators: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000; // 5 seconds
  @Input() transitionDuration: number = 800; // Transition duration in ms
  @Input() transitionEasing: string = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // Easing function
  @Input() loop: boolean = false; // Enable infinite loop
  @Input() pauseOnHover: boolean = true; // Pause autoplay on hover
  @Input() keyboardNavigation: boolean = true; // Enable keyboard navigation
  @Input() ariaLabel: string = 'Carousel'; // ARIA label for carousel
  @Output() onItemClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSlideChange: EventEmitter<number> = new EventEmitter<number>(); // Emit on slide change
  
  currentIndex = 0;
  itemsPerPage = 3;
  totalPages = 0;
  domain = environment.domain;
  isRTL = false;
  private autoPlayTimer?: any;
  private resizeObserver?: ResizeObserver;
  private languageChangeSubscription?: Subscription;
  private dirObserver?: MutationObserver;
  
  // Drag functionality
  isDragging = false;
  startX = 0;
  currentX = 0;
  dragOffset = 0;
  private dragThreshold = 50; // Minimum drag distance to trigger slide
  private isHovered = false; // Track hover state for autoplay pause
  
  @ViewChild('carouselInner', { static: false }) carouselInner?: ElementRef<HTMLDivElement>;
  @ViewChild('carouselContainer', { static: false }) carouselContainer?: ElementRef<HTMLDivElement>;
  private itemWidth = 0; // Cached item width in pixels
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translationService: TranslationService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isRTL = this.translationService.isRTL() || document.documentElement.dir === 'rtl';
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateRTL();
      this.updateItemsPerPage();
      this.setupResizeListener();
      if (this.autoPlay) {
        this.startAutoPlay();
      }
      if (this.keyboardNavigation) {
        this.setupKeyboardNavigation();
      }
      
      // Listen to language changes
      this.languageChangeSubscription = this.translateService.onLangChange.subscribe(() => {
        this.updateRTL();
        this.cdr.detectChanges();
      });
      
      // Also observe dir attribute changes on document
      this.dirObserver = new MutationObserver(() => {
        this.updateRTL();
      });
      
      this.dirObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir']
      });
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Calculate item width after view init with multiple attempts
      // Use Promise to avoid ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => {
        this.calculateItemWidthPixels();
        if (this.itemWidth === 0) {
          // Retry if calculation failed
          setTimeout(() => this.calculateItemWidthPixels(), 100);
        }
      });
    }
  }

  private updateRTL() {
    if (isPlatformBrowser(this.platformId)) {
      const newRTL = this.translationService.isRTL() || document.documentElement.dir === 'rtl';
      
      // Only update if RTL state actually changed
      if (this.isRTL !== newRTL) {
        this.isRTL = newRTL;
        
        // Reset currentIndex when RTL changes to avoid visual glitches
        if (this.items.length > 0) {
          const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
          this.currentIndex = Math.min(this.currentIndex, maxIndex);
        }
        
        // Force change detection to update arrows
        this.cdr.detectChanges();
      }
    }
  }


  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      window.removeEventListener('resize', this.handleResize);
      // Remove document listeners
      this.removeDocumentListeners();
      // Unsubscribe from language changes
      if (this.languageChangeSubscription) {
        this.languageChangeSubscription.unsubscribe();
      }
      // Disconnect dir observer
      if (this.dirObserver) {
        this.dirObserver.disconnect();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateRTL();
    this.updateItemsPerPage();
    // Recalculate item width on resize
    setTimeout(() => this.calculateItemWidthPixels(), 100);
  }

  @HostListener('document:DOMContentLoaded', ['$event'])
  handleDOMContentLoaded() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateRTL();
  }

  private setupResizeListener() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateItemsPerPage();
  }

  private updateItemsPerPage() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const width = window.innerWidth;
    
    // Use input itemsPerView as base, but adjust for screen size
    if (width < 640) {
      this.itemsPerPage = 1;
    } else if (width < 768) {
      this.itemsPerPage = Math.min(2, this.itemsPerView);
    } else if (width < 1024) {
      this.itemsPerPage = Math.min(2, this.itemsPerView);
    } else if (width < 1280) {
      this.itemsPerPage = Math.min(3, this.itemsPerView);
    } else {
      this.itemsPerPage = Math.min(this.itemsPerView, 5); // Max 5 items on large screens
    }
    
    // Ensure itemsPerPage doesn't exceed items length
    this.itemsPerPage = Math.min(this.itemsPerPage, this.items.length);
    
    // If itemsPerPage equals or exceeds items length, show all items (no scroll)
    if (this.itemsPerPage >= this.items.length) {
      this.itemsPerPage = this.items.length;
      this.totalPages = 1;
      this.currentIndex = 0;
      return;
    }
    
    // Calculate total pages for indicators (move by 1 item at a time)
    const scrollableItems = Math.max(0, this.items.length - this.itemsPerPage);
    this.totalPages = scrollableItems > 0 ? scrollableItems + 1 : 1;
    
    // Ensure currentIndex is valid
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }
    
    // Recalculate item width after itemsPerPage changes
    // Use Promise to avoid ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => this.calculateItemWidthPixels());
  }

  next(): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    // Move by one item at a time
    let nextIndex = Math.min(this.currentIndex + 1, maxIndex);
    
    if (this.loop && this.currentIndex >= maxIndex) {
      // Loop to beginning
      nextIndex = 0;
    }
    
    if (nextIndex !== this.currentIndex && (nextIndex <= maxIndex || this.loop)) {
      this.currentIndex = nextIndex;
      this.onSlideChange.emit(this.currentIndex);
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    }
  }

  previous(): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    let prevIndex = Math.max(0, this.currentIndex - 1);
    
    if (this.loop && this.currentIndex === 0) {
      // Loop to end
      prevIndex = maxIndex;
    }
    
    if (prevIndex !== this.currentIndex || (this.loop && this.currentIndex === 0)) {
      this.currentIndex = prevIndex;
      this.onSlideChange.emit(this.currentIndex);
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    }
  }

  goToPage(pageIndex: number): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    // Move by one item at a time
    const targetIndex = Math.min(pageIndex, maxIndex);
    if (targetIndex !== this.currentIndex) {
      this.currentIndex = targetIndex;
      this.onSlideChange.emit(this.currentIndex);
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    }
  }

  get currentPage(): number {
    // Since we move by 1 item, currentPage equals currentIndex
    return this.currentIndex;
  }

  get canGoPrevious(): boolean {
    return this.loop || this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    return this.loop || this.currentIndex < maxIndex;
  }

  get pagesArray(): number[] {
    // Return array of page indices (0 to totalPages - 1)
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }


  startAutoPlay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    // Don't start if paused on hover and currently hovered
    if (this.pauseOnHover && this.isHovered) {
      return;
    }
    this.autoPlayTimer = setInterval(() => {
      if (!this.pauseOnHover || !this.isHovered) {
        this.next();
      }
    }, this.autoPlayInterval);
  }
  
  onMouseEnter(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Don't pause if we're dragging
    if (this.isDragging) return;
    
    // Simple hover detection - only pause autoplay, don't affect individual items
    this.isHovered = true;
    if (this.pauseOnHover && this.autoPlay) {
      this.stopAutoPlay();
    }
  }
  
  onMouseLeave(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Simple leave detection - only resume autoplay
    this.isHovered = false;
    if (this.pauseOnHover && this.autoPlay && !this.isDragging) {
      this.startAutoPlay();
    }
  }
  
  setupKeyboardNavigation(): void {
    // Keyboard navigation is handled via @HostListener
  }
  
  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId) || !this.keyboardNavigation) return;
    
    // Only handle if carousel container or its children have focus
    const target = event.target as HTMLElement;
    if (!this.carouselContainer?.nativeElement?.contains(target)) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (this.isRTL) {
          this.next();
        } else {
          this.previous();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.isRTL) {
          this.previous();
        } else {
          this.next();
        }
        break;
      case 'Home':
        event.preventDefault();
        this.goToPage(0);
        break;
      case 'End':
        event.preventDefault();
        const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
        this.goToPage(maxIndex);
        break;
    }
  }

  stopAutoPlay(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Drag functionality
  onDragStart(event: MouseEvent | TouchEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.isDragging = true;
    this.startX = this.getEventX(event);
    this.currentX = this.startX;
    this.dragOffset = 0;
    
    // Stop autoplay during drag
    if (this.autoPlay) {
      this.stopAutoPlay();
    }
    
    // Add event listeners to document to track drag even outside element
    if (event instanceof MouseEvent) {
      document.addEventListener('mousemove', this.onDocumentMouseMove);
      document.addEventListener('mouseup', this.onDocumentMouseUp);
    } else {
      document.addEventListener('touchmove', this.onDocumentTouchMove, { passive: false });
      document.addEventListener('touchend', this.onDocumentTouchEnd);
    }
    
    // Prevent default to avoid text selection
    event.preventDefault();
    event.stopPropagation();
  }

  private onDocumentMouseMove = (event: MouseEvent) => {
    this.onDragMove(event);
  };

  private onDocumentMouseUp = (event: MouseEvent) => {
    this.onDragEnd();
    this.removeDocumentListeners();
  };

  private onDocumentTouchMove = (event: TouchEvent) => {
    this.onDragMove(event);
  };

  private onDocumentTouchEnd = (event: TouchEvent) => {
    this.onDragEnd();
    this.removeDocumentListeners();
  };

  private removeDocumentListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    document.removeEventListener('touchmove', this.onDocumentTouchMove);
    document.removeEventListener('touchend', this.onDocumentTouchEnd);
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !isPlatformBrowser(this.platformId)) return;
    
    const newX = this.getEventX(event);
    if (newX === 0 && this.startX === 0) return; // Invalid event
    
    this.currentX = newX;
    this.dragOffset = this.currentX - this.startX;
    
    // Prevent default scrolling
    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnd(): void {
    if (!this.isDragging || !isPlatformBrowser(this.platformId)) return;
    
    const itemWidth = this.calculateItemWidth();
    const threshold = itemWidth * 0.3; // 30% of item width
    const hadSignificantDrag = Math.abs(this.dragOffset) > threshold;
    
    // Determine if we should move to next/previous slide
    if (hadSignificantDrag) {
      // Save the drag direction and current offset
      const dragDirection = this.dragOffset > 0;
      const currentOffset = this.dragOffset;
      
      // Calculate target index
      let targetIndex = this.currentIndex;
      if (this.isRTL) {
        // In RTL: dragging right (positive) goes to next, dragging left (negative) goes to previous
        if (dragDirection) {
          // Dragging right in RTL = next
          const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
          targetIndex = Math.min(this.currentIndex + 1, maxIndex);
        } else {
          // Dragging left in RTL = previous
          targetIndex = Math.max(0, this.currentIndex - 1);
        }
      } else {
        // In LTR: dragging right (positive) goes to previous, dragging left (negative) goes to next
        if (dragDirection) {
          // Dragging right in LTR = previous
          targetIndex = Math.max(0, this.currentIndex - 1);
        } else {
          // Dragging left in LTR = next
          const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
          targetIndex = Math.min(this.currentIndex + 1, maxIndex);
        }
      }
      
      // Check if target index is valid and different
      if (targetIndex === this.currentIndex) {
        // No change needed, just reset drag
        this.dragOffset = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        return;
      }
      
      // Animate smoothly from current drag position to target position
      if (!isPlatformBrowser(this.platformId)) {
        this.currentIndex = targetIndex;
        this.dragOffset = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        return;
      }
      
      // Update currentIndex first
      this.currentIndex = targetIndex;
      this.onSlideChange.emit(this.currentIndex);
      
      // Reset drag offset immediately to prevent jumping
      // The CSS transition will handle the smooth movement
      this.dragOffset = 0;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      
      // Force change detection to update the transform
      if (isPlatformBrowser(this.platformId)) {
        this.cdr.detectChanges();
      }
      
      // Reset autoplay if enabled
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
      
      return; // Exit early, state will be reset in animation
    } else {
      // Smoothly return to original position if drag wasn't significant
      if (!isPlatformBrowser(this.platformId)) {
        this.dragOffset = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        return;
      }
      
      const startOffset = this.dragOffset;
      const startTime = performance.now();
      const duration = 500; // 500ms animation for calmer return
      
      const animate = (currentTime: number) => {
        if (!isPlatformBrowser(this.platformId)) return;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Gentle ease-out function for calm return
        // Using cubic-bezier(0.25, 0.46, 0.45, 0.94) equivalent
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        
        this.dragOffset = startOffset * (1 - easeOutQuad);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.dragOffset = 0;
          this.isDragging = false;
          this.startX = 0;
          this.currentX = 0;
        }
      };
      
      requestAnimationFrame(animate);
      return; // Exit early, state will be reset in animation
    }
    
    // Resume autoplay if enabled
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  private getEventX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return 0;
  }

  private calculateItemWidth(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    const container = document.querySelector('.carousel-inner');
    if (!container) return 0;
    const containerWidth = container.clientWidth;
    const gap = 16; // 1rem = 16px
    return (containerWidth - (gap * (this.itemsPerPage - 1))) / this.itemsPerPage;
  }

  private calculateItemWidthPixels(): void {
    if (!isPlatformBrowser(this.platformId) || !this.carouselInner?.nativeElement) return;
    
    const container = this.carouselInner.nativeElement;
    const containerWidth = container.clientWidth;
    
    if (containerWidth === 0) return; // Container not ready yet
    
    const gap = 16; // 1rem = 16px
    const calculatedWidth = (containerWidth - (gap * (this.itemsPerPage - 1))) / this.itemsPerPage;
    
    if (calculatedWidth > 0 && Math.abs(this.itemWidth - calculatedWidth) > 0.1) {
      this.itemWidth = calculatedWidth;
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      // Only use setTimeout in browser environment
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    }
  }

  getTransform(): string {
    // PrimeNG-style: Move by full item width (snap-to-item)
    // Don't modify state in getter - this causes ExpressionChangedAfterItHasBeenCheckedError
    // Use pixel-based calculation if available, otherwise use calc()
    if (isPlatformBrowser(this.platformId) && this.itemWidth > 0) {
      const gap = 16; // 1rem = 16px
      // Move by full item width + gap for snap-to-item behavior
      const moveDistance = (this.itemWidth + gap) * this.currentIndex;
      const baseTransform = this.isRTL 
        ? `translateX(${moveDistance}px)`
        : `translateX(-${moveDistance}px)`;
      
      if (this.isDragging && this.dragOffset !== 0) {
        // dragOffset is already in the correct direction for both RTL and LTR
        return `${baseTransform} translateX(${this.dragOffset}px)`;
      }
      
      return baseTransform;
    }
    
    // Fallback to calc() if itemWidth not calculated yet
    // Move by full item (100% / itemsPerPage + gap)
    const baseTransform = this.isRTL 
      ? `translateX(calc(${this.currentIndex} * ((100% + 1rem) / ${this.itemsPerPage})))`
      : `translateX(calc(-${this.currentIndex} * ((100% + 1rem) / ${this.itemsPerPage})))`;
    
    if (this.isDragging && this.dragOffset !== 0) {
      // dragOffset is already in the correct direction for both RTL and LTR
      return `${baseTransform} translateX(${this.dragOffset}px)`;
    }
    
    return baseTransform;
  }

}