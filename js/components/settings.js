// Settings Component - Manages settings panel UI and interactions
export class SettingsComponent {
    constructor(settingsService) {
        this.settingsService = settingsService;
        this.isVisible = false;
        this.callbacks = {};
        
        // DOM elements
        this.settingsPanel = null;
        this.settingsOverlay = null;
        this.closeBtn = null;
        
        // Setting controls
        this.controls = {
            showRomanization: null,
            showAudioControls: null,
            autoPlayAudio: null
        };
        
        this.bindMethods();
    }

    bindMethods() {
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleSettingChange = this.handleSettingChange.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
    }

    init(callbacks = {}) {
        this.callbacks = callbacks;
        this.cacheElements();
        this.setupEventListeners();
        this.loadCurrentSettings();
        console.log('Settings component initialized');
    }

    cacheElements() {
        this.settingsPanel = document.getElementById('settings-panel');
        this.closeBtn = document.getElementById('close-settings-btn');
        
        // Get setting controls
        this.controls.showRomanization = document.getElementById('show-romanization');
        this.controls.showAudioControls = document.getElementById('show-audio-controls');
        this.controls.autoPlayAudio = document.getElementById('auto-play-audio');
        
        // Create overlay if it doesn't exist
        this.createOverlay();
        
        if (!this.settingsPanel) {
            console.warn('Settings panel not found');
        }
    }

    createOverlay() {
        // Check if overlay already exists
        this.settingsOverlay = document.querySelector('.settings-overlay');
        
        if (!this.settingsOverlay) {
            this.settingsOverlay = document.createElement('div');
            this.settingsOverlay.className = 'settings-overlay';
            document.body.appendChild(this.settingsOverlay);
        }
    }

    setupEventListeners() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', this.handleCloseClick);
        }
        
        // Overlay click to close
        if (this.settingsOverlay) {
            this.settingsOverlay.addEventListener('click', this.handleOverlayClick);
        }
        
        // Setting controls
        Object.entries(this.controls).forEach(([key, element]) => {
            if (element) {
                element.addEventListener('change', this.handleSettingChange);
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.handleEscapeKey);
    }

    handleCloseClick() {
        this.close();
    }

    handleOverlayClick() {
        this.close();
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.isVisible) {
            this.close();
        }
    }

    handleSettingChange(event) {
        const control = event.target;
        const settingKey = control.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        
        let value = control.type === 'checkbox' ? control.checked : control.value;
        
        // Update settings
        this.settingsService.setSetting(settingKey, value);
        
        // Notify parent component
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.settingsService.getSettings());
        }
    }

    loadCurrentSettings() {
        const settings = this.settingsService.getSettings();
        
        // Update controls with current settings
        Object.entries(this.controls).forEach(([key, element]) => {
            if (element && settings.hasOwnProperty(key)) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        });
    }

    open() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        
        if (this.settingsPanel) {
            this.settingsPanel.classList.add('open');
        }
        
        if (this.settingsOverlay) {
            this.settingsOverlay.classList.add('active');
        }
        
        // Focus management
        this.focusFirstControl();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('settingsOpen'));
    }

    close() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('open');
        }
        
        if (this.settingsOverlay) {
            this.settingsOverlay.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('settingsClose'));
    }

    toggle() {
        if (this.isVisible) {
            this.close();
        } else {
            this.open();
        }
    }

    isOpen() {
        return this.isVisible;
    }

    focusFirstControl() {
        // Focus first available control
        const firstControl = Object.values(this.controls).find(control => 
            control && !control.disabled
        );
        
        if (firstControl) {
            setTimeout(() => {
                firstControl.focus();
            }, 100); // Small delay for animation
        }
    }

    // Add setting validation
    validateSetting(key, value) {
        switch (key) {
            case 'showRomanization':
            case 'showAudioControls':
            case 'autoPlayAudio':
                return typeof value === 'boolean';
            default:
                return true;
        }
    }

    // Show setting update feedback
    showUpdateFeedback(settingName) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'setting-feedback';
        feedback.textContent = `${settingName} updated`;
        
        if (this.settingsPanel) {
            this.settingsPanel.appendChild(feedback);
            
            // Animate in
            setTimeout(() => {
                feedback.classList.add('show');
            }, 10);
            
            // Remove after delay
            setTimeout(() => {
                feedback.classList.remove('show');
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }, 2000);
        }
    }

    // Reset all settings to defaults
    resetToDefaults() {
        this.settingsService.resetSettings();
        this.loadCurrentSettings();
        
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.settingsService.getSettings());
        }
        
        this.showUpdateFeedback('Settings reset to defaults');
    }

    // Export settings
    exportSettings() {
        const settings = this.settingsService.exportSettings();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'korean-flashcard-settings.json';
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // Import settings
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settingsData = JSON.parse(e.target.result);
                    if (this.settingsService.importSettings(settingsData)) {
                        this.loadCurrentSettings();
                        if (this.callbacks.onChange) {
                            this.callbacks.onChange(this.settingsService.getSettings());
                        }
                        this.showUpdateFeedback('Settings imported successfully');
                    } else {
                        this.showUpdateFeedback('Failed to import settings');
                    }
                } catch (error) {
                    console.error('Settings import error:', error);
                    this.showUpdateFeedback('Invalid settings file');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Update callbacks
    updateCallbacks(newCallbacks) {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
    }
}
