// Theme Manager - Handles dark/light theme switching
export class ThemeManager {
    constructor() {
        this.currentTheme = 'auto';
        this.systemTheme = 'light';
        this.mediaQuery = null;
        
        this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    }

    init() {
        this.detectSystemTheme();
        this.setupSystemThemeListener();
        this.applyInitialTheme();
        console.log('Theme manager initialized');
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemTheme = 'dark';
        } else {
            this.systemTheme = 'light';
        }
    }

    setupSystemThemeListener() {
        if (window.matchMedia) {
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
        }
    }

    handleSystemThemeChange(event) {
        this.systemTheme = event.matches ? 'dark' : 'light';
        // Note: We no longer use auto mode, so no action needed here
    }

    applyInitialTheme() {
        // Get saved theme from localStorage or default to dark
        const savedTheme = localStorage.getItem('korean-flashcard-theme');
        
        // Handle legacy 'auto' theme or invalid values
        if (!savedTheme || !['light', 'dark'].includes(savedTheme)) {
            this.setTheme('dark');
        } else {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme) {
        const validThemes = ['light', 'dark'];
        
        if (!validThemes.includes(theme)) {
            console.warn('Invalid theme:', theme);
            theme = 'dark';
        }

        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme(theme);
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        // Remove existing theme classes
        html.classList.remove('theme-light', 'theme-dark');
        html.removeAttribute('data-theme');
        
        // Apply theme directly (no auto mode)
        html.classList.add(`theme-${theme}`);
        html.setAttribute('data-theme', theme);
        
        // Update theme-color meta tag for mobile browsers
        this.updateThemeColorMeta(theme);
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChange', {
            detail: { 
                theme: this.currentTheme,
                effectiveTheme: theme
            }
        }));
    }

    updateThemeColorMeta(theme) {
        let themeColor = '#ffffff'; // Default light theme
        
        if (theme === 'dark') {
            themeColor = '#111827'; // Dark theme color
        }
        
        // Update existing meta tag or create new one
        let metaTag = document.querySelector('meta[name="theme-color"]');
        
        if (metaTag) {
            metaTag.setAttribute('content', themeColor);
        } else {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'theme-color');
            metaTag.setAttribute('content', themeColor);
            document.head.appendChild(metaTag);
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('korean-flashcard-theme', theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getEffectiveTheme() {
        return this.currentTheme;
    }

    getSystemTheme() {
        return this.systemTheme;
    }

    toggleTheme() {
        // Simple two-state toggle: light ↔ dark
        if (this.currentTheme === 'light') {
            this.setTheme('dark');
            return 'dark';
        } else {
            this.setTheme('light');
            return 'light';
        }
    }

    // CSS custom properties for theme-aware components
    updateCustomProperties(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.style.setProperty('--flashcard-bg', '#1f2937');
            root.style.setProperty('--flashcard-border', '#374151');
            root.style.setProperty('--text-primary', '#f9fafb');
            root.style.setProperty('--text-secondary', '#d1d5db');
        } else {
            root.style.setProperty('--flashcard-bg', '#ffffff');
            root.style.setProperty('--flashcard-border', '#e5e7eb');
            root.style.setProperty('--text-primary', '#1f2937');
            root.style.setProperty('--text-secondary', '#6b7280');
        }
    }

    // Accessibility considerations
    respectsReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    respectsHighContrast() {
        return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
    }

    // Debug information
    getThemeInfo() {
        return {
            currentTheme: this.currentTheme,
            effectiveTheme: this.getEffectiveTheme(),
            systemTheme: this.systemTheme,
            reducedMotion: this.respectsReducedMotion(),
            highContrast: this.respectsHighContrast()
        };
    }

    destroy() {
        if (this.mediaQuery) {
            this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
        }
    }
}
