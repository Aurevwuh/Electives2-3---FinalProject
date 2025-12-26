<template>
  <!-- Cipher Challenge View - Show First -->
  <CipherView
    v-if="showCipherChallenge && selectedCountry"
    :country="selectedCountry"
    @cipher-complete="startMission"
    @return-to-map="handleReturnToMap"
  />

  <!-- Main Command Center View -->
  <div v-else-if="!showMission" class="command-center">
    <h1>🌍 World Intelligence Overview</h1>

    <!-- Mission Briefing Modal -->
    <div v-if="showBriefing" class="modal-overlay">
      <div class="briefing-modal">
        <div class="briefing-header">
          <h2>🕵️ MISSION BRIEFING</h2>
        </div>
        
        <div class="briefing-content">
          <h3>{{ briefingCountry?.name }}</h3>
          <p class="briefing-description">{{ briefingCountry?.description }}</p>
        </div>

        <div class="briefing-actions">
          <button class="accept-btn" @click="acceptMission">✅ ACCEPT MISSION</button>
          <button class="decline-btn" @click="declineMission">❌ DECLINE</button>
        </div>
      </div>
    </div>

    <div class="world-map-container">
      <!-- SVG World Map -->
      <div class="world-map">
        <div class="map-title">🎯 Click on a country to view missions</div>
        <WorldMap ref="worldMapComponent" :missionCountries="missionCountryNames" @country-selected="onMapCountrySelected" />
      </div>
    </div>

    <!-- Selected Country Missions -->
    <div v-if="selectedCountry && !showBriefing && !showMission" class="missions">
      <h2>{{ selectedCountry.name }} Missions</h2>

      <!-- Questions -->
      <div class="questions">
        <div v-for="q in countryQuestions" :key="q.id" class="question-block">
          <p><strong>Q:</strong> {{ q.question }}</p>
          <div class="options">
            <button v-for="opt in ['option_a','option_b','option_c','option_d']"
                    :key="opt"
                    @click="checkAnswer(q, opt)">
              {{ q[opt] }}
            </button>
          </div>
          <p v-if="lastQuestionResult[q.id] !== undefined" 
             :class="{'correct': lastQuestionResult[q.id], 'wrong': !lastQuestionResult[q.id]}">
            {{ lastQuestionResult[q.id] ? "✅ Correct!" : "❌ Wrong!" }}
          </p>
        </div>
      </div>

      <!-- Arrow Puzzles -->
      <div class="puzzles">
        <div v-for="p in countryPuzzles" :key="p.id" class="puzzle-block">
          <p><strong>Puzzle:</strong> {{ p.flavor_text }}</p>

          <div v-if="p.puzzle_type === 'arrow'" class="arrow-puzzle">
            <p>Memorize the sequence and reproduce it using arrow keys or buttons:</p>

            <!-- Flash sequence -->
            <div v-if="showFlash[p.id]" class="flash-sequence">
              <span v-for="arrow in getSolutionArrows(p)" :key="arrow" class="flash-arrow">
                {{ arrow }}
              </span>
            </div>

            <!-- Arrow input buttons -->
            <div class="arrow-buttons">
              <button v-for="dir in ['up','down','left','right']" 
                      :key="dir" 
                      @click="arrowClick(p, dir)">
                {{ dir.toUpperCase() }}
              </button>
            </div>

            <!-- Player input -->
            <div class="user-sequence">
              <span v-for="d in userArrowInput[p.id]" :key="d" class="input-arrow">
                {{ arrowMap[d] }}
              </span>
            </div>

            <p v-if="lastResult[p.id] !== undefined" 
               :class="{'correct': lastResult[p.id], 'wrong': !lastResult[p.id]}">
              {{ lastResult[p.id] ? "✅ Correct!" : "❌ Wrong!" }}
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Mission View (One-by-One) - Full Screen -->
  <MissionView
    v-else-if="showMission && selectedCountry"
    :country="selectedCountry"
    :questions="countryQuestions"
    :puzzles="countryPuzzles"
    @return-to-map="handleReturnToMap" />
</template>

<script>
import { supabase, normalizeCountryName } from '../library/supabase.js';
import soundManager from '../library/soundManager.js';
import WorldMap from '../components/WorldMap.vue';
import MissionView from './MissionView.vue';
import CipherView from './CipherView.vue';

export default {
  components: { WorldMap, MissionView, CipherView },
  data() {
    return {
      countries: [],
      countriesWithQuestions: [], // Track which countries have questions
      selectedCountry: null,
      briefingCountry: null,
      showBriefing: false,
      showMission: false,
      showCipherChallenge: false,
      countryQuestions: [],
      countryPuzzles: [],
      userArrowInput: {},        // track arrow puzzle inputs
      progress: {},              // localStorage-based progress
      lastResult: {},            // for arrow puzzles ✔️/❌
      lastQuestionResult: {},    // for questions ✔️/❌
      showFlash: {},             // flash sequence visibility
      arrowMap: { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' },
      hoveredCountry: null,      // track hovered country on map
    }
  },

  mounted() {
    this.loadCountries();
    this.loadProgress();
    window.addEventListener('keydown', this.handleKeyboardInput);
    // Start ambient world view sounds when viewing the map
    soundManager.startAmbientCycle(7000); // Play ambient sound every 7 seconds
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyboardInput);
    // Stop ambient sounds when leaving the view
    soundManager.stopAmbientCycle();
  },

  computed: {
    missionCountryNames() {
      // Only return countries that have questions
      return this.countriesWithQuestions.map(c => c.name);
    }
  },

  methods: {
    async loadCountries() {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name", { ascending: true });
      if (!error) {
        this.countries = data;
        // Load which countries have questions
        await this.checkCountriesWithQuestions();
      }
    },

    async checkCountriesWithQuestions() {
      // Fetch all questions to identify which countries have them
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("country_id");
      
      if (qError) {
        console.error('Error fetching questions:', qError);
        this.countriesWithQuestions = [];
        return;
      }

      // Create a set of country IDs that have questions
      const countryIdsWithQuestions = new Set();
      if (questions && questions.length > 0) {
        questions.forEach(q => {
          if (q.country_id) {
            countryIdsWithQuestions.add(q.country_id);
          }
        });
      }

      // Filter countries to only those with questions
      this.countriesWithQuestions = this.countries.filter(country =>
        countryIdsWithQuestions.has(country.id)
      );
    },

    async selectCountry(country) {
      this.selectedCountry = country;

      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("country_id", country.id);
      if (!qError) this.countryQuestions = questions;

      // Fetch puzzles
      const { data: puzzles, error: pError } = await supabase
        .from("puzzles")
        .select("*")
        .eq("country_id", country.id);
      if (!pError) {
        // Only take the first puzzle as a bonus challenge
        this.countryPuzzles = puzzles ? puzzles.slice(0, 1) : [];
        puzzles?.forEach(p => {
          if (p.puzzle_type === 'arrow') this.userArrowInput[p.id] = [];
          this.showFlash[p.id] = true;
          // Hide flash after 4 seconds
          setTimeout(() => { this.showFlash[p.id] = false; }, 4000);
        });
      }
    },

    onMapCountrySelected(countryName) {
      // WorldMap returns the exact country name from the SVG
      // Need to find matching country in database (accounting for name variations)
      const country = this.countries.find(c => {
        // Try exact match first
        if (c.name === countryName) return true;
        
        // Try normalized comparison (e.g., "Russia" in DB matches "Russian Federation" from SVG)
        // Import normalizeCountryName to handle variations
        const dbNormalized = normalizeCountryName(c.name);
        const svgNormalized = normalizeCountryName(countryName);
        return dbNormalized && svgNormalized && 
               dbNormalized.toLowerCase() === svgNormalized.toLowerCase();
      });
      
      if (country) {
        // Show briefing modal instead of immediately loading missions
        this.briefingCountry = country;
        this.showBriefing = true;
      } else {
        console.log('Country not found:', countryName);
      }
    },

    closeBriefing() {
      this.showBriefing = false;
      this.briefingCountry = null;
      
      // Clear the country selection on the map
      if (this.$refs.worldMapComponent) {
        this.$refs.worldMapComponent.clearSelection();
      }
    },

    acceptMission() {
      if (this.briefingCountry) {
        // Stop ambient sounds when entering mission
        soundManager.stopAmbientCycle();
        this.selectCountry(this.briefingCountry).then(() => {
          this.showBriefing = false;
          this.selectedCountry = this.briefingCountry;
          this.showCipherChallenge = true;  // Show cipher challenge first
        });
      }
    },

    declineMission() {
      this.closeBriefing();
    },

    startMission() {
      // Cipher challenge completed, now show the main mission
      this.showCipherChallenge = false;
      this.showMission = true;
    },

    handleReturnToMap() {
      console.log('handleReturnToMap() called in parent');
      this.showMission = false;
      this.showCipherChallenge = false;
      this.selectedCountry = null;
      this.countryQuestions = [];
      this.countryPuzzles = [];
      
      // Clear the country selection on the map
      if (this.$refs.worldMapComponent) {
        this.$refs.worldMapComponent.clearSelection();
      }
      
      // Restart ambient sounds when returning to map
      soundManager.startAmbientCycle(7000);
      console.log('Return to map completed - flags reset');
    },

    checkAnswer(question, optionKey) {
      if (!this.progress[this.selectedCountry.id])
        this.progress[this.selectedCountry.id] = { questions: {}, puzzles: {} };

      const selected = optionKey.split('_')[1]; // 'a', 'b', 'c', or 'd'
      const correct = selected.toLowerCase() === question.correct_answer.toLowerCase();

      this.progress[this.selectedCountry.id].questions[question.id] = correct;
      this.lastQuestionResult[question.id] = correct;
      this.saveProgress();
    },

    handleKeyboardInput(event) {
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };

      if (!keyMap[event.key] || !this.selectedCountry) return;

      const puzzle = this.countryPuzzles.find(p => p.puzzle_type === 'arrow');
      if (!puzzle) return;

      event.preventDefault();
      this.arrowClick(puzzle, keyMap[event.key]);
    },

    getSolutionArrows(puzzle) {
      let solution = puzzle.solution;
      if (typeof solution === 'string') {
        try {
          solution = JSON.parse(solution);
        } catch { solution = solution.split(','); }
      }
      return solution.map(dir => this.arrowMap[dir]);
    },

    arrowClick(puzzle, dir) {
      if (!this.userArrowInput[puzzle.id]) this.userArrowInput[puzzle.id] = [];
      this.userArrowInput[puzzle.id].push(dir);

      let solution = puzzle.solution;
      if (typeof solution === 'string') {
        try { solution = JSON.parse(solution); } 
        catch { solution = solution.split(','); }
      }

      if (this.userArrowInput[puzzle.id].length === solution.length) {
        const correct = JSON.stringify(this.userArrowInput[puzzle.id]) === JSON.stringify(solution);
        if (!this.progress[this.selectedCountry.id])
          this.progress[this.selectedCountry.id] = { questions: {}, puzzles: {} };
        this.progress[this.selectedCountry.id].puzzles[puzzle.id] = correct;
        this.lastResult[puzzle.id] = correct;
        this.saveProgress();
        this.userArrowInput[puzzle.id] = []; // reset input for next attempt
      }
    },

    saveProgress() {
      localStorage.setItem('missionProgress', JSON.stringify(this.progress));
    },

    loadProgress() {
      const stored = localStorage.getItem('missionProgress');
      if (stored) this.progress = JSON.parse(stored);
    },

    isCompleted(country) {
      return this.progress[country.id] &&
             Object.values(this.progress[country.id].questions || {}).every(v => v === true) &&
             Object.values(this.progress[country.id].puzzles || {}).every(v => v === true);
    },
  }
}
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

h1 {
  color: var(--accent-color);
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.5);
  letter-spacing: 2px;
  margin-bottom: 30px;
  font-size: 32px;
  text-transform: uppercase;
  font-weight: 700;
}

h2 {
  color: var(--accent-color);
  text-shadow: 0 0 8px rgba(95, 179, 213, 0.4);
  letter-spacing: 2px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 10px;
  font-weight: 700;
}

h3 {
  color: var(--accent-color);
  text-shadow: 0 0 8px rgba(95, 179, 213, 0.4);
  letter-spacing: 2px;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 700;
}

/* Mission Briefing Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.briefing-modal {
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  border: 3px solid var(--accent-color);
  border-radius: 8px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 0 30px rgba(95, 179, 213, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.7);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.briefing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 15px;
}

.briefing-header h2 {
  margin: 0;
  border: none;
  padding: 0;
}

.close-btn {
  background: transparent;
  border: 2px solid var(--error-color);
  color: var(--error-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(168, 62, 62, 0.1);
  box-shadow: 0 0 15px rgba(168, 62, 62, 0.5);
}

.briefing-content {
  margin-bottom: 30px;
}

.briefing-description {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
  margin: 15px 0;
  padding: 15px;
  background: rgba(95, 179, 213, 0.05);
  border-left: 3px solid var(--accent-color);
}

.briefing-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.accept-btn, .decline-btn {
  padding: 12px 30px;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.accept-btn {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.15) 0%, rgba(74, 157, 111, 0.08) 100%);
  border: 2px solid var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.2);
}

.accept-btn:hover {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.25) 0%, rgba(74, 157, 111, 0.15) 100%);
  box-shadow: 0 0 25px rgba(95, 179, 213, 0.4);
  transform: scale(1.05);
}

.decline-btn {
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.15) 0%, rgba(139, 90, 141, 0.08) 100%);
  border: 2px solid var(--error-color);
  color: var(--error-color);
  box-shadow: 0 0 15px rgba(168, 62, 62, 0.2);
}

.decline-btn:hover {
  background: linear-gradient(135deg, rgba(168, 62, 62, 0.25) 0%, rgba(139, 90, 141, 0.15) 100%);
  box-shadow: 0 0 25px rgba(168, 62, 62, 0.4);
  transform: scale(1.05);
}

h4 {
  color: var(--accent-dark);
  letter-spacing: 1px;
  margin-bottom: 12px;
}

p {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
}

/* Country Buttons */
div > button {
  background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%);
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  padding: 12px 20px;
  margin: 8px;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(95, 179, 213, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.5);
}

div > button:hover {
  background: linear-gradient(135deg, #2a3f5a 0%, #1a2332 100%);
  color: var(--accent-color);
  border-color: var(--warning-color);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.4), inset 0 0 10px rgba(95, 179, 213, 0.15);
  transform: translateY(-2px);
}

div > button:active {
  transform: translateY(0);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3), inset 0 0 10px rgba(95, 179, 213, 0.1);
}

.map-svg {
  width: 100%;
  height: auto;
  min-height: 400px;
  cursor: pointer;
}

/* Questions & Puzzles */
.question-block, .puzzle-block {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%);
  border: 2px solid var(--accent-color);
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.question-block strong, .puzzle-block strong {
  color: var(--accent-color);
  text-shadow: 0 0 5px rgba(95, 179, 213, 0.3);
}

/* Arrow Buttons */
button[style*="font-size: 24px"] {
  background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%);
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(95, 179, 213, 0.2);
}

button[style*="font-size: 24px"]:hover {
  background: linear-gradient(135deg, #2a3f5a 0%, #1a2332 100%);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.4);
  transform: scale(1.05);
}

/* Solution Path */
/* World Map Container */
.world-map-container {
  margin-bottom: 30px;
}

.world-map {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%);
  border: 3px solid var(--accent-color);
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5);
  position: relative;
}

.map-title {
  text-align: center;
  color: var(--accent-color);
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-shadow: 0 0 5px rgba(95, 179, 213, 0.3);
}

.map-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  aspect-ratio: 2000 / 857;
}

.world-map-bg {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  filter: invert(1) hue-rotate(180deg) brightness(0.7) saturate(1.5);
}

.map-overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

/* Input Fields */
input[type="number"] {
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  padding: 10px;
  font-family: 'Roboto Mono', monospace;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(95, 179, 213, 0.15);
  font-size: 14px;
}

input[type="number"]:focus {
  outline: none;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(95, 179, 213, 0.3);
}

input[type="number"]::placeholder {
  color: var(--text-secondary);
}

/* Sequence Display */
.sequence-display {
  background: rgba(0, 0, 0, 0.6);
  color: var(--accent-color);
  padding: 10px;
  border-left: 3px solid var(--accent-color);
  margin-top: 10px;
  font-size: 18px;
  letter-spacing: 2px;
}

/* Status Messages */
.correct {
  color: var(--accent-dark);
  font-weight: bold;
  text-shadow: 0 0 10px rgba(74, 157, 111, 0.5);
}

.wrong {
  color: var(--error-color);
  font-weight: bold;
  text-shadow: 0 0 10px rgba(168, 62, 62, 0.5);
}

/* Hint Text */
em {
  color: var(--accent-color);
  font-style: italic;
  text-shadow: 0 0 5px rgba(95, 179, 213, 0.3);
}

/* Small text */
small, p[style*="font-size: 12px"] {
  color: var(--text-secondary);
  font-size: 12px;
}

</style>

