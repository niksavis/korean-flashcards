// Flashcard Component - Manages the main flashcard display and interactions
export class FlashcardComponent {
    constructor(audioService, settingsService) {
        this.audioService = audioService;
        this.settingsService = settingsService;
        
        this.currentWord = null;
        this.isFlipped = false;
        this.isAnimating = false;
        
        // DOM elements
        this.flashcardElement = null;
        this.frontElement = null;
        this.backElement = null;
        
        // Content elements
        this.wordPositionElement = null;
        this.hangulElement = null;
        this.romanizationElement = null;
        this.englishElement = null;
        this.wordTypeElement = null;
        this.usageElement = null;
        this.exampleSentenceElement = null;
        this.detailedGrammarElement = null;
        this.informalUsageElement = null;
        
        // Audio elements
        this.wordAudioBtn = null;
        this.sentenceAudioBtn = null;
        
        // Settings elements
        this.toggleEnglishBtn = null;
        this.expandButtons = [];
        
        this.bindMethods();
    }

    bindMethods() {
        this.handleFlipClick = this.handleFlipClick.bind(this);
        this.handleWordAudio = this.handleWordAudio.bind(this);
        this.handleSentenceAudio = this.handleSentenceAudio.bind(this);
        this.handleToggleEnglish = this.handleToggleEnglish.bind(this);
        this.handleExpandSection = this.handleExpandSection.bind(this);
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupExpandableSections();
        console.log('Flashcard component initialized');
    }

    cacheElements() {
        // Main flashcard elements
        this.flashcardElement = document.getElementById('flashcard');
        this.frontElement = document.querySelector('.flashcard-front');
        this.backElement = document.querySelector('.flashcard-back');
        
        // Content elements
        this.wordPositionElement = document.getElementById('word-position');
        this.hangulElement = document.getElementById('hangul-text');
        this.romanizationElement = document.getElementById('romanization-text');
        this.romanizationDisplay = document.getElementById('romanization-display');
        this.englishElement = document.getElementById('english-text');
        this.englishTranslation = document.getElementById('english-translation');
        this.wordTypeElement = document.getElementById('word-type-badge');
        this.usageElement = document.getElementById('usage-text');
        
        // Example sentence elements
        this.exampleSentenceElement = document.getElementById('example-sentence');
        this.sentenceKoreanElement = document.querySelector('.sentence-korean');
        this.sentenceRomanizationElement = document.querySelector('.sentence-romanization');
        
        // Expandable content elements
        this.detailedGrammarElement = document.getElementById('detailed-grammar-text');
        this.informalUsageElement = document.getElementById('informal-usage-text');
        
        // Audio buttons
        this.wordAudioBtn = document.getElementById('word-audio-btn');
        this.sentenceAudioBtn = document.getElementById('sentence-audio-btn');
        
        // Toggle buttons
        this.toggleEnglishBtn = document.getElementById('toggle-english-btn');
        
        // Validate elements
        this.validateElements();
    }

    validateElements() {
        const requiredElements = [
            'flashcardElement', 'frontElement', 'backElement',
            'hangulElement', 'englishElement'
        ];
        
        const missing = requiredElements.filter(elementName => !this[elementName]);
        
        if (missing.length > 0) {
            console.error('Missing required elements:', missing);
            throw new Error(`Missing required flashcard elements: ${missing.join(', ')}`);
        }
    }

    setupEventListeners() {
        // Flashcard click to flip
        if (this.flashcardElement) {
            this.flashcardElement.addEventListener('click', this.handleFlipClick);
        }
        
        // Audio buttons
        if (this.wordAudioBtn) {
            this.wordAudioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleWordAudio();
            });
        }
        
        if (this.sentenceAudioBtn) {
            this.sentenceAudioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSentenceAudio();
            });
        }
        
        // Toggle English button
        if (this.toggleEnglishBtn) {
            this.toggleEnglishBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleToggleEnglish();
            });
        }
    }

    setupExpandableSections() {
        const expandButtons = document.querySelectorAll('.expand-btn');
        expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleExpandSection(button);
            });
        });
        this.expandButtons = expandButtons;
    }

    displayWord(word, isFlipped = false) {
        this.currentWord = word;
        this.isFlipped = isFlipped;
        
        if (!word) {
            console.warn('No word provided to display');
            return;
        }
        
        // Update front side
        this.updateFrontSide(word);
        
        // Update back side
        this.updateBackSide(word);
        
        // Update flip state
        this.updateFlipState();
        
        // Apply current settings
        this.applyCurrentSettings();
    }

    updateFrontSide(word) {
        // Word position
        if (this.wordPositionElement) {
            this.wordPositionElement.textContent = word.position || '';
        }
        
        // Hangul
        if (this.hangulElement) {
            this.hangulElement.textContent = word.hangul || '';
        }
        
        // Romanization
        if (this.romanizationElement) {
            this.romanizationElement.textContent = word.romanization || '';
        }
        
        // Example sentence
        if (word.exampleSentence) {
            this.updateExampleSentence(word.exampleSentence);
        } else {
            this.hideExampleSentence();
        }
    }

    updateBackSide(word) {
        // English translation
        if (this.englishElement) {
            this.englishElement.textContent = word.english || '';
        }
        
        // Word type badge
        if (this.wordTypeElement) {
            this.wordTypeElement.textContent = word.wordType || '';
            this.wordTypeElement.className = `word-type-badge ${word.wordType || ''}`;
        }
        
        // Usage information
        if (this.usageElement && word.grammaticalInfo) {
            this.usageElement.textContent = word.grammaticalInfo.usage || '';
        }
        
        // Detailed grammar
        if (this.detailedGrammarElement && word.grammaticalInfo) {
            this.detailedGrammarElement.textContent = word.grammaticalInfo.detailed || '';
        }
        
        // Informal usage
        if (this.informalUsageElement && word.grammaticalInfo) {
            this.informalUsageElement.textContent = word.grammaticalInfo.informal || '';
        }
    }

    updateExampleSentence(exampleSentence) {
        if (!this.exampleSentenceElement) return;
        
        if (this.sentenceKoreanElement) {
            this.sentenceKoreanElement.textContent = exampleSentence.korean || '';
        }
        
        if (this.sentenceRomanizationElement) {
            this.sentenceRomanizationElement.textContent = exampleSentence.romanization || '';
        }
        
        this.exampleSentenceElement.style.display = 'block';
    }

    hideExampleSentence() {
        if (this.exampleSentenceElement) {
            this.exampleSentenceElement.style.display = 'none';
        }
    }

    flip(isFlipped) {
        if (this.isAnimating) return;
        
        this.isFlipped = isFlipped;
        this.updateFlipState();
    }

    updateFlipState() {
        if (!this.flashcardElement) return;
        
        this.isAnimating = true;
        
        if (this.isFlipped) {
            this.flashcardElement.classList.add('flipped');
        } else {
            this.flashcardElement.classList.remove('flipped');
        }
        
        // Reset animation flag after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 350); // Match CSS transition duration
    }

    handleFlipClick(event) {
        if (this.isAnimating) return;
        
        // Don't flip if clicking on interactive elements
        if (event.target.closest('.audio-btn, .toggle-btn, .expand-btn')) {
            return;
        }
        
        this.flip(!this.isFlipped);
        
        // Notify parent about flip
        document.dispatchEvent(new CustomEvent('flashcardFlip', {
            detail: { 
                isFlipped: this.isFlipped,
                word: this.currentWord 
            }
        }));
    }

    async handleWordAudio() {
        if (!this.currentWord || !this.audioService) return;
        
        try {
            await this.audioService.playWord(this.currentWord.hangul);
        } catch (error) {
            console.warn('Failed to play word audio:', error);
            this.showAudioError();
        }
    }

    async handleSentenceAudio() {
        if (!this.currentWord || !this.currentWord.exampleSentence || !this.audioService) return;
        
        try {
            await this.audioService.playSentence(this.currentWord.exampleSentence.korean);
        } catch (error) {
            console.warn('Failed to play sentence audio:', error);
            this.showAudioError();
        }
    }

    handleToggleEnglish() {
        if (!this.englishTranslation) return;
        
        const isHidden = this.englishTranslation.classList.contains('hidden');
        
        if (isHidden) {
            this.englishTranslation.classList.remove('hidden');
            this.toggleEnglishBtn.textContent = 'Hide English';
        } else {
            this.englishTranslation.classList.add('hidden');
            this.toggleEnglishBtn.textContent = 'Show English';
        }
    }

    handleExpandSection(button) {
        const targetId = button.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
        
        if (!targetContent) return;
        
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // Collapse
            button.setAttribute('aria-expanded', 'false');
            targetContent.classList.remove('expanded');
        } else {
            // Expand
            button.setAttribute('aria-expanded', 'true');
            targetContent.classList.add('expanded');
        }
    }

    showAudioError() {
        // Visual feedback for audio errors
        const audioButtons = document.querySelectorAll('.audio-btn');
        audioButtons.forEach(btn => {
            btn.classList.add('error');
            setTimeout(() => {
                btn.classList.remove('error');
            }, 2000);
        });
    }

    // Settings application methods
    applyCurrentSettings() {
        const settings = this.settingsService.getSettings();
        
        this.setRomanizationVisible(settings.showRomanization);
        this.setKoreanOnlyMode(settings.koreanOnlyMode);
        this.setAudioControlsVisible(settings.showAudioControls);
    }

    setRomanizationVisible(visible) {
        if (this.romanizationDisplay) {
            if (visible) {
                this.romanizationDisplay.classList.remove('hidden');
            } else {
                this.romanizationDisplay.classList.add('hidden');
            }
        }
        
        // Also apply to sentence romanization
        if (this.sentenceRomanizationElement) {
            if (visible) {
                this.sentenceRomanizationElement.style.display = 'block';
            } else {
                this.sentenceRomanizationElement.style.display = 'none';
            }
        }
    }

    setKoreanOnlyMode(enabled) {
        if (!this.englishTranslation || !this.toggleEnglishBtn) return;
        
        if (enabled) {
            this.englishTranslation.classList.add('hidden');
            this.toggleEnglishBtn.textContent = 'Show English';
            this.toggleEnglishBtn.style.display = 'block';
        } else {
            this.englishTranslation.classList.remove('hidden');
            this.toggleEnglishBtn.style.display = 'none';
        }
    }

    setAudioControlsVisible(visible) {
        const audioControls = document.querySelectorAll('.audio-controls, .audio-btn');
        
        audioControls.forEach(control => {
            if (visible) {
                control.classList.remove('hidden');
            } else {
                control.classList.add('hidden');
            }
        });
    }

    // Public API methods
    getCurrentWord() {
        return this.currentWord;
    }

    isCurrentlyFlipped() {
        return this.isFlipped;
    }

    reset() {
        this.currentWord = null;
        this.isFlipped = false;
        this.updateFlipState();
        
        // Reset expandable sections
        this.expandButtons.forEach(button => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                button.setAttribute('aria-expanded', 'false');
                targetContent.classList.remove('expanded');
            }
        });
    }

    // Accessibility helpers
    announceWord(word) {
        if (!word) return;
        
        const announcement = `Korean word: ${word.hangul}. ${word.romanization}. English: ${word.english}`;
        
        // Create accessible announcement
        const announcement_element = document.createElement('div');
        announcement_element.setAttribute('aria-live', 'polite');
        announcement_element.setAttribute('aria-atomic', 'true');
        announcement_element.className = 'sr-only';
        announcement_element.textContent = announcement;
        
        document.body.appendChild(announcement_element);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement_element);
        }, 1000);
    }

    // Error handling
    showError(message) {
        console.error('Flashcard error:', message);
        
        // Display error in the flashcard
        if (this.hangulElement) {
            this.hangulElement.textContent = 'Error';
        }
        if (this.englishElement) {
            this.englishElement.textContent = message || 'Failed to load word';
        }
    }
}
