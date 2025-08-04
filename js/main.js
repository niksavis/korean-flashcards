// Korean Flashcard Application - Main Entry Point
import { DataService } from './services/dataService.js';
import { AudioService } from './services/audioService.js';
import { SettingsService } from './services/settingsService.js';
import { StorageService } from './services/storageService.js';
import { FlashcardComponent } from './components/flashcard.js';
import { NavigationComponent } from './components/navigation.js';
import { ProgressComponent } from './components/progress.js';
import { SettingsComponent } from './components/settings.js';
import { KeyboardHandler } from './utils/keyboardHandler.js';
import { ThemeManager } from './utils/themeManager.js';

class KoreanFlashcardApp {
    constructor() {
        // Initialize services
        this.dataService = new DataService();
        this.audioService = new AudioService();
        this.settingsService = new SettingsService();
        this.storageService = new StorageService();
        
        // Initialize components
        this.flashcardComponent = new FlashcardComponent(this.audioService, this.settingsService);
        this.navigationComponent = new NavigationComponent();
        this.progressComponent = new ProgressComponent();
        this.settingsComponent = new SettingsComponent(this.settingsService);
        
        // Initialize utilities
        this.keyboardHandler = new KeyboardHandler();
        this.themeManager = new ThemeManager();
        
        // Application state
        this.state = {
            currentWordIndex: 0,
            words: [],
            isFlipped: false,
            isLoading: true,
            studySession: {
                startTime: null,
                cardsStudied: 0,
                correctAnswers: 0
            }
        };
        
        // Bind methods
        this.handleNextCard = this.handleNextCard.bind(this);
        this.handlePrevCard = this.handlePrevCard.bind(this);
        this.handleFlipCard = this.handleFlipCard.bind(this);
        this.handleSettingsToggle = this.handleSettingsToggle.bind(this);
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.handleSettingsChange = this.handleSettingsChange.bind(this);
    }

    async init() {
        try {
            console.log('Initializing Korean Flashcard App...');
            
            // Show loading overlay
            console.log('Showing loading overlay...');
            this.showLoading(true);
            console.log('Loading overlay shown');
            
            // Load user settings
            console.log('Loading settings...');
            await this.settingsService.loadSettings();
            console.log('Settings loaded');
            
            // Load word data
            console.log('Loading word data...');
            await this.dataService.loadWords();
            console.log('Word data loaded, getting words...');
            this.state.words = this.dataService.getAllWords();
            console.log(`Loaded ${this.state.words.length} words`);
            
            // Initialize components
            console.log('Initializing components...');
            this.initializeComponents();
            console.log('Components initialized');
            
            // Set up event listeners
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            console.log('Event listeners set up');
            
            // Apply initial settings
            console.log('Applying settings...');
            this.applySettings();
            console.log('Settings applied');
            
            // Start study session
            console.log('Starting study session...');
            this.startStudySession();
            console.log('Study session started');
            
            // Display first card
            console.log('Displaying first card...');
            this.displayCurrentCard();
            console.log('First card displayed');
            
            // Hide loading overlay
            console.log('Hiding loading overlay...');
            this.showLoading(false);
            console.log('Loading overlay hidden');

            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            console.error('Error stack:', error.stack);
            this.handleError('Failed to load the application. Please refresh the page.');
        }
    }

    initializeComponents() {
        // Initialize flashcard component
        this.flashcardComponent.init({
            onFlip: this.handleFlipCard
        });
        
        // Initialize navigation component
        this.navigationComponent.init({
            onNext: this.handleNextCard,
            onPrev: this.handlePrevCard,
            onFlip: this.handleFlipCard
        });
        
        // Initialize progress component
        this.progressComponent.init();
        
        // Initialize settings component
        this.settingsComponent.init({
            onChange: this.handleSettingsChange
        });
        
        // Initialize keyboard handler
        this.keyboardHandler.init({
            onNext: this.handleNextCard,
            onPrev: this.handlePrevCard,
            onFlip: this.handleFlipCard,
            onWordAudio: () => this.playCurrentWordAudio(),
            onSentenceAudio: () => this.playCurrentSentenceAudio(),
            onSettings: this.handleSettingsToggle
        });
        
        // Pass settings component reference for keyboard blocking
        this.keyboardHandler.setSettingsComponent(this.settingsComponent);
        
        // Initialize theme manager
        this.themeManager.init();
    }

    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', this.handleSettingsToggle);
        }
        
        // Theme toggle button
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.themeManager.toggleTheme();
            });
        }

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
        
        // Handle visibility change for session tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveProgress();
            }
        });
    }

    handleNextCard() {
        if (this.state.currentWordIndex < this.state.words.length - 1) {
            this.state.currentWordIndex++;
            this.state.isFlipped = false;
            this.state.studySession.cardsStudied++;
            this.displayCurrentCard();
            this.saveProgress();
        }
    }

    handlePrevCard() {
        if (this.state.currentWordIndex > 0) {
            this.state.currentWordIndex--;
            this.state.isFlipped = false;
            this.displayCurrentCard();
            this.saveProgress();
        }
    }

    handleFlipCard() {
        this.state.isFlipped = !this.state.isFlipped;
        this.flashcardComponent.flip(this.state.isFlipped);
        
        // Update navigation states to reflect the new flip state
        this.navigationComponent.updateStates(
            this.state.currentWordIndex > 0, // canGoPrev
            this.state.currentWordIndex < this.state.words.length - 1, // canGoNext
            this.state.isFlipped
        );
    }

    handleSettingsToggle() {
        this.settingsComponent.toggle();
    }

    handleKeyboard(event) {
        // Prevent keyboard actions when settings panel is open
        if (this.settingsComponent.isOpen()) {
            return;
        }
        
        // Don't duplicate the keyboard handler's own processing
        // The keyboardHandler.handleKeyDown will be called by its own event listener
    }

    handleSettingsChange(settings) {
        // Apply settings changes immediately
        this.applySettings();
        
        // Re-render current card with new settings
        this.displayCurrentCard();
        
        // Save settings
        this.settingsService.saveSettings();
    }

    applySettings() {
        const settings = this.settingsService.getSettings();
        
        // Apply romanization visibility
        this.flashcardComponent.setRomanizationVisible(settings.showRomanization);
        
        // Apply audio controls visibility
        this.flashcardComponent.setAudioControlsVisible(settings.showAudioControls);
        
        // Apply auto-play setting
        this.audioService.setAutoPlay(settings.autoPlayAudio);
        
        // Apply theme
        this.themeManager.setTheme(settings.theme);
    }

    displayCurrentCard() {
        const currentWord = this.getCurrentWord();
        if (!currentWord) return;
        
        // Update flashcard display
        this.flashcardComponent.displayWord(currentWord, this.state.isFlipped);
        
        // Update progress
        this.progressComponent.updateProgress(
            this.state.currentWordIndex + 1,
            this.state.words.length,
            currentWord.difficulty
        );
        
        // Update navigation states
        this.navigationComponent.updateStates(
            this.state.currentWordIndex > 0, // canGoPrev
            this.state.currentWordIndex < this.state.words.length - 1, // canGoNext
            this.state.isFlipped
        );
        
        // Auto-play audio if enabled
        if (this.settingsService.getSettings().autoPlayAudio && !this.state.isFlipped) {
            setTimeout(() => {
                this.playCurrentWordAudio();
            }, 500); // Small delay for better UX
        }
    }

    getCurrentWord() {
        return this.state.words[this.state.currentWordIndex] || null;
    }

    async playCurrentWordAudio() {
        const currentWord = this.getCurrentWord();
        if (currentWord) {
            try {
                await this.audioService.playWord(currentWord.hangul);
            } catch (error) {
                console.warn('Audio playback failed:', error);
            }
        }
    }

    async playCurrentSentenceAudio() {
        const currentWord = this.getCurrentWord();
        if (currentWord && currentWord.exampleSentence) {
            try {
                await this.audioService.playSentence(currentWord.exampleSentence.korean);
            } catch (error) {
                console.warn('Sentence audio playback failed:', error);
            }
        }
    }

    startStudySession() {
        this.state.studySession.startTime = new Date();
        this.state.studySession.cardsStudied = 0;
        this.state.studySession.correctAnswers = 0;
        
        // Load previous progress
        const progress = this.storageService.getProgress();
        if (progress && progress.currentWordIndex !== undefined) {
            this.state.currentWordIndex = Math.min(progress.currentWordIndex, this.state.words.length - 1);
        }
    }

    saveProgress() {
        const progress = {
            currentWordIndex: this.state.currentWordIndex,
            studySession: this.state.studySession,
            lastStudied: new Date().toISOString()
        };
        
        this.storageService.saveProgress(progress);
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
        this.state.isLoading = show;
    }

    handleError(message) {
        console.error('App Error:', message);
        
        // Hide loading overlay
        this.showLoading(false);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="retry-btn">
                    Try Again
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    // Public API methods for external access
    goToCard(index) {
        if (index >= 0 && index < this.state.words.length) {
            this.state.currentWordIndex = index;
            this.state.isFlipped = false;
            this.displayCurrentCard();
            this.saveProgress();
        }
    }

    getCurrentWordData() {
        return this.getCurrentWord();
    }

    getAppState() {
        return { ...this.state };
    }

    // Expose audio methods for external use
    playWordAudio() {
        return this.playCurrentWordAudio();
    }

    playSentenceAudio() {
        return this.playCurrentSentenceAudio();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Korean Flashcard App...');
    
    // Create global app instance
    window.koreanFlashcardApp = new KoreanFlashcardApp();
    
    // Initialize the app
    window.koreanFlashcardApp.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
});

// Export for module use
export { KoreanFlashcardApp };
