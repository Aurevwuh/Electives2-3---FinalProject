<template>
  <div class="mission-view">
    <div class="mission-header">
      <button class="back-btn" @click="abandonMission">← BACK TO MAP</button>
      <h2>🕵️ {{ country.name }} MISSION</h2>
      <div class="progress-tracker">
        <span>{{ currentIndex + 1 }} / {{ totalTasks }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Question Display -->
    <div v-if="currentTask && currentTask.type === 'question'" class="task-container">
      <div class="task-card question-card">
        <div class="task-header">
          <span class="task-number">QUESTION {{ currentIndex + 1 }}</span>
          <span class="task-type">🎯 INTELLIGENCE QUIZ</span>
        </div>

        <p class="question-text">{{ currentTask.data.question }}</p>

        <div class="options-grid">
          <button
            v-for="(opt, key) in getOptions(currentTask.data)"
            :key="key"
            @click="selectAnswer(currentTask.data, key)"
            :class="['option-btn', { 
              selected: selectedAnswer === key, 
              correct: lastResult && currentTask.data.correct_answer.toLowerCase() === key.split('_')[1].toLowerCase(),
              wrong: lastResult && !lastResult.correct && selectedAnswer === key
            }]"
            :disabled="lastResult !== null && lastResult.correct">
            {{ opt }}
          </button>
        </div>

        <div v-if="lastResult" :class="['feedback', { correct: lastResult.correct, wrong: !lastResult.correct }]">
          <span v-if="lastResult.correct">✅ CORRECT! Proceeding...</span>
          <span v-else>❌ INCORRECT! The correct answer is highlighted. Moving to next question...</span>
        </div>

        <button
          v-if="lastResult && lastResult.correct"
          @click="nextTask"
          class="next-btn">
          NEXT →
        </button>
      </div>
    </div>

    <!-- Puzzle Display -->
    <div v-if="currentTask && currentTask.type === 'puzzle'" class="task-container">
      <div class="task-card puzzle-card">
        <div class="task-header">
          <span class="task-number">PUZZLE {{ currentIndex + 1 }}</span>
          <span class="task-type">🔐 FINAL CHALLENGE</span>
        </div>

        <p class="puzzle-flavor">{{ currentTask.data.flavor_text }}</p>

        <div v-if="currentTask.data.puzzle_type === 'arrow'" class="arrow-puzzle">
          <p class="puzzle-instructions">Memorize the sequence and reproduce it using arrow keys or buttons:</p>

          <!-- Flash sequence with timer -->
          <div v-if="showFlash" class="flash-sequence">
            <div class="flash-timer-bar">
              <div class="flash-timer-fill" :style="{ width: (flashTimer / 6) * 100 + '%' }"></div>
              <span class="flash-timer-text">{{ flashTimer }}s</span>
            </div>
            <div class="arrows-display">
              <span v-for="(arrow, idx) in getSolutionArrows(currentTask.data)" :key="idx" class="flash-arrow">
                {{ arrow }}
              </span>
            </div>
          </div>

          <!-- Tries remaining display -->
          <div class="tries-remaining">
            <span>TRIES REMAINING: </span>
            <span class="tries-count">{{ currentTries }} / {{ puzzleTries }}</span>
          </div>

          <p class="keyboard-hint">⌨️ Use arrow keys to enter the sequence</p>

          <!-- Player input display -->
          <div class="user-sequence">
            <span v-for="(d, idx) in userInput" :key="idx" class="input-arrow">
              {{ arrowMap[d] }}
            </span>
          </div>

          <div v-if="lastResult" :class="['feedback', { correct: lastResult.correct, wrong: !lastResult.correct }]">
            <span v-if="lastResult.correct">✅ MISSION COMPLETE!</span>
            <span v-else-if="lastResult.tryAgain">❌ INCORRECT! {{ currentTries }} tries remaining...</span>
            <span v-else>❌ MISSION FAILED! Out of tries.</span>
          </div>

          <div v-if="lastResult && lastResult.correct" class="mission-complete">
            <p>🎉 Mission accomplished!</p>
            <button @click="returnToMap" class="return-btn return-btn-success">RETURN TO MAP</button>
          </div>

          <div v-if="lastResult && !lastResult.correct" class="mission-failed">
            <p>💥 Mission Failed!</p>
            <button @click="returnToMap" class="return-btn return-btn-failure">RETURN TO MAP</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission Complete Screen -->
    <div v-if="missionComplete" class="mission-complete-overlay">
      <div class="complete-modal">
        <h3>🎉 MISSION ACCOMPLISHED!</h3>
        <p>{{ country.name }} mission completed successfully!</p>
        <button @click="returnToMap" class="return-btn">RETURN TO MAP</button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase, updateIntelPoints, updateMissionCompleted, getCurrentUserId } from '../library/supabase.js';

export default {
  name: 'MissionView',
  props: {
    country: Object,
    questions: Array,
    puzzles: Array
  },
  emits: ['mission-complete', 'return-to-map'],
  data() {
    return {
      currentIndex: 0,
      allTasks: [],
      selectedAnswer: null,
      userInput: [],
      lastResult: null,
      showFlash: true,
      missionComplete: false,
      progress: {},
      arrowMap: { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' },
      flashTimer: 6,
      flashTimerInterval: null,
      puzzleTries: 3,
      currentTries: 3,
      returnToMapCalled: false
    };
  },
  computed: {
    currentTask() {
      return this.allTasks[this.currentIndex] || null;
    },
    totalTasks() {
      return this.allTasks.length;
    },
    progressPercentage() {
      if (this.totalTasks === 0) return 0;
      return ((this.currentIndex + 1) / this.totalTasks) * 100;
    }
  },
  watch: {
    questions() {
      this.initializeMission();
    },
    puzzles() {
      this.initializeMission();
    },
    currentIndex() {
      this.$forceUpdate();
    }
  },
  mounted() {
    this.initializeMission();
    this.loadProgress();
    window.addEventListener('keydown', this.handleKeyboardArrow);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyboardArrow);
    if (this.flashTimerInterval) clearInterval(this.flashTimerInterval);
  },

  methods: {
    initializeMission() {
      this.allTasks = [
        ...this.questions.map(q => ({ type: 'question', data: q })),
        ...this.puzzles.map(p => ({ type: 'puzzle', data: p }))
      ];
      this.returnToMapCalled = false;
    },

    getOptions(question) {
      return {
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d
      };
    },

    selectAnswer(question, optionKey) {
      if (this.lastResult) return;

      const selected = optionKey.split('_')[1];
      const correct = selected.toLowerCase() === question.correct_answer.toLowerCase();

      this.selectedAnswer = optionKey;
      this.lastResult = { correct, selected: optionKey };

      if (correct) {
        // Award 2 intel points per correct question
        this.awardIntelPoints(2);
        this.saveQuestionProgress(question.id, true);
      } else {
        setTimeout(() => {
          this.nextTask();
        }, 3000);
      }
    },

    awardIntelPoints(points) {
      const userId = getCurrentUserId();
      if (userId) {
        updateIntelPoints(userId, points);
      }
    },

    nextTask() {
      if (this.currentIndex < this.allTasks.length - 1) {
        this.currentIndex++;
        this.selectedAnswer = null;
        this.lastResult = null;
        this.userInput = [];
        this.showFlash = true;
        this.flashTimer = 6;
        this.currentTries = this.puzzleTries;
        
        if (this.flashTimerInterval) clearInterval(this.flashTimerInterval);

        if (this.currentTask.type === 'puzzle') {
          this.flashTimerInterval = setInterval(() => {
            this.flashTimer--;
            if (this.flashTimer <= 0) {
              clearInterval(this.flashTimerInterval);
              this.showFlash = false;
            }
          }, 1000);
        }
      } else {
        this.missionComplete = true;
      }
    },

    getSolutionArrows(puzzle) {
      let solution = puzzle.solution;
      if (typeof solution === 'string') {
        try {
          solution = JSON.parse(solution);
        } catch {
          solution = solution.split(',');
        }
      }
      return solution.map(dir => this.arrowMap[dir]);
    },

    arrowClick(dir) {
      if (this.lastResult || this.showFlash) return;

      this.userInput.push(dir);

      let solution = this.currentTask.data.solution;
      if (typeof solution === 'string') {
        try {
          solution = JSON.parse(solution);
        } catch {
          solution = solution.split(',');
        }
      }

      if (this.userInput.length === solution.length) {
        const correct = JSON.stringify(this.userInput) === JSON.stringify(solution);
        
        if (correct) {
          this.lastResult = { correct: true };
          // Award 2 intel points per correct puzzle
          this.awardIntelPoints(2);
          this.savePuzzleProgress(this.currentTask.data.id, true);
          setTimeout(() => {
            this.returnToMap();
          }, 2000);
        } else {
          this.currentTries--;
          
          if (this.currentTries <= 0) {
            this.lastResult = { correct: false };
            setTimeout(() => {
              this.returnToMap(false);
            }, 2000);
          } else {
            this.userInput = [];
            this.lastResult = { correct: false, tryAgain: true };
            setTimeout(() => {
              this.lastResult = null;
            }, 2000);
          }
        }
      }
    },

    handleKeyboardArrow(event) {
      if (!this.currentTask || this.currentTask.type !== 'puzzle') return;
      if (this.lastResult || this.showFlash) return;

      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };

      // Handle backspace/delete to remove last arrow
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        if (this.userInput.length > 0) {
          this.userInput.pop();
        }
        return;
      }

      if (keyMap[event.key]) {
        event.preventDefault();
        this.arrowClick(keyMap[event.key]);
      }
    },

    saveQuestionProgress(questionId, correct) {
      if (!this.progress[this.country.id]) {
        this.progress[this.country.id] = { questions: {}, puzzles: {} };
      }
      this.progress[this.country.id].questions[questionId] = correct;
      this.saveProgress();
    },

    savePuzzleProgress(puzzleId, correct) {
      if (!this.progress[this.country.id]) {
        this.progress[this.country.id] = { questions: {}, puzzles: {} };
      }
      this.progress[this.country.id].puzzles[puzzleId] = correct;
      this.saveProgress();
    },

    saveProgress() {
      localStorage.setItem('missionProgress', JSON.stringify(this.progress));
    },

    loadProgress() {
      const stored = localStorage.getItem('missionProgress');
      if (stored) this.progress = JSON.parse(stored);
    },

    abandonMission() {
      if (confirm('Abandon mission? Progress will be lost.')) {
        this.returnToMap(false);
      }
    },

    returnToMap(isSuccess = true) {
      // Prevent double calls
      if (this.returnToMapCalled) {
        console.log('returnToMap already called, ignoring duplicate');
        return;
      }
      
      this.returnToMapCalled = true;
      console.log('returnToMap() called with success:', isSuccess);
      
      // Emit event FIRST before any async operations
      console.log('Emitting return-to-map event');
      this.$emit('return-to-map');
      console.log('Event emitted');
      
      // Track mission completion to Supabase ONLY if successful
      const userId = getCurrentUserId();
      if (userId && isSuccess) {
        updateMissionCompleted(userId, this.country.id);
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

.mission-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  padding: 20px;
  color: var(--text-primary);
}

.mission-header {
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

.mission-header h2 {
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

.task-container {
  max-width: 900px;
  margin: 0 auto;
  margin-bottom: 30px;
}

.task-card {
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 3px solid var(--accent-color);
  border-radius: 8px;
  padding: 35px;
  box-shadow: 0 0 30px rgba(95, 179, 213, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.6),
              0 0 60px rgba(95, 179, 213, 0.08);
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(95, 179, 213, 0.02) 50%, transparent 70%);
  pointer-events: none;
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--accent-color);
  position: relative;
  z-index: 1;
}

.task-number {
  font-size: 11px;
  font-weight: bold;
  color: var(--accent-color);
  text-shadow: 0 0 8px rgba(95, 179, 213, 0.4);
  letter-spacing: 2px;
  background: rgba(95, 179, 213, 0.1);
  padding: 5px 12px;
  border-radius: 3px;
  border: 1px solid var(--accent-color);
}

.task-type {
  font-size: 11px;
  color: var(--warning-color);
  text-shadow: 0 0 8px rgba(107, 114, 128, 0.5);
  letter-spacing: 2px;
  background: rgba(107, 114, 128, 0.1);
  padding: 5px 12px;
  border-radius: 3px;
  border: 1px solid var(--warning-color);
}

.question-text {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.8;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  font-weight: 500;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.option-btn {
  background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%);
  border: 2px solid var(--accent-color);
  color: var(--accent-color);
  padding: 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  font-family: 'Roboto Mono', monospace;
  text-align: left;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.15);
  font-size: 14px;
}

.option-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(95, 179, 213, 0.15), transparent);
  transition: left 0.5s;
}

.option-btn:hover:not(:disabled)::before {
  left: 100%;
}

.option-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a2f4a 0%, #2a3f5a 100%);
  box-shadow: 0 0 25px rgba(95, 179, 213, 0.4);
  transform: translateY(-3px);
  border-color: var(--accent-color);
}

.option-btn.selected {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2) 0%, rgba(74, 157, 111, 0.1) 100%);
  box-shadow: 0 0 25px rgba(95, 179, 213, 0.3);
  border-color: var(--accent-cyan);
}

.option-btn.correct {
  border-color: #4a9d6f;
  background: rgba(74, 157, 111, 0.2);
  box-shadow: 0 0 30px rgba(74, 157, 111, 0.5);
}

.option-btn.wrong {
  border-color: var(--error-color);
  background: rgba(168, 62, 62, 0.2);
  box-shadow: 0 0 30px rgba(168, 62, 62, 0.5);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.puzzle-flavor {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  margin-bottom: 30px;
  font-style: italic;
  position: relative;
  z-index: 1;
  border-left: 3px solid var(--accent-color);
  padding-left: 15px;
  font-weight: 500;
}

.arrow-puzzle {
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.puzzle-instructions {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 25px;
  letter-spacing: 1px;
  font-weight: 500;
}

.tries-remaining {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%);
  border-left: 4px solid var(--warning-color);
  padding: 15px 20px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--text-primary);
  letter-spacing: 1px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(107, 114, 128, 0.15);
  font-weight: 500;
}

.tries-count {
  font-weight: bold;
  color: var(--warning-color);
  text-shadow: 0 0 8px rgba(107, 114, 128, 0.4);
}

.keyboard-hint {
  text-align: center;
  font-size: 13px;
  color: var(--accent-color);
  margin-bottom: 25px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.1) 0%, rgba(95, 179, 213, 0.05) 100%);
  border-left: 3px solid var(--accent-color);
  border-right: 3px solid var(--accent-color);
  letter-spacing: 1px;
  border-radius: 4px;
  font-weight: 500;
}

.flash-sequence {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.15) 0%, rgba(95, 179, 213, 0.05) 100%);
  border: 3px solid var(--accent-color);
  border-radius: 8px;
  padding: 35px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 30px rgba(95, 179, 213, 0.2), inset 0 0 20px rgba(95, 179, 213, 0.08);
  position: relative;
  overflow: hidden;
}

.flash-sequence::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(95, 179, 213, 0.02),
    rgba(95, 179, 213, 0.02) 2px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  animation: scanlines 0.15s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

.flash-timer-bar {
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(95, 179, 213, 0.2);
}

.flash-timer-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--warning-color));
  transition: width 1s linear;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.6);
}

.flash-timer-text {
  position: relative;
  z-index: 2;
  color: var(--accent-color);
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 12px rgba(95, 179, 213, 0.6);
  letter-spacing: 2px;
}

.arrows-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 100%;
  flex-wrap: nowrap;
  position: relative;
  z-index: 1;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.flash-arrow {
  font-size: 64px;
  animation: pulse 0.5s ease-in-out;
  display: inline-flex;
  filter: drop-shadow(0 0 12px rgba(95, 179, 213, 0.6));
  transition: transform 0.1s ease;
}

.user-sequence {
  background: rgba(0, 0, 0, 0.7);
  border-left: 4px solid var(--accent-color);
  border-right: 2px solid var(--accent-color);
  padding: 20px;
  margin-bottom: 25px;
  min-height: 50px;
  display: flex;
  gap: 15px;
  align-items: center;
  border-radius: 4px;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6), 0 0 15px rgba(95, 179, 213, 0.15);
}

.input-arrow {
  font-size: 28px;
  animation: pulse 0.3s ease;
}

.feedback {
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  font-size: 16px;
}

.feedback.correct {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.15) 0%, rgba(74, 157, 111, 0.08) 100%);
  border: 2px solid #4a9d6f;
  color: var(--accent-dark);
  box-shadow: 0 0 25px rgba(74, 157, 111, 0.3);
}

.feedback.wrong {
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.15) 0%, rgba(168, 62, 62, 0.08) 100%);
  border: 2px solid var(--error-color);
  color: var(--error-color);
  box-shadow: 0 0 25px rgba(168, 62, 62, 0.3);
}

.next-btn, .return-btn {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2) 0%, rgba(74, 157, 111, 0.12) 100%);
  border: 2px solid var(--accent-color);
  color: var(--accent-color);
  padding: 15px 40px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Roboto Mono', monospace;
  text-transform: uppercase;
  display: block;
  margin: 25px auto 0;
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.2);
  position: relative;
  overflow: hidden;
}

.next-btn::before, .return-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(95, 179, 213, 0.15), transparent);
  transition: left 0.5s;
}

.next-btn:hover::before, .return-btn:hover::before {
  left: 100%;
}

.next-btn:hover, .return-btn:hover {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.3) 0%, rgba(74, 157, 111, 0.2) 100%);
  box-shadow: 0 0 35px rgba(95, 179, 213, 0.4);
  transform: translateY(-2px);
  border-color: var(--accent-color);
}

.mission-complete {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.15) 0%, rgba(74, 157, 111, 0.08) 100%);
  border: 3px solid #4a9d6f;
  border-radius: 8px;
  margin-top: 25px;
  box-shadow: 0 0 30px rgba(74, 157, 111, 0.3);
  position: relative;
  z-index: 1;
}

.mission-failed {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.15) 0%, rgba(168, 62, 62, 0.08) 100%);
  border: 3px solid var(--error-color);
  border-radius: 8px;
  margin-top: 25px;
  box-shadow: 0 0 30px rgba(168, 62, 62, 0.3);
  position: relative;
  z-index: 1;
}

.mission-complete p, .mission-failed p {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.mission-complete p {
  color: var(--accent-dark);
  text-shadow: 0 0 12px rgba(74, 157, 111, 0.5);
}

.mission-failed p {
  color: var(--error-color);
  text-shadow: 0 0 12px rgba(168, 62, 62, 0.5);
}

.mission-complete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.complete-modal {
  background: linear-gradient(135deg, #0f1419 0%, #1a2f4a 100%);
  border: 4px solid var(--accent-color);
  border-radius: 12px;
  padding: 50px;
  text-align: center;
  box-shadow: 0 0 60px rgba(95, 179, 213, 0.4), inset 0 0 40px rgba(0, 0, 0, 0.6);
}

.complete-modal h3 {
  font-size: 36px;
  color: var(--accent-color);
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.5);
  letter-spacing: 3px;
  margin-bottom: 20px;
  font-weight: 700;
}

.complete-modal p {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 35px;
  letter-spacing: 1px;
}

/* Success state button */
.return-btn-success {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.25) 0%, rgba(74, 157, 111, 0.15) 100%) !important;
  border-color: #4a9d6f !important;
  color: var(--accent-dark) !important;
  box-shadow: 0 0 25px rgba(74, 157, 111, 0.4) !important;
}

.return-btn-success:hover {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.35) 0%, rgba(74, 157, 111, 0.25) 100%) !important;
  box-shadow: 0 0 40px rgba(74, 157, 111, 0.6) !important;
  text-shadow: 0 0 12px rgba(74, 157, 111, 0.5);
}

/* Failure state button */
.return-btn-failure {
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.25) 0%, rgba(168, 62, 62, 0.15) 100%) !important;
  border-color: var(--error-color) !important;
  color: var(--error-color) !important;
  box-shadow: 0 0 25px rgba(168, 62, 62, 0.4) !important;
}

.return-btn-failure:hover {
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.35) 0%, rgba(168, 62, 62, 0.25) 100%) !important;
  box-shadow: 0 0 40px rgba(168, 62, 62, 0.6) !important;
  text-shadow: 0 0 12px rgba(168, 62, 62, 0.5);
}
</style>
