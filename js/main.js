// Korean Flashcard Application - Main Entry Point
import { DataService } from './services/dataService.js';
import { AudioService } from './services/audioService.js';
import { SettingsService } from './services/settingsService.js';
import { StorageService } from './services/storageService.js';
import { SessionService } from './services/sessionService.js';
import { FlashcardComponent } from './components/flashcard.js';
import { NavigationComponent } from './components/navigation.js';
import { ProgressComponent } from './components/progress.js';
import { SettingsComponent } from './components/settings.js';
import { HangulReferenceComponent } from './components/hangulReference.js';
import { KeyboardHandler } from './utils/keyboardHandler.js';
import { ThemeManager } from './utils/themeManager.js';

class KoreanFlashcardApp {
    constructor() {
        // Initialize services
        this.dataService = new DataService();
        this.audioService = new AudioService();
        this.settingsService = new SettingsService();
        this.storageService = new StorageService();
        this.sessionService = new SessionService(this.dataService);
        
        // Initialize components
        this.flashcardComponent = new FlashcardComponent(this.audioService, this.settingsService);
        this.navigationComponent = new NavigationComponent();
        this.progressComponent = new ProgressComponent();
        this.settingsComponent = new SettingsComponent(this.settingsService, this.sessionService);
        this.hangulReferenceComponent = new HangulReferenceComponent();
        
        // Initialize utilities
        this.keyboardHandler = new KeyboardHandler();
        this.themeManager = new ThemeManager();
        
        // Application state
        this.state = {
            currentWordIndex: 0,
            words: [],
            filteredWords: [], // New: filtered subset of words
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
        this.handleHangulReference = this.handleHangulReference.bind(this);
        this.handleGoToCard = this.handleGoToCard.bind(this);
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
            this.state.filteredWords = this.state.words; // Initialize with all words
            console.log(`Loaded ${this.state.words.length} words`);
            
            // Initialize session service after data is loaded
            console.log('Initializing sessions...');
            await this.sessionService.initialize();
            console.log('Sessions initialized');
            
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
            onChange: this.handleSettingsChange,
            onStartSession: this.handleStartSession.bind(this)
        });
        
        // Initialize hangul reference component
        this.hangulReferenceComponent.init(this.audioService);
        
            // Initialize filter options after data is loaded
            this.settingsComponent.initializeFilterOptions(this.dataService);
            
            // Apply initial filters
            console.log('Applying initial filters...');
            this.updateFilteredWords(this.settingsService.getSettings());
            console.log('Initial filters applied');        // Initialize keyboard handler
        this.keyboardHandler.init({
            onNext: this.handleNextCard,
            onPrev: this.handlePrevCard,
            onFlip: this.handleFlipCard,
            onWordAudio: () => this.playCurrentWordAudio(),
            onSentenceAudio: () => this.playCurrentSentenceAudio(),
            onSettings: this.handleSettingsToggle,
            onHangul: this.handleHangulReference
        });
        
        // Pass settings component reference for keyboard blocking
        this.keyboardHandler.setSettingsComponent(this.settingsComponent);
        
        // Pass hangul reference component for keyboard blocking
        this.keyboardHandler.setHangulReferenceComponent(this.hangulReferenceComponent);
        
        // Initialize theme manager
        this.themeManager.init();
    }

    setupEventListeners() {
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', this.handleSettingsToggle);
        }
        
        // Hangul reference button
        const hangulBtn = document.getElementById('hangul-reference-btn');
        if (hangulBtn) {
            hangulBtn.addEventListener('click', this.handleHangulReference);
        }
        
        // Go to card functionality
        const goToBtn = document.getElementById('go-to-btn');
        const goToInput = document.getElementById('go-to-input');
        if (goToBtn && goToInput) {
            goToBtn.addEventListener('click', this.handleGoToCard);
            goToInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.handleGoToCard();
                }
            });
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
        if (this.state.currentWordIndex < this.state.filteredWords.length - 1) {
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

    handleHangulReference() {
        if (this.hangulReferenceComponent.isOpen()) {
            this.hangulReferenceComponent.close();
        } else {
            this.hangulReferenceComponent.open();
        }
    }

    handleGoToCard() {
        const goToInput = document.getElementById('go-to-input');
        if (!goToInput) return;
        
        const cardNumber = parseInt(goToInput.value, 10);
        const totalCards = this.state.filteredWords.length;
        
        // Validate input
        if (isNaN(cardNumber) || cardNumber < 1 || cardNumber > totalCards) {
            // Show feedback
            goToInput.style.borderColor = 'var(--error-color)';
            goToInput.title = `Please enter a number between 1 and ${totalCards}`;
            
            // Reset after 2 seconds
            setTimeout(() => {
                goToInput.style.borderColor = '';
                goToInput.title = 'Enter card number to jump to';
            }, 2000);
            return;
        }
        
        // Navigate to card (subtract 1 for 0-based index)
        this.state.currentWordIndex = cardNumber - 1;
        this.state.isFlipped = false;
        this.displayCurrentCard();
        this.saveProgress();
        
        // Clear input and show success
        goToInput.value = '';
        goToInput.style.borderColor = 'var(--accent-color)';
        setTimeout(() => {
            goToInput.style.borderColor = '';
        }, 1000);
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
        
        // Handle session mode changes
        if (settings.sessionMode === 'all') {
            // Reset to show all filtered words (not session-limited)
            this.updateFilteredWords(settings);
        } else if (settings.sessionMode === 'session' && settings.selectedSession) {
            // Apply session filtering - start the selected session
            this.handleStartSession(settings.selectedSession);
        } else {
            // Update filtered words for session mode but no session selected yet
            this.updateFilteredWords(settings);
        }
        
        // Re-render current card with new settings
        this.displayCurrentCard();
        
        // Save settings
        this.settingsService.saveSettings();
    }

    updateFilteredWords(settings) {
        const criteria = {
            topic: settings.topicFilter,
            wordType: settings.wordTypeFilter,
            search: settings.searchQuery
        };
        
        const previousFilteredLength = this.state.filteredWords.length;
        const previousCurrentWord = this.getCurrentWord();
        
        this.state.filteredWords = this.dataService.filterWords(criteria);
        
        console.log(`Filter update: ${this.state.filteredWords.length} words match criteria`);
        
        // If we have no words matching the filter, reset to all words
        if (this.state.filteredWords.length === 0) {
            console.warn('No words match current filters, showing all words');
            this.state.filteredWords = this.state.words;
        }
        
        // Try to keep the same word if it exists in the filtered set
        if (previousCurrentWord) {
            const newIndex = this.state.filteredWords.findIndex(word => word.id === previousCurrentWord.id);
            if (newIndex >= 0) {
                this.state.currentWordIndex = newIndex;
            } else {
                // Word not in filtered set, go to beginning
                this.state.currentWordIndex = 0;
            }
        } else {
            // No previous word, start at beginning
            this.state.currentWordIndex = 0;
        }
        
        // Ensure index is within bounds
        if (this.state.currentWordIndex >= this.state.filteredWords.length) {
            this.state.currentWordIndex = Math.max(0, this.state.filteredWords.length - 1);
        }
        
        console.log(`Current index after filtering: ${this.state.currentWordIndex} of ${this.state.filteredWords.length}`);
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
            this.state.filteredWords.length,
            currentWord.difficulty
        );
        
        // Update navigation states
        this.navigationComponent.updateStates(
            this.state.currentWordIndex > 0, // canGoPrev
            this.state.currentWordIndex < this.state.filteredWords.length - 1, // canGoNext
            this.state.isFlipped
        );
        
        // Update Go To Card input max value
        const goToInput = document.getElementById('go-to-input');
        if (goToInput) {
            goToInput.max = this.state.filteredWords.length;
            goToInput.placeholder = `1-${this.state.filteredWords.length}`;
        }
        
        // Auto-play audio if enabled
        if (this.settingsService.getSettings().autoPlayAudio && !this.state.isFlipped) {
            setTimeout(() => {
                this.playCurrentWordAudio();
            }, 500); // Small delay for better UX
        }
    }

    getCurrentWord() {
        return this.state.filteredWords[this.state.currentWordIndex] || null;
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

    handleStartSession(sessionId) {
        if (!this.sessionService) {
            console.error('Session service not initialized');
            return;
        }

        const session = this.sessionService.getSession(sessionId);
        if (!session) {
            console.error('Session not found:', sessionId);
            return;
        }
        
        // Set the filtered words to the session's words
        this.state.filteredWords = session.words;
        this.state.currentWordIndex = 0;
        this.state.isFlipped = false;
        
        // Ensure we start fresh with the first card front-side
        this.displayCurrentCard();
        
        // Update navigation to reflect new session
        this.navigationComponent.updateStates(
            false, // can't go prev from first card
            this.state.filteredWords.length > 1, // can go next if more than 1 card
            false // not flipped
        );
        
        console.log(`Started session "${session.title}": showing ${session.words.length} cards`);
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
