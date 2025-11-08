import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

interface HreflangConfig {
  lang: string;
  url: string;
}

interface SeoOptions {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  hreflangs?: HreflangConfig[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateSeo(options: SeoOptions): void {
    if (!options) return;
  
    const { title, description, keywords, canonicalUrl, ogImage, ogType, hreflangs } = options;
  
    if (isPlatformBrowser(this.platformId)) {
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ name: 'keywords', content: keywords || '' });
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  
      // Google Open Graph
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:type', content: ogType || 'website' });
      this.meta.updateTag({ property: 'og:image', content: ogImage || this.getDefaultOgImage() });
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl || this.getCurrentUrl() });
  
      // Social platforms loop
      this.meta.updateTag({ name: `twitter:title`, content: title });
      this.meta.updateTag({ name: `twitter:description`, content: description });
      this.meta.updateTag({ name: `twitter:image`, content: ogImage || this.getDefaultOgImage() });
      this.meta.updateTag({ name: `twitter:url`, content: canonicalUrl || this.getCurrentUrl() });
      this.meta.updateTag({ name: `twitter:site`, content: 'https://pledgestores.com' });
      

      this.meta.updateTag({ name: `pinterest:title`, content: title });
      this.meta.updateTag({ name: `pinterest:description`, content: description });
      this.meta.updateTag({ name: `pinterest:image`, content: ogImage || this.getDefaultOgImage() });
      this.meta.updateTag({ name: `pinterest:url`, content: canonicalUrl || this.getCurrentUrl() });
      this.meta.updateTag({ name: `pinterest:site`, content: 'https://pledgestores.com' });

      this.setCanonical(canonicalUrl || this.getCurrentUrl());
      this.setHreflang(hreflangs);
    }
  }
  
  

  injectStructuredData(jsonLd: Record<string, unknown>): void {
    if (!jsonLd || !this.doc) return;
    const scriptId = 'seo-structured-data';
    let script = this.doc.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = this.doc.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }

    script.textContent = JSON.stringify(jsonLd);
  }

  private setCanonical(url: string): void {
    if (!url || !this.doc) return;

    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setHreflang(hreflangs?: HreflangConfig[]): void {
    if (!hreflangs || !hreflangs.length || !this.doc) return;

    const existing = Array.from(this.doc.querySelectorAll("link[rel='alternate'][hreflang]"));
    existing.forEach(link => link.parentNode?.removeChild(link));

    hreflangs.forEach(({ lang, url }) => {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      this.doc.head.appendChild(link);
    });
  }

  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.doc.location.href;
    }
    return 'https://pledgestores.com';
  }

  private getDefaultOgImage(): string {
    return 'https://pledgestores.com/assets/images/logo.png';
  }
}

