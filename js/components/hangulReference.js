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
            { char: 'ㄱ', roman: 'g/k', name: 'giyeok', koreanName: '기역', example: '가' },
            { char: 'ㄴ', roman: 'n', name: 'nieun', koreanName: '니은', example: '나' },
            { char: 'ㄷ', roman: 'd/t', name: 'digeut', koreanName: '디귿', example: '다' },
            { char: 'ㄹ', roman: 'r/l', name: 'rieul', koreanName: '리을', example: '라' },
            { char: 'ㅁ', roman: 'm', name: 'mieum', koreanName: '미음', example: '마' },
            { char: 'ㅂ', roman: 'b/p', name: 'bieup', koreanName: '비읍', example: '바' },
            { char: 'ㅅ', roman: 's', name: 'siot', koreanName: '시옷', example: '사' },
            { char: 'ㅇ', roman: 'ng/silent', name: 'ieung', koreanName: '이응', example: '아' },
            { char: 'ㅈ', roman: 'j', name: 'jieut', koreanName: '지읒', example: '자' },
            { char: 'ㅊ', roman: 'ch', name: 'chieut', koreanName: '치읓', example: '차' },
            { char: 'ㅋ', roman: 'k', name: 'kieuk', koreanName: '키읔', example: '카' },
            { char: 'ㅌ', roman: 't', name: 'tieut', koreanName: '티읕', example: '타' },
            { char: 'ㅍ', roman: 'p', name: 'pieup', koreanName: '피읖', example: '파' },
            { char: 'ㅎ', roman: 'h', name: 'hieut', koreanName: '히읗', example: '하' }
        ];

        // Korean vowels (모음)
        this.vowels = [
            { char: 'ㅏ', roman: 'a', name: 'a', koreanName: '아', example: '아' },
            { char: 'ㅑ', roman: 'ya', name: 'ya', koreanName: '야', example: '야' },
            { char: 'ㅓ', roman: 'eo', name: 'eo', koreanName: '어', example: '어' },
            { char: 'ㅕ', roman: 'yeo', name: 'yeo', koreanName: '여', example: '여' },
            { char: 'ㅗ', roman: 'o', name: 'o', koreanName: '오', example: '오' },
            { char: 'ㅛ', roman: 'yo', name: 'yo', koreanName: '요', example: '요' },
            { char: 'ㅜ', roman: 'u', name: 'u', koreanName: '우', example: '우' },
            { char: 'ㅠ', roman: 'yu', name: 'yu', koreanName: '유', example: '유' },
            { char: 'ㅡ', roman: 'eu', name: 'eu', koreanName: '으', example: '으' },
            { char: 'ㅣ', roman: 'i', name: 'i', koreanName: '이', example: '이' }
        ];

        // Complex consonants (쌍자음)
        this.complexConsonants = [
            { char: 'ㄲ', roman: 'kk', name: 'ssang-giyeok', koreanName: '쌍기역', example: '까' },
            { char: 'ㄸ', roman: 'tt', name: 'ssang-digeut', koreanName: '쌍디귿', example: '따' },
            { char: 'ㅃ', roman: 'pp', name: 'ssang-bieup', koreanName: '쌍비읍', example: '빠' },
            { char: 'ㅆ', roman: 'ss', name: 'ssang-siot', koreanName: '쌍시옷', example: '싸' },
            { char: 'ㅉ', roman: 'jj', name: 'ssang-jieut', koreanName: '쌍지읒', example: '짜' }
        ];

        // Complex vowels (복합모음)
        this.complexVowels = [
            { char: 'ㅐ', roman: 'ae', name: 'ae', koreanName: '애', example: '애' },
            { char: 'ㅒ', roman: 'yae', name: 'yae', koreanName: '얘', example: '얘' },
            { char: 'ㅔ', roman: 'e', name: 'e', koreanName: '에', example: '에' },
            { char: 'ㅖ', roman: 'ye', name: 'ye', koreanName: '예', example: '예' },
            { char: 'ㅘ', roman: 'wa', name: 'wa', koreanName: '와', example: '와' },
            { char: 'ㅙ', roman: 'wae', name: 'wae', koreanName: '왜', example: '왜' },
            { char: 'ㅚ', roman: 'oe', name: 'oe', koreanName: '외', example: '외' },
            { char: 'ㅝ', roman: 'wo', name: 'wo', koreanName: '워', example: '워' },
            { char: 'ㅞ', roman: 'we', name: 'we', koreanName: '웨', example: '웨' },
            { char: 'ㅟ', roman: 'wi', name: 'wi', koreanName: '위', example: '위' },
            { char: 'ㅢ', roman: 'ui', name: 'ui', koreanName: '의', example: '의' }
        ];

        // Batchim rules and examples
        this.batchimRules = [
            {
                title: "Final Consonant ㄱ, ㄲ, ㅋ → [k] sound",
                description: "These consonants at the end of syllables are pronounced as unreleased [k]",
                examples: [
                    { korean: '학교', roman: 'hak-gyo', meaning: 'school' },
                    { korean: '부엌', roman: 'bu-eok', meaning: 'kitchen' },
                    { korean: '밖', roman: 'bakk', meaning: 'outside' },
                    { korean: '책', roman: 'chaek', meaning: 'book' },
                    { korean: '죽', roman: 'juk', meaning: 'porridge' }
                ]
            },
            {
                title: "Final Consonant ㄴ → [n] sound",
                description: "ㄴ at the end maintains its [n] sound",
                examples: [
                    { korean: '손', roman: 'son', meaning: 'hand' },
                    { korean: '문', roman: 'mun', meaning: 'door' },
                    { korean: '은', roman: 'eun', meaning: 'silver/topic particle' },
                    { korean: '한국', roman: 'han-guk', meaning: 'Korea' },
                    { korean: '눈', roman: 'nun', meaning: 'eye/snow' }
                ]
            },
            {
                title: "Final Consonant ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ → [t] sound",
                description: "These consonants at the end are all pronounced as unreleased [t]",
                examples: [
                    { korean: '맛', roman: 'mat', meaning: 'taste' },
                    { korean: '옷', roman: 'ot', meaning: 'clothes' },
                    { korean: '꽃', roman: 'kkot', meaning: 'flower' },
                    { korean: '밑', roman: 'mit', meaning: 'under' },
                    { korean: '빛', roman: 'bit', meaning: 'light' },
                    { korean: '낳', roman: 'nat', meaning: 'give birth' }
                ]
            },
            {
                title: "Final Consonant ㄹ → [l] sound",
                description: "ㄹ at the end is pronounced as [l]",
                examples: [
                    { korean: '물', roman: 'mul', meaning: 'water' },
                    { korean: '말', roman: 'mal', meaning: 'word/horse' },
                    { korean: '길', roman: 'gil', meaning: 'road' },
                    { korean: '날', roman: 'nal', meaning: 'day' },
                    { korean: '발', roman: 'bal', meaning: 'foot' }
                ]
            },
            {
                title: "Final Consonant ㅁ → [m] sound",
                description: "ㅁ at the end maintains its [m] sound",
                examples: [
                    { korean: '집', roman: 'jip', meaning: 'house' },
                    { korean: '김', roman: 'kim', meaning: 'seaweed/name' },
                    { korean: '남', roman: 'nam', meaning: 'south/male' },
                    { korean: '밤', roman: 'bam', meaning: 'night/chestnut' },
                    { korean: '품', roman: 'pum', meaning: 'item/quality' }
                ]
            },
            {
                title: "Final Consonant ㅂ, ㅍ → [p] sound",
                description: "These consonants at the end are pronounced as unreleased [p]",
                examples: [
                    { korean: '입', roman: 'ip', meaning: 'mouth' },
                    { korean: '앞', roman: 'ap', meaning: 'front' },
                    { korean: '잎', roman: 'ip', meaning: 'leaf' },
                    { korean: '숲', roman: 'sup', meaning: 'forest' },
                    { korean: '깊', roman: 'gip', meaning: 'deep' }
                ]
            },
            {
                title: "Final Consonant ㅇ → [ng] sound",
                description: "ㅇ at the end is pronounced as [ng]",
                examples: [
                    { korean: '강', roman: 'gang', meaning: 'river' },
                    { korean: '방', roman: 'bang', meaning: 'room' },
                    { korean: '공', roman: 'gong', meaning: 'ball/air' },
                    { korean: '사랑', roman: 'sa-rang', meaning: 'love' },
                    { korean: '영', roman: 'yeong', meaning: 'zero/spirit' }
                ]
            }
        ];

        // Consonant assimilation rules
        this.assimilationRules = [
            {
                title: "Nasalization: ㄱ + ㄴ/ㅁ → [ng + n/m] (비음화)",
                description: "When ㄱ meets ㄴ or ㅁ, ㄱ becomes ㅇ (ng sound)",
                examples: [
                    { korean: '학년', roman: 'hang-nyeon', meaning: 'school year' },
                    { korean: '국내', roman: 'gung-nae', meaning: 'domestic' },
                    { korean: '국물', roman: 'gung-mul', meaning: 'soup' },
                    { korean: '학문', roman: 'hang-mun', meaning: 'learning' },
                    { korean: '백년', roman: 'baeng-nyeon', meaning: '100 years' }
                ]
            },
            {
                title: "Nasalization: ㄷ + ㄴ/ㅁ → [n + n/m] (비음화)",
                description: "When ㄷ meets ㄴ or ㅁ, ㄷ becomes ㄴ",
                examples: [
                    { korean: '받는다', roman: 'ban-neun-da', meaning: 'receive' },
                    { korean: '믿는다', roman: 'min-neun-da', meaning: 'believe' },
                    { korean: '듣는다', roman: 'deun-neun-da', meaning: 'listen' },
                    { korean: '받문', roman: 'ban-mun', meaning: 'to receive a document' },
                    { korean: '맞먹다', roman: 'man-meok-da', meaning: 'be equal to' }
                ]
            },
            {
                title: "Nasalization: ㅂ + ㄴ/ㅁ → [m + n/m] (비음화)",
                description: "When ㅂ meets ㄴ or ㅁ, ㅂ becomes ㅁ",
                examples: [
                    { korean: '입니다', roman: 'im-ni-da', meaning: 'is/am/are (formal)' },
                    { korean: '십년', roman: 'sim-nyeon', meaning: 'ten years' },
                    { korean: '깁니다', roman: 'gim-ni-da', meaning: 'is long (formal)' },
                    { korean: '입문', roman: 'im-mun', meaning: 'introduction' },
                    { korean: '집무', roman: 'jim-mu', meaning: 'office work' }
                ]
            },
            {
                title: "Liquid Assimilation: ㄴ + ㄹ → [l + l] (유음화)",
                description: "When ㄴ meets ㄹ, both become ㄹ",
                examples: [
                    { korean: '신라', roman: 'sil-la', meaning: 'Silla (dynasty)' },
                    { korean: '원래', roman: 'wol-lae', meaning: 'originally' },
                    { korean: '천리', roman: 'cheoL-li', meaning: '1000 ri (distance)' },
                    { korean: '인류', roman: 'il-lyu', meaning: 'mankind' },
                    { korean: '관련', roman: 'gwal-lyeon', meaning: 'relation' }
                ]
            },
            {
                title: "Liquid Assimilation: ㄹ + ㄴ → [l + l] (유음화)",
                description: "When ㄹ meets ㄴ, both become ㄹ",
                examples: [
                    { korean: '물냉면', roman: 'mul-laeng-myeon', meaning: 'cold noodles' },
                    { korean: '설날', roman: 'seol-lal', meaning: 'New Year\'s Day' },
                    { korean: '실내', roman: 'sil-lae', meaning: 'indoor' },
                    { korean: '일년', roman: 'il-lyeon', meaning: 'one year' },
                    { korean: '칠년', roman: 'chil-lyeon', meaning: 'seven years' }
                ]
            },
            {
                title: "Aspiration: ㅎ + ㄱ/ㄷ/ㅂ/ㅈ → [k/t/p/ch + aspiration] (기음화)",
                description: "When ㅎ meets certain consonants, it creates aspirated sounds",
                examples: [
                    { korean: '좋다', roman: 'jo-ta', meaning: 'good' },
                    { korean: '놓다', roman: 'no-ta', meaning: 'put/place' },
                    { korean: '북한', roman: 'bu-kan', meaning: 'North Korea' },
                    { korean: '법학', roman: 'beop-hak', meaning: 'law study' },
                    { korean: '입학', roman: 'i-pak', meaning: 'admission' }
                ]
            },
            {
                title: "Tensification: Stop + ㄱ/ㄷ/ㅂ/ㅅ/ㅈ → [reinforced consonants] (경음화)",
                description: "After stops, certain consonants become tense (doubled)",
                examples: [
                    { korean: '학기', roman: 'hak-kki', meaning: 'semester' },
                    { korean: '먹다', roman: 'meok-tta', meaning: 'eat' },
                    { korean: '각색', roman: 'gak-ssaek', meaning: 'adaptation' },
                    { korean: '녹저', roman: 'nok-jjeo', meaning: 'rust stain' },
                    { korean: '밭벼', roman: 'bat-ppyeo', meaning: 'field rice' }
                ]
            },
            {
                title: "Palatalization: ㄷ/ㅌ + ㅣ/y-vowels → [j/ch] (구개음화)",
                description: "When ㄷ or ㅌ meets ㅣ or y-vowels, they become ㅈ or ㅊ",
                examples: [
                    { korean: '같이', roman: 'ga-chi', meaning: 'together' },
                    { korean: '굳이', roman: 'gu-ji', meaning: 'purposely' },
                    { korean: '닫히다', roman: 'da-chi-da', meaning: 'be closed' },
                    { korean: '곧이듣다', roman: 'go-ji-deut-da', meaning: 'believe readily' },
                    { korean: '받히다', roman: 'ba-chi-da', meaning: 'be supported' }
                ]
            },
            {
                title: "ㅎ Deletion: ㅎ + vowel → [vowel only] (ㅎ 탈락)",
                description: "ㅎ at the end is often dropped before vowels",
                examples: [
                    { korean: '좋아', roman: 'jo-a', meaning: 'good (informal)' },
                    { korean: '많아', roman: 'ma-na', meaning: 'many (informal)' },
                    { korean: '놓아', roman: 'no-a', meaning: 'put (informal)' },
                    { korean: '싫어', roman: 'si-reo', meaning: 'dislike' },
                    { korean: '않아', roman: 'a-na', meaning: 'not (informal)' }
                ]
            },
            {
                title: "ㄴ Insertion: Consonant + ㅣ/y-vowels → [n + vowel] (ㄴ 첨가)",
                description: "ㄴ is inserted between final consonants and words starting with ㅣ or y-vowels",
                examples: [
                    { korean: '색연필', roman: 'saeng-nyeon-pil', meaning: 'colored pencil' },
                    { korean: '나뭇잎', roman: 'na-mun-nip', meaning: 'tree leaf' },
                    { korean: '꽃잎', roman: 'kkon-nip', meaning: 'flower petal' },
                    { korean: '밭일', roman: 'ban-nil', meaning: 'farm work' },
                    { korean: '옷입다', roman: 'on-nip-da', meaning: 'wear clothes' }
                ]
            },
            {
                title: "ㅎ + ㅅ → ㅆ (Tensification with ㅎ)",
                description: "When ㅎ meets ㅅ, they become tense ㅆ",
                examples: [
                    { korean: '좋습니다', roman: 'jo-sseum-ni-da', meaning: 'is good (formal)' },
                    { korean: '많습니다', roman: 'man-sseum-ni-da', meaning: 'is many (formal)' },
                    { korean: '놓습니다', roman: 'no-sseum-ni-da', meaning: 'put (formal)' },
                    { korean: '않습니다', roman: 'an-sseum-ni-da', meaning: 'is not (formal)' },
                    { korean: '넣습니다', roman: 'neo-sseum-ni-da', meaning: 'put in (formal)' }
                ]
            },
            {
                title: "ㅎ + ㄴ → ㄴ (ㅎ weakening before ㄴ)",
                description: "When ㅎ meets ㄴ, ㅎ disappears and ㄴ remains",
                examples: [
                    { korean: '않는', roman: 'an-neun', meaning: 'not (present)' },
                    { korean: '놓는', roman: 'no-neun', meaning: 'putting' },
                    { korean: '좋네', roman: 'jon-ne', meaning: 'good (exclamation)' },
                    { korean: '많네', roman: 'man-ne', meaning: 'many (exclamation)' },
                    { korean: '싫네', roman: 'sin-ne', meaning: 'dislike (exclamation)' }
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
            
            if (audioBtn) {
                // Check if it's a letter audio button or example audio button
                const isLetterAudio = audioBtn.dataset.letter || audioBtn.closest('.hangul-letter');
                if (isLetterAudio) {
                    this.handleLetterAudio(event);
                } else {
                    this.handleExampleAudio(event);
                }
            }
        });
    }

    createLetterCard(letter) {
        return `
            <div class="hangul-letter">
                <div class="hangul-letter-char">${letter.char}</div>
                <div class="hangul-letter-roman">[${letter.roman}]</div>
                <div class="hangul-letter-name">${letter.name}</div>
                <div class="hangul-letter-korean">${letter.koreanName}</div>
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
                                <button class="hangul-audio-btn" data-example="${example.korean}" data-romanization="${example.roman}" aria-label="Play ${example.korean} pronunciation">
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
