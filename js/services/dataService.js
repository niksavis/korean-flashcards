// Data Service - Manages Korean word data loading and processing
export class DataService {
    constructor() {
        this.words = [];
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    async loadWords() {
        // Prevent multiple simultaneous loads
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        if (this.isLoaded) {
            return this.words;
        }

        this.loadingPromise = this._loadWordsFromSource();
        
        try {
            await this.loadingPromise;
            this.isLoaded = true;
        } catch (error) {
            this.loadingPromise = null;
            throw error;
        }

        return this.words;
    }

    async _loadWordsFromSource() {
        try {
            // Try to load from main data file first
            console.log('Loading words from korean-words.json...');
            const response = await fetch('./data/korean-words.json');
            
            if (!response.ok) {
                console.log('Main data file not found, loading sample data...');
                return this._loadSampleData();
            }
            
            const data = await response.json();
            
            if (this._validateDataStructure(data)) {
                this.words = data.words || data;
                console.log(`Successfully loaded ${this.words.length} words from main data file`);
            } else {
                throw new Error('Invalid data structure in korean-words.json');
            }
            
        } catch (error) {
            console.warn('Failed to load main data file:', error.message);
            console.log('Falling back to sample data...');
            return this._loadSampleData();
        }
    }

    async _loadSampleData() {
        try {
            const response = await fetch('./data/korean-words.json');
            
            if (!response.ok) {
                // If main data fails, create minimal fallback data
                console.log('Korean words data not found, creating fallback data...');
                this.words = this._createFallbackData();
                return;
            }
            
            const data = await response.json();
            this.words = data.words || data;
            console.log(`Loaded ${this.words.length} words from sample data`);
            
        } catch (error) {
            console.warn('Failed to load sample data:', error.message);
            console.log('Creating minimal fallback data...');
            this.words = this._createFallbackData();
        }
    }

    _createFallbackData() {
        console.log('Creating minimal fallback data for demo...');
        return [
            {
                id: 1,
                position: 1,
                hangul: "것",
                romanization: "geot",
                english: "A thing or an object",
                pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("것"),
                partOfSpeech: "noun",
                difficulty: "beginner",
                frequency: "high",
                exampleSentence: {
                    korean: "이것은 일상생활에서 자주 사용되는 것이다.",
                    romanization: "igeoseun ilsangsaenghwargeseo jaju sayongdoeneun geosida.",
                    english: "This is something frequently used in daily life.",
                    pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("이것은 일상생활에서 자주 사용되는 것이다")
                },
                grammaticalInfo: {
                    type: "noun",
                    usage: "Used to refer to objects or abstract concepts (formal)",
                    level: "basic",
                    notes: "One of the most frequently used words in Korean",
                    detailed: "Dependent noun that requires a modifier. Cannot stand alone as a complete noun phrase.",
                    informal: "Used casually in conversations: 뭔가 (mwonga) is informal equivalent"
                }
            },
            {
                id: 2,
                position: 2,
                hangul: "하다",
                romanization: "hada",
                english: "To do",
                pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("하다"),
                partOfSpeech: "verb",
                difficulty: "beginner",
                frequency: "high",
                exampleSentence: {
                    korean: "오늘 뭐 할 거예요?",
                    romanization: "oneul mwo hal geoyeyo?",
                    english: "What are you going to do today?",
                    pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("오늘 뭐 할 거예요")
                },
                grammaticalInfo: {
                    type: "verb",
                    usage: "The most common verb in Korean, meaning 'to do' (formal)",
                    level: "basic",
                    notes: "Used in countless compound verbs and expressions",
                    detailed: "Irregular verb that changes form based on formality and tense. Essential for Korean grammar.",
                    informal: "해 (hae) is the informal form"
                }
            },
            {
                id: 3,
                position: 3,
                hangul: "있다",
                romanization: "itda",
                english: "To exist, to have",
                pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("있다"),
                partOfSpeech: "verb",
                difficulty: "beginner",
                frequency: "high",
                exampleSentence: {
                    korean: "집에 있어요.",
                    romanization: "jibe isseoyo.",
                    english: "I'm at home.",
                    pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("집에 있어요")
                },
                grammaticalInfo: {
                    type: "verb",
                    usage: "Indicates existence or location (formal)",
                    level: "basic",
                    notes: "Essential verb for expressing location and possession",
                    detailed: "Used for both 'to be' (location) and 'to have' depending on context.",
                    informal: "있어 (isseo) is the informal form"
                }
            },
            {
                id: 4,
                position: 4,
                hangul: "사람",
                romanization: "saram",
                english: "Person, people",
                pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("사람"),
                partOfSpeech: "noun",
                difficulty: "beginner",
                frequency: "high",
                exampleSentence: {
                    korean: "좋은 사람이에요.",
                    romanization: "joeun saramieyo.",
                    english: "They are a good person.",
                    pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("좋은 사람이에요")
                },
                grammaticalInfo: {
                    type: "noun",
                    usage: "Basic word for person or people (formal)",
                    level: "basic",
                    notes: "Fundamental vocabulary for describing people",
                    detailed: "Can be used for both singular and plural. Often combined with other words.",
                    informal: "Same form used in informal speech"
                }
            },
            {
                id: 5,
                position: 5,
                hangul: "그",
                romanization: "geu",
                english: "That, the",
                pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("그"),
                partOfSpeech: "determiner",
                difficulty: "beginner",
                frequency: "high",
                exampleSentence: {
                    korean: "그 사람은 누구예요?",
                    romanization: "geu sarameun nuguyeyo?",
                    english: "Who is that person?",
                    pronunciation_url: "https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=" + encodeURIComponent("그 사람은 누구예요")
                },
                grammaticalInfo: {
                    type: "determiner",
                    usage: "Demonstrative determiner meaning 'that' (formal)",
                    level: "basic",
                    notes: "Used to point to things at middle distance",
                    detailed: "Part of the three-way demonstrative system: 이 (this), 그 (that), 저 (that over there).",
                    informal: "Same form used in informal speech"
                }
            }
        ];
    }

    _validateDataStructure(data) {
        // Check if data has the expected structure
        const words = data.words || data;
        
        if (!Array.isArray(words)) {
            console.error('Data is not an array');
            return false;
        }

        if (words.length === 0) {
            console.error('No words found in data');
            return false;
        }

        // Validate a sample of words
        const sampleWord = words[0];
        const requiredFields = ['hangul', 'romanization', 'english', 'partOfSpeech'];
        
        for (const field of requiredFields) {
            if (!sampleWord.hasOwnProperty(field)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        console.log('Data structure validation passed');
        return true;
    }

    getAllWords() {
        return this.words;
    }

    getWord(index) {
        return this.words[index] || null;
    }

    getWordById(id) {
        return this.words.find(word => word.id === id) || null;
    }

    searchWords(query) {
        if (!query) return this.words;
        
        const lowercaseQuery = query.toLowerCase();
        
        return this.words.filter(word => 
            word.hangul.includes(query) ||
            word.romanization.toLowerCase().includes(lowercaseQuery) ||
            word.english.toLowerCase().includes(lowercaseQuery)
        );
    }

    getWordsByDifficulty(difficulty) {
        return this.words.filter(word => word.difficulty === difficulty);
    }

    getWordsByType(partOfSpeech) {
        return this.words.filter(word => word.partOfSpeech === partOfSpeech);
    }

    getWordsByFrequency(frequency) {
        return this.words.filter(word => word.frequency === frequency);
    }

    getRandomWords(count = 10) {
        const shuffled = [...this.words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getWordsInRange(start, end) {
        return this.words.slice(start, end);
    }

    getTotalWordCount() {
        return this.words.length;
    }

    getStatistics() {
        const stats = {
            total: this.words.length,
            byDifficulty: {},
            byType: {},
            byFrequency: {}
        };

        this.words.forEach(word => {
            // Count by difficulty
            const difficulty = word.difficulty || 'unknown';
            stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;

            // Count by word type
            const type = word.partOfSpeech || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by frequency
            const frequency = word.frequency || 'unknown';
            stats.byFrequency[frequency] = (stats.byFrequency[frequency] || 0) + 1;
        });

        return stats;
    }

    // Utility method to check if data is loaded
    isDataLoaded() {
        return this.isLoaded;
    }

    // Method to reload data (useful for testing or data updates)
    async reloadData() {
        this.words = [];
        this.isLoaded = false;
        this.loadingPromise = null;
        return this.loadWords();
    }

    // Export data (useful for backup or sharing)
    exportData() {
        return {
            metadata: {
                exportDate: new Date().toISOString(),
                wordCount: this.words.length,
                version: '1.0'
            },
            words: this.words
        };
    }

    // Filter words based on criteria
    filterWords(criteria = {}) {
        return this.words.filter(word => {
            // Topic filter
            if (criteria.topic && criteria.topic !== 'all') {
                if (word.topic !== criteria.topic) return false;
            }

            // Word type filter
            if (criteria.partOfSpeech && criteria.partOfSpeech !== 'all') {
                if (word.partOfSpeech !== criteria.partOfSpeech) return false;
            }

            // Difficulty filter
            if (criteria.difficulty && criteria.difficulty !== 'all') {
                if (word.difficulty !== criteria.difficulty) return false;
            }

            // Search query
            if (criteria.search && criteria.search.trim()) {
                const searchTerm = criteria.search.toLowerCase().trim();
                const hangul = (word.hangul || '').toLowerCase();
                const romanization = (word.romanization || '').toLowerCase();
                const english = (word.english || '').toLowerCase();
                
                if (!hangul.includes(searchTerm) && 
                    !romanization.includes(searchTerm) && 
                    !english.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    // Search words by text
    searchWords(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return this.words;
        }

        const term = searchTerm.toLowerCase().trim();
        return this.words.filter(word => {
            const hangul = (word.hangul || '').toLowerCase();
            const romanization = (word.romanization || '').toLowerCase();
            const english = (word.english || '').toLowerCase();
            
            return hangul.includes(term) || 
                   romanization.includes(term) || 
                   english.includes(term);
        });
    }

    // Get unique topics from words
    getUniqueTopics() {
        const topics = new Set();
        this.words.forEach(word => {
            if (word.topic) {
                topics.add(word.topic);
            }
        });
        return Array.from(topics).sort();
    }

    // Get unique word types (legacy method name)
    getUniqueWordTypes() {
        return this.getUniquePartOfSpeech();
    }
    
    // Get unique parts of speech
    getUniquePartOfSpeech() {
        const types = new Set();
        this.words.forEach(word => {
            if (word.partOfSpeech) {
                types.add(word.partOfSpeech);
            }
        });
        return Array.from(types).sort();
    }

    // Get words by topic
    getWordsByTopic(topic) {
        return this.words.filter(word => word.topic === topic);
    }

    // Get words by word type
    getWordsByType(type) {
        return this.words.filter(word => word.partOfSpeech === type);
    }

    // Get filtered statistics
    getFilteredStatistics(filteredWords) {
        const stats = {
            total: filteredWords.length,
            byDifficulty: {},
            byType: {},
            byTopic: {},
            byFrequency: {}
        };

        filteredWords.forEach(word => {
            // Count by difficulty
            const difficulty = word.difficulty || 'unknown';
            stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;

            // Count by word type
            const type = word.partOfSpeech || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by topic
            const topic = word.topic || 'unknown';
            stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;

            // Count by frequency
            const frequency = word.frequency || 'unknown';
            stats.byFrequency[frequency] = (stats.byFrequency[frequency] || 0) + 1;
        });

        return stats;
    }

    // Cascading filter methods
    getTopicsByPartOfSpeech(partOfSpeech) {
        if (partOfSpeech === 'all') {
            return [...new Set(this.words.map(word => word.topic))].sort();
        }
        
        const topics = new Set();
        this.words.forEach(word => {
            if (word.partOfSpeech === partOfSpeech) {
                topics.add(word.topic);
            }
        });
        
        return Array.from(topics).sort();
    }

    filterWordsByPartOfSpeechAndTopic(partOfSpeech = 'all', topic = 'all') {
        return this.words.filter(word => {
            const posMatch = partOfSpeech === 'all' || word.partOfSpeech === partOfSpeech;
            const topicMatch = topic === 'all' || word.topic === topic;
            return posMatch && topicMatch;
        });
    }

    getCascadingFilterOptions() {
        const options = {
            partsOfSpeech: {},
            topicsByPartOfSpeech: {}
        };
        
        // Korean part of speech names
        const koreanNames = {
            "noun": "명사", "verb": "동사", "adjective": "형용사",
            "pronoun": "대명사", "adverb": "부사", "ending": "어미",
            "particle": "조사", "determiner": "관형사", 
            "interjection": "감탄사", "numeral": "수사"
        };
        
        this.words.forEach(word => {
            const pos = word.partOfSpeech;
            const topic = word.topic;
            
            if (!options.partsOfSpeech[pos]) {
                const koreanName = koreanNames[pos] || pos;
                options.partsOfSpeech[pos] = `${pos.charAt(0).toUpperCase() + pos.slice(1)} - ${koreanName}`;
            }
            
            if (!options.topicsByPartOfSpeech[pos]) {
                options.topicsByPartOfSpeech[pos] = new Set();
            }
            options.topicsByPartOfSpeech[pos].add(topic);
        });
        
        // Convert sets to arrays
        Object.keys(options.topicsByPartOfSpeech).forEach(pos => {
            options.topicsByPartOfSpeech[pos] = Array.from(options.topicsByPartOfSpeech[pos]).sort();
        });
        
        return options;
    }

}
