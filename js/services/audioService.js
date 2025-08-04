// Audio Service - Handles Korean pronunciation using Google TTS with fallback methods
export class AudioService {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        this.currentSpeed = 1.0; // Fixed speed since Google TTS doesn't support variable speed
        this.autoPlay = false;
        this.isPlaying = false;
        this.currentAudio = null;
        
        // Background tone for speaker activation
        this.backgroundToneEnabled = true; // Enable pleasant background tone
        this.audioContext = null;
        this.backgroundGainNode = null;
        this.backgroundOscillators = [];
        
        // Audio source preferences (ordered by reliability)
        this.audioMethods = ['speechAPI', 'googleTTS'];
        this.currentMethodIndex = 0;
        
        // Korean voice preference for Speech API
        this.preferredVoice = null;
        this.voicesLoaded = false;
        
        this.initializeVoices();
        this.initializeAudioContext();
    }

    initializeVoices() {
        if (!this.isSupported) {
            console.warn('Speech Synthesis not supported in this browser');
            return;
        }

        // Load voices asynchronously
        const loadVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            console.log('Available voices:', voices.length);
            
            // Log all available voices for debugging
            voices.forEach((voice, index) => {
                console.log(`Voice ${index}: ${voice.name} (${voice.lang}) - ${voice.voiceURI}`);
            });
            
            // Find Korean voices
            const koreanVoices = voices.filter(voice => 
                voice.lang.startsWith('ko') || 
                voice.lang.includes('KR') ||
                voice.name.toLowerCase().includes('korean')
            );

            console.log(`Found ${koreanVoices.length} Korean voices:`, koreanVoices.map(v => `${v.name} (${v.lang})`));

            if (koreanVoices.length > 0) {
                // Prefer Google Korean voices if available
                this.preferredVoice = koreanVoices.find(voice => 
                    voice.name.toLowerCase().includes('google')
                ) || koreanVoices[0];
                
                console.log('Korean voice selected:', this.preferredVoice.name);
            } else {
                console.warn('No Korean voices found, will use default voice');
            }
            
            this.voicesLoaded = true;
        };

        // Load voices immediately if available
        if (this.speechSynthesis.getVoices().length > 0) {
            loadVoices();
        } else {
            // Wait for voices to load
            this.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        }
    }

    initializeAudioContext() {
        try {
            // Initialize Web Audio API for background tones
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create main gain node for background tone
            this.backgroundGainNode = this.audioContext.createGain();
            this.backgroundGainNode.connect(this.audioContext.destination);
            this.backgroundGainNode.gain.setValueAtTime(0.005, this.audioContext.currentTime); // Much quieter
            
            console.log('Audio context initialized for background tones');
        } catch (error) {
            console.warn('Web Audio API not available:', error);
            this.backgroundToneEnabled = false;
        }
    }

    createPleasantBackgroundTone() {
        if (!this.backgroundToneEnabled || !this.audioContext) {
            return null;
        }

        try {
            // Create a pleasant chord with multiple frequencies (C major triad in low octave)
            const frequencies = [130.81, 164.81, 196.00]; // C3, E3, G3 - soft, pleasant chord
            const oscillators = [];
            const gainNodes = [];

            frequencies.forEach((freq, index) => {
                // Create oscillator for each frequency
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                // Use sine wave for smooth, pleasant sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                // Set individual gains (make lower frequencies slightly quieter)
                const individualGain = index === 0 ? 0.1 : 0.15; // Much quieter individual gains
                gain.gain.setValueAtTime(individualGain, this.audioContext.currentTime);
                
                // Connect: oscillator -> gain -> background gain -> destination
                osc.connect(gain);
                gain.connect(this.backgroundGainNode);
                
                oscillators.push(osc);
                gainNodes.push(gain);
            });

            return { oscillators, gainNodes };
        } catch (error) {
            console.warn('Failed to create background tone:', error);
            return null;
        }
    }

    async startBackgroundTone(duration) {
        if (!this.backgroundToneEnabled) {
            return null;
        }

        const toneComponents = this.createPleasantBackgroundTone();
        if (!toneComponents) {
            return null;
        }

        const { oscillators, gainNodes } = toneComponents;

        try {
            const currentTime = this.audioContext.currentTime;
            
            // Fade in over 0.1 seconds (shorter fade)
            gainNodes.forEach(gain => {
                gain.gain.setValueAtTime(0, currentTime);
                gain.gain.linearRampToValueAtTime(gain.gain.value || 0.15, currentTime + 0.1);
            });

            // Start all oscillators
            oscillators.forEach(osc => {
                osc.start(currentTime);
                osc.stop(currentTime + duration);
            });

            // Store for potential cleanup
            this.backgroundOscillators = oscillators;

            console.log(`Started pleasant background tone for ${duration} seconds`);
            return { oscillators, gainNodes };
        } catch (error) {
            console.warn('Failed to start background tone:', error);
            // Cleanup on error
            oscillators.forEach(osc => {
                try { osc.stop(); } catch (e) { }
            });
            return null;
        }
    }

    stopBackgroundTone() {
        if (this.backgroundOscillators.length > 0) {
            try {
                this.backgroundOscillators.forEach(osc => {
                    try { osc.stop(); } catch (e) { }
                });
                this.backgroundOscillators = [];
                console.log('Stopped background tone');
            } catch (error) {
                console.warn('Error stopping background tone:', error);
            }
        }
    }

    async playWord(hangul, speed = null) {
        try {
            console.log(`Playing Korean word: ${hangul}`);
            
            // Create direct Google Translate TTS URL (exactly like your example)
            const encodedText = encodeURIComponent(hangul);
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodedText}`;
            
            console.log(`Trying Google TTS URL: ${audioUrl}`);
            
            // Try Google TTS first
            return await this.playDirectAudio(audioUrl, speed);
            
        } catch (error) {
            console.log('Using Speech API fallback for pronunciation');
            // Fallback to speech synthesis
            return await this.playWithSpeechAPI(hangul, speed || this.currentSpeed);
        }
    }

    async playSentence(sentence, speed = null) {
        try {
            console.log(`Playing Korean sentence: ${sentence}`);
            
            // Create direct Google Translate TTS URL for sentence
            const encodedText = encodeURIComponent(sentence);
            const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodedText}`;
            
            console.log(`Using Google TTS URL for sentence: ${audioUrl}`);
            
            // Play audio directly (background tone will be handled in playDirectAudio)
            return await this.playDirectAudio(audioUrl, speed);
            
        } catch (error) {
            console.warn('Google TTS failed for sentence, trying Speech API fallback:', error);
            // Fallback to speech synthesis with slower speed
            const playbackSpeed = speed || (this.currentSpeed * 0.8);
            return await this.playWithSpeechAPI(sentence, playbackSpeed);
        }
    }

    async playDirectAudio(audioUrl, speed = null) {
        return new Promise(async (resolve, reject) => {
            // Use the audio element from the DOM (exactly like StackOverflow solution)
            const audioEl = document.getElementById('tts-audio');
            
            if (!audioEl) {
                reject(new Error('Audio element not found'));
                return;
            }

            // Start background tone 200ms before TTS
            console.log('Starting background tone 200ms before TTS...');
            const backgroundToneComponents = await this.startBackgroundTone(0.3); // 300ms total (0.2s before + estimated TTS duration)
            
            // Wait 200ms for speakers to activate
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Simple event handlers
            const onEnded = () => {
                this.isPlaying = false;
                this.stopBackgroundTone(); // Stop background tone when TTS ends
                this.notifyAudioEnd();
                audioEl.removeEventListener('ended', onEnded);
                audioEl.removeEventListener('error', onError);
                audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
                resolve();
            };
            
            const onError = (event) => {
                this.isPlaying = false;
                this.stopBackgroundTone(); // Stop background tone on error
                this.notifyAudioEnd();
                audioEl.removeEventListener('ended', onEnded);
                audioEl.removeEventListener('error', onError);
                audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
                // Don't log verbose error details for normal audio interruptions
                reject(new Error('Audio fallback needed'));
            };

            const onLoadedMetadata = () => {
                // Once we know the duration, we can adjust the background tone if needed
                const ttsDuration = audioEl.duration;
                console.log(`TTS duration: ${ttsDuration}s, background tone should continue`);
            };
            
            // Add event listeners
            audioEl.addEventListener('ended', onEnded);
            audioEl.addEventListener('error', onError);
            audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
            
            // Set source and play (exactly like StackOverflow example)
            audioEl.src = audioUrl;
            
            this.isPlaying = true;
            this.notifyAudioStart();
            
            // Play the audio
            audioEl.play()
                .then(() => {
                    console.log('Google TTS audio started playing with background tone');
                })
                .catch(error => {
                    // Stop background tone on play failure
                    this.stopBackgroundTone();
                    // Don't log aborted/interrupted errors as they're normal
                    if (error.name === 'AbortError' || error.message.includes('aborted')) {
                        console.log('Audio playback interrupted (normal when switching quickly)');
                    } else {
                        console.log('Google TTS play failed, falling back to Speech API');
                    }
                    onError(error);
                });
        });
    }

    playWithSpeechAPI(text, rate = 0.8) {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                reject(new Error('Speech Synthesis not supported'));
                return;
            }

            // Stop any currently playing speech
            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set properties for Korean
            utterance.lang = 'ko-KR';
            utterance.rate = Math.max(0.1, Math.min(2.0, rate));
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to use the best available Korean voice
            const voices = this.speechSynthesis.getVoices();
            const koreanVoices = voices.filter(voice => 
                voice.lang.startsWith('ko') || 
                voice.lang.includes('KR') ||
                voice.name.toLowerCase().includes('korean')
            );
            
            if (koreanVoices.length > 0) {
                // Prefer Google or Microsoft Korean voices
                const preferredVoice = koreanVoices.find(voice => 
                    voice.name.toLowerCase().includes('google') ||
                    voice.name.toLowerCase().includes('microsoft') ||
                    voice.name.toLowerCase().includes('naver')
                ) || koreanVoices[0];
                
                utterance.voice = preferredVoice;
                console.log(`Using Korean voice: ${preferredVoice.name} (${preferredVoice.lang})`);
            } else {
                console.warn('No Korean voices found, using default voice');
            }

            // Set up event listeners
            utterance.onstart = () => {
                this.isPlaying = true;
                this.notifyAudioStart();
                console.log('Speech synthesis started');
            };

            utterance.onend = () => {
                this.isPlaying = false;
                this.notifyAudioEnd();
                console.log('Speech synthesis ended');
                resolve();
            };

            utterance.onerror = (event) => {
                this.isPlaying = false;
                this.notifyAudioEnd();
                console.error('Speech synthesis error:', event.error);
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            utterance.onpause = () => {
                console.log('Speech synthesis paused');
            };

            utterance.onresume = () => {
                console.log('Speech synthesis resumed');
            };

            // Start speaking
            try {
                console.log(`Speaking Korean text: "${text}"`);
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                this.isPlaying = false;
                console.error('Failed to start speech synthesis:', error);
                reject(error);
            }
        });
    }

    async playWithGoogleTTS(text, speed = 1.0) {
        try {
            // Stop any currently playing audio
            this.stop();

            console.log('Attempting Google TTS via proxy/alternative method...');
            
            // Use a more reliable approach - ResponsiveVoice or similar
            if (window.responsiveVoice && window.responsiveVoice.speak) {
                return new Promise((resolve, reject) => {
                    this.isPlaying = true;
                    this.notifyAudioStart();
                    
                    window.responsiveVoice.speak(text, "Korean Female", {
                        rate: speed,
                        onstart: () => {
                            console.log('ResponsiveVoice started');
                        },
                        onend: () => {
                            this.isPlaying = false;
                            this.notifyAudioEnd();
                            resolve();
                        },
                        onerror: (error) => {
                            this.isPlaying = false;
                            this.notifyAudioEnd();
                            reject(new Error(`ResponsiveVoice error: ${error}`));
                        }
                    });
                });
            }
            
            // Fallback: Use browser's built-in speech synthesis
            console.log('ResponsiveVoice not available, using Speech Synthesis API...');
            return await this.playWithSpeechAPI(text, speed);
            
        } catch (error) {
            console.error('Google TTS error:', error);
            throw new Error(`Google TTS failed: ${error.message}`);
        }
    }

    async tryPlayAudioUrl(audioUrl, speed = 1.0) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            this.currentAudio = audio;
            
            const cleanup = () => {
                this.isPlaying = false;
                this.currentAudio = null;
                this.notifyAudioEnd();
            };
            
            let hasStartedPlaying = false;
            
            audio.onloadstart = () => {
                this.isPlaying = true;
                this.notifyAudioStart();
                console.log('Direct audio started loading');
            };

            audio.oncanplay = () => {
                console.log('Audio can start playing');
            };

            audio.oncanplaythrough = () => {
                console.log('Audio can play through without interruption');
            };

            audio.onplay = () => {
                hasStartedPlaying = true;
                console.log('Audio playback started');
            };

            audio.onended = () => {
                cleanup();
                resolve();
            };

            audio.onerror = (event) => {
                cleanup();
                const errorMessage = event.target.error ? 
                    `Audio error: ${event.target.error.message} (code: ${event.target.error.code})` : 
                    'Unknown audio error';
                console.error(errorMessage);
                reject(new Error(errorMessage));
            };

            audio.onabort = () => {
                cleanup();
                if (hasStartedPlaying) {
                    resolve(); // Don't reject on abort if we started playing
                } else {
                    reject(new Error('Audio loading was aborted'));
                }
            };

            audio.onstalled = () => {
                console.warn('Audio download stalled');
            };

            audio.onsuspend = () => {
                console.warn('Audio download suspended');
            };

            // Set playback rate when metadata is loaded
            audio.addEventListener('loadedmetadata', () => {
                try {
                    if (audio.playbackRate !== undefined) {
                        audio.playbackRate = Math.max(0.5, Math.min(2.0, speed));
                        console.log(`Audio metadata loaded, duration: ${audio.duration}s, playback rate: ${audio.playbackRate}`);
                    }
                } catch (e) {
                    console.warn('Could not set playback rate:', e);
                }
            });

            // Set source with proper headers simulation
            audio.crossOrigin = 'anonymous';
            audio.preload = 'auto';
            audio.src = audioUrl;
            
            // Use a timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                if (!hasStartedPlaying) {
                    cleanup();
                    reject(new Error('Audio playback timeout - failed to start within 15 seconds'));
                }
            }, 15000); // 15 second timeout
            
            // Attempt to play
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        clearTimeout(timeoutId);
                        console.log('Audio play promise resolved successfully');
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        cleanup();
                        reject(new Error(`Failed to play audio: ${error.message}`));
                    });
            } else {
                // Older browsers that don't return a promise
                clearTimeout(timeoutId);
            }
        });
    }

    async playWithFetchedAudio(text, speed = 1.0) {
        // Alternative method using fetch with proper headers
        const encodedText = encodeURIComponent(text);
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ko&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=0.24`;
        
        try {
            const response = await fetch(audioUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'audio/mpeg, audio/*, */*',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                    'Referer': 'https://translate.google.com/',
                    'Origin': 'https://translate.google.com',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const audioBlob = await response.blob();
            
            if (audioBlob.size === 0) {
                throw new Error('Received empty audio response');
            }
            
            const audioObjectUrl = URL.createObjectURL(audioBlob);
            
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                this.currentAudio = audio;
                
                const cleanup = () => {
                    this.isPlaying = false;
                    this.currentAudio = null;
                    this.notifyAudioEnd();
                    URL.revokeObjectURL(audioObjectUrl); // Clean up
                };
                
                audio.onloadstart = () => {
                    this.isPlaying = true;
                    this.notifyAudioStart();
                    console.log('Fetch-based audio started loading');
                };

                audio.onended = () => {
                    cleanup();
                    resolve();
                };

                audio.onerror = (event) => {
                    cleanup();
                    reject(new Error(`Fetched audio playback failed: ${event.target.error?.message || 'Unknown error'}`));
                };

                audio.onabort = () => {
                    cleanup();
                    resolve();
                };

                // Set playback rate
                audio.addEventListener('loadedmetadata', () => {
                    try {
                        if (audio.playbackRate !== undefined) {
                            audio.playbackRate = Math.max(0.5, Math.min(2.0, speed));
                        }
                        console.log(`Audio metadata loaded, duration: ${audio.duration}s`);
                    } catch (e) {
                        console.warn('Could not set playback rate:', e);
                    }
                });

                audio.src = audioObjectUrl;
                audio.play().catch(error => {
                    cleanup();
                    reject(new Error(`Failed to play fetched audio: ${error.message}`));
                });
            });
        } catch (error) {
            throw new Error(`Failed to fetch audio: ${error.message}`);
        }
    }

    async playWithIframe(text) {
        // Fallback method using hidden iframe
        return new Promise((resolve, reject) => {
            try {
                const encodedText = encodeURIComponent(text);
                const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=ko&total=1&idx=0&textlen=${text.length}&client=tw-ob`;
                
                // Create hidden iframe
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.style.position = 'absolute';
                iframe.style.left = '-9999px';
                iframe.src = audioUrl;
                
                // Clean up function
                const cleanup = () => {
                    this.isPlaying = false;
                    this.notifyAudioEnd();
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                };
                
                // Set up event listeners
                iframe.onload = () => {
                    this.isPlaying = true;
                    this.notifyAudioStart();
                    console.log('Iframe-based audio loading');
                    
                    // Auto-cleanup after expected duration
                    setTimeout(() => {
                        cleanup();
                        resolve();
                    }, Math.max(2000, text.length * 100)); // Estimate duration
                };
                
                iframe.onerror = () => {
                    cleanup();
                    reject(new Error('Iframe audio loading failed'));
                };
                
                // Add to document
                document.body.appendChild(iframe);
                
                // Timeout fallback
                setTimeout(() => {
                    cleanup();
                    reject(new Error('Iframe audio timeout'));
                }, 10000);
                
            } catch (error) {
                reject(new Error(`Iframe audio setup failed: ${error.message}`));
            }
        });
    }

    stop() {
        try {
            // Stop background tone first
            this.stopBackgroundTone();
            
            // Stop Speech API
            if (this.isSupported && this.speechSynthesis.speaking) {
                this.speechSynthesis.cancel();
            }
            
            // Stop HTML5 Audio
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio = null;
            }
            
            this.isPlaying = false;
            this.notifyAudioEnd();
        } catch (error) {
            console.warn('Error stopping audio:', error);
        }
    }

    pause() {
        try {
            if (this.currentAudio && !this.currentAudio.paused) {
                this.currentAudio.pause();
                this.isPlaying = false;
                this.notifyAudioEnd();
            }
            
            if (this.isSupported && this.speechSynthesis.speaking) {
                this.speechSynthesis.pause();
                this.isPlaying = false;
                this.notifyAudioEnd();
            }
        } catch (error) {
            console.warn('Error pausing audio:', error);
        }
    }

    resume() {
        try {
            if (this.currentAudio && this.currentAudio.paused) {
                this.currentAudio.play();
                this.isPlaying = true;
                this.notifyAudioStart();
            }
            
            if (this.isSupported && this.speechSynthesis.paused) {
                this.speechSynthesis.resume();
                this.isPlaying = true;
                this.notifyAudioStart();
            }
        } catch (error) {
            console.warn('Error resuming audio:', error);
        }
    }

    getSpeed() {
        return this.currentSpeed;
    }

    setAutoPlay(enabled) {
        this.autoPlay = !!enabled;
    }

    getAutoPlay() {
        return this.autoPlay;
    }

    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    notifyAudioStart() {
        // Dispatch audio start event
        document.dispatchEvent(new CustomEvent('audioStart', {
            detail: {
                service: 'AudioService',
                timestamp: Date.now()
            }
        }));
        
        // Add visual feedback
        const flashcard = document.querySelector('.flashcard-front, .flashcard-back');
        if (flashcard) {
            flashcard.classList.add('audio-playing');
        }
    }

    notifyAudioEnd() {
        // Dispatch audio end event
        document.dispatchEvent(new CustomEvent('audioEnd', {
            detail: {
                service: 'AudioService',
                timestamp: Date.now()
            }
        }));
        
        // Remove visual feedback
        const flashcard = document.querySelector('.flashcard-front, .flashcard-back');
        if (flashcard) {
            flashcard.classList.remove('audio-playing');
        }
    }

    getAvailableVoices() {
        if (!this.isSupported) {
            return [];
        }
        
        return this.speechSynthesis.getVoices().filter(voice => 
            voice.lang.startsWith('ko') || 
            voice.lang.includes('KR') ||
            voice.name.toLowerCase().includes('korean')
        );
    }

    setPreferredVoice(voiceName) {
        const voices = this.getAvailableVoices();
        this.preferredVoice = voices.find(voice => voice.name === voiceName) || null;
    }

    isAudioSupported() {
        return this.isSupported || 'Audio' in window;
    }

    getCurrentAudioMethod() {
        if (this.currentMethodIndex < this.audioMethods.length) {
            return this.audioMethods[this.currentMethodIndex];
        }
        return 'none';
    }

    setBackgroundTone(enabled) {
        this.backgroundToneEnabled = enabled;
        console.log(`Background tone ${enabled ? 'enabled' : 'disabled'}`);
        
        // Stop any currently playing background tone if disabled
        if (!enabled) {
            this.stopBackgroundTone();
        }
    }

    // Legacy methods for compatibility
    async playKoreanWord(hangul, speed = null) {
        return await this.playWord(hangul, speed);
    }

    async playKoreanSentence(sentence, speed = null) {
        return await this.playSentence(sentence, speed);
    }
}
