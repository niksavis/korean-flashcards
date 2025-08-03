// Keyboard Handler - Manages keyboard shortcuts and navigation
export class KeyboardHandler {
    constructor() {
        this.callbacks = {};
        this.isEnabled = true;
        this.shortcuts = {
            next: ['ArrowRight', 'KeyN'],
            prev: ['ArrowLeft', 'KeyP'],
            flip: ['Space', 'Enter', 'KeyF'],
            audio: ['KeyA'],
            settings: ['KeyS'],
            escape: ['Escape']
        };
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init(callbacks = {}) {
        this.callbacks = callbacks;
        this.setupEventListeners();
        console.log('Keyboard handler initialized');
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        // Don't handle shortcuts when user is typing in inputs
        if (this.isTypingContext(event.target)) {
            return;
        }
        
        // Handle each shortcut
        const code = event.code;
        
        if (this.shortcuts.next.includes(code)) {
            event.preventDefault();
            this.executeCallback('onNext');
        } else if (this.shortcuts.prev.includes(code)) {
            event.preventDefault();
            this.executeCallback('onPrev');
        } else if (this.shortcuts.flip.includes(code)) {
            event.preventDefault();
            this.executeCallback('onFlip');
        } else if (this.shortcuts.audio.includes(code)) {
            event.preventDefault();
            this.executeCallback('onAudio');
        } else if (this.shortcuts.settings.includes(code)) {
            event.preventDefault();
            this.executeCallback('onSettings');
        } else if (this.shortcuts.escape.includes(code)) {
            event.preventDefault();
            this.executeCallback('onEscape');
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

    getShortcutInfo() {
        return [
            { key: 'Space', action: 'Flip card' },
            { key: '← →', action: 'Previous / Next' },
            { key: 'A', action: 'Play audio' },
            { key: 'S', action: 'Settings' },
            { key: 'Esc', action: 'Close panels' }
        ];
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.callbacks = {};
    }
}
