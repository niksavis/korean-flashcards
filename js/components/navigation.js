// Navigation Component - Handles card navigation controls
export class NavigationComponent {
    constructor() {
        this.callbacks = {};
        
        // DOM elements
        this.prevBtn = null;
        this.nextBtn = null;
        this.flipBtn = null;
        
        this.bindMethods();
    }

    bindMethods() {
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleFlipClick = this.handleFlipClick.bind(this);
    }

    init(callbacks = {}) {
        this.callbacks = callbacks;
        this.cacheElements();
        this.setupEventListeners();
        
        // Ensure flip button starts with correct text
        if (this.flipBtn) {
            const flipText = this.flipBtn.querySelector('span');
            if (flipText) {
                flipText.textContent = 'Flip';
                console.log('Navigation: Set flip button text to "Flip"');
            }
        }
        
        console.log('Navigation component initialized');
    }

    cacheElements() {
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.flipBtn = document.getElementById('flip-btn');
        
        if (!this.prevBtn || !this.nextBtn || !this.flipBtn) {
            console.warn('Some navigation elements not found');
        }
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', this.handlePrevClick);
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', this.handleNextClick);
        }
        
        if (this.flipBtn) {
            this.flipBtn.addEventListener('click', this.handleFlipClick);
        }
    }

    handlePrevClick() {
        if (this.callbacks.onPrev) {
            this.callbacks.onPrev();
        }
    }

    handleNextClick() {
        if (this.callbacks.onNext) {
            this.callbacks.onNext();
        }
    }

    handleFlipClick() {
        if (this.callbacks.onFlip) {
            this.callbacks.onFlip();
        }
    }

    updateStates(canGoPrev, canGoNext, isFlipped) {
        // Update previous button state
        if (this.prevBtn) {
            this.prevBtn.disabled = !canGoPrev;
            this.prevBtn.setAttribute('aria-disabled', !canGoPrev);
            
            if (canGoPrev) {
                this.prevBtn.classList.remove('disabled');
            } else {
                this.prevBtn.classList.add('disabled');
            }
        }
        
        // Update next button state
        if (this.nextBtn) {
            this.nextBtn.disabled = !canGoNext;
            this.nextBtn.setAttribute('aria-disabled', !canGoNext);
            
            if (canGoNext) {
                this.nextBtn.classList.remove('disabled');
            } else {
                this.nextBtn.classList.add('disabled');
            }
        }
        
        // Update flip button text
        if (this.flipBtn) {
            const flipText = this.flipBtn.querySelector('span');
            if (flipText) {
                flipText.textContent = 'Flip';
            }
            
            this.flipBtn.setAttribute('aria-label', 
                isFlipped ? 'Flip to front of card' : 'Flip to back of card'
            );
        }
    }

    setEnabled(enabled) {
        const buttons = [this.prevBtn, this.nextBtn, this.flipBtn];
        
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = !enabled;
                
                if (enabled) {
                    btn.classList.remove('disabled');
                } else {
                    btn.classList.add('disabled');
                }
            }
        });
    }

    // Loading state for navigation buttons
    setLoading(isLoading) {
        const buttons = [this.prevBtn, this.nextBtn, this.flipBtn];
        
        buttons.forEach(btn => {
            if (btn) {
                if (isLoading) {
                    btn.classList.add('loading');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('loading');
                    btn.disabled = false;
                }
            }
        });
    }

    // Highlight navigation hints for new users
    showHints() {
        const buttons = [this.prevBtn, this.nextBtn, this.flipBtn];
        
        buttons.forEach((btn, index) => {
            if (btn) {
                setTimeout(() => {
                    btn.classList.add('hint');
                    setTimeout(() => {
                        btn.classList.remove('hint');
                    }, 1000);
                }, index * 300);
            }
        });
    }

    updateCallbacks(newCallbacks) {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
    }
}
