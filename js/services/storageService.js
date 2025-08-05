// Storage Service - Handles data persistence and retrieval
export class StorageService {
    constructor() {
        this.storageKeys = {
            progress: 'korean-flashcard-progress',
            settings: 'korean-flashcard-settings',
            statistics: 'korean-flashcard-statistics',
            bookmarks: 'korean-flashcard-bookmarks',
            studySessions: 'korean-flashcard-sessions'
        };
        
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
        this.isIndexedDBAvailable = this.checkIndexedDBAvailability();
        
        // Initialize IndexedDB for offline data if available
        if (this.isIndexedDBAvailable) {
            this.initIndexedDB();
        }
    }

    checkLocalStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    checkIndexedDBAvailability() {
        return 'indexedDB' in window;
    }

    async initIndexedDB() {
        // Placeholder for future IndexedDB implementation
        // Currently using localStorage for all storage needs
    }

    // Progress Management
    saveProgress(progress) {
        if (!this.isLocalStorageAvailable) {
            console.warn('Cannot save progress: localStorage not available');
            return false;
        }

        try {
            const progressData = {
                ...progress,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKeys.progress, JSON.stringify(progressData));
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    }

    getProgress() {
        if (!this.isLocalStorageAvailable) {
            return null;
        }

        try {
            const stored = localStorage.getItem(this.storageKeys.progress);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to get progress:', error);
            return null;
        }
    }

    clearProgress() {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKeys.progress);
            return true;
        } catch (error) {
            console.error('Failed to clear progress:', error);
            return false;
        }
    }

    // Statistics Management
    saveStatistics(stats) {
        if (!this.isLocalStorageAvailable) {
            console.warn('Cannot save statistics: localStorage not available');
            return false;
        }

        try {
            const statisticsData = {
                ...stats,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKeys.statistics, JSON.stringify(statisticsData));
            return true;
        } catch (error) {
            console.error('Failed to save statistics:', error);
            return false;
        }
    }

    getStatistics() {
        if (!this.isLocalStorageAvailable) {
            return this.getDefaultStatistics();
        }

        try {
            const stored = localStorage.getItem(this.storageKeys.statistics);
            return stored ? JSON.parse(stored) : this.getDefaultStatistics();
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return this.getDefaultStatistics();
        }
    }

    getDefaultStatistics() {
        return {
            totalCardsStudied: 0,
            totalStudyTime: 0,
            sessionsCompleted: 0,
            averageAccuracy: 0,
            streak: 0,
            longestStreak: 0,
            wordsLearned: [],
            difficultyProgress: {
                beginner: 0,
                intermediate: 0,
                advanced: 0
            },
            lastStudyDate: null
        };
    }

    updateStatistics(sessionData) {
        const currentStats = this.getStatistics();
        
        // Update statistics based on session data
        const updatedStats = {
            ...currentStats,
            totalCardsStudied: currentStats.totalCardsStudied + (sessionData.cardsStudied || 0),
            totalStudyTime: currentStats.totalStudyTime + (sessionData.studyTime || 0),
            sessionsCompleted: currentStats.sessionsCompleted + 1,
            lastStudyDate: new Date().toISOString()
        };

        // Update streak
        const today = new Date().toDateString();
        const lastStudyDate = currentStats.lastStudyDate ? new Date(currentStats.lastStudyDate).toDateString() : null;
        
        if (lastStudyDate === today) {
            // Same day, maintain streak
            updatedStats.streak = currentStats.streak;
        } else if (this.isConsecutiveDay(lastStudyDate, today)) {
            // Consecutive day, increment streak
            updatedStats.streak = currentStats.streak + 1;
            updatedStats.longestStreak = Math.max(updatedStats.longestStreak, updatedStats.streak);
        } else {
            // Streak broken
            updatedStats.streak = 1;
        }

        this.saveStatistics(updatedStats);
        return updatedStats;
    }

    isConsecutiveDay(lastDate, currentDate) {
        if (!lastDate) return false;
        
        const last = new Date(lastDate);
        const current = new Date(currentDate);
        const diffTime = Math.abs(current - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays === 1;
    }

    // Bookmarks Management
    saveBookmarks(bookmarks) {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            localStorage.setItem(this.storageKeys.bookmarks, JSON.stringify(bookmarks));
            return true;
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
            return false;
        }
    }

    getBookmarks() {
        if (!this.isLocalStorageAvailable) {
            return [];
        }

        try {
            const stored = localStorage.getItem(this.storageKeys.bookmarks);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to get bookmarks:', error);
            return [];
        }
    }

    addBookmark(wordId) {
        const bookmarks = this.getBookmarks();
        if (!bookmarks.includes(wordId)) {
            bookmarks.push(wordId);
            this.saveBookmarks(bookmarks);
            return true;
        }
        return false;
    }

    removeBookmark(wordId) {
        const bookmarks = this.getBookmarks();
        const index = bookmarks.indexOf(wordId);
        if (index > -1) {
            bookmarks.splice(index, 1);
            this.saveBookmarks(bookmarks);
            return true;
        }
        return false;
    }

    isBookmarked(wordId) {
        const bookmarks = this.getBookmarks();
        return bookmarks.includes(wordId);
    }

    // Study Sessions Management
    saveStudySession(sessionData) {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            const sessions = this.getStudySessions();
            const session = {
                ...sessionData,
                id: this.generateSessionId(),
                timestamp: new Date().toISOString()
            };
            
            sessions.push(session);
            
            // Keep only the last 50 sessions to prevent storage bloat
            if (sessions.length > 50) {
                sessions.splice(0, sessions.length - 50);
            }
            
            localStorage.setItem(this.storageKeys.studySessions, JSON.stringify(sessions));
            return true;
        } catch (error) {
            console.error('Failed to save study session:', error);
            return false;
        }
    }

    getStudySessions() {
        if (!this.isLocalStorageAvailable) {
            return [];
        }

        try {
            const stored = localStorage.getItem(this.storageKeys.studySessions);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to get study sessions:', error);
            return [];
        }
    }

    getRecentSessions(count = 10) {
        const sessions = this.getStudySessions();
        return sessions.slice(-count).reverse(); // Get most recent first
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Data Export/Import
    exportAllData() {
        const data = {
            progress: this.getProgress(),
            statistics: this.getStatistics(),
            bookmarks: this.getBookmarks(),
            studySessions: this.getStudySessions(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return data;
    }

    importData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid import data');
        }

        const imported = {
            progress: false,
            statistics: false,
            bookmarks: false,
            sessions: false
        };

        try {
            if (data.progress) {
                this.saveProgress(data.progress);
                imported.progress = true;
            }

            if (data.statistics) {
                this.saveStatistics(data.statistics);
                imported.statistics = true;
            }

            if (data.bookmarks && Array.isArray(data.bookmarks)) {
                this.saveBookmarks(data.bookmarks);
                imported.bookmarks = true;
            }

            if (data.studySessions && Array.isArray(data.studySessions)) {
                localStorage.setItem(this.storageKeys.studySessions, JSON.stringify(data.studySessions));
                imported.sessions = true;
            }

            return imported;
        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }

    // Storage Cleanup
    clearAllData() {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    getStorageUsage() {
        if (!this.isLocalStorageAvailable) {
            return { used: 0, available: 0, percentage: 0 };
        }

        try {
            let used = 0;
            Object.values(this.storageKeys).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    used += item.length;
                }
            });

            // Estimate available space (localStorage typically has 5-10MB limit)
            const estimated = 5 * 1024 * 1024; // 5MB estimate
            const percentage = (used / estimated) * 100;

            return {
                used: used,
                available: estimated,
                percentage: Math.min(percentage, 100)
            };
        } catch (error) {
            console.error('Failed to calculate storage usage:', error);
            return { used: 0, available: 0, percentage: 0 };
        }
    }

    // Utility methods
    isStorageAvailable() {
        return this.isLocalStorageAvailable;
    }

    getStorageInfo() {
        return {
            localStorage: this.isLocalStorageAvailable,
            indexedDB: this.isIndexedDBAvailable,
            usage: this.getStorageUsage()
        };
    }
}
