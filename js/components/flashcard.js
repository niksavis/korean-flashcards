// Flashcard Component - Manages the main flashcard display and interactions
export class FlashcardComponent {
    constructor(audioService, settingsService) {
        this.audioService = audioService;
        this.settingsService = settingsService;
        
        this.currentWord = null;
        this.isFlipped = false;
        this.isAnimating = false;
        
        // Callbacks
        this.onFlipCallback = null;
        
        // DOM elements
        this.flashcardElement = null;
        this.frontElement = null;
        this.backElement = null;
        
        // Content elements
        this.wordPositionElement = null;
        this.hangulElement = null;
        this.romanizationElement = null;
        this.englishElement = null;
        this.wordTopicElement = null;
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
        this.handleWordAudio = this.handleWordAudio.bind(this);
        this.handleSentenceAudio = this.handleSentenceAudio.bind(this);
        this.handleFlashcardClick = this.handleFlashcardClick.bind(this);
    }

    init(callbacks = {}) {
        this.onFlipCallback = callbacks.onFlip;
        this.cacheElements();
        this.setupEventListeners();
        console.log('Flashcard component initialized');
    }

    cacheElements() {
        // Main flashcard elements
        this.flashcardElement = document.getElementById('flashcard');
        this.frontElement = document.querySelector('.flashcard-front');
        this.backElement = document.querySelector('.flashcard-back');
        
        // Front side elements
        this.wordPositionElement = document.getElementById('word-position');
        this.hangulElement = document.getElementById('hangul-text');
        this.wordTopicElement = document.getElementById('word-topic');
        this.wordTypeElement = document.getElementById('word-type');
        this.wordCategoryElement = document.getElementById('word-category'); // Legacy fallback
        this.wordTypeHintElement = document.getElementById('word-type-hint'); // Legacy fallback
        this.romanizationElement = document.getElementById('romanization-text');
        this.romanizationDisplay = document.getElementById('romanization-display');
        
        // Back side elements
        this.englishElement = document.getElementById('english-text');
        this.romanizationFullElement = document.getElementById('romanization-full');
        this.exampleSectionElement = document.getElementById('example-section');
        this.sentenceKoreanElement = document.getElementById('sentence-korean');
        this.sentenceRomanizationElement = document.getElementById('sentence-romanization');
        this.sentenceEnglishElement = document.getElementById('sentence-english');
        this.frequencyLevelElement = document.getElementById('frequency-level');
        this.difficultyLevelElement = document.getElementById('difficulty-level');
        
        // New front card frequency/difficulty elements
        this.frequencyLevelFrontElement = document.getElementById('frequency-level-front');
        this.difficultyLevelFrontElement = document.getElementById('difficulty-level-front');
        
        // Audio buttons
        this.wordAudioBtn = document.getElementById('word-audio-btn');
        this.sentenceAudioBtn = document.getElementById('sentence-audio-btn');
        
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

        // Flashcard click to flip
        if (this.flashcardElement) {
            this.flashcardElement.addEventListener('click', (e) => {
                // Don't flip if clicking on audio buttons or other interactive elements
                if (e.target.closest('.audio-btn') || 
                    e.target.closest('.expand-btn') || 
                    e.target.closest('button')) {
                    return;
                }
                
                // Trigger flip through main app callback
                this.handleFlashcardClick();
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
        
        // Hangul (main focus)
        if (this.hangulElement) {
            this.hangulElement.textContent = word.hangul || '';
        }
        
        // Topic (enhanced display)
        if (this.wordTopicElement) {
            this.wordTopicElement.textContent = word.topic || word.category || '';
            this.wordTopicElement.className = `topic-badge ${(word.topic || word.category || '').toLowerCase().replace(/\s+/g, '-')}`;
        }
        
        // Word type (enhanced display)
        if (this.wordTypeElement) {
            this.wordTypeElement.textContent = word.partOfSpeech || '';
            this.wordTypeElement.className = `type-badge ${(word.partOfSpeech || '').toLowerCase()}`;
        }
        
        // Legacy fallbacks for existing elements
        if (this.wordCategoryElement) {
            this.wordCategoryElement.textContent = word.topic || word.category || '';
            this.wordCategoryElement.className = `category-badge ${(word.topic || word.category || '').toLowerCase().replace(/\s+/g, '-')}`;
        }
        
        if (this.wordTypeHintElement) {
            this.wordTypeHintElement.textContent = word.partOfSpeech || '';
            this.wordTypeHintElement.className = `type-badge ${(word.partOfSpeech || '').toLowerCase()}`;
        }
        
        // Romanization (pronunciation help)
        if (this.romanizationElement) {
            this.romanizationElement.textContent = word.romanization || '';
        }
    }

    updateBackSide(word) {
        // English translation (main answer)
        if (this.englishElement) {
            this.englishElement.textContent = word.english || '';
        }
        
        // Full romanization guide
        if (this.romanizationFullElement) {
            this.romanizationFullElement.textContent = word.romanization || '';
        }
        
        // Example sentence section
        if (word.exampleSentence) {
            this.updateExampleSentence(word.exampleSentence);
            if (this.exampleSectionElement) {
                this.exampleSectionElement.style.display = 'block';
            }
        } else {
            if (this.exampleSectionElement) {
                this.exampleSectionElement.style.display = 'none';
            }
        }
        
        // Frequency information (both back and front card)
        if (this.frequencyLevelElement) {
            const frequency = word.frequency || 'medium';
            this.frequencyLevelElement.textContent = this.formatFrequencyText(frequency);
            this.frequencyLevelElement.className = `frequency-badge ${frequency}`;
        }
        
        if (this.frequencyLevelFrontElement) {
            const frequency = word.frequency || 'medium';
            this.frequencyLevelFrontElement.textContent = this.formatFrequencyText(frequency);
            this.frequencyLevelFrontElement.className = `frequency-badge ${frequency}`;
        }
        
        // Difficulty information (both back and front card)
        if (this.difficultyLevelElement) {
            const difficulty = word.difficulty || 'intermediate';
            this.difficultyLevelElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            this.difficultyLevelElement.className = `difficulty-badge ${difficulty}`;
        }
        
        if (this.difficultyLevelFrontElement) {
            const difficulty = word.difficulty || 'intermediate';
            this.difficultyLevelFrontElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            this.difficultyLevelFrontElement.className = `difficulty-badge ${difficulty}`;
        }
    }

    updateExampleSentence(exampleSentence) {
        if (this.sentenceKoreanElement) {
            this.sentenceKoreanElement.textContent = exampleSentence.korean || '';
        }
        
        if (this.sentenceRomanizationElement) {
            this.sentenceRomanizationElement.textContent = exampleSentence.romanization || '';
        }
        
        if (this.sentenceEnglishElement) {
            this.sentenceEnglishElement.textContent = exampleSentence.english || '';
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

    handleFlashcardClick() {
        // Prevent flip during animation
        if (this.isAnimating) return;
        
        // Call the flip callback if provided
        if (this.onFlipCallback && typeof this.onFlipCallback === 'function') {
            this.onFlipCallback();
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

    setAudioControlsVisible(visible) {
        const audioControls = document.querySelectorAll('.word-audio-controls, .audio-btn');
        
        audioControls.forEach(control => {
            if (visible) {
                control.classList.remove('hidden');
                control.style.display = ''; // Remove any inline hiding
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

    // Format frequency values for display
    formatFrequencyText(frequency) {
        const frequencyMap = {
            'very_high': 'Very High',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low',
            'very_low': 'Very Low'
        };
        return frequencyMap[frequency] || frequency.charAt(0).toUpperCase() + frequency.slice(1);
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
