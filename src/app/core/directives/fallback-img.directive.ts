import { Directive, HostListener, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { environment } from '../../../environments/environment';

@Directive({
  selector: 'img[fallback]',
  standalone: true
})
export class FallbackImgDirective implements OnInit {
  @Input() fallback = 'images/photo.png';
  private hasAddedDomain = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Add domain before src if it's a relative path
    this.addDomainToSrc();
    // Add performance attributes
    this.addPerformanceAttributes();
  }

  private addPerformanceAttributes(): void {
    const element = this.el.nativeElement;
    
    // Add loading="lazy" if not already present
    if (!element.hasAttribute('loading')) {
      this.renderer.setAttribute(element, 'loading', 'lazy');
    }
    
    // Add decoding="async" for better performance
    if (!element.hasAttribute('decoding')) {
      this.renderer.setAttribute(element, 'decoding', 'async');
    }
    
    // Add fetchpriority="auto" if not specified
    if (!element.hasAttribute('fetchpriority')) {
      this.renderer.setAttribute(element, 'fetchpriority', 'auto');
    }
  }

  private addDomainToSrc(): void {
    if (this.hasAddedDomain) return;

    const element = this.el.nativeElement;
    const currentSrc = element.getAttribute('src');

    if (currentSrc && !this.isAbsoluteUrl(currentSrc)) {
      // If it's a relative URL, prepend the domain
      const fullUrl = this.buildFullUrl(currentSrc);
      this.renderer.setAttribute(element, 'src', fullUrl);
      this.hasAddedDomain = true;
    }
  }

  private isAbsoluteUrl(url: string): boolean {
    // Check if URL starts with http://, https://, //, or data:
    return /^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:');
  }

  private buildFullUrl(src: string): string {
    // Remove leading slash if exists to avoid double slashes
    const cleanSrc = src.startsWith('/') ? src : '/' + src;
    return environment.domain + cleanSrc;
  }

  @HostListener('error')
  onError(): void {
    const element = this.el.nativeElement;
    const fallbackUrl = this.isAbsoluteUrl(this.fallback) 
      ? this.fallback 
      : this.buildFullUrl(this.fallback);

    // Prevent infinite loop if fallback also fails
    if (element.src !== fallbackUrl) {
      this.renderer.setAttribute(element, 'src', fallbackUrl);
    }
  }
}