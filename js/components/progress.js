// Progress Component - Manages progress display and tracking
export class ProgressComponent {
    constructor() {
        // DOM elements
        this.progressText = null;
        this.progressFill = null;
        this.difficultyBadge = null;
        
        // Progress data
        this.currentIndex = 0;
        this.totalCards = 0;
        this.currentDifficulty = 'beginner';
    }

    init() {
        this.cacheElements();
        console.log('Progress component initialized');
    }

    cacheElements() {
        this.progressText = document.getElementById('progress-text');
        this.progressFill = document.getElementById('progress-fill');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        
        if (!this.progressText || !this.progressFill) {
            console.warn('Some progress elements not found');
        }
    }

    updateProgress(currentIndex, total, difficulty = 'beginner') {
        this.currentIndex = currentIndex;
        this.totalCards = total;
        this.currentDifficulty = difficulty;
        
        this.updateProgressText();
        this.updateProgressBar();
        this.updateDifficultyBadge();
    }

    updateProgressText() {
        if (!this.progressText) return;
        
        const text = `Word ${this.currentIndex} of ${this.totalCards}`;
        this.progressText.textContent = text;
        
        // Add milestone celebration
        if (this.isMilestone(this.currentIndex)) {
            this.progressText.classList.add('milestone');
            setTimeout(() => {
                this.progressText.classList.remove('milestone');
            }, 2000);
        }
    }

    updateProgressBar() {
        if (!this.progressFill) return;
        
        const percentage = this.totalCards > 0 ? (this.currentIndex / this.totalCards) * 100 : 0;
        
        this.progressFill.style.width = `${percentage}%`;
        this.progressFill.setAttribute('aria-valuenow', percentage);
        this.progressFill.setAttribute('aria-valuetext', 
            `${this.currentIndex} of ${this.totalCards} words completed`
        );
        
        // Add milestone styling
        if (this.isMilestone(this.currentIndex)) {
            this.progressFill.classList.add('milestone');
            setTimeout(() => {
                this.progressFill.classList.remove('milestone');
            }, 2000);
        }
    }

    updateDifficultyBadge() {
        if (!this.difficultyBadge) return;
        
        // Remove existing difficulty classes
        this.difficultyBadge.classList.remove('beginner', 'intermediate', 'advanced');
        
        // Add current difficulty class
        this.difficultyBadge.classList.add(this.currentDifficulty);
        this.difficultyBadge.textContent = this.capitalizeFirst(this.currentDifficulty);
    }

    isMilestone(index) {
        // Milestones at 100, 500, 1000, 2000, 3000, 4000, 5000, 6000
        const milestones = [100, 500, 1000, 2000, 3000, 4000, 5000, 6000];
        return milestones.includes(index);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Show progress celebration for milestones
    showMilestoneCelebration(milestone) {
        // Create celebration element
        const celebration = document.createElement('div');
        celebration.className = 'milestone-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <div class="celebration-text">
                    <h3>Milestone Reached!</h3>
                    <p>You've studied ${milestone} words!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Animate in
        setTimeout(() => {
            celebration.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            celebration.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(celebration);
            }, 300);
        }, 3000);
    }

    // Get progress statistics
    getProgressStats() {
        const percentage = this.totalCards > 0 ? (this.currentIndex / this.totalCards) * 100 : 0;
        
        return {
            currentIndex: this.currentIndex,
            totalCards: this.totalCards,
            percentage: Math.round(percentage * 100) / 100,
            difficulty: this.currentDifficulty,
            remaining: this.totalCards - this.currentIndex,
            isComplete: this.currentIndex === this.totalCards
        };
    }

    // Set custom progress text
    setCustomText(text) {
        if (this.progressText) {
            this.progressText.textContent = text;
        }
    }

    // Reset progress
    reset() {
        this.currentIndex = 0;
        this.totalCards = 0;
        this.currentDifficulty = 'beginner';
        
        this.updateProgress(0, 0, 'beginner');
    }

    // Animate progress change
    animateToProgress(targetIndex, totalCards, difficulty) {
        const startIndex = this.currentIndex;
        const duration = 500; // Animation duration in ms
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const currentIndex = Math.round(startIndex + (targetIndex - startIndex) * eased);
            
            this.updateProgress(currentIndex, totalCards, difficulty);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Show loading state
    setLoading(isLoading) {
        if (this.progressText) {
            if (isLoading) {
                this.progressText.textContent = 'Loading...';
                this.progressText.classList.add('loading');
            } else {
                this.progressText.classList.remove('loading');
            }
        }
        
        if (this.progressFill) {
            if (isLoading) {
                this.progressFill.style.width = '0%';
                this.progressFill.classList.add('loading');
            } else {
                this.progressFill.classList.remove('loading');
            }
        }
    }

    // Update progress with smooth transition
    smoothUpdateProgress(currentIndex, total, difficulty) {
        // Check if this is a significant change that warrants animation
        const significantChange = Math.abs(currentIndex - this.currentIndex) > 1;
        
        if (significantChange) {
            this.animateToProgress(currentIndex, total, difficulty);
        } else {
            this.updateProgress(currentIndex, total, difficulty);
        }
        
        // Check for milestone
        if (this.isMilestone(currentIndex) && currentIndex > this.currentIndex) {
            this.showMilestoneCelebration(currentIndex);
        }
    }
}
