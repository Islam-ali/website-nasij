import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ProductCardComponent } from "../product-card/product-card.component";
import { TranslationService } from '../../../core/services/translate.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carousel',
  standalone: true,
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
  @Input() transitionDuration: number = 400; // Transition duration in ms (optimized)
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
  startY = 0;
  currentX = 0;
  currentY = 0;
  dragOffset = 0;
  // Removed unused dragThreshold - using DRAG_THRESHOLD_RATIO instead
  private isHovered = false; // Track hover state for autoplay pause
  private hasActualDrag = false; // Track if user actually dragged (not just clicked)
  private dragStartTarget: HTMLElement | null = null; // Store the element that was clicked
  private isHorizontalDrag = false; // Track if drag is horizontal (carousel) or vertical (scroll)
  private dragStartTime = 0; // Track drag start time for velocity calculation
  
  @ViewChild('carouselInner', { static: false }) carouselInner?: ElementRef<HTMLDivElement>;
  @ViewChild('carouselContainer', { static: false }) carouselContainer?: ElementRef<HTMLDivElement>;
  private itemWidth = 0; // Cached item width in pixels
  transformString = 'translateX(0)'; // Cached transform string to avoid ExpressionChangedAfterItHasBeenCheckedError
  
  // Constants
  private readonly GAP_PX = 16; // 1rem = 16px
  private readonly MOMENTUM_THRESHOLD = 0.3; // Velocity threshold for momentum
  private readonly MIN_DRAG_DISTANCE = 10; // Minimum pixels for drag detection
  private readonly VERTICAL_SCROLL_THRESHOLD = 15; // Pixels to detect vertical scroll
  
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
      // Initialize transform string - defer to avoid ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => {
        this.updateTransformString();
        // Calculate item width after view init with multiple attempts
        this.calculateItemWidthPixels();
        this.updateTransformString();
        if (this.itemWidth === 0) {
          // Retry if calculation failed
          setTimeout(() => {
            this.calculateItemWidthPixels();
            this.updateTransformString();
          }, 100);
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
          const maxIndex = this.getMaxIndex();
          this.currentIndex = Math.min(this.currentIndex, maxIndex);
        }
        
        // Force change detection to update arrows
        this.cdr.detectChanges();
      }
    }
  }


  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Clean up autoplay timer
    this.stopAutoPlay();
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
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

  @HostListener('window:resize')
  handleResize() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateRTL();
    this.updateItemsPerPage();
    // Recalculate item width on resize
    setTimeout(() => {
      this.calculateItemWidthPixels();
      this.updateTransformString();
    }, 100);
  }

  @HostListener('document:DOMContentLoaded')
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
    // But allow scrolling even if itemsPerPage equals items.length
    this.itemsPerPage = Math.min(this.itemsPerPage, this.items.length);
    
    // Calculate total pages for indicators
    // Since we move by 1 item at a time, total pages = total scrollable positions
    // Always allow scrolling to see all items
    // When itemsPerPage = 1, we can scroll through all items (items.length positions)
    // When itemsPerPage > 1, we can scroll through (items.length - itemsPerPage + 1) positions
    if (this.itemsPerPage >= this.items.length) {
      // If itemsPerPage >= items.length, we can still scroll through all items one by one
      this.totalPages = this.items.length;
    } else {
      // Calculate scrollable positions: we can show items from index 0 to (items.length - itemsPerPage)
      const scrollablePositions = this.items.length - this.itemsPerPage + 1;
      this.totalPages = Math.max(1, scrollablePositions);
    }
    
    // Ensure currentIndex is valid
    const maxIndex = this.getMaxIndex();
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }
    
    // Recalculate item width after itemsPerPage changes
    // Use Promise to avoid ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => {
      this.calculateItemWidthPixels();
      this.updateTransformString();
    });
  }

  next(): void {
    const maxIndex = this.getMaxIndex();
    // Move by one item at a time
    let nextIndex = Math.min(this.currentIndex + 1, maxIndex);
    
    if (this.loop && this.currentIndex >= maxIndex) {
      // Loop to beginning
      nextIndex = 0;
    }
    
    if (nextIndex !== this.currentIndex && (nextIndex <= maxIndex || this.loop)) {
      this.goToIndex(nextIndex);
    }
  }

  previous(): void {
    const maxIndex = this.getMaxIndex();
    let prevIndex = Math.max(0, this.currentIndex - 1);
    
    if (this.loop && this.currentIndex === 0) {
      // Loop to end
      prevIndex = maxIndex;
    }
    
    if (prevIndex !== this.currentIndex || (this.loop && this.currentIndex === 0)) {
      this.goToIndex(prevIndex);
    }
  }

  goToPage(pageIndex: number): void {
    const maxIndex = this.getMaxIndex();
    // Move by one item at a time
    const targetIndex = Math.min(pageIndex, maxIndex);
    if (targetIndex !== this.currentIndex) {
      this.goToIndex(targetIndex);
    }
  }
  
  private goToIndex(index: number): void {
    this.currentIndex = index;
    // Update transform string - use Promise to avoid ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => {
      this.updateTransformString();
    });
    this.onSlideChange.emit(this.currentIndex);
    if (this.autoPlay) {
      this.resetAutoPlay();
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
    return this.loop || this.currentIndex < this.getMaxIndex();
  }
  
  private getMaxIndex(): number {
    return Math.max(0, this.items.length - this.itemsPerPage);
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
        this.goToPage(this.getMaxIndex());
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

    // Store the initial target element for later click handling
    const clickedElement = event.target as HTMLElement;
    this.dragStartTarget = clickedElement;

    // For mouse events, start dragging immediately (allow dragging from anywhere)
    if (event instanceof MouseEvent) {
      this.isDragging = true;
      this.hasActualDrag = false;
      this.isHorizontalDrag = false;
      this.startX = this.getEventX(event);
      this.startY = this.getEventY(event);
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.dragOffset = 0;
      this.dragStartTime = performance.now();

      // Stop autoplay during drag
      if (this.autoPlay) {
        this.stopAutoPlay();
      }

      // Add event listeners to document to track drag even outside element
      document.addEventListener('mousemove', this.onDocumentMouseMove);
      document.addEventListener('mouseup', this.onDocumentMouseUp);

      // Don't prevent default here - only prevent if user actually drags horizontally
      return;
    }
    
    // For touch events, don't start dragging immediately - wait to see if it's horizontal
    // This allows vertical scrolling to work normally
    if (event instanceof TouchEvent) {
      // Just store the initial position, don't set isDragging yet
      // Allow dragging from anywhere, even on product cards
      this.startX = this.getEventX(event);
      this.startY = this.getEventY(event);
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.dragOffset = 0;
      this.hasActualDrag = false;
      this.isHorizontalDrag = false;

      // Add passive listener to detect direction
      document.addEventListener('touchmove', this.onDocumentTouchMove, { passive: true });
      document.addEventListener('touchend', this.onDocumentTouchEnd);
      return;
    }
    
    // For mouse events, start dragging immediately
    this.isDragging = true;
    this.hasActualDrag = false;
    this.isHorizontalDrag = false;
    this.startX = this.getEventX(event);
    this.startY = this.getEventY(event);
    this.currentX = this.startX;
    this.currentY = this.startY;
    this.dragOffset = 0;
    this.dragStartTime = performance.now();
    
    // Stop autoplay during drag
    if (this.autoPlay) {
      this.stopAutoPlay();
    }
    
    // Add event listeners to document to track drag even outside element
    if (!isPlatformBrowser(this.platformId)) return;
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
    
    // Don't prevent default here - only prevent if user actually drags horizontally
    // This allows click events and vertical scroll to pass through
  }

  private onDocumentMouseMove = (event: MouseEvent) => {
    this.onDragMove(event);
  };

  private onDocumentMouseUp = (event: MouseEvent) => {
    this.onDragEnd();
    this.removeDocumentListeners();
  };

  private onDocumentTouchMove = (event: TouchEvent) => {
    // First check: determine if this is horizontal or vertical movement
    if (!this.isDragging && this.startX !== 0) {
      const deltaX = Math.abs(this.getEventX(event) - this.startX);
      const deltaY = Math.abs(this.getEventY(event) - this.startY);
      
      // If vertical movement is greater, it's a scroll - don't interfere
      if (deltaY > deltaX && deltaY > this.VERTICAL_SCROLL_THRESHOLD) {
        // Clear everything and allow normal scroll
        this.startX = 0;
        this.startY = 0;
        this.removeDocumentListeners();
        return;
      }
      
      // If horizontal movement is greater, start carousel drag
      if (deltaX > deltaY && deltaX > this.VERTICAL_SCROLL_THRESHOLD) {
        this.isDragging = true;
        this.isHorizontalDrag = true;
        this.hasActualDrag = true;
        this.dragStartTime = performance.now();
        
        // Stop autoplay during drag
        if (this.autoPlay) {
          this.stopAutoPlay();
        }
        
        // Remove passive listener and add non-passive one to prevent scroll
        document.removeEventListener('touchmove', this.onDocumentTouchMove);
        document.addEventListener('touchmove', this.onDocumentTouchMoveNonPassive, { passive: false });
        
        // Now handle the drag
        this.onDragMove(event);
        return;
      }
      
      // Not enough movement yet, continue waiting
      return;
    }
    
    // If already dragging horizontally, continue
    if (this.isDragging && this.isHorizontalDrag) {
      this.onDragMove(event);
    }
  };

  private onDocumentTouchMoveNonPassive = (event: TouchEvent) => {
    this.onDragMove(event);
  };

  private onDocumentTouchEnd = (event: TouchEvent) => {
    // Only call onDragEnd if we were actually dragging
    if (this.isDragging) {
      this.onDragEnd();
    } else {
      // Just clean up if we weren't dragging
      this.startX = 0;
      this.startY = 0;
      this.removeDocumentListeners();
    }
  };

  private removeDocumentListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    document.removeEventListener('touchmove', this.onDocumentTouchMove);
    document.removeEventListener('touchmove', this.onDocumentTouchMoveNonPassive);
    document.removeEventListener('touchend', this.onDocumentTouchEnd);
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !isPlatformBrowser(this.platformId)) return;

    const newX = this.getEventX(event);
    const newY = this.getEventY(event);
    if (newX === 0 && this.startX === 0) return; // Invalid event
    
    this.currentX = newX;
    this.currentY = newY;
    this.dragOffset = this.currentX - this.startX;
    
    // Check if this is a horizontal drag (for carousel) or vertical (for scroll)
    const deltaX = Math.abs(this.dragOffset);
    const deltaY = Math.abs(newY - this.startY);
    
    // Only treat as drag if horizontal movement is greater than vertical
    // This allows vertical scrolling to work normally
    if (deltaX > deltaY && deltaX > this.MIN_DRAG_DISTANCE) {
      if (!this.isHorizontalDrag) {
        this.isHorizontalDrag = true;
      }
      this.hasActualDrag = true;
      // Update transform string during drag - update immediately for smooth dragging
      if (isPlatformBrowser(this.platformId)) {
        this.transformString = this.getTransform();
      }
      // Prevent default scrolling only when actually dragging horizontally
      if (event instanceof TouchEvent) {
        event.preventDefault();
      }
      event.stopPropagation();
    } else if (deltaY > deltaX && deltaY > this.VERTICAL_SCROLL_THRESHOLD) {
      // Vertical scroll detected, cancel drag and allow scroll
      this.isDragging = false;
      this.hasActualDrag = false;
      this.isHorizontalDrag = false;
      this.dragOffset = 0;
      this.startX = 0;
      this.startY = 0;
      this.removeDocumentListeners();
      return;
    }
  }

  onDragEnd(): void {
    if (!this.isDragging || !isPlatformBrowser(this.platformId)) return;

    // For small drags or clicks, let the natural click events from product-card component handle it
    // Only prevent default carousel behavior for significant drags
    if (!this.hasActualDrag) {
      // Reset state and let product-card component handle the click naturally
      this.resetDragState();
      return;
    }
    
    const itemWidth = this.calculateItemWidth();
    const maxIndex = this.getMaxIndex();

    // Calculate how many items to move based on drag distance
    const itemsToMove = Math.round(Math.abs(this.dragOffset) / itemWidth);

    // Minimum threshold for any movement
    const minThreshold = itemWidth * 0.1; // 10% of item width
    const hadSignificantDrag = Math.abs(this.dragOffset) > minThreshold && itemsToMove > 0;

    // Calculate velocity for momentum scrolling
    const dragDuration = this.dragStartTime > 0 ? performance.now() - this.dragStartTime : 0;
    const velocity = dragDuration > 0 ? Math.abs(this.dragOffset) / dragDuration : 0;
    const hasMomentum = velocity > this.MOMENTUM_THRESHOLD;

    // Determine if we should move slides
    if (hadSignificantDrag) {
      // Save the drag direction
      const dragDirection = this.dragOffset > 0;

      // Calculate target index based on drag distance and direction
      let targetIndex = this.currentIndex;

      if (this.isRTL) {
        // In RTL: dragging right (positive) goes to next, dragging left (negative) goes to previous
        if (dragDirection) {
          // Dragging right in RTL = next (increase index)
          targetIndex = Math.min(this.currentIndex + itemsToMove, maxIndex);
        } else {
          // Dragging left in RTL = previous (decrease index)
          targetIndex = Math.max(0, this.currentIndex - itemsToMove);
        }
      } else {
        // In LTR: dragging right (positive) goes to previous, dragging left (negative) goes to next
        if (dragDirection) {
          // Dragging right in LTR = previous (decrease index)
          targetIndex = Math.max(0, this.currentIndex - itemsToMove);
        } else {
          // Dragging left in LTR = next (increase index)
          targetIndex = Math.min(this.currentIndex + itemsToMove, maxIndex);
        }
      }
      
      // Ensure targetIndex doesn't exceed maxIndex
      targetIndex = Math.min(targetIndex, maxIndex);
      
      // Check if target index is valid and different
      if (targetIndex === this.currentIndex && !hasMomentum) {
        // No change needed, just reset drag
        this.dragOffset = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.dragStartTime = 0;
        return;
      }
      
      // If has momentum, add one more item in the drag direction
      if (hasMomentum) {
        if (this.dragOffset > 0) {
          if (this.isRTL) {
            targetIndex = Math.min(targetIndex + 1, maxIndex);
          } else {
            targetIndex = Math.max(targetIndex - 1, 0);
          }
        } else {
          if (this.isRTL) {
            targetIndex = Math.max(targetIndex - 1, 0);
          } else {
            targetIndex = Math.min(targetIndex + 1, maxIndex);
          }
        }
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
      
      // Update to target index
      this.goToIndex(targetIndex);
      
      // Reset drag offset immediately to prevent jumping
      // The CSS transition will handle the smooth movement
      this.dragOffset = 0;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      
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
        // Update transform string during animation - update immediately for smooth animation
        if (isPlatformBrowser(this.platformId)) {
          this.transformString = this.getTransform();
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.resetDragState();
        }
      };
      
      requestAnimationFrame(animate);
      return; // Exit early, state will be reset in animation
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

  private getEventY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientY;
    }
    return 0;
  }

  private resetDragState(): void {
    this.isDragging = false;
    this.hasActualDrag = false;
    this.isHorizontalDrag = false;
    this.dragOffset = 0;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.dragStartTime = 0;
    this.dragStartTarget = null;
    this.transformString = this.getTransform();
    this.cdr.detectChanges();
  }

  private calculateItemWidth(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    
    // Try to use cached itemWidth first
    if (this.itemWidth > 0) {
      return this.itemWidth;
    }
    
    // Try to get from carouselInner if available
    if (this.carouselInner?.nativeElement) {
      const container = this.carouselInner.nativeElement;
      const containerWidth = container.clientWidth;
      
      if (containerWidth > 0 && container.children.length > 0) {
        const firstItem = container.children[0] as HTMLElement;
        if (firstItem) {
          const rect = firstItem.getBoundingClientRect();
          if (rect.width > 0) {
            return rect.width;
          }
        }
      }
    }
    
    // Fallback: query selector
    const container = document.querySelector('.carousel-inner') as HTMLElement;
    if (!container) return 0;
    const containerWidth = container.clientWidth;
    return (containerWidth - (this.GAP_PX * (this.itemsPerPage - 1))) / this.itemsPerPage;
  }

  private calculateItemWidthPixels(): void {
    if (!isPlatformBrowser(this.platformId) || !this.carouselInner?.nativeElement) return;
    
    const container = this.carouselInner.nativeElement;
    const containerWidth = container.clientWidth;
    
    if (containerWidth === 0) return; // Container not ready yet
    
    // Try to get actual width from DOM first
    let calculatedWidth = 0;
    if (container.children.length > 0) {
      const firstItem = container.children[0] as HTMLElement;
      if (firstItem) {
        const rect = firstItem.getBoundingClientRect();
        calculatedWidth = rect.width;
      }
    }
    
    // Fallback to calculation if DOM width not available
    if (calculatedWidth <= 0) {
      calculatedWidth = (containerWidth - (this.GAP_PX * (this.itemsPerPage - 1))) / this.itemsPerPage;
    }
    
    if (calculatedWidth > 0 && Math.abs(this.itemWidth - calculatedWidth) > 0.1) {
      this.itemWidth = calculatedWidth;
      // Update transform string - use Promise to avoid ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => {
        this.updateTransformString();
      });
    }
  }

  private updateTransformString(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    // This ensures the update happens after the current change detection cycle
    if (isPlatformBrowser(this.platformId)) {
      // Use requestAnimationFrame for smoother updates during animations
      if (this.isDragging) {
        // During drag, update immediately for smooth dragging
        this.transformString = this.getTransform();
      } else {
        // For non-drag updates, defer to next tick to avoid change detection errors
        Promise.resolve().then(() => {
          this.transformString = this.getTransform();
          this.cdr.markForCheck();
        });
      }
    } else {
      this.transformString = this.getTransform();
    }
  }

  getTransform(): string {
    // Move by exactly one item width + gap at a time
    // Don't modify state in getter - this causes ExpressionChangedAfterItHasBeenCheckedError
    if (isPlatformBrowser(this.platformId) && this.carouselInner?.nativeElement) {
      const container = this.carouselInner.nativeElement;
      const containerWidth = container.clientWidth;
      
      if (containerWidth === 0) return 'translateX(0)';
      
      // Get actual item width from DOM - use getBoundingClientRect for precise measurement
      let actualItemWidth = 0;
      
      if (container.children.length > 0) {
        const firstItem = container.children[0] as HTMLElement;
        if (firstItem) {
          // Use getBoundingClientRect for more accurate width measurement
          const rect = firstItem.getBoundingClientRect();
          actualItemWidth = rect.width;
        }
      }
      
      // Fallback: use cached itemWidth or calculate it
      if (actualItemWidth <= 0) {
        actualItemWidth = this.itemWidth;
      }
      
      if (actualItemWidth <= 0) {
        actualItemWidth = (containerWidth - (this.GAP_PX * (this.itemsPerPage - 1))) / this.itemsPerPage;
      }
      
      // Calculate the exact distance to move: one item width + gap
      // This is the actual space one item occupies (width + gap between items)
      const oneItemMove = actualItemWidth + this.GAP_PX;
      
      // Calculate total content width
      const totalContentWidth = oneItemMove * this.items.length - this.GAP_PX;
      
      // Calculate maximum transform to show the last item(s)
      const maxIndex = this.getMaxIndex();
      
      // Calculate maxTransform: ensure we can reach the last item(s)
      // The key is to ensure we can scroll to maxIndex to show the last itemsPerPage items
      // maxIndex = items.length - itemsPerPage
      // So we need to scroll by maxIndex items: oneItemMove * maxIndex
      const maxTransform = oneItemMove * maxIndex;
      
      // Move by exactly one item width + gap for each index
      // Each movement = oneItemMove (itemWidth + gap)
      const moveDistance = oneItemMove * this.currentIndex;
      
      // Clamp to prevent going beyond the end, but ensure we can reach maxIndex
      // Important: Allow movement up to maxTransform to show all items
      let clampedDistance = Math.min(moveDistance, maxTransform);
      
      // Ensure we can always reach maxIndex (critical for showing last items)
      // If currentIndex is at maxIndex, ensure we can move to maxTransform
      if (this.currentIndex >= maxIndex) {
        clampedDistance = maxTransform;
      }
      
      const baseTransform = this.isRTL 
        ? `translateX(${Math.round(clampedDistance)}px)`
        : `translateX(-${Math.round(clampedDistance)}px)`;
      
      if (this.isDragging && this.dragOffset !== 0) {
        // When dragging, allow temporary movement with elastic bounds
        const totalOffset = this.isRTL 
          ? clampedDistance + this.dragOffset
          : -clampedDistance + this.dragOffset;
        
        // Apply elastic resistance at boundaries (bounce effect)
        let clampedOffset = 0;
        if (this.isRTL) {
          if (totalOffset < 0) {
            // Beyond start - apply resistance
            clampedOffset = totalOffset * 0.3 - clampedDistance;
          } else if (totalOffset > maxTransform) {
            // Beyond end - apply resistance
            clampedOffset = (totalOffset - maxTransform) * 0.3 + maxTransform - clampedDistance;
          } else {
            clampedOffset = totalOffset - clampedDistance;
          }
        } else {
          if (totalOffset > 0) {
            // Beyond start - apply resistance
            clampedOffset = totalOffset * 0.3 + clampedDistance;
          } else if (totalOffset < -maxTransform) {
            // Beyond end - apply resistance
            clampedOffset = (totalOffset + maxTransform) * 0.3 - maxTransform + clampedDistance;
          } else {
            clampedOffset = totalOffset + clampedDistance;
          }
        }
        
        return `${baseTransform} translateX(${Math.round(clampedOffset)}px)`;
      }
      
      return baseTransform;
    }
    
    // Fallback to calc() if container not ready yet
    // Move by exactly one item width + gap at a time
    const maxIndex = this.getMaxIndex();
    const clampedIndex = Math.min(this.currentIndex, maxIndex);
    
    // Calculate single item move: (100% + gap) / itemsPerPage
    // This represents the actual space one item takes (width + gap)
    const singleItemMove = `((100% + 1rem) / ${this.itemsPerPage})`;
    
    const baseTransform = this.isRTL 
      ? `translateX(calc(${clampedIndex} * ${singleItemMove}))`
      : `translateX(calc(-${clampedIndex} * ${singleItemMove}))`;
    
    if (this.isDragging && this.dragOffset !== 0) {
      return `${baseTransform} translateX(${this.dragOffset}px)`;
    }
    
    return baseTransform;
  }

}