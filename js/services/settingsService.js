// Settings Service - Manages user preferences and application settings
export class SettingsService {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.storageKey = 'korean-flashcard-settings';
        this.listeners = [];
    }

    getDefaultSettings() {
        return {
            // Display settings
            showRomanization: true,
            showAudioControls: true, // Show audio controls by default for language learning
            
            // Audio settings
            autoPlayAudio: false,
            preferredVoice: null,
            
            // Theme settings
            theme: 'dark', // 'light', 'dark'
            
            // Study settings
            autoAdvanceTime: 0, // 0 = manual advance only
            studyMode: 'sequential', // 'sequential', 'random', 'difficulty'
            difficultyFilter: 'all', // 'all', 'beginner', 'intermediate', 'advanced'
            
            // Filter settings
            topicFilter: 'all', // 'all', specific topic name
            wordTypeFilter: 'all', // 'all', specific word type
            searchQuery: '', // search text
            
            // Accessibility settings
            reducedMotion: false,
            highContrast: false,
            fontSize: 'normal', // 'small', 'normal', 'large'
            
            // Advanced settings
            keyboardShortcuts: true,
            showProgress: true,
            enableStatistics: true,
            
            // Version for migration
            version: '2.0'
        };
    }

    async loadSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                
                // Merge with defaults to handle new settings
                this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
                
                // Handle version migration if needed
                this.migrateSettings();
                
                console.log('Settings loaded successfully');
            } else {
                console.log('No stored settings found, using defaults');
            }
        } catch (error) {
            console.warn('Failed to load settings, using defaults:', error);
            this.settings = this.getDefaultSettings();
        }
        
        // Apply system preferences if theme is auto
        if (this.settings.theme === 'auto') {
            this.detectSystemTheme();
        }
        
        // Detect system accessibility preferences
        this.detectSystemAccessibility();
        
        return this.settings;
    }

    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log('Settings saved successfully');
            this.notifyListeners();
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.saveSettings();
        } else {
            console.warn(`Unknown setting key: ${key}`);
        }
    }

    // Alias for backward compatibility
    updateSetting(key, value) {
        return this.setSetting(key, value);
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
    }

    // Theme management
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.settings.detectedTheme = 'dark';
        } else {
            this.settings.detectedTheme = 'light';
        }
    }

    getEffectiveTheme() {
        if (this.settings.theme === 'auto') {
            return this.settings.detectedTheme || 'light';
        }
        return this.settings.theme;
    }

    // Accessibility detection
    detectSystemAccessibility() {
        // Detect reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
        }

        // Detect high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
        }
    }

    // Settings validation
    validateSettings(settings) {
        const errors = [];
        
        // Validate theme
        const validThemes = ['light', 'dark'];
        if (!validThemes.includes(settings.theme)) {
            errors.push('Invalid theme value');
            settings.theme = 'dark';
        }
        
        // Validate study mode
        const validStudyModes = ['sequential', 'random', 'difficulty'];
        if (!validStudyModes.includes(settings.studyMode)) {
            errors.push('Invalid study mode');
            settings.studyMode = 'sequential';
        }
        
        // Validate difficulty filter
        const validDifficulties = ['all', 'beginner', 'intermediate', 'advanced'];
        if (!validDifficulties.includes(settings.difficultyFilter)) {
            errors.push('Invalid difficulty filter');
            settings.difficultyFilter = 'all';
        }
        
        if (errors.length > 0) {
            console.warn('Settings validation errors:', errors);
        }
        
        return settings;
    }

    // Migration for settings version changes
    migrateSettings() {
        const currentVersion = this.settings.version || '1.0';
        
        // Add migration logic here for future versions
        if (currentVersion === '1.0') {
            // No migration needed for v1.0
        }
        
        // Update version
        this.settings.version = '1.0';
    }

    // Event listener management
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.settings);
            } catch (error) {
                console.error('Settings listener error:', error);
            }
        });
    }

    // Export/Import settings
    exportSettings() {
        return {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            appVersion: '1.0'
        };
    }

    importSettings(settingsData) {
        try {
            if (settingsData && settingsData.settings) {
                const validatedSettings = this.validateSettings(settingsData.settings);
                this.settings = { ...this.getDefaultSettings(), ...validatedSettings };
                this.saveSettings();
                return true;
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
        }
        return false;
    }

    // Preset configurations
    getPresets() {
        return {
            beginner: {
                showRomanization: true,
                showAudioControls: true,
                autoPlayAudio: true,
                difficultyFilter: 'beginner'
            },
            intermediate: {
                showRomanization: true,
                showAudioControls: false,
                autoPlayAudio: false,
                difficultyFilter: 'intermediate'
            },
            advanced: {
                showRomanization: false,
                showAudioControls: false,
                autoPlayAudio: false,
                difficultyFilter: 'advanced'
            }
        };
    }

    applyPreset(presetName) {
        const presets = this.getPresets();
        if (presets[presetName]) {
            this.updateSettings(presets[presetName]);
            return true;
        }
        return false;
    }

    // Quick toggle methods for common settings
    toggleRomanization() {
        this.setSetting('showRomanization', !this.settings.showRomanization);
    }

    toggleAudioControls() {
        this.setSetting('showAudioControls', !this.settings.showAudioControls);
    }

    toggleAutoPlay() {
        this.setSetting('autoPlayAudio', !this.settings.autoPlayAudio);
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setSetting('theme', themes[nextIndex]);
    }

    // Accessibility helpers
    isReducedMotionEnabled() {
        return this.settings.reducedMotion;
    }

    isHighContrastEnabled() {
        return this.settings.highContrast;
    }

    getFontSizeMultiplier() {
        const multipliers = {
            small: 0.875,
            normal: 1.0,
            large: 1.125
        };
        return multipliers[this.settings.fontSize] || 1.0;
    }

    // Study session preferences
    getStudyModeSettings() {
        return {
            mode: this.settings.studyMode,
            difficultyFilter: this.settings.difficultyFilter,
            autoAdvanceTime: this.settings.autoAdvanceTime
        };
    }

    // Debug information
    getDebugInfo() {
        return {
            settings: this.settings,
            storageKey: this.storageKey,
            listenerCount: this.listeners.length,
            effectiveTheme: this.getEffectiveTheme(),
            systemPreferences: {
                prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
                prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches
            }
        };
    }
}
