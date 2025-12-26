<template>
  <div class="cipher-puzzle-container">
    <header class="view-header">
      <h1>🔐 Caesar Cipher Puzzles</h1>
      <p class="subtitle">Manage caesar cipher puzzles from Supabase</p>
    </header>

    <div class="main-content">
      <!-- SHIFT SELECTOR SIDEBAR -->
      <aside class="shift-sidebar">
        <div class="sidebar-header">
          <h2>📍 Shifts</h2>
          <p class="hint">Select a shift to view puzzles</p>
        </div>

        <div class="shifts-list">
          <button
            v-for="shift in [1, 2, 3, 4, 5]"
            :key="shift"
            @click="selectedShift = shift"
            :class="['shift-btn', { active: selectedShift === shift }]"
          >
            Shift {{ shift }}
            <span class="puzzle-count">{{ getPuzzleCountByShift(shift) }}</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-panel">
        <!-- CONTROLS -->
        <div class="controls-section">
          <button @click="loadPuzzles" class="btn btn-primary">
            🔄 Refresh Puzzles
          </button>
          <button @click="showAddForm = !showAddForm" class="btn btn-primary">
            {{ showAddForm ? '✖ Cancel' : '➕ Add New Puzzle' }}
          </button>
          <div class="filter-info">
            Shift {{ selectedShift }}: <strong>{{ puzzlesByShift.length }}</strong> puzzles
          </div>
        </div>

        <!-- ADD PUZZLE FORM -->
        <div v-if="showAddForm" class="form-section">
          <h2>Add New Caesar Cipher Puzzle - Shift {{ selectedShift }}</h2>
          <form @submit.prevent="addNewPuzzle" class="puzzle-form">
            <div class="form-group">
              <label>Solution (Decrypted):</label>
              <input v-model="newPuzzle.solution" type="text" required placeholder="Enter the answer">
            </div>

            <div class="form-group">
              <label>Shift Value (1-5):</label>
              <input v-model.number="newPuzzle.shift" type="number" min="1" max="5" required placeholder="1-5">
            </div>

            <button 
              v-if="newPuzzle.solution && newPuzzle.shift"
              type="button"
              @click="autoGenerateEncrypted"
              class="btn btn-auto-gen"
              style="margin: 10px 0;"
            >
              🔄 Generate Encrypted Text (Shift {{ newPuzzle.shift }})
            </button>

            <div v-if="newPuzzle.encrypted" class="form-group generated-display">
              <label>Generated Encrypted Text:</label>
              <div class="encrypted-display">{{ newPuzzle.encrypted }}</div>
            </div>

            <div class="form-group">
              <label>Difficulty:</label>
              <select v-model="newPuzzle.difficulty">
                <option value="Rookie">Rookie</option>
                <option value="Agent">Agent</option>
                <option value="Operative">Operative</option>
                <option value="Veteran">Veteran</option>
                <option value="Master Spy">Master Spy</option>
              </select>
            </div>

            <div class="form-group">
              <label>Context (Optional):</label>
              <input v-model="newPuzzle.context" type="text" placeholder="e.g., Moscow, 1962 - First contact from our mole">
            </div>

            <button type="submit" class="btn btn-success" :disabled="!newPuzzle.encrypted">Save Puzzle</button>
          </form>
        </div>

        <!-- PUZZLES LIST -->
        <div class="puzzles-section">
          <h2>Shift {{ selectedShift }} Puzzles ({{ puzzlesByShift.length }})</h2>
          
          <div v-if="puzzlesByShift.length === 0" class="empty-state">
            <p>No caesar cipher puzzles found for Shift {{ selectedShift }}. Add one to get started!</p>
          </div>

          <div v-else class="puzzles-grid">
            <div v-for="puzzle in puzzlesByShift" :key="puzzle.id" class="puzzle-card">
              <div class="puzzle-header">
                <h3>{{ puzzle.puzzle_data?.context || 'Caesar Cipher' }}</h3>
                <span class="difficulty-badge" :class="puzzle.puzzle_data?.difficulty?.toLowerCase()">
                  {{ puzzle.puzzle_data?.difficulty || 'N/A' }}
                </span>
              </div>

              <div class="puzzle-content">
                <div class="puzzle-field">
                  <label>Encrypted Text:</label>
                  <p class="puzzle-text">{{ puzzle.puzzle_data?.encrypted }}</p>
                </div>

                <div class="puzzle-field">
                  <label>Solution:</label>
                  <p class="answer-text">{{ puzzle.solution }}</p>
                </div>

                <div class="puzzle-field">
                  <label>Shift:</label>
                  <p>{{ puzzle.puzzle_data?.shift }}</p>
                </div>

                <div class="puzzle-field">
                  <label>Country:</label>
                  <p>{{ getCountryName(puzzle.country_id) || 'Global' }}</p>
                </div>
              </div>

              <div class="puzzle-actions">
                <button @click="editPuzzle(puzzle)" class="btn btn-small btn-secondary">
                  ✏️ Edit
                </button>
                <button @click="deletePuzzleConfirm(puzzle.id)" class="btn btn-small btn-danger">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- EDIT MODAL -->
        <div v-if="editingPuzzle" class="modal-overlay" @click.self="editingPuzzle = null">
          <div class="modal">
            <h2>Edit Puzzle</h2>
            <form @submit.prevent="saveEdit" class="puzzle-form">
              <div class="form-group">
                <label>Encrypted Text:</label>
                <input v-model="editingPuzzle.puzzle_data.encrypted" type="text" required>
              </div>

              <div class="form-group">
                <label>Solution:</label>
                <input v-model="editingPuzzle.solution" type="text" required>
              </div>

              <div class="form-group">
                <label>Shift Value:</label>
                <input v-model.number="editingPuzzle.puzzle_data.shift" type="number" min="1" max="25">
              </div>

              <div class="form-group">
                <label>Difficulty:</label>
                <select v-model="editingPuzzle.puzzle_data.difficulty">
                  <option value="Rookie">Rookie</option>
                  <option value="Agent">Agent</option>
                  <option value="Operative">Operative</option>
                  <option value="Veteran">Veteran</option>
                  <option value="Master Spy">Master Spy</option>
                </select>
              </div>

              <div class="form-group">
                <label>Context:</label>
                <input v-model="editingPuzzle.puzzle_data.context" type="text">
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-success">Save Changes</button>
                <button type="button" @click="editingPuzzle = null" class="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllPuzzles, updatePuzzle, deletePuzzle, addPuzzle, getCountriesByIds } from '../library/supabase.js'

export default {
  name: 'CipherPuzzleView',
  data() {
    return {
      allPuzzles: [],
      countries: [],
      showAddForm: false,
      editingPuzzle: null,
      selectedShift: 1,
      newPuzzle: {
        encrypted: '',
        solution: '',
        shift: 3,
        difficulty: 'Operative',
        context: ''
      }
    }
  },
  computed: {
    caesarPuzzles() {
      return this.allPuzzles.filter(p => p.puzzle_type === 'caesar_cipher')
    },
    puzzlesByShift() {
      return this.caesarPuzzles.filter(p => {
        const puzzleShift = p.puzzle_data?.shift
        return puzzleShift === this.selectedShift
      })
    }
  },
  mounted() {
    this.loadPuzzles()
    this.loadCountries()
  },
  methods: {
    getPuzzleCountByShift(shift) {
      return this.caesarPuzzles.filter(p => p.puzzle_data?.shift === shift).length
    },

    async loadPuzzles() {
      console.log('Loading puzzles from Supabase...')
      const result = await getAllPuzzles()
      if (result.success) {
        this.allPuzzles = result.data || []
        console.log(`Loaded ${this.allPuzzles.length} total puzzles, ${this.caesarPuzzles.length} caesar cipher`)
      } else {
        console.error('Error loading puzzles:', result.error)
        alert('Failed to load puzzles')
      }
    },

    async loadCountries() {
      const result = await getCountriesByIds()
      if (result.success) {
        this.countries = result.data || []
        console.log('Countries loaded:', this.countries.length)
      }
    },

    getCountryName(countryId) {
      if (!countryId) return null
      const country = this.countries.find(c => c.id === countryId)
      return country ? country.name : null
    },

    async addNewPuzzle() {
      if (!this.newPuzzle.encrypted || !this.newPuzzle.solution) {
        alert('Please fill in all required fields')
        return
      }

      const puzzleData = {
        puzzle_type: 'caesar_cipher',
        puzzle_data: JSON.stringify({
          encrypted: this.newPuzzle.encrypted,
          shift: this.selectedShift,
          difficulty: this.newPuzzle.difficulty,
          context: this.newPuzzle.context
        }),
        solution: this.newPuzzle.solution
      }

      console.log('Adding new puzzle:', puzzleData)
      const result = await addPuzzle(puzzleData)

      if (result.success) {
        console.log('Puzzle added successfully')
        this.newPuzzle = {
          encrypted: '',
          solution: '',
          shift: 3,
          difficulty: 'Operative',
          context: ''
        }
        this.showAddForm = false
        await this.loadPuzzles()
        alert('Cipher puzzle added successfully!')
      } else {
        console.error('Error adding puzzle:', result.error)
        alert('Failed to add puzzle: ' + (result.error?.message || 'Unknown error'))
      }
    },

    autoGenerateEncrypted() {
      const plaintext = this.newPuzzle.solution;
      const shift = this.newPuzzle.shift;

      if (!plaintext || shift === undefined || shift === null || shift === '') {
        alert('Please enter solution text and shift value');
        return;
      }

      const shiftNum = parseInt(shift) || this.selectedShift;
      if (shiftNum === 0) {
        this.newPuzzle.encrypted = plaintext.toUpperCase();
        alert(`Generated: "${plaintext}" → "${plaintext.toUpperCase()}"`);
        return;
      }

      const normalized = shiftNum % 26;
      let encrypted = '';

      for (let char of plaintext.toUpperCase()) {
        if (char >= 'A' && char <= 'Z') {
          const code = char.charCodeAt(0) - 65;
          const shifted = (code - normalized + 26) % 26;
          encrypted += String.fromCharCode(shifted + 65);
        } else {
          encrypted += char;
        }
      }

      this.newPuzzle.encrypted = encrypted;
      alert(`Generated: "${plaintext}" → "${encrypted}" (Shift ${shiftNum})`);
    },

    editPuzzle(puzzle) {
      this.editingPuzzle = JSON.parse(JSON.stringify(puzzle))
      // Scroll modal into view
      this.$nextTick(() => {
        const modal = document.querySelector('.modal')
        if (modal) {
          modal.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },

    async saveEdit() {
      if (!this.editingPuzzle.puzzle_data?.encrypted || !this.editingPuzzle.solution) {
        alert('Please fill in all required fields')
        return
      }

      console.log('Updating puzzle:', this.editingPuzzle.id)
      const result = await updatePuzzle(this.editingPuzzle.id, this.editingPuzzle)

      if (result.success) {
        console.log('Puzzle updated successfully')
        this.editingPuzzle = null
        await this.loadPuzzles()
      } else {
        console.error('Error updating puzzle:', result.error)
        alert('Failed to update puzzle')
      }
    },

    async deletePuzzleConfirm(puzzleId) {
      if (confirm('Are you sure you want to delete this puzzle?')) {
        console.log('Deleting puzzle:', puzzleId)
        const result = await deletePuzzle(puzzleId)

        if (result.success) {
          console.log('Puzzle deleted successfully')
          await this.loadPuzzles()
        } else {
          console.error('Error deleting puzzle:', result.error)
          alert('Failed to delete puzzle')
        }
      }
    }
  }
}
</script>

<style scoped>
.cipher-puzzle-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  color: var(--text-primary);
}

.view-header {
  text-align: center;
  margin-bottom: 1rem;
}

.view-header h1 {
  font-size: 2.5rem;
  font-family: 'Orbitron', sans-serif;
  color: var(--accent-cyan);
  margin: 0;
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.3);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
}

.main-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
}

/* SIDEBAR */
.shift-sidebar {
  background: rgba(26, 35, 50, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--accent-cyan);
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

.shifts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.shift-btn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.shift-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: rgba(95, 179, 213, 0.1);
}

.shift-btn.active {
  background: var(--accent-cyan);
  border-color: var(--accent-cyan);
  color: #000;
}

.puzzle-count {
  background: rgba(95, 179, 213, 0.3);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.shift-btn.active .puzzle-count {
  background: rgba(0, 0, 0, 0.2);
}

/* MAIN PANEL */
.main-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.controls-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: rgba(95, 179, 213, 0.05);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.filter-info {
  margin-left: auto;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.filter-info strong {
  color: var(--accent-cyan);
}

.form-section {
  padding: 2rem;
  background: rgba(95, 179, 213, 0.05);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.form-section h2 {
  color: var(--accent-cyan);
  margin-top: 0;
  font-family: 'Orbitron', sans-serif;
}

.puzzle-form {
  display: grid;
  gap: 1.5rem;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--accent-cyan);
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  border-radius: 4px;
  font-family: 'Space Mono', monospace;
}

.form-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #4fa3c5 !important;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') !important;
  background-repeat: no-repeat !important;
  background-position: right 8px center !important;
  background-size: 20px !important;
  padding-right: 35px !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border: 2px solid #5fb3d5 !important;
}

.form-group select:hover {
  background-color: #4a95b5 !important;
  border-color: #5fb3d5 !important;
  box-shadow: 0 0 8px rgba(95, 179, 213, 0.4) !important;
}

.form-group input:focus {
  outline: none;
  border-color: var(--border-primary);
  background: rgba(0, 0, 0, 0.3);
}

.form-group select:focus {
  outline: none;
  border-color: #5fb3d5 !important;
  background-color: #4fa3c5 !important;
  box-shadow: 0 0 12px rgba(95, 179, 213, 0.5) !important;
}

.form-group select option {
  background: #1a2f4a !important;
  color: #ffffff !important;
  padding: 10px 12px !important;
  font-weight: 600 !important;
}

.form-group select option:hover,
.form-group select option:checked {
  background: linear-gradient(#5fb3d5, #5fb3d5) !important;
  background-color: #5fb3d5 !important;
  color: #ffffff !important;
}

.generated-display {
  background: rgba(95, 179, 213, 0.1);
  border-left: 4px solid #5fb3d5;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.generated-display label {
  color: #5fb3d5;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.encrypted-display {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #5fb3d5;
  padding: 12px;
  border-radius: 4px;
  color: #4a9d6f;
  font-weight: 700;
  font-size: 1.1em;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: 'Space Mono', monospace;
}

.btn-primary {
  background: var(--accent-cyan);
  color: #000;
  border-color: var(--accent-cyan);
}

.btn-primary:hover {
  background: #4a9fd9;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.5);
}

.btn-success {
  background: var(--accent-green);
  color: #fff;
  border-color: var(--accent-green);
}

.btn-success:hover {
  background: #3d8a5e;
  box-shadow: 0 0 15px rgba(74, 157, 111, 0.5);
}

.btn-success:disabled {
  background: #666666;
  border-color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-success:disabled:hover {
  box-shadow: none;
}

.btn-auto-gen {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.4), rgba(74, 157, 111, 0.2));
  color: var(--accent-green);
  border: 2px solid var(--accent-green);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.btn-auto-gen:hover {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.6), rgba(74, 157, 111, 0.4));
  box-shadow: 0 0 12px rgba(74, 157, 111, 0.5);
  transform: translateY(-2px);
}

.btn-auto-gen:active {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
  background: #c44545;
  color: #fff;
  border-color: #c44545;
}

.btn-danger:hover {
  background: #a83636;
  box-shadow: 0 0 15px rgba(196, 69, 69, 0.5);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.puzzles-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.puzzles-section h2 {
  color: var(--accent-cyan);
  font-family: 'Orbitron', sans-serif;
  margin: 0;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background: rgba(95, 179, 213, 0.05);
  border: 1px dashed var(--border-primary);
  border-radius: 8px;
  color: var(--text-secondary);
}

.puzzles-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.puzzle-card {
  background: rgba(26, 35, 50, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.puzzle-card:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.2);
}

.puzzle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.puzzle-header h3 {
  margin: 0;
  color: var(--accent-cyan);
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
}

.difficulty-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.difficulty-badge.rookie {
  background: rgba(76, 175, 80, 0.3);
  color: #4cb050;
}

.difficulty-badge.agent {
  background: rgba(33, 150, 243, 0.3);
  color: #2196f3;
}

.difficulty-badge.operative {
  background: rgba(255, 152, 0, 0.3);
  color: #ff9800;
}

.difficulty-badge.veteran {
  background: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.difficulty-badge.master\ spy {
  background: rgba(156, 39, 176, 0.3);
  color: #9c27b0;
}

.puzzle-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.puzzle-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.puzzle-field label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.puzzle-field p {
  margin: 0;
  color: var(--text-primary);
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-family: 'Space Mono', monospace;
  word-break: break-all;
}

.puzzle-text,
.answer-text {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.puzzle-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.puzzle-actions .btn {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions .btn {
  flex: 1;
}

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--secondary-color);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  color: var(--accent-cyan);
  margin-top: 0;
  font-family: 'Orbitron', sans-serif;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 150px 1fr;
  }

  .puzzles-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .cipher-puzzle-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .view-header h1 {
    font-size: 1.8rem;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .shift-sidebar {
    position: static;
    margin-bottom: -1rem;
  }

  .shifts-list {
    grid-template-columns: repeat(5, 1fr);
    display: grid;
    gap: 0.5rem;
  }

  .shift-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .puzzle-count {
    display: none;
  }

  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-info {
    margin-left: 0;
  }

  .puzzles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
