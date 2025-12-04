import { Injectable, signal, computed, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'pledge-theme-mode';

  private _themeConfig = signal<ThemeConfig>({
    mode: this.getIsDark() ? 'dark' : 'light',
    isDark: this.getIsDark()
  });

  public themeConfig = this._themeConfig.asReadonly();
  public isDark = computed(() => this._themeConfig().isDark);
  public mode = computed(() => this._themeConfig().mode);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeTheme();

    // Watch for system theme changes
    if (isPlatformBrowser(this.platformId)) {
      this.watchSystemTheme();
    }

    // Effect to apply theme changes
    effect(() => {
      const config = this._themeConfig();
      this.applyTheme(config.isDark);
    });
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      this._themeConfig.set({ mode: this.getIsDark() ? 'dark' : 'light', isDark: this.getIsDark() });
      this.applyTheme(this.getIsDark());
    }
  }

  private getIsDark(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const savedMode = localStorage.getItem(this.THEME_KEY) as ThemeMode || (this.getSystemPrefersDark() ? 'dark' : 'light');
    return savedMode === 'dark';
  }

  private getSystemPrefersDark(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      console.log('getSystemPrefersDark', window.matchMedia('(prefers-color-scheme: dark)').matches);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private watchSystemTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery?.addEventListener('change', (e) => {
        const isDark = e.matches;
        this._themeConfig.update(config => ({ ...config, isDark }));
      });
    }
  }

  setTheme(mode: ThemeMode): void {

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, mode);
    }
    const isDark = this.getIsDark();
    this._themeConfig.set({ mode, isDark });

  }

  toggleTheme(): void {
    const currentMode = this._themeConfig().mode;
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    this.setTheme(newMode);
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      const body = document.body;
      if (isDark) {
        html.classList.add('dark');
        body.classList.add('dark');
        html.classList.add('app-dark');
      } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
        html.classList.remove('app-dark');
      }
    }
  }

  // Utility methods
  getThemeIcon(): string {
    const mode = this._themeConfig().mode;
    return mode === 'dark' ? 'pi-moon' : 'pi-sun';
  }

  getThemeLabel(): string {
    const mode = this._themeConfig().mode;
    return mode === 'dark' ? 'Switch to Light' : 'Switch to Dark';
  }

  getNextThemeMode(): ThemeMode {
    const currentMode = this._themeConfig().mode;
    const modes: ThemeMode[] = ['light', 'dark'];
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    return modes[nextIndex];
  }
} 