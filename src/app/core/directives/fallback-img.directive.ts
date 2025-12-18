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
      // If it's an assets path, ensure it starts with / (absolute from root)
      // Otherwise, prepend the domain
      const fullUrl = this.buildFullUrl(currentSrc);
      this.renderer.setAttribute(element, 'src', fullUrl);
      this.hasAddedDomain = true;
    }
  }

  private isAbsoluteUrl(url: string): boolean {
    // Check if URL starts with http://, https://, //, or data:
    return /^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:');
  }

  private isAssetsPath(url: string): boolean {
    // Check if path starts with /assets/ or assets/
    return url.startsWith('/assets/') || url.startsWith('assets/') || url.startsWith('./assets/');
  }

  private buildFullUrl(src: string): string {
    // If it's an assets path, return as absolute path from root (no domain)
    if (this.isAssetsPath(src)) {
      return src.startsWith('/') ? src : `/${src}`;
    }
    // Remove leading slash if exists to avoid double slashes
    const cleanSrc = src.startsWith('/') ? src : '/' + src;
    return environment.domain + cleanSrc;
  }

  @HostListener('error')
  onError(): void {
    const element = this.el.nativeElement;
    
    // Prevent infinite loop - check if we're already trying to load the fallback
    const currentSrc = element.src || element.getAttribute('src') || '';
    if (currentSrc.includes('/assets/images/photo.png') || currentSrc.includes('assets/images/photo.png')) {
      // Already trying fallback, stop to prevent infinite loop
      return;
    }

    // Build fallback URL
    const fallbackUrl = this.isAbsoluteUrl(this.fallback) 
      ? this.fallback 
      : this.buildFullUrl(this.fallback);

    // Only set fallback if it's different from current src
    if (currentSrc !== fallbackUrl && !currentSrc.includes(fallbackUrl)) {
      try {
        this.renderer.setAttribute(element, 'src', fallbackUrl);
      } catch (error) {
        // Silently fail to prevent console errors
        console.warn('Failed to set fallback image:', error);
      }
    }
  }
}