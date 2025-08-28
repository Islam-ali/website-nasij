import { Injectable, effect, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private readonly THEME_KEY = 'nasig-theme-preference';
    
    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: this.getInitialTheme(),
        menuMode: 'static'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!config) {
                return;
            }

            this.handleDarkModeTransition(config);
        });

        // Initialize theme on startup
        this.initializeTheme();
    }

    private getInitialTheme(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            // Check localStorage first
            console.log('getInitialTheme');
            console.log(
                window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            );
            const savedTheme = localStorage.getItem(this.THEME_KEY);
            if (savedTheme !== null) {
                return savedTheme === 'dark';
            }
            
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return true;
            }
        }
        return false;
    }

    private initializeTheme(): void {
        if (isPlatformBrowser(this.platformId)) {
            const isDark = this.layoutConfig().darkTheme ?? false;
            this.applyTheme(isDark);
        }
    }

    toggleTheme() {
        const currentConfig = this.layoutConfig();
        const newDarkTheme = !currentConfig.darkTheme;
        
        this.layoutConfig.set({
            ...currentConfig,
            darkTheme: newDarkTheme
        });
        
        // Save to localStorage
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.THEME_KEY, newDarkTheme ? 'dark' : 'light');
        }
        
        this.configUpdate.next(this.layoutConfig());
    }

    setTheme(isDark: boolean) {
        const currentConfig = this.layoutConfig();
        this.layoutConfig.set({
            ...currentConfig,
            darkTheme: isDark
        });
        
        // Save to localStorage
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
        }
        
        this.configUpdate.next(this.layoutConfig());
    }

    private overlayOpen = new Subject<any>();

    private menuSource = new Subject<MenuChangeEvent>();

    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'dark' : 'light'));

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);

    private initialized = false;

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        this.applyTheme(_config.darkTheme ?? false);
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

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        if (isPlatformBrowser(this.platformId)) {
            return window.innerWidth > 991;
        }
        return false;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}
