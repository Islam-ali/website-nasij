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
  locale?: string; // 'en_US' or 'ar_EG'
  alternateLocale?: string; // Alternate language locale
  siteName?: string;
  twitterSite?: string;
  twitterCreator?: string;
  facebookAppId?: string;
  facebookPages?: string;
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
  
    const { 
      title, 
      description, 
      keywords, 
      canonicalUrl, 
      ogImage, 
      ogType, 
      hreflangs,
      locale = 'en_US',
      alternateLocale = 'ar_EG',
      siteName = 'Pledge Stores',
      twitterSite = '@pledge',
      twitterCreator = '@pledge',
      facebookAppId = '1234567890',
      facebookPages = '1234567890'
    } = options;
  
    if (isPlatformBrowser(this.platformId)) {
      const imageUrl = ogImage || this.getDefaultOgImage();
      const url = canonicalUrl || this.getCurrentUrl();
      
      // Basic SEO Meta Tags
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      if (keywords) {
        this.meta.updateTag({ name: 'keywords', content: keywords });
      }
      this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
      this.meta.updateTag({ name: 'language', content: locale === 'en_US' ? 'English, Arabic' : 'Arabic, English' });
      
      // Open Graph / Facebook Meta Tags
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:type', content: ogType || 'website' });
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
      this.meta.updateTag({ property: 'og:image:alt', content: title });
      this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
      this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:site_name', content: siteName });
      this.meta.updateTag({ property: 'og:locale', content: locale });
      if (alternateLocale) {
        this.meta.updateTag({ property: 'og:locale:alternate', content: alternateLocale });
      }
      
      // Facebook Specific Meta Tags
      this.meta.updateTag({ property: 'fb:app_id', content: facebookAppId });
      this.meta.updateTag({ property: 'fb:pages', content: facebookPages });
      
      // WhatsApp Meta Tags (uses Open Graph, but we ensure proper formatting)
      // WhatsApp reads og:image, og:title, og:description, og:url
      // Already set above, but we ensure image is properly formatted
      
      // Twitter Card Meta Tags
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
      this.meta.updateTag({ name: 'twitter:image:alt', content: title });
      this.meta.updateTag({ name: 'twitter:url', content: url });
      this.meta.updateTag({ name: 'twitter:site', content: twitterSite });
      this.meta.updateTag({ name: 'twitter:creator', content: twitterCreator });
      
      // LinkedIn Meta Tags
      this.meta.updateTag({ property: 'linkedin:title', content: title });
      this.meta.updateTag({ property: 'linkedin:description', content: description });
      this.meta.updateTag({ property: 'linkedin:image', content: imageUrl });
      this.meta.updateTag({ property: 'linkedin:url', content: url });
      
      // Pinterest Meta Tags
      this.meta.updateTag({ property: 'pinterest:title', content: title });
      this.meta.updateTag({ property: 'pinterest:description', content: description });
      this.meta.updateTag({ property: 'pinterest:image', content: imageUrl });
      this.meta.updateTag({ property: 'pinterest:url', content: url });
      
      // Update HTML lang and dir attributes
      this.updateHtmlAttributes(locale);
      
      // Canonical URL and Hreflang
      this.setCanonical(url);
      this.setHreflang(hreflangs || this.getDefaultHreflangs());
    }
  }
  
  private updateHtmlAttributes(locale: string): void {
    if (!this.doc) return;
    
    const htmlElement = this.doc.documentElement;
    const isArabic = locale.startsWith('ar');
    
    htmlElement.setAttribute('lang', isArabic ? 'ar' : 'en');
    htmlElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
  }
  
  private getDefaultHreflangs(): HreflangConfig[] {
    const baseUrl = 'https://pledgestores.com';
    return [
      { lang: 'en', url: `${baseUrl}/en` },
      { lang: 'ar', url: `${baseUrl}/ar` },
      { lang: 'x-default', url: baseUrl }
    ];
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

