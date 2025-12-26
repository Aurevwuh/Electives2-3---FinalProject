<template>
  <div class="cipher-view">
    <div class="cipher-header">
      <button class="back-btn" @click="abandonChallenge">← BACK TO MAP</button>
      <h2>🔐 CIPHER CHALLENGE</h2>
      <div class="progress-tracker">
        <span>{{ currentPuzzleIndex + 1 }} / {{ cipherPuzzles.length }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <div v-if="cipherPuzzles.length > 0" class="cipher-content">
      <!-- Current Puzzle -->
      <div class="puzzle-info">
        <div class="puzzle-status">
          <span>{{ currentPuzzle.difficulty || 'Unknown' }}</span>
        </div>
        <p class="context-text">{{ currentPuzzle.context }}</p>
      </div>

      <!-- Intercepted Message -->
      <div class="intercepted-section">
        <div class="label">INTERCEPTED TRANSMISSION:</div>
        <div class="intercepted-text">{{ currentPuzzle.intercepted }}</div>
      </div>

      <!-- Hint Toggle -->
      <div class="hint-section">
        <button @click="showHint = !showHint" class="hint-btn">
          {{ showHint ? 'Hide Intelligence Brief' : 'Request Intelligence Brief' }}
        </button>
        <div v-if="showHint" class="hint-box">
          <strong>INTEL:</strong> Caesar Cipher - Shift by {{ currentPuzzle.shift }}
          
          <!-- Cipher Reference Guide -->
          <div class="cipher-reference">
            <div class="reference-title">CIPHER REFERENCE GUIDE:</div>
            
            <!-- Shift Examples -->
            <div class="shift-examples">
              <div class="shift-row">
                <span class="shift-label">Normal:</span>
                <span class="alphabet">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</span>
              </div>
              <div class="shift-row" v-for="shift in [1, 2, 3, 4, 5]" :key="shift">
                <span class="shift-label">Shift {{ shift }}:</span>
                <span class="alphabet">{{ getShiftedAlphabet(shift) }}</span>
              </div>
            </div>
            
            <div class="reference-hint">💡 Use this guide to compare alphabet placements and decode the message</div>
          </div>
        </div>
      </div>

      <!-- Cipher Timer -->
      <div class="cipher-timer">
        <div class="timer-bar">
          <div class="timer-fill" :style="{ width: cipherTimePercent + '%', backgroundColor: cipherTimer <= 10 ? '#a83e3e' : '#5fb3d5' }"></div>
        </div>
        <p class="timer-text">⏱️ {{ cipherTimer }}s remaining</p>
      </div>

      <!-- Input Area -->
      <div class="input-section">
        <label>DECRYPTED MESSAGE:</label>
        <input
          ref="cipherInput"
          v-model="userInput"
          @keyup.enter="checkAnswer"
          @keydown="handleInputKeydown"
          type="text"
          placeholder="Enter decoded message..."
          class="cipher-input"
        />
      </div>

      <!-- Feedback -->
      <div v-if="lastResult !== null" :class="['feedback', lastResult ? 'correct' : 'wrong']">
        <p>{{ lastResult ? '✅ DECRYPTION SUCCESSFUL' : '❌ DECRYPTION FAILED' }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="button-group">
        <button @click="checkAnswer" :disabled="!userInput.trim()" class="btn btn-submit">
          DECRYPT MESSAGE
        </button>
        <button @click="skipPuzzle" class="btn btn-skip">
          SKIP
        </button>
        <button
          v-if="lastResult && currentPuzzleIndex < cipherPuzzles.length - 1"
          @click="nextPuzzle"
          class="btn btn-next"
        >
          NEXT CIPHER →
        </button>
        <button
          v-if="lastResult && currentPuzzleIndex === cipherPuzzles.length - 1"
          @click="startMission"
          class="btn btn-complete"
        >
          START MISSION →
        </button>
      </div>
    </div>

    <div v-else class="loading">
      Loading cipher puzzles...
    </div>
  </div>
</template>

<script>
import { supabase, updateCipherProgress, updateIntelPoints, getCurrentUserId } from '@/library/supabase.js';
import soundManager from '@/library/soundManager.js';
export default {
  name: 'CipherView',
  props: {
    country: Object
  },
  emits: ['cipher-complete', 'return-to-map'],
  data() {
    return {
      cipherPuzzles: [],
      currentPuzzleIndex: 0,
      userInput: '',
      showHint: false,
      lastResult: null,
      cipherTimer: 0,
      cipherTimeLimit: 0,
      cipherTimerInterval: null,
      cursorPosition: 0
    };
  },
  computed: {
    currentPuzzle() {
      return this.cipherPuzzles[this.currentPuzzleIndex] || {};
    },
    progressPercentage() {
      if (this.cipherPuzzles.length === 0) return 0;
      return ((this.currentPuzzleIndex + 1) / this.cipherPuzzles.length) * 100;
    },
    cipherTimePercent() {
      if (this.cipherTimeLimit === 0) return 100;
      return Math.max(0, (this.cipherTimer / this.cipherTimeLimit) * 100);
    }
  },
  mounted() {
    // Stop ambient sounds completely when entering cipher challenge
    soundManager.stopAmbientCycle();
    this.loadCipherPuzzles();
    soundManager.stopBackgroundMusic();
    soundManager.playBackgroundMusic();
    soundManager.sounds.backgroundMusic.src = '/sounds/cipher-background.mp3';
    soundManager.playBackgroundMusic();
  },
  beforeUnmount() {
    if (this.cipherTimerInterval) clearInterval(this.cipherTimerInterval);
    soundManager.stopBackgroundMusic();
    soundManager.sounds.backgroundMusic.src = '/sounds/spy-theme-bg.mp3';
  },
  methods: {
    async loadCipherPuzzles() {
      try {
        // Fetch all caesar cipher puzzles (they don't have country_id associations)
        const { data, error } = await supabase
          .from('puzzles')
          .select('*')
          .eq('puzzle_type', 'caesar_cipher');

        if (error) {
          console.error('Error loading cipher puzzles:', error);
          return;
        }

        console.log('Raw cipher data from Supabase:', data);

        if (!data || data.length === 0) {
          console.warn('No cipher puzzles found in database');
          return;
        }

        // Shuffle and pick 1 random puzzle
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(1, data.length));

        // Parse puzzle_data JSON and format for display
        this.cipherPuzzles = selected.map(puzzle => ({
          id: puzzle.id,
          puzzle_type: puzzle.puzzle_type,
          solution: puzzle.solution,
          ...this.parsePuzzleData(puzzle.puzzle_data)
        }));

        console.log('Loaded cipher puzzles:', this.cipherPuzzles);
        
        // Start timer after puzzles are loaded
        this.$nextTick(() => {
          this.startCipherTimer();
        });
      } catch (error) {
        console.error('Error in loadCipherPuzzles:', error);
      }
    },

    parsePuzzleData(puzzleDataJson) {
      try {
        // Handle JSON string or object
        const data = typeof puzzleDataJson === 'string' ? JSON.parse(puzzleDataJson) : puzzleDataJson;
        
        // Ensure all fields have defaults
        const result = {
          intercepted: data.encrypted || data.intercepted || '',
          shift: data.shift || 0,
          context: data.context || 'Unknown location',
          difficulty: data.difficulty || 'Unknown'
        };
        
        console.log('Parsed puzzle data:', result);
        return result;
      } catch (e) {
        console.error('Error parsing puzzle data:', e, 'Input was:', puzzleDataJson);
        return {
          intercepted: '',
          shift: 0,
          context: 'Unknown location',
          difficulty: 'Unknown'
        };
      }
    },

    checkAnswer() {
      const normalized = this.userInput.toUpperCase().trim();
      const correct = normalized === this.currentPuzzle.solution.toUpperCase();
      
      // Clear timer when answer is submitted
      if (this.cipherTimerInterval) clearInterval(this.cipherTimerInterval);
      
      this.lastResult = correct;

      if (correct) {
        soundManager.play('correctAnswer');
        // Award points based on difficulty
        this.awardCipherPoints(this.currentPuzzle.difficulty);
      } else {
        soundManager.play('incorrectAnswer');
        console.log('Wrong answer. Expected:', this.currentPuzzle.solution, 'Got:', normalized);
        // Auto-advance to next puzzle after 2 seconds if wrong
        setTimeout(() => {
          this.nextPuzzle();
        }, 2000);
      }
    },

    skipPuzzle() {
      const userId = getCurrentUserId();
      if (userId) {
        // Record skip (passed but not correct)
        updateCipherProgress(userId, 0, 1); // 0 correct, 1 passed
      }
      this.nextPuzzle();
    },

    awardCipherPoints(difficulty) {
      // Award points based on difficulty level
      const difficultyPoints = {
        'Recruit': 5,
        'Operative': 10,
        'Agent': 15,
        'Elite': 20
      };

      const points = difficultyPoints[difficulty] || 5;
      
      const userId = getCurrentUserId();
      if (userId) {
        // Award intel points first
        updateIntelPoints(userId, points);
        // Update cipher progress stats
        updateCipherProgress(userId, 1, 1); // 1 correct, 1 passed
      }
      
      console.log(`Awarded ${points} intelligence points for ${difficulty} difficulty cipher!`);
    },

    nextPuzzle() {
      if (this.currentPuzzleIndex < this.cipherPuzzles.length - 1) {
        this.currentPuzzleIndex++;
        this.userInput = '';
        this.showHint = false;
        this.lastResult = null;
      } else {
        // Last puzzle was answered (correctly or wrong), start mission
        setTimeout(() => {
          this.startMission();
        }, 500);
      }
    },

    startMission() {
      if (this.cipherTimerInterval) clearInterval(this.cipherTimerInterval);
      this.$emit('cipher-complete');
    },

    startCipherTimer() {
      // Calculate time limit based on shift difficulty
      const shift = this.currentPuzzle.shift || 1;
      this.cipherTimeLimit = 60 + (shift * 15); // Base 60 seconds + 15 per shift level
      this.cipherTimer = this.cipherTimeLimit;

      // Clear existing timer if any
      if (this.cipherTimerInterval) clearInterval(this.cipherTimerInterval);

      // Start cipher timer
      this.cipherTimerInterval = setInterval(() => {
        this.cipherTimer--;
        if (this.cipherTimer <= 0) {
          clearInterval(this.cipherTimerInterval);
          this.lastResult = false; // Timeout = failure
          setTimeout(() => {
            this.startMission();
          }, 1500);
        }
      }, 1000);
    },

    abandonChallenge() {
      if (confirm('Abandon cipher challenge? You can try again later.')) {
        if (this.cipherTimerInterval) clearInterval(this.cipherTimerInterval);
        this.$emit('return-to-map');
      }
    },

    getShiftedAlphabet(shift) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return alphabet
        .split('')
        .map(char => {
          const index = alphabet.indexOf(char);
          const shiftedIndex = (index - shift + 26) % 26;
          return alphabet[shiftedIndex];
        })
        .join(' ');
    },

    handleInputKeydown(event) {
      // Handle arrow keys for cursor movement
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const input = this.$refs.cipherInput;
        const currentPos = input.selectionStart;
        if (currentPos > 0) {
          input.setSelectionRange(currentPos - 1, currentPos - 1);
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const input = this.$refs.cipherInput;
        const currentPos = input.selectionStart;
        if (currentPos < this.userInput.length) {
          input.setSelectionRange(currentPos + 1, currentPos + 1);
        }
      }
    }
  },
  watch: {
    userInput(newValue) {
      // Auto-capitalize all input
      if (newValue !== newValue.toUpperCase()) {
        this.userInput = newValue.toUpperCase();
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap');

:root {
  --accent-color: #5fb3d5;
  --accent-dark: #4a9d6f;
  --warning-color: #6b7280;
  --error-color: #a83e3e;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
}

* {
  font-family: 'Roboto Mono', 'Orbitron', 'Courier New', monospace;
}

.cipher-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  padding: 20px;
  color: var(--text-primary);
}

.cipher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 3px solid var(--accent-color);
  padding-bottom: 20px;
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.05) 0%, transparent 100%);
}

.back-btn {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(168, 62, 62, 0.1) 100%);
  border: 2px solid var(--warning-color);
  color: var(--warning-color);
  padding: 10px 20px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.4) 0%, rgba(168, 62, 62, 0.2) 100%);
  box-shadow: 0 0 15px rgba(107, 114, 128, 0.5);
  transform: scale(1.05);
}

.cipher-header h2 {
  color: var(--accent-color);
  text-shadow: 0 0 8px rgba(95, 179, 213, 0.5);
  letter-spacing: 2px;
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
}

.progress-tracker {
  font-size: 14px;
  color: var(--accent-color);
  text-shadow: 0 0 5px rgba(95, 179, 213, 0.3);
  letter-spacing: 1px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  margin-bottom: 30px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(95, 179, 213, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5fb3d5, #6b7280);
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.6);
}

.cipher-content {
  max-width: 900px;
  margin: 0 auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.puzzle-info {
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(139, 90, 141, 0.08);
  border-left: 3px solid #8b5a8d;
  border-radius: 3px;
}

.puzzle-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #5fb3d5;
  font-weight: 600;
}

.context-text {
  margin: 0;
  font-size: 13px;
  color: #7a8fa0;
  font-style: italic;
}

.intercepted-section {
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(168, 62, 62, 0.08);
  border: 2px solid #a83e3e;
  border-radius: 3px;
}

.label {
  color: #a83e3e;
  font-size: 12px;
  margin-bottom: 12px;
  letter-spacing: 1px;
  font-weight: 600;
}

.intercepted-text {
  font-size: 20px;
  text-align: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  letter-spacing: 2px;
  color: #ffd700;
  font-weight: bold;
  word-break: break-word;
}

.hint-section {
  margin-bottom: 25px;
}

.hint-btn {
  background: transparent;
  border: none;
  color: #5fb3d5;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-family: inherit;
  transition: color 0.2s;
}

.hint-btn:hover {
  color: #7fb3d5;
}

.hint-box {
  margin-top: 10px;
  padding: 12px;
  background: rgba(95, 179, 213, 0.08);
  border-left: 3px solid #5fb3d5;
  border-radius: 2px;
  font-size: 12px;
  color: #5fb3d5;
}

.cipher-reference {
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid rgba(95, 179, 213, 0.3);
}

.reference-title {
  display: block;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 12px;
  letter-spacing: 1px;
  font-size: 13px;
}

.shift-examples {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 14px;
  border-radius: 2px;
}

.shift-row {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 13px;
}

.shift-label {
  min-width: 75px;
  font-weight: 600;
  color: #7fb3d5;
  text-align: right;
  font-size: 13px;
}

.alphabet {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  color: #c5d3e0;
  overflow-x: auto;
  padding: 6px;
  flex: 1;
  font-size: 13px;
}

.reference-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #7fb3d5;
  font-style: italic;
}

.input-section {
  margin-bottom: 25px;
}

.input-section label {
  display: block;
  color: #a83e3e;
  margin-bottom: 8px;
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: 600;
}

.cipher-input {
  width: 100%;
  padding: 12px;
  background: #0f1419;
  border: 2px solid #a83e3e;
  border-radius: 2px;
  color: #c5d3e0;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  transition: all 0.2s;
}

.cipher-input:focus {
  outline: none;
  border-color: #8b5a8d;
  box-shadow: 0 0 10px rgba(168, 62, 62, 0.3);
}

.cipher-input::placeholder {
  color: #7a8fa0;
}

.feedback {
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 2px;
  font-weight: 600;
  text-align: center;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.feedback.correct {
  background: rgba(74, 157, 111, 0.15);
  border: 2px solid #4a9d6f;
  color: #4a9d6f;
}

.feedback.wrong {
  background: rgba(168, 62, 62, 0.15);
  border: 2px solid #a83e3e;
  color: #a83e3e;
}

.button-group {
  display: flex;
  gap: 15px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid;
  border-radius: 2px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 1px;
  font-size: 12px;
  text-transform: uppercase;
}

.btn-submit {
  background: linear-gradient(135deg, #a83e3e 0%, #8b3434 100%);
  border-color: #a83e3e;
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #b84e4e 0%, #9b4444 100%);
  box-shadow: 0 0 15px rgba(168, 62, 62, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-skip {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  border-color: #6b7280;
  color: #fff;
}

.btn-skip:hover {
  background: linear-gradient(135deg, #7b8290 0%, #5b6573 100%);
  box-shadow: 0 0 15px rgba(107, 114, 128, 0.4);
}

.btn-next, .btn-complete {
  background: linear-gradient(135deg, #4a9d6f 0%, #3a7d5f 100%);
  border-color: #4a9d6f;
  color: #fff;
}

.btn-next:hover, .btn-complete:hover {
  background: linear-gradient(135deg, #5aad7f 0%, #4a8d6f 100%);
  box-shadow: 0 0 15px rgba(74, 157, 111, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5fb3d5;
}

.cipher-timer {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%);
  border-left: 4px solid #6b7280;
  border-right: 2px solid #6b7280;
  padding: 15px 20px;
  margin-bottom: 25px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(107, 114, 128, 0.15);
}

.timer-bar {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #6b7280;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
}

.timer-fill {
  height: 100%;
  transition: width 1s linear, background-color 0.3s ease;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.6);
}

.timer-text {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  letter-spacing: 1px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(107, 114, 128, 0.4);
}
</style>
