import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslationService } from './translate.service';

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
  locale?: string;
  alternateLocale?: string;
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private translationService: TranslationService
  ) {}

  updateSeo(options: SeoOptions, businessProfile?: any): void {
    if (!options) return;
    this.updateSeoInternal(options, businessProfile);
  }

  private updateSeoInternal(options: SeoOptions, businessProfile: any | null): void {
    // Get dynamic values from business profile if available
    let dynamicSiteName = '';
    let dynamicBaseUrl = '';
    let dynamicCanonicalUrl = '';
    
    if (businessProfile) {
      if (businessProfile.siteName) {
        const currentLang = this.translationService.getCurrentLanguage();
        const isArabic = currentLang === 'ar';
        dynamicSiteName = isArabic 
          ? (businessProfile.siteName.ar || businessProfile.siteName.en || '')
          : (businessProfile.siteName.en || businessProfile.siteName.ar || '');
      }
      
      if (businessProfile.baseUrl) {
        dynamicBaseUrl = businessProfile.baseUrl;
      }
      
      if (businessProfile.canonicalUrl) {
        dynamicCanonicalUrl = businessProfile.canonicalUrl;
      } else if (businessProfile.baseUrl) {
        dynamicCanonicalUrl = businessProfile.baseUrl;
      }
    }

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
      siteName = dynamicSiteName || '',
      twitterSite = '',
      twitterCreator = '',
      facebookAppId = '',
      facebookPages = ''
    } = options;
    
    // Use dynamic canonical URL if not provided in options
    const finalCanonicalUrl = canonicalUrl || dynamicCanonicalUrl;
    
    const imageUrl = ogImage || this.getDefaultOgImage(businessProfile);
    const url = finalCanonicalUrl || this.getCurrentUrl(businessProfile);
        
    // Basic SEO Meta Tags  
    if (title) {
      this.title.setTitle(title);
    }
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
        
    // Set keywords only if provided
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    this.meta.updateTag({ name: 'language', content: locale === 'en_US' ? 'English, Arabic' : 'Arabic, English' });
    
    // Open Graph / Facebook Meta Tags
    if (title) {
    this.meta.updateTag({ property: 'og:title', content: title });
    }
    if (description) {
    this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:type', content: ogType || 'website' });
    if (imageUrl) {
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
      if (title) {
    this.meta.updateTag({ property: 'og:image:alt', content: title });
      }
    this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
    this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
    }
    if (url) {
    this.meta.updateTag({ property: 'og:url', content: url });
    }
    if (siteName) {
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    }
    this.meta.updateTag({ property: 'og:locale', content: locale });
    if (alternateLocale) {
      this.meta.updateTag({ property: 'og:locale:alternate', content: alternateLocale });
    }
    
    // Facebook Specific Meta Tags (only if provided)
    if (facebookAppId) {
    this.meta.updateTag({ property: 'fb:app_id', content: facebookAppId });
    }
    if (facebookPages) {
    this.meta.updateTag({ property: 'fb:pages', content: facebookPages });
    }
    
    // Twitter Card Meta Tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    if (title) {
    this.meta.updateTag({ name: 'twitter:title', content: title });
    }
    if (description) {
    this.meta.updateTag({ name: 'twitter:description', content: description });
    }
    if (imageUrl) {
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
      if (title) {
    this.meta.updateTag({ name: 'twitter:image:alt', content: title });
      }
    }
    if (url) {
    this.meta.updateTag({ name: 'twitter:url', content: url });
    }
    if (twitterSite) {
    this.meta.updateTag({ name: 'twitter:site', content: twitterSite });
    }
    if (twitterCreator) {
    this.meta.updateTag({ name: 'twitter:creator', content: twitterCreator });
    }
    
    // LinkedIn Meta Tags
    if (title) {
    this.meta.updateTag({ property: 'linkedin:title', content: title });
    }
    if (description) {
    this.meta.updateTag({ property: 'linkedin:description', content: description });
    }
    if (imageUrl) {
    this.meta.updateTag({ property: 'linkedin:image', content: imageUrl });
    }
    if (url) {
    this.meta.updateTag({ property: 'linkedin:url', content: url });
    }
    
    // Pinterest Meta Tags
    if (title) {
    this.meta.updateTag({ property: 'pinterest:title', content: title });
    }
    if (description) {
    this.meta.updateTag({ property: 'pinterest:description', content: description });
    }
    if (imageUrl) {
    this.meta.updateTag({ property: 'pinterest:image', content: imageUrl });
    }
    if (url) {
    this.meta.updateTag({ property: 'pinterest:url', content: url });
    }
    
    // Update HTML lang and dir attributes based on current language, not just locale
    this.updateHtmlAttributes();
    
    // Canonical URL and Hreflang
    if (url) {
    this.setCanonical(url);
    }
    if (hreflangs && hreflangs.length > 0) {
      this.setHreflang(hreflangs);
    } else if (businessProfile) {
      this.setHreflang(this.getDefaultHreflangs(businessProfile));
    }
  }
  
  private updateHtmlAttributes(): void {
    if (!this.doc || !isPlatformBrowser(this.platformId)) return;
    
    // Get current language from TranslationService, not from locale parameter
    // Also check localStorage as fallback in case TranslationService is not ready yet
    let currentLanguage: string;
    try {
      currentLanguage = this.translationService.getCurrentLanguage();
    } catch (e) {
      // Fallback to localStorage if TranslationService is not ready
      currentLanguage = localStorage.getItem('lang-store') || 'ar';
    }
    
    const htmlElement = this.doc.documentElement;
    const isArabic = currentLanguage === 'ar';
    
    // Only update if different to avoid unnecessary DOM manipulation
    const currentDir = htmlElement.getAttribute('dir');
    const currentLang = htmlElement.getAttribute('lang');
    
    if (isArabic) {
      if (currentDir !== 'rtl') {
        htmlElement.setAttribute('dir', 'rtl');
      }
      if (currentLang !== 'ar') {
        htmlElement.setAttribute('lang', 'ar');
      }
    } else {
      if (currentDir !== 'ltr') {
        htmlElement.setAttribute('dir', 'ltr');
      }
      if (currentLang !== 'en') {
        htmlElement.setAttribute('lang', 'en');
      }
    }
  }
  
  private getDefaultHreflangs(businessProfile?: any): HreflangConfig[] {
    let baseUrl = '';
    
    if (businessProfile?.baseUrl) {
      baseUrl = businessProfile.baseUrl;
    }
    
    return [
      { lang: 'en', url: `${baseUrl}` },
      { lang: 'ar', url: `${baseUrl}` },
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
 
    // Normalize URL - remove trailing slash, query params, fragments
    const normalizedUrl = this.normalizeCanonicalUrl(url);
 
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', normalizedUrl);
  }
 
  private normalizeCanonicalUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove www
      if (urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.replace('www.', '');
      }
      // Ensure HTTPS
      urlObj.protocol = 'https:';
      // Remove trailing slash (except for root)
      if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      // Remove query params and fragments for canonical
      urlObj.search = '';
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
      return url;
    }
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
 
  private getCurrentUrl(businessProfile?: any): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.doc.location.href;
    }
    
    // Use baseUrl from business profile if available
    if (businessProfile?.baseUrl) {
      return businessProfile.baseUrl;
    }
    
    return '';
  }
 
  private getDefaultOgImage(businessProfile?: any): string {
    // Use baseUrl from business profile if available
    let baseUrl = '';
    if (businessProfile?.baseUrl) {
      baseUrl = businessProfile.baseUrl;
    }
    
    if (!baseUrl) {
      return '';
    }
    
    return `${baseUrl}/images/logo.png`;
  }
 
  /**
   * Inject custom meta tags from business profile (as HTML string)
   */
  injectCustomMetaTags(metaTags: string): void {
    if (!metaTags || typeof metaTags !== 'string' || !this.doc || !isPlatformBrowser(this.platformId)) return;
 
    // Remove existing custom meta tags (identified by data-custom-meta attribute)
    const existingCustomTags = this.doc.querySelectorAll('meta[data-custom-meta]');
    existingCustomTags.forEach(tag => {
      try {
        tag.remove();
      } catch (e) {
        // Ignore removal errors
      }
    });
 
    try {
      // Split by newlines and process each line
      const lines = metaTags.trim().split(/\r?\n/).filter(line => line.trim());
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('<meta')) {
          return;
        }
 
        try {
          // Use DOMParser for safer parsing
          const parser = new DOMParser();
          const doc = parser.parseFromString(trimmedLine, 'text/html');
          const metaElement = doc.querySelector('meta');
          
          if (metaElement && metaElement.parentNode) {
            // Create a new meta element
            const newMeta = this.doc.createElement('meta');
            
            // Copy all attributes from the parsed meta tag
            Array.from(metaElement.attributes).forEach(attr => {
              try {
                newMeta.setAttribute(attr.name, attr.value);
              } catch (attrError) {
                console.warn('Failed to set attribute:', attr.name, attrError);
              }
            });
            
            // Add identifier for later removal
            newMeta.setAttribute('data-custom-meta', `custom-${index}`);
            
            // Safely append to head
            if (this.doc.head) {
              this.doc.head.appendChild(newMeta);
            }
          } else {
            // Fallback: parse attributes manually using regex
            this.parseMetaTagManually(trimmedLine, index);
          }
        } catch (error) {
          console.warn('Failed to parse meta tag with DOMParser, trying manual parsing:', trimmedLine, error);
          // Fallback to manual parsing
          this.parseMetaTagManually(trimmedLine, index);
        }
      });
    } catch (error) {
      console.error('Failed to inject custom meta tags:', error);
    }
  }
 
  private parseMetaTagManually(metaTagHtml: string, index: number): void {
    try {
      // Extract attributes from <meta> tag using regex
      const metaMatch = metaTagHtml.match(/<meta\s+([^>]*)\/?>/i);
      if (!metaMatch || !metaMatch[1]) {
        console.warn('Could not parse meta tag:', metaTagHtml);
        return;
      }
 
      const attrsString = metaMatch[1];
      const newMeta = this.doc.createElement('meta');
      
      // Parse attributes: name="value" or name='value' or name=value
      const attrRegex = /(\w+)(?:=["']([^"']*)["'])?/g;
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
        const attrName = attrMatch[1].toLowerCase();
        const attrValue = attrMatch[2] || '';
        
        try {
          if (attrName === 'content' && !attrValue) {
            // Some attributes might not have quotes, try to get the rest
            continue;
          }
          newMeta.setAttribute(attrName, attrValue);
        } catch (e) {
          console.warn('Failed to set attribute manually:', attrName, e);
        }
      }
      
      // Add identifier for later removal
      newMeta.setAttribute('data-custom-meta', `custom-${index}`);
      
      // Append to head
      if (this.doc.head) {
        this.doc.head.appendChild(newMeta);
      }
    } catch (error) {
      console.error('Manual meta tag parsing failed:', error);
    }
  }
 
  /**
   * Inject custom scripts from business profile
   */
  injectCustomScripts(scripts: Array<{ position: 'head' | 'body'; script: string }>): void {
    if (!scripts || !Array.isArray(scripts) || !this.doc || !isPlatformBrowser(this.platformId)) return;
 
    // Remove existing custom scripts and links (identified by data-custom-script and data-custom-link attributes)
    const existingScripts = this.doc.querySelectorAll('script[data-custom-script], link[data-custom-link]');
    existingScripts.forEach(script => script.remove());
 
    // Add new custom scripts
    scripts.forEach((scriptData, index) => {
      if (!scriptData.script || !scriptData.script.trim()) return; // Skip if no script content
 
      try {
        const scriptContent = scriptData.script.trim();
        
        // Parse the content using DOMParser
        const parser = new DOMParser();
        const wrappedContent = `<div>${scriptContent}</div>`;
        const doc = parser.parseFromString(wrappedContent, 'text/html');
        
        // Check for parsing errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          console.warn('Parse error detected in script content:', scriptContent);
          return;
        }
        
        // Get the container div
        const container = doc.querySelector('div');
        if (!container) {
          console.warn('Could not parse script content:', scriptContent);
          return;
        }
        
        // Process all child elements
        Array.from(container.children).forEach((element) => {
          try {
            const tagName = element.tagName.toLowerCase();
            
            // Handle <script> tags
            if (tagName === 'script') {
              const scriptElement = this.doc.createElement('script');
              scriptElement.setAttribute('data-custom-script', `custom-${index}`);
              
              // Copy all attributes
              Array.from(element.attributes).forEach(attr => {
                try {
                  if (attr.name.toLowerCase() !== 'data-custom-script') {
                    if (attr.name.toLowerCase() === 'src') {
                      scriptElement.src = attr.value;
                    } else {
                      scriptElement.setAttribute(attr.name, attr.value);
                    }
                  }
                } catch (attrError) {
                  console.warn('Failed to set script attribute:', attr.name, attrError);
                }
              });
              
              // Get script content safely
              const scriptText = element.textContent?.trim() || '';
              
              // Only set textContent if we have content and no src
              if (scriptText && !scriptElement.src) {
                // Validate that content doesn't contain HTML tags (common error)
                if (scriptText.includes('<') && scriptText.includes('>')) {
                  console.warn('Script contains HTML tags, skipping:', scriptText.substring(0, 100));
                  return;
                }
                scriptElement.textContent = scriptText;
              }
              
              // Append to head or body based on position
              const targetElement = scriptData.position === 'head' 
                ? this.doc.head 
                : (this.doc.body || this.doc.head);
              
              if (targetElement) {
                targetElement.appendChild(scriptElement);
              }
            }
            // Handle <link> tags (stylesheets, etc.)
            else if (tagName === 'link') {
              const linkElement = this.doc.createElement('link');
              linkElement.setAttribute('data-custom-link', `custom-${index}`);
              
              // Copy all attributes
              Array.from(element.attributes).forEach(attr => {
                try {
                  linkElement.setAttribute(attr.name, attr.value);
                } catch (attrError) {
                  console.warn('Failed to set link attribute:', attr.name, attrError);
                }
              });
              
              // Links should always go in head
              if (this.doc.head) {
                this.doc.head.appendChild(linkElement);
              }
            }
            // Handle <style> tags
            else if (tagName === 'style') {
              const styleElement = this.doc.createElement('style');
              styleElement.setAttribute('data-custom-script', `custom-${index}`);
              
              // Copy all attributes
              Array.from(element.attributes).forEach(attr => {
                try {
                  styleElement.setAttribute(attr.name, attr.value);
                } catch (attrError) {
                  console.warn('Failed to set style attribute:', attr.name, attrError);
                }
              });
              
              const styleText = element.textContent?.trim() || '';
              if (styleText) {
                styleElement.textContent = styleText;
              }
              
              // Styles should always go in head
              if (this.doc.head) {
                this.doc.head.appendChild(styleElement);
              }
            }
            // Log warning for other tags
            else {
              console.warn(`Unsupported tag type in scripts array: <${tagName}>. Only <script>, <link>, and <style> are supported.`);
            }
          } catch (elementError) {
            console.error('Error processing element:', element, elementError);
          }
        });
        
      } catch (error) {
        console.error('Failed to inject script at index', index, ':', error);
        console.error('Script content was:', scriptData.script);
      }
    });
  }
 
  private parseAndInjectScriptFallback(scriptContent: string, index: number, position: 'head' | 'body'): void {
    try {
      // Extract the full script tag using regex
      const scriptMatch = scriptContent.match(/<script\s*([^>]*)>([\s\S]*?)<\/script>/i);
      
      if (!scriptMatch) {
        // Not a valid script tag, treat as plain JavaScript
        const scriptElement = this.doc.createElement('script');
        scriptElement.setAttribute('data-custom-script', `custom-${index}`);
        scriptElement.textContent = scriptContent.trim();
        
        const targetElement = position === 'head' ? this.doc.head : (this.doc.body || this.doc.head);
        if (targetElement) {
          targetElement.appendChild(scriptElement);
        }
        return;
      }
      
      const attrsString = scriptMatch[1] || '';
      const scriptBody = scriptMatch[2] || '';
      
      const scriptElement = this.doc.createElement('script');
      scriptElement.setAttribute('data-custom-script', `custom-${index}`);
      
      // Parse attributes more carefully
      if (attrsString.trim()) {
        // Handle both quoted and unquoted attribute values
        const attrRegex = /(\w+(?:-\w+)*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))|(\w+(?:-\w+)*)(?=\s|>)/g;
        let attrMatch;
        
        while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
          try {
            const attrName = (attrMatch[1] || attrMatch[5]).toLowerCase();
            const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';
            
            if (attrName === 'src') {
              scriptElement.src = attrValue;
            } else if (attrName && attrName !== 'data-custom-script') {
              scriptElement.setAttribute(attrName, attrValue);
            }
          } catch (attrError) {
            console.warn('Failed to parse script attribute:', attrMatch[0], attrError);
          }
        }
      }
      
      // Only set textContent if there's body content and no src attribute
      if (scriptBody.trim() && !scriptElement.src) {
        scriptElement.textContent = scriptBody.trim();
      }
      
      // Append to head or body
      const targetElement = position === 'head' ? this.doc.head : (this.doc.body || this.doc.head);
      if (targetElement) {
        targetElement.appendChild(scriptElement);
      }
    } catch (error) {
      console.error('Fallback script parsing also failed:', error);
      // Last resort: create empty script with just the content as text
      try {
        const scriptElement = this.doc.createElement('script');
        scriptElement.setAttribute('data-custom-script', `custom-${index}`);
        // Extract just the content, ignoring tags
        const contentOnly = scriptContent.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        scriptElement.textContent = contentOnly;
        
        const targetElement = position === 'head' ? this.doc.head : (this.doc.body || this.doc.head);
        if (targetElement) {
          targetElement.appendChild(scriptElement);
        }
      } catch (finalError) {
        console.error('Final fallback also failed:', finalError);
      }
    }
  }
 
  /**
   * Apply business profile SEO settings (meta tags, scripts, etc.)
   */
  applyBusinessProfileSeo(profile: any): void {
    if (!profile || !isPlatformBrowser(this.platformId)) return;
 
    try {
    const currentLang = this.translationService.getCurrentLanguage();
    const isArabic = currentLang === 'ar';
    
    // Get site name from profile
    let siteName = 'Pledge Stores';
    if (profile.siteName) {
      siteName = isArabic 
        ? (profile.siteName.ar || profile.siteName.en || siteName)
        : (profile.siteName.en || profile.siteName.ar || siteName);
    }
    
    // Get base URL and canonical URL
    const baseUrl = profile.baseUrl || '';
    const canonicalUrl = profile.canonicalUrl || profile.baseUrl || baseUrl;
    
    // Apply meta title and description if available
    if (profile.metaTitle || profile.metaDescription) {
      if (profile.metaTitle) {
        const title = isArabic ? (profile.metaTitle.ar || profile.metaTitle.en) : (profile.metaTitle.en || profile.metaTitle.ar);
        if (title && title.trim()) {
          this.title.setTitle(title.trim());
        }
      }
 
      if (profile.metaDescription) {
        const description = isArabic ? (profile.metaDescription.ar || profile.metaDescription.en) : (profile.metaDescription.en || profile.metaDescription.ar);
        if (description && description.trim()) {
          this.meta.updateTag({ name: 'description', content: description.trim() });
        }
      }
    }
 
    // Apply meta keywords if available
    if (profile.metaKeywords && Array.isArray(profile.metaKeywords) && profile.metaKeywords.length > 0) {
      const keywordsString = profile.metaKeywords.filter((k: string) => k && k.trim()).join(', ');
      if (keywordsString) {
        this.meta.updateTag({ name: 'keywords', content: keywordsString });
      }
    }
 
    // Update Open Graph site name
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    
    // Update canonical URL
    this.setCanonical(canonicalUrl);
    
    // Update hreflang with base URL
    this.setHreflang(this.getDefaultHreflangs(profile));
 
    // Inject custom meta tags
    if (profile.metaTags && typeof profile.metaTags === 'string' && profile.metaTags.trim()) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.injectCustomMetaTags(profile.metaTags);
      }, 0);
    }
 
    // Inject custom scripts
    if (profile.scripts && Array.isArray(profile.scripts) && profile.scripts.length > 0) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.injectCustomScripts(profile.scripts);
      }, 0);
    }
    } catch (error) {
      console.error('Error applying business profile SEO:', error);
    }
  }
}