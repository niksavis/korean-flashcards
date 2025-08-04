// Hangul Reference Component - Korean Alphabet Learning Reference
export class HangulReferenceComponent {
    constructor() {
        this.isVisible = false;
        this.audioService = null;
        
        // DOM elements
        this.modal = null;
        this.closeBtn = null;
        this.modalBody = null;
        
        this.bindMethods();
        this.initHangulData();
    }

    bindMethods() {
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleLetterAudio = this.handleLetterAudio.bind(this);
        this.handleExampleAudio = this.handleExampleAudio.bind(this);
    }

    init(audioService) {
        this.audioService = audioService;
        this.cacheElements();
        this.setupEventListeners();
        console.log('Hangul Reference component initialized');
    }

    cacheElements() {
        this.modal = document.getElementById('hangul-modal');
        this.closeBtn = document.getElementById('close-hangul-btn');
        this.modalBody = document.querySelector('.hangul-modal-body');
        
        if (!this.modal) {
            console.warn('Hangul modal not found');
        }
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', this.handleCloseClick);
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', this.handleOverlayClick);
        }
        
        document.addEventListener('keydown', this.handleEscapeKey);
    }

    handleCloseClick() {
        this.close();
    }

    handleOverlayClick(event) {
        if (event.target === this.modal) {
            this.close();
        }
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.isVisible) {
            this.close();
        }
    }

    async handleLetterAudio(event) {
        const letter = event.target.dataset.letter;
        const example = event.target.dataset.example;
        
        if (letter && this.audioService) {
            try {
                event.target.classList.add('playing');
                await this.audioService.playKoreanWord(example || letter);
            } catch (error) {
                console.error('Letter audio playback failed:', error);
            } finally {
                event.target.classList.remove('playing');
            }
        }
    }

    async handleExampleAudio(event) {
        const example = event.target.dataset.example;
        const romanization = event.target.dataset.romanization;
        
        if (example && this.audioService) {
            try {
                event.target.classList.add('playing');
                await this.audioService.playKoreanWord(example);
            } catch (error) {
                console.error('Example audio playback failed:', error);
            } finally {
                event.target.classList.remove('playing');
            }
        }
    }

    open() {
        if (!this.modal) return;
        
        this.isVisible = true;
        this.modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // Load content if not already loaded
        if (this.modalBody && this.modalBody.innerHTML.includes('Loading')) {
            this.loadHangulContent();
        }
        
        console.log('Hangul reference opened');
    }

    close() {
        if (!this.modal) return;
        
        this.isVisible = false;
        this.modal.classList.remove('open');
        document.body.style.overflow = '';
        
        console.log('Hangul reference closed');
    }

    isOpen() {
        return this.isVisible;
    }

    initHangulData() {
        // Korean consonants (자음)
        this.consonants = [
            { char: 'ㄱ', roman: 'g/k', name: 'giyeok', example: '가' },
            { char: 'ㄴ', roman: 'n', name: 'nieun', example: '나' },
            { char: 'ㄷ', roman: 'd/t', name: 'digeut', example: '다' },
            { char: 'ㄹ', roman: 'r/l', name: 'rieul', example: '라' },
            { char: 'ㅁ', roman: 'm', name: 'mieum', example: '마' },
            { char: 'ㅂ', roman: 'b/p', name: 'bieup', example: '바' },
            { char: 'ㅅ', roman: 's', name: 'siot', example: '사' },
            { char: 'ㅇ', roman: 'ng/silent', name: 'ieung', example: '아' },
            { char: 'ㅈ', roman: 'j', name: 'jieut', example: '자' },
            { char: 'ㅊ', roman: 'ch', name: 'chieut', example: '차' },
            { char: 'ㅋ', roman: 'k', name: 'kieuk', example: '카' },
            { char: 'ㅌ', roman: 't', name: 'tieut', example: '타' },
            { char: 'ㅍ', roman: 'p', name: 'pieup', example: '파' },
            { char: 'ㅎ', roman: 'h', name: 'hieut', example: '하' }
        ];

        // Korean vowels (모음)
        this.vowels = [
            { char: 'ㅏ', roman: 'a', name: 'a', example: '아' },
            { char: 'ㅑ', roman: 'ya', name: 'ya', example: '야' },
            { char: 'ㅓ', roman: 'eo', name: 'eo', example: '어' },
            { char: 'ㅕ', roman: 'yeo', name: 'yeo', example: '여' },
            { char: 'ㅗ', roman: 'o', name: 'o', example: '오' },
            { char: 'ㅛ', roman: 'yo', name: 'yo', example: '요' },
            { char: 'ㅜ', roman: 'u', name: 'u', example: '우' },
            { char: 'ㅠ', roman: 'yu', name: 'yu', example: '유' },
            { char: 'ㅡ', roman: 'eu', name: 'eu', example: '으' },
            { char: 'ㅣ', roman: 'i', name: 'i', example: '이' }
        ];

        // Complex consonants (쌍자음)
        this.complexConsonants = [
            { char: 'ㄲ', roman: 'kk', name: 'ssang-giyeok', example: '까' },
            { char: 'ㄸ', roman: 'tt', name: 'ssang-digeut', example: '따' },
            { char: 'ㅃ', roman: 'pp', name: 'ssang-bieup', example: '빠' },
            { char: 'ㅆ', roman: 'ss', name: 'ssang-siot', example: '싸' },
            { char: 'ㅉ', roman: 'jj', name: 'ssang-jieut', example: '짜' }
        ];

        // Complex vowels (복합모음)
        this.complexVowels = [
            { char: 'ㅐ', roman: 'ae', name: 'ae', example: '애' },
            { char: 'ㅒ', roman: 'yae', name: 'yae', example: '얘' },
            { char: 'ㅔ', roman: 'e', name: 'e', example: '에' },
            { char: 'ㅖ', roman: 'ye', name: 'ye', example: '예' },
            { char: 'ㅘ', roman: 'wa', name: 'wa', example: '와' },
            { char: 'ㅙ', roman: 'wae', name: 'wae', example: '왜' },
            { char: 'ㅚ', roman: 'oe', name: 'oe', example: '외' },
            { char: 'ㅝ', roman: 'wo', name: 'wo', example: '워' },
            { char: 'ㅞ', roman: 'we', name: 'we', example: '웨' },
            { char: 'ㅟ', roman: 'wi', name: 'wi', example: '위' },
            { char: 'ㅢ', roman: 'ui', name: 'ui', example: '의' }
        ];

        // Batchim rules and examples
        this.batchimRules = [
            {
                title: "Final Consonant ㄱ, ㄲ, ㅋ → [k] sound",
                description: "These consonants at the end of syllables are pronounced as [k]",
                examples: [
                    { korean: '학교', roman: 'hakgyo', meaning: 'school' },
                    { korean: '부엌', roman: 'bueok', meaning: 'kitchen' },
                    { korean: '밖', roman: 'bakk', meaning: 'outside' }
                ]
            },
            {
                title: "Final Consonant ㄴ → [n] sound",
                description: "ㄴ at the end maintains its [n] sound",
                examples: [
                    { korean: '손', roman: 'son', meaning: 'hand' },
                    { korean: '문', roman: 'mun', meaning: 'door' },
                    { korean: '은', roman: 'eun', meaning: 'silver/topic particle' }
                ]
            },
            {
                title: "Final Consonant ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ → [t] sound",
                description: "These consonants at the end are all pronounced as [t]",
                examples: [
                    { korean: '맛', roman: 'mat', meaning: 'taste' },
                    { korean: '옷', roman: 'ot', meaning: 'clothes' },
                    { korean: '꽃', roman: 'kkot', meaning: 'flower' }
                ]
            },
            {
                title: "Final Consonant ㄹ → [l] sound",
                description: "ㄹ at the end is pronounced as [l]",
                examples: [
                    { korean: '물', roman: 'mul', meaning: 'water' },
                    { korean: '말', roman: 'mal', meaning: 'word/horse' },
                    { korean: '길', roman: 'gil', meaning: 'road' }
                ]
            },
            {
                title: "Final Consonant ㅁ → [m] sound",
                description: "ㅁ at the end maintains its [m] sound",
                examples: [
                    { korean: '집', roman: 'jip', meaning: 'house' },
                    { korean: '김', roman: 'gim', meaning: 'seaweed/name' },
                    { korean: '남', roman: 'nam', meaning: 'south/male' }
                ]
            },
            {
                title: "Final Consonant ㅂ, ㅍ → [p] sound",
                description: "These consonants at the end are pronounced as [p]",
                examples: [
                    { korean: '입', roman: 'ip', meaning: 'mouth' },
                    { korean: '앞', roman: 'ap', meaning: 'front' },
                    { korean: '잎', roman: 'ip', meaning: 'leaf' }
                ]
            },
            {
                title: "Final Consonant ㅇ → [ng] sound",
                description: "ㅇ at the end is pronounced as [ng]",
                examples: [
                    { korean: '강', roman: 'gang', meaning: 'river' },
                    { korean: '방', roman: 'bang', meaning: 'room' },
                    { korean: '공', roman: 'gong', meaning: 'ball/air' }
                ]
            }
        ];

        // Consonant assimilation rules
        this.assimilationRules = [
            {
                title: "ㄱ + ㄴ → [ng + n]",
                description: "When ㄱ meets ㄴ, ㄱ becomes ㅇ",
                examples: [
                    { korean: '학년', roman: 'hangnyeon', meaning: 'school year' },
                    { korean: '국내', roman: 'gungnae', meaning: 'domestic' }
                ]
            },
            {
                title: "ㄱ + ㅁ → [ng + m]",
                description: "When ㄱ meets ㅁ, ㄱ becomes ㅇ",
                examples: [
                    { korean: '국물', roman: 'gungmul', meaning: 'soup' },
                    { korean: '학문', roman: 'hangmun', meaning: 'learning' }
                ]
            },
            {
                title: "ㄷ + ㄴ → [n + n]",
                description: "When ㄷ meets ㄴ, ㄷ becomes ㄴ",
                examples: [
                    { korean: '닫는', roman: 'danneun', meaning: 'closing' },
                    { korean: '받는', roman: 'banneun', meaning: 'receiving' }
                ]
            },
            {
                title: "ㄷ + ㅁ → [n + m]",
                description: "When ㄷ meets ㅁ, ㄷ becomes ㄴ",
                examples: [
                    { korean: '닫문', roman: 'danmun', meaning: 'closed door' },
                    { korean: '맛만', roman: 'manman', meaning: 'only taste' }
                ]
            },
            {
                title: "ㅂ + ㄴ → [m + n]",
                description: "When ㅂ meets ㄴ, ㅂ becomes ㅁ",
                examples: [
                    { korean: '입니다', roman: 'imnida', meaning: 'is/am/are (formal)' },
                    { korean: '십년', roman: 'simnyeon', meaning: 'ten years' }
                ]
            },
            {
                title: "ㅂ + ㅁ → [m + m]",
                description: "When ㅂ meets ㅁ, ㅂ becomes ㅁ",
                examples: [
                    { korean: '입문', roman: 'immun', meaning: 'introduction' },
                    { korean: '집무', roman: 'jimmu', meaning: 'office work' }
                ]
            }
        ];
    }

    loadHangulContent() {
        if (!this.modalBody) return;

        const content = `
            <div class="hangul-section">
                <h3>Basic Consonants (기본 자음)</h3>
                <div class="hangul-grid">
                    ${this.consonants.map(letter => this.createLetterCard(letter)).join('')}
                </div>
            </div>

            <div class="hangul-section">
                <h3>Basic Vowels (기본 모음)</h3>
                <div class="hangul-grid">
                    ${this.vowels.map(letter => this.createLetterCard(letter)).join('')}
                </div>
            </div>

            <div class="hangul-section">
                <h3>Double Consonants (쌍자음)</h3>
                <div class="hangul-grid">
                    ${this.complexConsonants.map(letter => this.createLetterCard(letter)).join('')}
                </div>
            </div>

            <div class="hangul-section">
                <h3>Complex Vowels (복합모음)</h3>
                <div class="hangul-grid">
                    ${this.complexVowels.map(letter => this.createLetterCard(letter)).join('')}
                </div>
            </div>

            <div class="hangul-section">
                <h3>Final Consonant Rules (받침 규칙)</h3>
                <div class="hangul-rules">
                    ${this.batchimRules.map(rule => this.createRuleCard(rule)).join('')}
                </div>
            </div>

            <div class="hangul-section">
                <h3>Consonant Assimilation (자음 동화)</h3>
                <div class="hangul-rules">
                    ${this.assimilationRules.map(rule => this.createRuleCard(rule)).join('')}
                </div>
            </div>
        `;

        this.modalBody.innerHTML = content;

        // Add event listeners for audio buttons
        this.modalBody.addEventListener('click', (event) => {
            const audioBtn = event.target.closest('.hangul-audio-btn');
            const exampleBtn = event.target.closest('.hangul-example');
            
            if (audioBtn) {
                this.handleLetterAudio(event);
            } else if (exampleBtn) {
                this.handleExampleAudio(event);
            }
        });
    }

    createLetterCard(letter) {
        return `
            <div class="hangul-letter">
                <div class="hangul-letter-char">${letter.char}</div>
                <div class="hangul-letter-roman">${letter.roman}</div>
                <div class="hangul-letter-name">${letter.name}</div>
                <div class="hangul-letter-audio">
                    <button class="hangul-audio-btn" data-letter="${letter.char}" data-example="${letter.example}" aria-label="Play ${letter.char} pronunciation">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    createRuleCard(rule) {
        return `
            <div class="hangul-rule">
                <div class="hangul-rule-title">${rule.title}</div>
                <div class="hangul-rule-description">${rule.description}</div>
                <div class="hangul-examples">
                    ${rule.examples.map(example => `
                        <div class="hangul-example" data-example="${example.korean}" data-romanization="${example.roman}">
                            <span class="hangul-example-korean">${example.korean}</span>
                            <span class="hangul-example-roman">[${example.roman}]</span>
                            <span class="hangul-example-meaning">${example.meaning}</span>
                            <div class="hangul-example-audio">
                                <button class="hangul-audio-btn" data-letter="" data-example="${example.korean}" aria-label="Play ${example.korean} pronunciation">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}
