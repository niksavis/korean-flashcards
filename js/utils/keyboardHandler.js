// Keyboard Handler - Manages keyboard shortcuts and navigation
export class KeyboardHandler {
    constructor() {
        this.callbacks = {};
        this.isEnabled = true;
        this.settingsComponent = null;
        this.hangulReferenceComponent = null;
        this.shortcuts = {
            next: ['ArrowRight', 'KeyN'],
            prev: ['ArrowLeft', 'KeyP'],
            flip: ['Space', 'Enter', 'KeyF'],
            wordAudio: ['KeyA'],
            sentenceAudio: ['KeyS'],
            settings: ['KeyQ'],
            hangul: ['KeyH'],
            escape: ['Escape']
        };
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init(callbacks = {}) {
        this.callbacks = callbacks;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Handle each shortcut
        const code = event.code;
        
        // Always allow escape key
        if (this.shortcuts.escape.includes(code)) {
            event.preventDefault();
            this.executeCallback('onEscape');
            return;
        }
        
        // Allow settings key (Q) to work even when settings panel is open (for toggle)
        if (this.shortcuts.settings.includes(code)) {
            event.preventDefault();
            this.executeCallback('onSettings');
            return;
        }
        
        // Allow hangul key (H) to work even when hangul modal is open (for toggle)
        if (this.shortcuts.hangul.includes(code)) {
            event.preventDefault();
            this.executeCallback('onHangul');
            return;
        }
        
        // Don't handle shortcuts when user is typing in inputs (but AFTER checking toggle keys)
        if (this.isTypingContext(event.target)) {
            return;
        }
        
        // Don't handle other shortcuts when modal panels are open
        if (this.settingsComponent && this.settingsComponent.isOpen()) {
            return;
        }
        
        if (this.hangulReferenceComponent && this.hangulReferenceComponent.isOpen()) {
            return;
        }
        
        if (this.shortcuts.next.includes(code)) {
            event.preventDefault();
            this.executeCallback('onNext');
        } else if (this.shortcuts.prev.includes(code)) {
            event.preventDefault();
            this.executeCallback('onPrev');
        } else if (this.shortcuts.flip.includes(code)) {
            event.preventDefault();
            this.executeCallback('onFlip');
        } else if (this.shortcuts.wordAudio.includes(code)) {
            event.preventDefault();
            this.executeCallback('onWordAudio');
        } else if (this.shortcuts.sentenceAudio.includes(code)) {
            event.preventDefault();
            this.executeCallback('onSentenceAudio');
        }
    }

    executeCallback(callbackName) {
        if (this.callbacks[callbackName] && typeof this.callbacks[callbackName] === 'function') {
            try {
                this.callbacks[callbackName]();
            } catch (error) {
                console.error(`Keyboard callback error (${callbackName}):`, error);
            }
        }
    }

    isTypingContext(element) {
        const typingElements = ['INPUT', 'TEXTAREA', 'SELECT'];
        const isContentEditable = element.contentEditable === 'true';
        
        return typingElements.includes(element.tagName) || isContentEditable;
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    updateCallbacks(newCallbacks) {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
    }

    setSettingsComponent(settingsComponent) {
        this.settingsComponent = settingsComponent;
    }

    setHangulReferenceComponent(hangulReferenceComponent) {
        this.hangulReferenceComponent = hangulReferenceComponent;
    }

    getShortcutInfo() {
        return [
            { key: 'Space', action: 'Flip card' },
            { key: '← →', action: 'Previous / Next' },
            { key: 'A', action: 'Play audio' },
            { key: 'S', action: 'Settings' },
            { key: 'H', action: 'Korean Alphabet' },
            { key: 'Esc', action: 'Close panels' }
        ];
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.callbacks = {};
    }
}
