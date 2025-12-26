<template>
  <div class="cipher-container">
    <!-- Header -->
    <div class="cipher-header">
      <h2>🔐 CIPHER BREAKER</h2>
      <p class="subtitle">TOP SECRET - EYES ONLY</p>
    </div>

    <div v-if="cipherPuzzles.length > 0" class="cipher-content">
      <!-- Current Puzzle -->
      <div class="puzzle-info">
        <div class="puzzle-status">
          <span>MISSION: {{ currentPuzzleIndex + 1 }} / {{ cipherPuzzles.length }}</span>
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
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-section">
        <label>DECRYPTED MESSAGE:</label>
        <input
          v-model="userInput"
          @keyup.enter="checkAnswer"
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
        <button
          v-if="lastResult && currentPuzzleIndex < cipherPuzzles.length - 1"
          @click="nextPuzzle"
          class="btn btn-next"
        >
          NEXT MISSION →
        </button>
      </div>
    </div>

    <div v-else class="loading">
      Loading cipher puzzles...
    </div>
  </div>
</template>

<script>
import { supabase } from '@/library/supabase.js';

export default {
  name: 'CipherPuzzle',
  props: {
    countryId: String
  },
  data() {
    return {
      cipherPuzzles: [],
      currentPuzzleIndex: 0,
      userInput: '',
      showHint: false,
      lastResult: null
    };
  },
  computed: {
    currentPuzzle() {
      return this.cipherPuzzles[this.currentPuzzleIndex] || {};
    }
  },
  mounted() {
    this.loadCipherPuzzles();
  },
  methods: {
    async loadCipherPuzzles() {
      try {
        let query = supabase
          .from('puzzles')
          .select('*')
          .eq('puzzle_type', 'cipher');

        // If countryId is provided, filter by country
        if (this.countryId) {
          query = query.eq('country_id', this.countryId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading cipher puzzles:', error);
          return;
        }

        // Parse puzzle_data JSON and format for display
        this.cipherPuzzles = data.map(puzzle => ({
          id: puzzle.id,
          puzzle_type: puzzle.puzzle_type,
          solution: puzzle.solution,
          ...this.parsePuzzleData(puzzle.puzzle_data)
        }));

        console.log('Loaded cipher puzzles:', this.cipherPuzzles);
      } catch (error) {
        console.error('Error in loadCipherPuzzles:', error);
      }
    },

    parsePuzzleData(puzzleDataJson) {
      try {
        // Handle JSON string or object
        const data = typeof puzzleDataJson === 'string' ? JSON.parse(puzzleDataJson) : puzzleDataJson;
        return {
          intercepted: data.intercepted || '',
          shift: data.shift || 0,
          context: data.context || 'Unknown location',
          difficulty: data.difficulty || 'Unknown'
        };
      } catch (e) {
        console.error('Error parsing puzzle data:', e);
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
      this.lastResult = correct;

      if (!correct) {
        this.$emit('puzzle-failed', {
          puzzleId: this.currentPuzzle.id,
          userAnswer: normalized,
          correctAnswer: this.currentPuzzle.solution
        });
      } else {
        this.$emit('puzzle-completed', {
          puzzleId: this.currentPuzzle.id,
          solution: this.currentPuzzle.solution
        });
        // Auto-shift to next puzzle after 1 second
        setTimeout(() => {
          this.nextPuzzle();
        }, 1000);
      }
    },

    nextPuzzle() {
      if (this.currentPuzzleIndex < this.cipherPuzzles.length - 1) {
        this.currentPuzzleIndex++;
        this.userInput = '';
        this.showHint = false;
        this.lastResult = null;
      } else {
        this.$emit('all-puzzles-completed');
      }
    }
  }
};
</script>

<style scoped>
.cipher-container {
  padding: 30px;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  border: 2px solid #a83e3e;
  border-radius: 4px;
  color: #c5d3e0;
  font-family: 'Roboto Mono', monospace;
}

.cipher-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #a83e3e;
}

.cipher-header h2 {
  font-size: 28px;
  color: #a83e3e;
  margin: 0;
  text-shadow: 0 0 10px rgba(168, 62, 62, 0.5);
  letter-spacing: 2px;
}

.subtitle {
  color: #7a8fa0;
  margin: 8px 0 0 0;
  font-size: 12px;
  letter-spacing: 2px;
}

.cipher-content {
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

.btn-next {
  background: linear-gradient(135deg, #4a9d6f 0%, #3a7d5f 100%);
  border-color: #4a9d6f;
  color: #fff;
}

.btn-next:hover {
  background: linear-gradient(135deg, #5aad7f 0%, #4a8d6f 100%);
  box-shadow: 0 0 15px rgba(74, 157, 111, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5fb3d5;
}
</style>