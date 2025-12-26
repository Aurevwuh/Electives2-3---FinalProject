<template>
  <div class="cipher-puzzle-container">
    <div class="puzzle-header">
      <h3>🔐 Cipher Puzzle Editor</h3>
      <button @click="closeEditor" class="btn-close">✕</button>
    </div>

    <div class="puzzle-content">
      <!-- ADD NEW CIPHER PUZZLE -->
      <div v-if="!selectedPuzzle" class="add-section">
        <h4>Create New Cipher Puzzle</h4>
        <div class="form-group">
          <label>Puzzle Name *</label>
          <input 
            v-model="newPuzzle.name"
            placeholder="e.g., Caesar Cipher, ROT13, Substitution..."
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea 
            v-model="newPuzzle.description"
            placeholder="Describe the cipher type and rules..."
            rows="3"
            class="input-field"
          ></textarea>
        </div>

        <!-- CAESAR CIPHER AUTO-GENERATOR -->
        <div v-if="newPuzzle.cipher_type === 'Caesar'" class="auto-generate-section">
          <h5>🔄 Auto-Generate Caesar Cipher</h5>
          <div class="auto-gen-form">
            <div class="form-group">
              <label>Plain Text Message</label>
              <input 
                v-model="caesarGenerator.plaintext"
                @input="generateCaesar"
                placeholder="Enter message to encrypt (e.g., GO, HELLO)..."
                class="input-field"
              />
            </div>
            <div class="form-group">
              <label>Shift Value (1-25)</label>
              <input 
                v-model.number="caesarGenerator.shift"
                @input="generateCaesar"
                @change="generateCaesar"
                type="number"
                min="1"
                max="25"
                placeholder="e.g., 3"
                class="input-field"
              />
            </div>
            <div v-if="caesarGenerator.plaintext && caesarGenerator.shift" class="cipher-preview">
              <p><strong>Plain:</strong> {{ caesarGenerator.plaintext }}</p>
              <p><strong>Encrypted (Shift {{ caesarGenerator.shift }}):</strong> {{ caesarGenerator.encrypted }}</p>
            </div>
            <button 
              v-if="caesarGenerator.plaintext && caesarGenerator.shift" 
              @click="applyCaesarGenerated" 
              class="btn btn-apply"
            >
              ✓ Apply This Cipher
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Encrypted Text *</label>
          <textarea 
            v-model="newPuzzle.content"
            placeholder="Enter the encrypted text/cipher..."
            rows="4"
            class="input-field"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Solution/Plain Text *</label>
          <textarea 
            v-model="newPuzzle.solution"
            placeholder="The decrypted/original text..."
            rows="4"
            class="input-field"
          ></textarea>
          <div v-if="newPuzzle.cipher_type === 'Caesar'" class="shift-helper">
            <label>Shift Value (for auto-generation): </label>
            <input 
              v-model.number="newPuzzle.shift"
              type="number"
              min="1"
              max="25"
              placeholder="e.g., 3"
              class="input-field input-small"
            />
          </div>
        </div>

        <div class="cipher-type-select">
          <label>Cipher Type</label>
          <div class="cipher-options">
            <button 
              v-for="type in cipherTypes"
              :key="type"
              @click="newPuzzle.cipher_type = type"
              :class="['cipher-btn', { active: newPuzzle.cipher_type === type }]"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button @click="addPuzzle" class="btn btn-success">💾 Create Puzzle</button>
          <button @click="resetForm" class="btn btn-secondary">Clear</button>
        </div>
      </div>

      <!-- PUZZLE LIST -->
      <div v-else class="puzzles-list">
        <div v-for="puzzle in puzzles" :key="puzzle.id" class="puzzle-item">
          <div class="puzzle-info">
            <h4>{{ puzzle.name }}</h4>
            <p class="cipher-type-badge">{{ puzzle.cipher_type || 'General' }}</p>
            <p class="description">{{ puzzle.description }}</p>
          </div>
          <div class="puzzle-actions">
            <button @click="editPuzzle(puzzle)" class="btn-small btn-edit">✏️ Edit</button>
            <button @click="deletePuzzle(puzzle.id)" class="btn-small btn-delete">🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CipherPuzzleAdmin',
  props: {
    countryId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      puzzles: [],
      selectedPuzzle: null,
      newPuzzle: {
        name: '',
        description: '',
        content: '',
        solution: '',
        cipher_type: 'Caesar',
        shift: 3
      },
      caesarGenerator: {
        plaintext: '',
        shift: 3,
        encrypted: ''
      },
      cipherTypes: [
        'Caesar',
        'ROT13',
        'Substitution',
        'Vigenère',
        'Atbash',
        'Rail Fence',
        'Transposition',
        'Custom'
      ]
    };
  },

  async mounted() {
    await this.loadCipherPuzzles();
  },

  methods: {
    async loadCipherPuzzles() {
      try {
        const { getCipherPuzzlesByCountry } = await import('../library/supabase.js');
        const result = await getCipherPuzzlesByCountry(this.countryId);
        
        if (result.success) {
          this.puzzles = result.data || [];
        }
      } catch (err) {
        console.error('Error loading cipher puzzles:', err);
        alert('Failed to load puzzles');
      }
    },

    async addPuzzle() {
      if (!this.validatePuzzle(this.newPuzzle)) return;

      try {
        const { addCipherPuzzle } = await import('../library/supabase.js');
        const puzzleData = {
          ...this.newPuzzle,
          country_id: this.countryId
        };

        const result = await addCipherPuzzle(puzzleData);
        
        if (result.success) {
          this.puzzles.push(result.data);
          this.resetForm();
          alert('Cipher puzzle created successfully!');
        } else {
          alert('Failed to create puzzle');
        }
      } catch (err) {
        console.error('Error adding puzzle:', err);
        alert('Error creating puzzle');
      }
    },

    async deletePuzzle(puzzleId) {
      if (!confirm('Delete this cipher puzzle?')) return;

      try {
        const { deleteCipherPuzzle } = await import('../library/supabase.js');
        const result = await deleteCipherPuzzle(puzzleId);
        
        if (result.success) {
          this.puzzles = this.puzzles.filter(p => p.id !== puzzleId);
          alert('Puzzle deleted successfully!');
        } else {
          alert('Failed to delete puzzle');
        }
      } catch (err) {
        console.error('Error deleting puzzle:', err);
        alert('Failed to delete puzzle');
      }
    },

    editPuzzle(puzzle) {
      this.selectedPuzzle = puzzle;
      this.$emit('edit-puzzle', puzzle);
    },

    validatePuzzle(puzzle) {
      if (!puzzle.name.trim()) {
        alert('Puzzle name is required');
        return false;
      }
      if (!puzzle.description.trim()) {
        alert('Description is required');
        return false;
      }
      if (!puzzle.content.trim()) {
        alert('Encrypted text is required');
        return false;
      }
      if (!puzzle.solution.trim()) {
        alert('Solution is required');
        return false;
      }
      return true;
    },

    resetForm() {
      this.newPuzzle = {
        name: '',
        description: '',
        content: '',
        solution: '',
        cipher_type: 'Caesar',
        shift: 3
      };
      this.caesarGenerator = {
        plaintext: '',
        shift: 3,
        encrypted: ''
      };
    },

    generateCaesar() {
      const { plaintext, shift } = this.caesarGenerator;
      if (!plaintext || shift === undefined || shift === null || shift === '') {
        this.caesarGenerator.encrypted = '';
        return;
      }

      const shiftNum = parseInt(shift) || 3;
      if (shiftNum === 0) {
        this.caesarGenerator.encrypted = plaintext.toUpperCase();
        return;
      }
      
      const normalized = shiftNum % 26;
      let encrypted = '';

      for (let char of plaintext.toUpperCase()) {
        if (char >= 'A' && char <= 'Z') {
          const code = char.charCodeAt(0) - 65;
          const shifted = (code + normalized) % 26;
          encrypted += String.fromCharCode(shifted + 65);
        } else {
          encrypted += char;
        }
      }

      this.caesarGenerator.encrypted = encrypted;
    },

    applyCaesarGenerated() {
      this.newPuzzle.solution = this.caesarGenerator.plaintext.toUpperCase();
      this.newPuzzle.content = this.caesarGenerator.encrypted;
      alert(`Applied: \"${this.caesarGenerator.plaintext}\" → \"${this.caesarGenerator.encrypted}\"`);
    },

    closeEditor() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
:root {
  --primary: #5fb3d5;
  --success: #4a9d6f;
  --danger: #c74545;
  --border: #3a5f7a;
  --text: #e8f4f8;
  --text-secondary: #a8c5d1;
  --dark: #1a2f4a;
}

.cipher-puzzle-container {
  background: linear-gradient(135deg, rgba(26, 47, 74, 0.95), rgba(10, 22, 40, 0.95));
  border: 2px solid var(--primary);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.puzzle-header {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(95, 179, 213, 0.1));
  border-bottom: 2px solid var(--primary);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.puzzle-header h3 {
  margin: 0;
  color: var(--primary);
  font-size: 1.1em;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
  transition: all 0.2s;
}

.btn-close:hover {
  color: var(--danger);
}

.puzzle-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.add-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-section h4 {
  margin: 0 0 8px 0;
  color: var(--primary);
  font-size: 1em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.85em;
}

.input-field {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9em;
  transition: all 0.3s;
  resize: vertical;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.1);
  box-shadow: 0 0 10px rgba(95, 179, 213, 0.2);
}

.input-with-button {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auto-generate-row {
  display: flex;
  gap: 10px;
  margin: -8px 0 8px 0;
  justify-content: center;
}

.btn-auto-gen {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.4), rgba(74, 157, 111, 0.2));
  border: 2px solid var(--success);
  color: var(--success);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-auto-gen:hover {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.6), rgba(74, 157, 111, 0.4));
  box-shadow: 0 0 12px rgba(74, 157, 111, 0.5);
  transform: translateY(-2px);
}

.btn-auto-gen:active {
  transform: translateY(0);
}

.shift-helper {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
  padding: 8px;
  background: rgba(74, 157, 111, 0.1);
  border: 1px solid rgba(74, 157, 111, 0.3);
  border-radius: 4px;
}

.shift-helper label {
  color: var(--success);
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
}

.input-small {
  width: 80px !important;
  padding: 6px 8px !important;
  font-size: 0.85em !important;
}

.cipher-type-select {
  margin: 8px 0;
}

.cipher-type-select label {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.85em;
  display: block;
  margin-bottom: 8px;
}

.cipher-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.cipher-btn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: 600;
  transition: all 0.2s;
}

.cipher-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.cipher-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #000;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9em;
  flex: 1;
}

.btn-success {
  background: var(--success);
  color: #fff;
}

.btn-success:hover {
  background: #3a8d5f;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text);
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.puzzles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.puzzle-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.puzzle-item:hover {
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.05);
  box-shadow: 0 5px 15px rgba(95, 179, 213, 0.1);
}

.puzzle-info {
  flex: 1;
}

.puzzle-info h4 {
  margin: 0 0 4px 0;
  color: var(--primary);
  font-size: 0.95em;
}

.cipher-type-badge {
  background: rgba(95, 179, 213, 0.2);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: 600;
  width: fit-content;
  margin: 0 0 6px 0;
}

.description {
  color: var(--text-secondary);
  font-size: 0.85em;
  margin: 0;
  line-height: 1.3;
}

.puzzle-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-small {
  padding: 5px 10px;
  font-size: 0.8em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: rgba(95, 179, 213, 0.2);
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-edit:hover {
  background: var(--primary);
  color: #000;
}

.btn-delete {
  background: rgba(199, 69, 69, 0.2);
  color: #ff6b6b;
  border: 1px solid #c74545;
}

.btn-delete:hover {
  background: #c74545;
  color: #fff;
}

/* SCROLLBAR */
.puzzle-content::-webkit-scrollbar {
  width: 6px;
}

.puzzle-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.puzzle-content::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}

.puzzle-content::-webkit-scrollbar-thumb:hover {
  background: #4fa3c5;
}

@media (max-width: 768px) {
  .cipher-options {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .puzzle-item {
    flex-direction: column;
  }

  .puzzle-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.auto-generate-section {
  background: rgba(74, 157, 111, 0.1);
  border: 2px solid rgba(74, 157, 111, 0.4);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.auto-generate-section h5 {
  margin: 0 0 10px 0;
  color: var(--success);
  font-size: 0.95em;
}

.auto-gen-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cipher-preview {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--success);
  padding: 10px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 0.85em;
}

.cipher-preview p {
  margin: 4px 0;
  color: var(--text);
}

.cipher-preview strong {
  color: var(--success);
}

.btn-apply {
  background: var(--success);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.btn-apply:hover {
  background: #3a8d5f;
  transform: translateY(-2px);
}</style>