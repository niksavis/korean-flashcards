// Progressive Session Service - Manages intelligent progressive learning sessions
export class SessionService {
    constructor(dataService) {
        this.dataService = dataService;
        this.sessions = [];
        this.progressiveSessions = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        await this.loadProgressiveSessions();
        await this.generateSessions();
        this.initialized = true;
    }

    async loadProgressiveSessions() {
        try {
            const response = await fetch('./data/learning_sessions.json');
            this.progressiveSessions = await response.json();
            console.log(`Loaded ${this.progressiveSessions.metadata.total_sessions} progressive sessions`);
        } catch (error) {
            console.error('Failed to load progressive sessions:', error);
            // Fallback to empty structure if load fails
            this.progressiveSessions = { progression: [] };
        }
    }

    async generateSessions() {
        if (!this.dataService.isDataLoaded()) {
            throw new Error('Data service must be loaded before generating sessions');
        }

        const allWords = this.dataService.getAllWords();
        this.sessions = await this.createProgressiveSessionsWithWords(allWords);
        
        console.log(`Generated ${this.sessions.length} learning sessions`);
    }

    async createProgressiveSessionsWithWords(words) {
        const sessions = [];

        if (!this.progressiveSessions || !this.progressiveSessions.progression) {
            console.warn('No progressive sessions configuration found');
            return sessions;
        }

        // Process each level
        for (const level of this.progressiveSessions.progression) {
            for (const sessionConfig of level.sessions) {
                const sessionWords = this.selectWordsForSession(words, sessionConfig);
                
                if (sessionWords.length >= 10) { // Minimum viable session size
                    sessions.push({
                        id: sessionConfig.id,
                        type: 'progressive',
                        level: level.level,
                        levelTitle: level.title,
                        title: sessionConfig.title,
                        description: sessionConfig.description,
                        topics: sessionConfig.topics,
                        difficulty: sessionConfig.difficulty,
                        targetWords: sessionConfig.target_words,
                        estimatedTime: sessionConfig.estimated_time,
                        icon: sessionConfig.icon,
                        prerequisites: sessionConfig.prerequisites || [],
                        wordTypes: sessionConfig.word_types || [],
                        priorityKeywords: sessionConfig.priority_keywords || [],
                        words: sessionWords,
                        category: level.title,
                        actualWordCount: sessionWords.length,
                        unlocked: this.isSessionUnlocked(sessionConfig, sessions)
                    });
                } else {
                    console.warn(`Session ${sessionConfig.id} has only ${sessionWords.length} words (minimum 10 required)`);
                }
            }
        }

        return sessions;
    }

    selectWordsForSession(words, sessionConfig) {
        // Filter words by session criteria
        let filteredWords = words.filter(word => {
            // Topic matching
            const topicMatch = sessionConfig.topics.some(topic => 
                word.topic === topic || word.topic.includes(topic)
            );
            
            // Difficulty matching (with some flexibility)
            const difficultyMatch = 
                word.difficulty === sessionConfig.difficulty ||
                (sessionConfig.difficulty === 'beginner-intermediate' && 
                 (word.difficulty === 'beginner' || word.difficulty === 'intermediate'));
            
            // Word type matching (if specified)
            const wordTypeMatch = !sessionConfig.word_types.length || 
                sessionConfig.word_types.includes(word.partOfSpeech);

            return topicMatch && difficultyMatch && wordTypeMatch;
        });

        // Prioritize words with priority keywords
        const priorityWords = [];
        const regularWords = [];

        filteredWords.forEach(word => {
            const hasPriorityKeyword = sessionConfig.priority_keywords.some(keyword => 
                word.hangul.includes(keyword) || 
                word.english.toLowerCase().includes(keyword.toLowerCase()) ||
                word.romanization?.includes(keyword)
            );

            if (hasPriorityKeyword) {
                priorityWords.push(word);
            } else {
                regularWords.push(word);
            }
        });

        // Sort priority words by frequency/commonality (if available)
        priorityWords.sort((a, b) => {
            // Prefer shorter Korean words (often more basic)
            const lengthA = a.hangul.length;
            const lengthB = b.hangul.length;
            if (lengthA !== lengthB) return lengthA - lengthB;
            
            // Then alphabetical
            return a.hangul.localeCompare(b.hangul);
        });

        // Sort regular words
        regularWords.sort((a, b) => {
            // Prefer higher frequency words if available
            if (a.frequency && b.frequency) {
                return b.frequency - a.frequency;
            }
            // Fall back to alphabetical
            return a.hangul.localeCompare(b.hangul);
        });

        // Combine priority words first, then regular words
        const selectedWords = [...priorityWords, ...regularWords];

        // Return target number of words
        return selectedWords.slice(0, sessionConfig.target_words);
    }

    isSessionUnlocked(sessionConfig, existingSessions) {
        // First session is always unlocked
        if (!sessionConfig.prerequisites || sessionConfig.prerequisites.length === 0) {
            return true;
        }

        // Check if all prerequisites are completed
        return sessionConfig.prerequisites.every(prereqId => {
            const prereqSession = existingSessions.find(s => s.id === prereqId);
            return prereqSession && this.isSessionCompleted(prereqId);
        });
    }

    isSessionCompleted(sessionId) {
        // Check localStorage for completion status
        const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        return completedSessions.includes(sessionId);
    }

    markSessionCompleted(sessionId) {
        const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        if (!completedSessions.includes(sessionId)) {
            completedSessions.push(sessionId);
            localStorage.setItem('completedSessions', JSON.stringify(completedSessions));
        }
        
        // Update unlocked status for dependent sessions
        this.updateUnlockedSessions();
    }

    updateUnlockedSessions() {
        this.sessions.forEach(session => {
            session.unlocked = this.isSessionUnlocked(session, this.sessions);
        });
    }

    getAllSessions() {
        return this.sessions;
    }

    getSessionsByLevel() {
        const levels = {};
        this.sessions.forEach(session => {
            const levelKey = `Level ${session.level}`;
            if (!levels[levelKey]) {
                levels[levelKey] = {
                    level: session.level,
                    title: session.levelTitle,
                    sessions: []
                };
            }
            levels[levelKey].sessions.push(session);
        });
        return levels;
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
        // Return unlocked sessions from Level 1 first, then progression order
        return this.sessions
            .filter(session => session.unlocked)
            .sort((a, b) => {
                // Sort by level first
                if (a.level !== b.level) {
                    return a.level - b.level;
                }
                // Then by original order within level
                return a.id.localeCompare(b.id);
            });
    }

    getNextRecommendedSession() {
        const recommended = this.getRecommendedSessions();
        const completed = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        
        // Find first uncompleted session
        return recommended.find(session => !completed.includes(session.id));
    }

    getSessionsByDifficulty(difficulty) {
        return this.sessions.filter(session => session.difficulty === difficulty);
    }

    getUnlockedSessions() {
        return this.sessions.filter(session => session.unlocked);
    }

    getCompletedSessions() {
        const completed = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        return this.sessions.filter(session => completed.includes(session.id));
    }

    getProgressStats() {
        const totalSessions = this.sessions.length;
        const completedSessions = this.getCompletedSessions().length;
        const unlockedSessions = this.getUnlockedSessions().length;
        
        const levelProgress = {};
        this.sessions.forEach(session => {
            const levelKey = session.level;
            if (!levelProgress[levelKey]) {
                levelProgress[levelKey] = { total: 0, completed: 0 };
            }
            levelProgress[levelKey].total++;
            if (this.isSessionCompleted(session.id)) {
                levelProgress[levelKey].completed++;
            }
        });

        return {
            totalSessions,
            completedSessions,
            unlockedSessions,
            completionPercentage: Math.round((completedSessions / totalSessions) * 100),
            levelProgress
        };
    }

    searchSessions(query) {
        const searchTerm = query.toLowerCase();
        return this.sessions.filter(session =>
            session.title.toLowerCase().includes(searchTerm) ||
            session.description.toLowerCase().includes(searchTerm) ||
            session.topics?.some(topic => topic.toLowerCase().includes(searchTerm)) ||
            session.category.toLowerCase().includes(searchTerm) ||
            session.levelTitle.toLowerCase().includes(searchTerm)
        );
    }

    getSessionProgress(sessionId) {
        const progress = JSON.parse(localStorage.getItem('sessionProgress') || '{}');
        return progress[sessionId] || { wordsLearned: 0, wordsReviewed: 0, accuracy: 0 };
    }

    updateSessionProgress(sessionId, progress) {
        const allProgress = JSON.parse(localStorage.getItem('sessionProgress') || '{}');
        allProgress[sessionId] = progress;
        localStorage.setItem('sessionProgress', JSON.stringify(allProgress));
    }

    resetProgress() {
        localStorage.removeItem('completedSessions');
        localStorage.removeItem('sessionProgress');
        this.updateUnlockedSessions();
    }
}
