import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BusinessProfileService } from './business-profile.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  primaryColor = signal<string>('#976735'); // Default brown color
  primaryGradientStart = signal<string>('#976735');
  primaryGradientEnd = signal<string>('#73532F');
  colorShades = signal<Record<number, string>>({});

  constructor(
    private businessProfileService: BusinessProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadPrimaryColor();
  }

  private loadPrimaryColor(): void {
    this.businessProfileService.getLatestBusinessProfile().subscribe({
      next: (response) => {
        if (response.data && response.data.primaryColor) {
          this.setPrimaryColor(response.data.primaryColor);
        }
      },
      error: (error) => {
        // Keep default color
        this.setPrimaryColor('#976735');
      }
    });
  }

  setPrimaryColor(color: string): void {
    this.primaryColor.set(color);
    
    // Generate all color shades (50-900)
    const shades = this.generateColorShades(color);
    this.colorShades.set(shades);
    
    // Set gradient colors
    this.primaryGradientStart.set(shades[500] || color);
    this.primaryGradientEnd.set(shades[700] || this.adjustColorBrightness(color, -20));
    
    // Apply CSS variables for dynamic styling
    this.applyCSSVariables(color, shades);
  }

  private applyCSSVariables(color: string, shades: Record<number, string>): void {
    // Only apply CSS variables in browser environment (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = document.documentElement;
    
    // Set base colors
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-color-dark', shades[700]);
    root.style.setProperty('--primary-color-light', shades[300]);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${shades[500]} 0%, ${shades[700]} 100%)`);
    
    // Set all shades (50-900)
    Object.keys(shades).forEach(shade => {
      root.style.setProperty(`--primary-${shade}`, shades[parseInt(shade)]);
    });
    
    // Set DEFAULT
    root.style.setProperty('--primary-DEFAULT', shades[500] || color);
  }

  /**
   * Generate color shades from 50 (lightest) to 900 (darkest)
   * Based on the base color provided
   */
  private generateColorShades(baseColor: string): Record<number, string> {
    const shades: Record<number, string> = {};
    
    // Parse the base color to RGB
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return shades;
    
    // Convert RGB to HSL for better color manipulation
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Generate shades by adjusting lightness
    // 50 = very light, 900 = very dark
    const shadeMap = {
      50: 0.95,   // 95% lightness
      100: 0.90,  // 90% lightness
      200: 0.80,  // 80% lightness
      300: 0.70,  // 70% lightness
      400: 0.60,  // 60% lightness
      500: hsl.l, // Base color lightness (DEFAULT)
      600: hsl.l - 0.10, // 10% darker
      700: hsl.l - 0.20, // 20% darker
      800: hsl.l - 0.30, // 30% darker
      900: hsl.l - 0.40, // 40% darker
    };
    
    Object.keys(shadeMap).forEach(shade => {
      const lightness = Math.max(0.05, Math.min(0.95, shadeMap[parseInt(shade) as keyof typeof shadeMap]));
      const color = this.hslToHex(hsl.h, hsl.s, lightness);
      shades[parseInt(shade)] = color;
    });
    
    return shades;
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h, s, l };
  }

  /**
   * Convert HSL to Hex
   */
  private hslToHex(h: number, s: number, l: number): string {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  getGradientStyle(direction: string = '135deg'): string {
    return `linear-gradient(${direction}, ${this.primaryGradientStart()} 0%, ${this.primaryGradientEnd()} 100%)`;
  }

  getGradientClasses(): string {
    // Return Tailwind-compatible gradient classes (if using JIT mode)
    return 'bg-gradient-to-br from-primary to-primary-dark';
  }

  /**
   * Get a specific shade of the primary color
   */
  getShade(shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900): string {
    return this.colorShades()[shade] || this.primaryColor();
  }

  /**
   * Get all color shades
   */
  getAllShades(): Record<number, string> {
    return this.colorShades();
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate new values
    const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
    const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
    const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
    
    // Convert back to hex
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  // Helper method to get RGB values from hex
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Get color with opacity
  getColorWithOpacity(opacity: number): string {
    const rgb = this.hexToRgb(this.primaryColor());
    if (!rgb) return this.primaryColor();
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }
}

