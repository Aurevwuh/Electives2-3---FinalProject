/**
 * Sound Manager - Handles all audio for Spy Espionage
 * Free and copyright-free sounds from Freepik, Pixabay, Zapsplat
 */

class SoundManager {
  constructor() {
    this.isMuted = localStorage.getItem('soundMuted') === 'true';
    this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.7;
    this.sounds = {};
    this.backgroundMusic = null;
    this.initializeSounds();
  }

  /**
   * Initialize all sound references
   */
  initializeSounds() {
    this.sounds = {
      // Background music
      backgroundMusic: new Audio('/sounds/spy-theme-bg.mp3'),
      cipherBackground: new Audio('/sounds/cipher-background.mp3'),
      missionBackground: new Audio('/sounds/mission-background.mp3'),
      startMenu: new Audio('/sounds/Start-menu.mp3'),
      
      // World view ambient sounds
      computerAtmosphere: new Audio('/sounds/WorldView%20Ambient/Atmosphere%20of%20computer%20devices%20and%20communications.mp3'),
      walkie1: new Audio('/sounds/WorldView%20Ambient/Walkie%20talkie%20(2).mp3'),
      walkie2: new Audio('/sounds/WorldView%20Ambient/Walkie%20talkie%20(5).mp3'),
      radioTuning: new Audio('/sounds/WorldView%20Ambient/Radio_%20am%20tuning%20(4).mp3'),
      morse: new Audio('/sounds/WorldView%20Ambient/Signals%20in%20morse%20code.mp3'),
      
      // Mission sounds
      missionAccept: new Audio('/sounds/mission-accept.mp3'),
      missionComplete: new Audio('/sounds/mission-complete.mp3'),
      missionFailed: new Audio('/sounds/mission-failed.mp3'),
      
      // Puzzle answer feedback
      correctAnswer: new Audio('/sounds/correct-answer.mp3'),
      incorrectAnswer: new Audio('/sounds/incorrect-answer.mp3'),
      
      // UI sounds
      clickSfx: new Audio('/sounds/click-sfx.wav'),
      hoverButton: new Audio('/sounds/hover-button.mp3')
    };

    // Configure background music to loop
    this.sounds.backgroundMusic.loop = true;
    this.sounds.cipherBackground.loop = true;
    this.sounds.missionBackground.loop = true;
    this.sounds.startMenu.loop = true;
    
    // Set volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Play a sound effect
   */
  play(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;
    
    const sound = this.sounds[soundName];
    sound.currentTime = 0;
    sound.play().catch(err => console.log(`Audio play error for ${soundName}:`, err));
  }

  /**
   * Start background music
   */
  playBackgroundMusic() {
    if (this.isMuted || !this.sounds.backgroundMusic) return;
    
    this.sounds.backgroundMusic.volume = this.volume * 0.7; // Increased background music volume
    this.sounds.backgroundMusic.play().catch(err => console.log('Background music error:', err));
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.sounds.backgroundMusic) {
      this.sounds.backgroundMusic.pause();
      this.sounds.backgroundMusic.currentTime = 0;
    }
  }

  /**
   * Play start menu music
   */
  playStartMenuMusic() {
    if (this.isMuted || !this.sounds.startMenu) return;
    
    this.sounds.startMenu.volume = this.volume * 0.7;
    this.sounds.startMenu.play().catch(err => console.log('Start menu music error:', err));
  }

  /**
   * Stop start menu music
   */
  stopStartMenuMusic() {
    if (this.sounds.startMenu) {
      this.sounds.startMenu.pause();
      this.sounds.startMenu.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('soundMuted', this.isMuted);
    
    if (this.isMuted) {
      this.stopAll();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.isMuted;
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('soundVolume', this.volume);
    
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Get mute state
   */
  isSoundMuted() {
    return this.isMuted;
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Play random world view ambient sound (at reduced volume)
   */
  playRandomAmbient() {
    if (this.isMuted) return;
    
    const ambientSounds = [
      'computerAtmosphere',
      'walkie1',
      'walkie2',
      'radioTuning',
      'morse',
      'morse',
      'morse'  // Morse code plays more often (3x frequency)
    ];
    
    const randomSound = ambientSounds[Math.floor(Math.random() * ambientSounds.length)];
    const sound = this.sounds[randomSound];
    sound.volume = this.volume * 0.3; // Ambient sounds at 30% of master volume
    sound.currentTime = 0;
    sound.play().catch(err => console.log(`Ambient audio error for ${randomSound}:`, err));
  }

  /**
   * Schedule random ambient sounds at intervals
   */
  startAmbientCycle(intervalMs = 8000) {
    this.ambientInterval = setInterval(() => {
      this.playRandomAmbient();
    }, intervalMs);
  }

  /**
   * Stop ambient sound cycle and pause any playing ambient sounds
   */
  stopAmbientCycle() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    // Stop any currently playing ambient sounds
    const ambientSounds = [
      'computerAtmosphere',
      'walkie1',
      'walkie2',
      'radioTuning',
      'morse'
    ];
    ambientSounds.forEach(soundName => {
      if (this.sounds[soundName]) {
        this.sounds[soundName].pause();
        this.sounds[soundName].currentTime = 0;
      }
    });
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
