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
            autoPlayAudio: null,
            topicFilter: null,
            wordTypeFilter: null,
            searchQuery: null
        };
        
        // Filter controls
        this.searchInput = null;
        this.clearSearchBtn = null;
        this.clearFiltersBtn = null;
        this.filterStatus = null;
        this.quickTopicBtns = [];
        
        this.bindMethods();
    }

    bindMethods() {
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleSettingChange = this.handleSettingChange.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
        this.handleClearFilters = this.handleClearFilters.bind(this);
        this.handleQuickTopic = this.handleQuickTopic.bind(this);
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
        this.controls.topicFilter = document.getElementById('topic-filter');
        this.controls.wordTypeFilter = document.getElementById('word-type-filter');
        
        // Search and filter controls
        this.searchInput = document.getElementById('word-search');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        this.filterStatus = document.getElementById('filter-status');
        this.quickTopicBtns = document.querySelectorAll('.topic-btn');
        
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
        
        // Search controls
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearchInput);
        }
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', this.handleClearSearch);
        }
        
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', this.handleClearFilters);
        }
        
        // Quick topic buttons
        this.quickTopicBtns.forEach(btn => {
            btn.addEventListener('click', this.handleQuickTopic);
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
        
        // Update filter status if it's a filter control
        if (['topicFilter', 'wordTypeFilter'].includes(settingKey)) {
            this.updateFilterStatus();
        }
    }

    handleSearchInput(event) {
        const searchQuery = event.target.value;
        this.settingsService.setSetting('searchQuery', searchQuery);
        
        // Show/hide clear button
        if (this.clearSearchBtn) {
            this.clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
        }
        
        // Notify parent component
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.settingsService.getSettings());
        }
        
        this.updateFilterStatus();
    }

    handleClearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.settingsService.setSetting('searchQuery', '');
            
            if (this.clearSearchBtn) {
                this.clearSearchBtn.style.display = 'none';
            }
            
            if (this.callbacks.onChange) {
                this.callbacks.onChange(this.settingsService.getSettings());
            }
            
            this.updateFilterStatus();
        }
    }

    handleClearFilters() {
        // Reset all filters
        this.settingsService.setSetting('topicFilter', 'all');
        this.settingsService.setSetting('wordTypeFilter', 'all');
        this.settingsService.setSetting('searchQuery', '');
        
        // Update UI
        if (this.controls.topicFilter) this.controls.topicFilter.value = 'all';
        if (this.controls.wordTypeFilter) this.controls.wordTypeFilter.value = 'all';
        if (this.searchInput) this.searchInput.value = '';
        if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'none';
        
        // Update quick topic buttons
        this.quickTopicBtns.forEach(btn => btn.classList.remove('active'));
        
        // Notify parent component
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.settingsService.getSettings());
        }
        
        this.updateFilterStatus();
    }

    handleQuickTopic(event) {
        const topic = event.target.dataset.topic;
        
        // Update topic filter
        this.settingsService.setSetting('topicFilter', topic);
        if (this.controls.topicFilter) {
            this.controls.topicFilter.value = topic;
        }
        
        // Update button states
        this.quickTopicBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.topic === topic);
        });
        
        // Notify parent component
        if (this.callbacks.onChange) {
            this.callbacks.onChange(this.settingsService.getSettings());
        }
        
        this.updateFilterStatus();
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
        
        // Update search input
        if (this.searchInput && settings.searchQuery) {
            this.searchInput.value = settings.searchQuery;
            if (this.clearSearchBtn) {
                this.clearSearchBtn.style.display = settings.searchQuery ? 'flex' : 'none';
            }
        }
        
        // Update quick topic buttons
        this.quickTopicBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.topic === settings.topicFilter);
        });
        
        this.updateFilterStatus();
    }

    // Initialize filter options with data
    initializeFilterOptions(dataService) {
        this.dataService = dataService;
        
        // Populate topic filter
        if (this.controls.topicFilter && dataService.isDataLoaded()) {
            const topics = dataService.getUniqueTopics();
            const topicSelect = this.controls.topicFilter;
            
            // Clear existing options (except "All Topics")
            while (topicSelect.children.length > 1) {
                topicSelect.removeChild(topicSelect.lastChild);
            }
            
            // Add topic options
            topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        }
        
        // Populate word type filter
        if (this.controls.wordTypeFilter && dataService.isDataLoaded()) {
            const wordTypes = dataService.getUniqueWordTypes();
            const typeSelect = this.controls.wordTypeFilter;
            
            // Clear existing options (except "All Types")
            while (typeSelect.children.length > 1) {
                typeSelect.removeChild(typeSelect.lastChild);
            }
            
            // Add word type options
            wordTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                typeSelect.appendChild(option);
            });
        }
        
        this.updateFilterStatus();
    }

    // Update filter status display
    updateFilterStatus() {
        if (!this.filterStatus || !this.dataService || !this.dataService.isDataLoaded()) {
            return;
        }
        
        const settings = this.settingsService.getSettings();
        const criteria = {
            topic: settings.topicFilter,
            wordType: settings.wordTypeFilter,
            search: settings.searchQuery
        };
        
        const filteredWords = this.dataService.filterWords(criteria);
        const totalWords = this.dataService.getAllWords().length;
        
        // Build status text
        let statusText = `Showing ${filteredWords.length} of ${totalWords} words`;
        
        const activeFilters = [];
        if (settings.topicFilter && settings.topicFilter !== 'all') {
            activeFilters.push(`Topic: ${settings.topicFilter}`);
        }
        if (settings.wordTypeFilter && settings.wordTypeFilter !== 'all') {
            activeFilters.push(`Type: ${settings.wordTypeFilter}`);
        }
        if (settings.searchQuery && settings.searchQuery.trim()) {
            activeFilters.push(`Search: "${settings.searchQuery}"`);
        }
        
        if (activeFilters.length > 0) {
            statusText += ` (${activeFilters.join(', ')})`;
        }
        
        this.filterStatus.textContent = statusText;
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
