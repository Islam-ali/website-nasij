import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ProductCardComponent } from "../product-card/product-card.component";
import { TranslationService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemsPerView: number = 3; // Default 3 items per view
  @Input() itemsPerScroll: number = 1; // Number of items to scroll at a time
  @Input() showArrows: boolean = true;
  @Input() showIndicators: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000; // 5 seconds
  @Output() onItemClick: EventEmitter<any> = new EventEmitter<any>();
  
  currentIndex = 0;
  itemsPerPage = 3;
  totalPages = 0;
  domain = environment.domain;
  isRTL = false;
  private autoPlayTimer?: any;
  private resizeObserver?: ResizeObserver;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translationService: TranslationService
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
    }
  }

  private updateRTL() {
    if (isPlatformBrowser(this.platformId)) {
      this.isRTL = this.translationService.isRTL() || document.documentElement.dir === 'rtl';
      // Reset currentIndex when RTL changes to avoid visual glitches
      if (this.items.length > 0) {
        const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
        this.currentIndex = Math.min(this.currentIndex, maxIndex);
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
    }
  }

  @HostListener('window:resize', ['$event'])
  handleResize() {
    this.updateRTL();
    this.updateItemsPerPage();
  }

  @HostListener('document:DOMContentLoaded', ['$event'])
  handleDOMContentLoaded() {
    this.updateRTL();
  }

  private setupResizeListener() {
    if (typeof window !== 'undefined') {
      this.updateItemsPerPage();
    }
  }

  private updateItemsPerPage() {
    if (typeof window === 'undefined') return;
    
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
    
    // Calculate total pages for indicators
    const scrollableItems = Math.max(0, this.items.length - this.itemsPerPage);
    this.totalPages = scrollableItems > 0 ? Math.ceil(scrollableItems / this.itemsPerScroll) + 1 : 1;
    
    // Ensure currentIndex is valid
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }
  }

  next(): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    const nextIndex = Math.min(this.currentIndex + this.itemsPerScroll, maxIndex);
    
    if (nextIndex !== this.currentIndex && nextIndex <= maxIndex) {
      this.currentIndex = nextIndex;
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    } else if (this.autoPlay && this.currentIndex >= maxIndex) {
      // Loop to beginning
      this.currentIndex = 0;
      this.resetAutoPlay();
    }
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.itemsPerScroll);
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    } else if (this.autoPlay && this.currentIndex === 0) {
      // Loop to end
      const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
      this.currentIndex = maxIndex;
      this.resetAutoPlay();
    }
  }

  goToPage(pageIndex: number): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    this.currentIndex = Math.min(pageIndex * this.itemsPerScroll, maxIndex);
    if (this.autoPlay) {
      this.resetAutoPlay();
    }
  }

  get currentPage(): number {
    return Math.floor(this.currentIndex / this.itemsPerScroll);
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0 || this.autoPlay;
  }

  get canGoNext(): boolean {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerPage);
    return this.currentIndex < maxIndex || this.autoPlay;
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }


  startAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayInterval);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

}