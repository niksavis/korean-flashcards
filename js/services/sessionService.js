// Session Service - Manages intelligent learning sessions
export class SessionService {
    constructor(dataService) {
        this.dataService = dataService;
        this.sessions = [];
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        await this.generateSessions();
        this.initialized = true;
    }

    async generateSessions() {
        if (!this.dataService.isDataLoaded()) {
            throw new Error('Data service must be loaded before generating sessions');
        }

        const allWords = this.dataService.getAllWords();
        this.sessions = this.createPedagogicalSessions(allWords);
        
        console.log(`Generated ${this.sessions.length} learning sessions`);
    }

    createPedagogicalSessions(words) {
        const sessions = [];

        // 1. Beginner Foundation Sessions (Essential vocabulary)
        sessions.push(...this.createFoundationSessions(words));

        // 2. Topic-Based Learning Sessions (Thematic groupings)
        sessions.push(...this.createTopicSessions(words));

        // 3. Progressive Difficulty Sessions (Skill building)
        sessions.push(...this.createProgressiveSessions(words));

        // 4. Word Type Mastery Sessions (Grammar focused)
        sessions.push(...this.createWordTypeSessions(words));

        return sessions;
    }

    createFoundationSessions(words) {
        const sessions = [];
        
        // Essential beginner words - most critical for communication
        const essentialTopics = [
            { topic: 'Greetings', title: 'Essential Greetings', description: 'Master basic Korean greetings and polite expressions' },
            { topic: 'Family', title: 'Family & Relationships', description: 'Learn to talk about family members and relationships' },
            { topic: 'Numbers', title: 'Numbers & Counting', description: 'Essential numbers for daily communication' },
            { topic: 'Time', title: 'Time & Scheduling', description: 'Tell time and discuss schedules' },
            { topic: 'Days', title: 'Days & Dates', description: 'Days of the week and calendar terms' },
            { topic: 'Food', title: 'Essential Food Vocabulary', description: 'Basic food terms for dining and shopping' },
            { topic: 'Colors', title: 'Colors & Descriptions', description: 'Basic colors and descriptive vocabulary' }
        ];

        essentialTopics.forEach((topicInfo, index) => {
            const topicWords = words.filter(word => 
                word.topic === topicInfo.topic && 
                word.difficulty === 'beginner'
            ).slice(0, 25); // Limit to 25 most essential words

            if (topicWords.length >= 10) {
                sessions.push({
                    id: `foundation-${index + 1}`,
                    type: 'foundation',
                    title: topicInfo.title,
                    description: topicInfo.description,
                    topic: topicInfo.topic,
                    difficulty: 'beginner',
                    words: topicWords,
                    recommendedOrder: index + 1,
                    category: 'Foundation (Start Here)',
                    estimatedTime: '15-20 minutes',
                    icon: '🌱'
                });
            }
        });

        return sessions;
    }

    createTopicSessions(words) {
        const sessions = [];
        const topicGroups = this.groupWordsByTopic(words);

        // Learning-optimized topic sessions
        const topicConfig = {
            'Animals': { title: 'Animals & Pets', description: 'Learn about animals, pets, and wildlife', icon: '🐕', difficulty: 'beginner' },
            'Body Parts': { title: 'Body & Health', description: 'Body parts and health-related vocabulary', icon: '👤', difficulty: 'beginner' },
            'Clothes': { title: 'Clothing & Fashion', description: 'Clothing items and fashion vocabulary', icon: '👕', difficulty: 'beginner' },
            'Daily Routine': { title: 'Daily Activities', description: 'Common daily activities and routines', icon: '🌅', difficulty: 'beginner' },
            'Drinks': { title: 'Beverages & Drinks', description: 'All types of drinks and beverages', icon: '🥤', difficulty: 'beginner' },
            'Transportation': { title: 'Transportation', description: 'Vehicles and travel methods', icon: '🚗', difficulty: 'intermediate' },
            'Places': { title: 'Places & Locations', description: 'Important places and locations', icon: '🏢', difficulty: 'intermediate' },
            'Weather': { title: 'Weather & Seasons', description: 'Weather conditions and seasonal vocabulary', icon: '🌤️', difficulty: 'intermediate' },
            'Technology': { title: 'Technology & Digital Life', description: 'Modern technology and digital terms', icon: '💻', difficulty: 'intermediate' },
            'Business': { title: 'Business & Work', description: 'Professional and business vocabulary', icon: '💼', difficulty: 'advanced' },
            'Culture': { title: 'Korean Culture', description: 'Cultural terms and traditions', icon: '🎭', difficulty: 'advanced' },
            'Politics': { title: 'Politics & Society', description: 'Government and social vocabulary', icon: '🏛️', difficulty: 'advanced' }
        };

        Object.entries(topicConfig).forEach(([topic, config]) => {
            if (topicGroups[topic] && topicGroups[topic].length >= 15) {
                const topicWords = topicGroups[topic]
                    .filter(word => word.difficulty === config.difficulty)
                    .slice(0, 25);

                if (topicWords.length >= 10) {
                    sessions.push({
                        id: `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'topic',
                        title: config.title,
                        description: config.description,
                        topic: topic,
                        difficulty: config.difficulty,
                        words: topicWords,
                        category: `${config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)} Topics`,
                        estimatedTime: '20-25 minutes',
                        icon: config.icon
                    });
                }
            }
        });

        return sessions;
    }

    createProgressiveSessions(words) {
        const sessions = [];
        
        // Verb progression sessions
        const verbSessions = [
            {
                title: 'Essential Action Verbs',
                description: 'Most common Korean verbs for daily actions',
                difficulty: 'beginner',
                wordTypes: ['verb'],
                maxWords: 20,
                icon: '🏃'
            },
            {
                title: 'Advanced Verbs',
                description: 'Complex verbs for detailed expression',
                difficulty: 'advanced',
                wordTypes: ['verb'],
                maxWords: 25,
                icon: '🚀'
            }
        ];

        verbSessions.forEach((config, index) => {
            const sessionWords = words.filter(word => 
                config.wordTypes.includes(word.wordType) && 
                word.difficulty === config.difficulty
            ).slice(0, config.maxWords);

            if (sessionWords.length >= 15) {
                sessions.push({
                    id: `progressive-verbs-${index + 1}`,
                    type: 'progressive',
                    title: config.title,
                    description: config.description,
                    difficulty: config.difficulty,
                    words: sessionWords,
                    category: 'Progressive Learning',
                    estimatedTime: '20-30 minutes',
                    icon: config.icon
                });
            }
        });

        return sessions;
    }

    createWordTypeSessions(words) {
        const sessions = [];
        
        // Grammar-focused sessions
        const grammarSessions = [
            {
                title: 'Descriptive Adjectives',
                description: 'Essential adjectives for describing people, places, and things',
                wordType: 'adjective',
                difficulty: 'beginner',
                maxWords: 25,
                icon: '📝'
            },
            {
                title: 'Essential Adverbs',
                description: 'Common adverbs to modify verbs and adjectives',
                wordType: 'adverb',
                difficulty: 'intermediate',
                maxWords: 20,
                icon: '➡️'
            }
        ];

        grammarSessions.forEach((config, index) => {
            const sessionWords = words.filter(word => 
                word.wordType === config.wordType && 
                word.difficulty === config.difficulty
            ).slice(0, config.maxWords);

            if (sessionWords.length >= 10) {
                sessions.push({
                    id: `grammar-${config.wordType}-${index + 1}`,
                    type: 'grammar',
                    title: config.title,
                    description: config.description,
                    wordType: config.wordType,
                    difficulty: config.difficulty,
                    words: sessionWords,
                    category: 'Grammar Focus',
                    estimatedTime: '15-25 minutes',
                    icon: config.icon
                });
            }
        });

        return sessions;
    }

    groupWordsByTopic(words) {
        const groups = {};
        words.forEach(word => {
            if (!groups[word.topic]) {
                groups[word.topic] = [];
            }
            groups[word.topic].push(word);
        });
        return groups;
    }

    getAllSessions() {
        return this.sessions;
    }

    getSessionsByCategory() {
        const categories = {};
        this.sessions.forEach(session => {
            if (!categories[session.category]) {
                categories[session.category] = [];
            }
            categories[session.category].push(session);
        });
        return categories;
    }

    getSession(sessionId) {
        return this.sessions.find(session => session.id === sessionId);
    }

    getRecommendedSessions() {
        return this.sessions
            .filter(session => session.type === 'foundation')
            .sort((a, b) => (a.recommendedOrder || 999) - (b.recommendedOrder || 999));
    }

    getSessionsByDifficulty(difficulty) {
        return this.sessions.filter(session => session.difficulty === difficulty);
    }

    searchSessions(query) {
        const searchTerm = query.toLowerCase();
        return this.sessions.filter(session =>
            session.title.toLowerCase().includes(searchTerm) ||
            session.description.toLowerCase().includes(searchTerm) ||
            session.topic?.toLowerCase().includes(searchTerm) ||
            session.category.toLowerCase().includes(searchTerm)
        );
    }
}
