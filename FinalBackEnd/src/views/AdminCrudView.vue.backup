<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>🔐 ADMIN CONTROL PANEL</h1>
      <p class="subtitle">Manage countries, questions, and arrow puzzles</p>
    </header>

    <!-- COUNTRY EDIT MODAL -->
    <div v-if="showCountryEditModal" class="modal-overlay" @click.self="closeCountryEditModal"></div>
    <div v-if="showCountryEditModal" class="country-edit-modal">
      <div class="modal-header">
        <h2>Edit Country Details</h2>
        <button @click="closeCountryEditModal" class="btn-close">✕</button>
      </div>
      <div class="modal-content">
        <div class="form-group">
          <label>Country Name</label>
          <input v-model="editingCountry.name" type="text" placeholder="e.g., Spain" class="input-field" />
        </div>
        <div class="form-group">
          <label>Region</label>
          <input v-model="editingCountry.region" type="text" placeholder="e.g., Europe" class="input-field" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="editingCountry.description" placeholder="Describe this country..." rows="4" class="input-field"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveCountryChanges" class="btn btn-primary">💾 Save Changes</button>
          <button @click="closeCountryEditModal" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <!-- FULL SCREEN MAP -->
    <div class="map-section-full">
      <WorldMap 
        :missionCountries="countriesWithMissions"
        @country-selected="selectCountryFromMap"
        showAllCountries
        class="world-map-full"
      />
    </div>

    <!-- MODAL OVERLAY -->
    <div v-if="selectedCountry" class="modal-overlay" @click.self="closeModal"></div>

    <!-- MODAL POPUP FOR CONTENT MANAGEMENT -->
    <div v-if="selectedCountry" class="modal-panel">
      <div class="modal-header">
        <div class="header-info">
          <h2>{{ selectedCountry }}</h2>
          <p class="country-stats">{{ questionCount }} Questions • {{ puzzleCount }} Puzzles</p>
          <button @click="openCountryEditModal" class="btn-edit-country">✏️ Edit Country Details</button>
        </div>
        <button @click="closeModal" class="btn-close">✕ Close</button>
      </div>

      <!-- TABS -->
      <div class="tabs-container">
        <div class="tab-buttons">
          <button 
            @click="activeTab = 'questions'"
            :class="['tab-button', { active: activeTab === 'questions' }]"
          >
            📝 Questions
          </button>
          <button 
            @click="activeTab = 'puzzles'"
            :class="['tab-button', { active: activeTab === 'puzzles' }]"
          >
            ➜ Arrow Puzzles
          </button>
        </div>

        <!-- QUESTIONS TAB -->
        <div v-if="activeTab === 'questions'" class="tab-content">
          <div class="tab-header">
            <h3>📝 Questions</h3>
            <button @click="showQuestionForm = !showQuestionForm" class="btn btn-primary">
              {{ showQuestionForm ? '✖ Cancel' : '➕ Add Question' }}
            </button>
          </div>

          <!-- ADD QUESTION FORM -->
          <div v-if="showQuestionForm" class="form-panel">
            <div class="form-section">
              <label>Question Text *</label>
              <textarea 
                v-model="newQuestion.question"
                placeholder="Enter the question..."
                rows="2"
                class="input-field"
              ></textarea>
            </div>

            <div class="options-grid">
              <div class="form-section">
                <label>Option A *</label>
                <input 
                  v-model="newQuestion.option_a"
                  placeholder="Answer A"
                  class="input-field"
                />
              </div>
              <div class="form-section">
                <label>Option B *</label>
                <input 
                  v-model="newQuestion.option_b"
                  placeholder="Answer B"
                  class="input-field"
                />
              </div>
              <div class="form-section">
                <label>Option C *</label>
                <input 
                  v-model="newQuestion.option_c"
                  placeholder="Answer C"
                  class="input-field"
                />
              </div>
              <div class="form-section">
                <label>Option D *</label>
                <input 
                  v-model="newQuestion.option_d"
                  placeholder="Answer D"
                  class="input-field"
                />
              </div>
            </div>

            <div class="form-section">
              <label>Correct Answer *</label>
              <select v-model="newQuestion.correct_answer" class="input-field">
                <option value="">Select the correct answer</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div class="form-actions">
              <button @click="addQuestion" class="btn btn-success">💾 Save Question</button>
              <button @click="showQuestionForm = false" class="btn btn-secondary">Cancel</button>
            </div>
          </div>

          <!-- QUESTIONS LIST -->
          <div class="content-list">
            <div v-if="currentCountryQuestions.length === 0" class="empty-list">
              <p>No questions yet. Add one to get started!</p>
            </div>

            <div 
              v-for="question in currentCountryQuestions"
              :key="question.id"
              class="content-card question-card"
            >
              <div v-if="editingQuestionId !== question.id" class="card-display">
                <div class="question-text">{{ question.question }}</div>
                <div class="options-display">
                  <div 
                    v-for="option in ['A', 'B', 'C', 'D']"
                    :key="option"
                    :class="['option', { correct: question.correct_answer === option }]"
                  >
                    <span class="option-label">{{ option }})</span>
                    <span class="option-text">{{ question[`option_${option.toLowerCase()}`] }}</span>
                    <span v-if="question.correct_answer === option" class="badge">✓ Correct</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button @click="startEditQuestion(question)" class="btn-small btn-edit">✏️ Edit</button>
                  <button @click="deleteQuestion(question.id)" class="btn-small btn-delete">🗑️ Delete</button>
                </div>
              </div>

              <!-- EDIT MODE -->
              <div v-else class="card-edit">
                <div class="edit-form">
                  <div class="form-section">
                    <label>Question</label>
                    <textarea 
                      v-model="editingQuestion.question"
                      rows="2"
                      class="input-field"
                    ></textarea>
                  </div>

                  <div class="options-grid">
                    <div class="form-section">
                      <label>A</label>
                      <input v-model="editingQuestion.option_a" class="input-field" />
                    </div>
                    <div class="form-section">
                      <label>B</label>
                      <input v-model="editingQuestion.option_b" class="input-field" />
                    </div>
                    <div class="form-section">
                      <label>C</label>
                      <input v-model="editingQuestion.option_c" class="input-field" />
                    </div>
                    <div class="form-section">
                      <label>D</label>
                      <input v-model="editingQuestion.option_d" class="input-field" />
                    </div>
                  </div>

                  <div class="form-section">
                    <label>Correct Answer</label>
                    <div class="current-answer" v-if="editingQuestion.correct_answer">
                      <span>Current: <strong>{{ editingQuestion.correct_answer }}</strong> - {{ editingQuestion[`option_${editingQuestion.correct_answer.toLowerCase()}`] }}</span>
                    </div>
                    <select v-model="editingQuestion.correct_answer" class="input-field">
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div class="edit-actions">
                    <button @click="saveEditQuestion" class="btn-small btn-success">💾 Save</button>
                    <button @click="cancelEditQuestion" class="btn-small btn-secondary">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PUZZLES TAB -->
        <div v-if="activeTab === 'puzzles'" class="tab-content">
          <div class="tab-header">
            <h3>➜ Arrow Puzzles</h3>
            <button @click="showPuzzleForm = !showPuzzleForm" class="btn btn-primary">
              {{ showPuzzleForm ? '✖ Cancel' : '➕ Add Puzzle' }}
            </button>
          </div>

          <!-- ADD PUZZLE FORM -->
          <div v-if="showPuzzleForm" class="form-panel">
            <div class="arrow-input-section">
              <label>Enter Arrow Sequence (using arrow keys) *</label>
              <div class="arrow-input-display">
                <input 
                  @keydown="handleArrowKeyInput"
                  placeholder="Click here and press arrow keys (↑↓←→)..."
                  class="arrow-input-field"
                  type="text"
                  readonly
                />
                <div class="arrow-symbols">{{ formatArrowSequence(newPuzzle.solution) }}</div>
              </div>
            </div>

            <div class="form-actions">
              <button @click="addPuzzle" class="btn btn-success" :disabled="!newPuzzle.solution || newPuzzle.solution.length === 0">💾 Save Puzzle</button>
              <button @click="resetPuzzleForm(); showPuzzleForm = false" class="btn btn-secondary">Cancel</button>
            </div>
          </div>

          <!-- PUZZLES LIST -->
          <div class="content-list">
            <div v-if="currentCountryPuzzles.length === 0" class="empty-list">
              <p>No puzzles yet. Add one to get started!</p>
            </div>

            <div 
              v-for="puzzle in currentCountryPuzzles"
              :key="puzzle.id"
              class="content-card puzzle-card"
            >
              <div v-if="editingPuzzleId !== puzzle.id" class="card-display">
                <div class="arrow-puzzle-display">
                  <div class="arrow-sequence-label">Arrow Sequence:</div>
                  <div class="arrow-sequence-display">{{ formatArrowSequence(puzzle.solution) }}</div>
                </div>
                <div class="card-actions">
                  <button @click="startEditPuzzle(puzzle)" class="btn-small btn-edit">✏️ Edit</button>
                  <button @click="deletePuzzle(puzzle.id)" class="btn-small btn-delete">🗑️ Delete</button>
                </div>
              </div>

              <!-- EDIT MODE -->
              <div v-else class="card-edit">
                <div class="edit-form">
                  <div class="form-section">
                    <label>Edit Arrow Sequence</label>
                    <div class="arrow-input-display">
                      <input 
                        @keydown="handleArrowKeyInput"
                        placeholder="Click here and press arrow keys (↑↓←→)..."
                        class="arrow-input-field"
                        type="text"
                        readonly
                      />
                      <div class="arrow-symbols">{{ formatArrowSequence(editingPuzzle.solution) }}</div>
                    </div>
                  </div>

                  <div class="edit-actions">
                    <button @click="saveEditPuzzle" class="btn-small btn-success">💾 Save</button>
                    <button @click="cancelEditPuzzle" class="btn-small btn-secondary">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION SYSTEM -->
    <transition-group name="notification" tag="div" class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <div class="notification-content">
          <span class="notification-icon">{{ notification.icon }}</span>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import WorldMap from '@/components/WorldMap.vue';

export default {
  name: 'AdminCrudView',
  components: {
    WorldMap
  },

  data() {
    return {
      selectedCountry: null,
      selectedCountryId: null,
      countries: [],
      questions: [], // All questions for highlighting
      puzzles: [], // All puzzles for highlighting
      
      // Currently selected country's content (for display in modal)
      currentCountryQuestions: [],
      currentCountryPuzzles: [],

      // Country edit modal
      showCountryEditModal: false,
      editingCountry: {
        name: '',
        region: '',
        description: ''
      },

      // Question form
      showQuestionForm: false,
      newQuestion: {
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: ''
      },
      editingQuestionId: null,
      editingQuestion: null,

      // Puzzle form
      showPuzzleForm: false,
      newPuzzle: {
        solution: []
      },
      editingPuzzleId: null,
      editingPuzzle: null,

      // Tab management
      activeTab: 'questions',

      // Notification system
      notifications: [],
      notificationCounter: 0
    };
  },

  computed: {
    questionCount() {
      return this.currentCountryQuestions.length;
    },
    puzzleCount() {
      return this.currentCountryPuzzles.length;
    },
    countriesWithMissions() {
      // Return list of country names that have questions or puzzles
      const highlighted = this.countries
        .filter(c => {
          const hasQuestions = this.questions.some(q => q.country_id === c.id);
          const hasPuzzles = this.puzzles.some(p => p.country_id === c.id);
          const hasMissions = hasQuestions || hasPuzzles;
          
          if (hasMissions) {
            console.log(`✓ ${c.name} (${c.id}) has missions`);
          }
          
          return hasMissions;
        })
        .map(c => c.name);
      
      console.log('=== countriesWithMissions Updated ===');
      console.log('Total countries with missions:', highlighted.length);
      console.log('Mission countries array:', highlighted);
      console.log('Passing to WorldMap prop:', highlighted);
      return highlighted;
    }
  },

  async mounted() {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      this.showNotification('Access denied. Admin only.', 'error', 2000);
      setTimeout(() => this.$router.push('/'), 2000);
    }

    console.log('AdminCrudView mounted - loading data...');
    await this.loadCountries();
    await this.loadAllQuestionsAndPuzzles();
    console.log('Data loading complete');
    this.$nextTick(() => {
      console.log('After nextTick, countriesWithMissions:', this.countriesWithMissions);
    });
  },

  methods: {
    // ===== NOTIFICATION SYSTEM =====
    showNotification(message, type = 'success', duration = 3000) {
      const id = this.notificationCounter++;
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
      };
      
      const notification = {
        id,
        message,
        type,
        icon: icons[type] || '•'
      };
      
      this.notifications.push(notification);
      
      if (duration > 0) {
        setTimeout(() => {
          this.notifications = this.notifications.filter(n => n.id !== id);
        }, duration);
      }
    },

    // ===== COUNTRY METHODS =====
    async loadCountries() {
      try {
        const { supabase } = await import('../library/supabase.js');
        const { countryCodeToName } = await import('../utils/countryMap.js');
        
        console.log('Loading countries from Supabase...');
        
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Supabase error loading countries:', error);
          this.showNotification('Failed to load countries from database', 'error');
          this.countries = [];
          return;
        }
        
        if (!data || data.length === 0) {
          console.warn('No countries found in database');
          this.countries = [];
          return;
        }
        
        console.log(`Loaded ${data.length} countries from database:`, data.map(c => ({ id: c.id, name: c.name })));
        
        // Normalize country names - convert 2-letter codes to full names if needed
        this.countries = (data || []).map(country => {
          const originalName = country.name?.trim();
          
          // If the name is a 2-letter code, convert it to full name
          if (originalName && originalName.length === 2 && countryCodeToName[originalName]) {
            const fullName = countryCodeToName[originalName];
            console.log(`Converting ${originalName} to ${fullName}`);
            return {
              ...country,
              name: fullName
            };
          }
          return country;
        });
        
        console.log('Processed countries:', this.countries.map(c => ({ id: c.id, name: c.name })));
      } catch (err) {
        console.error('Error loading countries:', err);
        this.showNotification('Failed to load countries', 'error');
        this.countries = [];
      }
    },

    async loadAllQuestionsAndPuzzles() {
      try {
        const { getAllQuestions, getAllPuzzles } = await import('../library/supabase.js');
        
        console.log('Loading questions and puzzles...');
        
        // Load all questions
        const questionsResult = await getAllQuestions();
        this.questions = questionsResult.success ? (questionsResult.data || []) : [];
        console.log(`Loaded ${this.questions.length} questions`);

        // Load all puzzles
        const puzzlesResult = await getAllPuzzles();
        if (puzzlesResult.success) {
          this.puzzles = (puzzlesResult.data || []).map(puzzle => {
            let solution = puzzle.solution;
            if (typeof solution === 'string') {
              try {
                solution = JSON.parse(solution);
              } catch (e) {
                solution = Array.isArray(solution) ? solution : [];
              }
            }
            return {
              ...puzzle,
              solution: Array.isArray(solution) ? solution : []
            };
          });
        }
        console.log(`Loaded ${this.puzzles.length} puzzles`);
        
        // Log detailed info for debugging
        console.log('\n=== DETAILED COUNTRY INFO ===');
        console.log('Countries in array:', this.countries.length);
        this.countries.forEach((c, idx) => {
          const qCount = this.questions.filter(q => q.country_id === c.id).length;
          const pCount = this.puzzles.filter(p => p.country_id === c.id).length;
          console.log(`${idx + 1}. ${c.name} | ID: ${c.id} | Questions: ${qCount} | Puzzles: ${pCount}`);
        });
        
        console.log('\n=== QUESTIONS BREAKDOWN ===');
        const questionsByCountry = {};
        this.questions.forEach(q => {
          if (!questionsByCountry[q.country_id]) {
            questionsByCountry[q.country_id] = 0;
          }
          questionsByCountry[q.country_id]++;
        });
        Object.entries(questionsByCountry).forEach(([countryId, count]) => {
          const country = this.countries.find(c => c.id === countryId);
          console.log(`Country ID: ${countryId} (${country?.name || 'UNKNOWN'}) - ${count} questions`);
        });
        
        console.log('\n=== PUZZLES BREAKDOWN ===');
        const puzzlesByCountry = {};
        this.puzzles.forEach(p => {
          if (!puzzlesByCountry[p.country_id]) {
            puzzlesByCountry[p.country_id] = 0;
          }
          puzzlesByCountry[p.country_id]++;
        });
        Object.entries(puzzlesByCountry).forEach(([countryId, count]) => {
          const country = this.countries.find(c => c.id === countryId);
          console.log(`Country ID: ${countryId} (${country?.name || 'UNKNOWN'}) - ${count} puzzles`);
        });
        
      } catch (err) {
        console.error('Error loading all questions and puzzles:', err);
      }
    },

    async selectCountryFromMap(countryName) {
      try {
        const { getCountryNameFromCode, getRegionFromCountry } = await import('../utils/countryMap.js');
        
        // Get full country name from code if needed
        const fullCountryName = getCountryNameFromCode(countryName);
        
        // Check if country exists in database
        let country = this.countries.find(c => c.name.toLowerCase() === fullCountryName.toLowerCase());
        
        if (!country) {
          // Create a temporary country object (not saved to database yet)
          const region = getRegionFromCountry(fullCountryName);
          country = {
            id: `temp_${Date.now()}`,
            name: fullCountryName,
            region: region,
            description: `${fullCountryName} missions and puzzles`,
            isTemporary: true
          };
          // Add temporary country to the countries array so it can be found later
          this.countries.push(country);
        }

        this.selectedCountry = country.name;
        this.selectedCountryId = country.id;
        this.loadCountryContent(country.id);
      } catch (err) {
        console.error('Error selecting country:', err);
        alert('Failed to select country');
      }
    },

    closeModal() {
      this.selectedCountry = null;
      this.selectedCountryId = null;
      this.showQuestionForm = false;
      this.showPuzzleForm = false;
      this.editingQuestionId = null;
      this.editingPuzzleId = null;
      this.activeTab = 'questions';
    },

    openCountryEditModal() {
      const country = this.countries.find(c => c.id === this.selectedCountryId);
      if (country) {
        this.editingCountry = {
          name: country.name || '',
          region: country.region || '',
          description: country.description || ''
        };
        this.showCountryEditModal = true;
      }
    },

    closeCountryEditModal() {
      this.showCountryEditModal = false;
      this.editingCountry = { name: '', region: '', description: '' };
    },

    async saveCountryChanges() {
      try {
        const { updateCountry } = await import('../library/supabase.js');
        const result = await updateCountry(this.selectedCountryId, this.editingCountry);
        
        if (result.success) {
          // Update local countries list
          const idx = this.countries.findIndex(c => c.id === this.selectedCountryId);
          if (idx !== -1) {
            this.countries[idx] = result.data;
            this.selectedCountry = result.data.name;
          }
          this.closeCountryEditModal();
          alert('Country details saved successfully!');
        } else {
          alert('Failed to save country changes');
        }
      } catch (err) {
        console.error('Error saving country:', err);
        alert('Failed to save country changes');
      }
    },

    async loadCountryContent(countryId) {
      try {
        const { getQuestionsByCountry } = await import('../library/supabase.js');
        const { getPuzzlesByCountry } = await import('../library/supabase.js');

        // Load questions for the selected country
        const questionsResult = await getQuestionsByCountry(countryId);
        this.currentCountryQuestions = questionsResult.success ? (questionsResult.data || []) : [];

        // Load puzzles for the selected country and parse JSON solutions
        const puzzlesResult = await getPuzzlesByCountry(countryId);
        if (puzzlesResult.success) {
          this.currentCountryPuzzles = (puzzlesResult.data || []).map(puzzle => {
            let solution = puzzle.solution;
            if (typeof solution === 'string') {
              try {
                solution = JSON.parse(solution);
              } catch (e) {
                solution = Array.isArray(solution) ? solution : [];
              }
            }
            return {
              ...puzzle,
              solution: Array.isArray(solution) ? solution : []
            };
          });
        } else {
          this.currentCountryPuzzles = [];
        }
      } catch (err) {
        console.error('Error loading country content:', err);
        alert('Failed to load content');
      }
    },

    // ===== QUESTION METHODS =====
    async addQuestion() {
      if (!this.validateQuestion(this.newQuestion)) return;

      try {
        // Ensure country exists before adding question
        const country = await this.ensureCountryExists();
        if (!country) return;

        const { addQuestion } = await import('../library/supabase.js');

        const result = await addQuestion({
          country_id: country.id,
          question: this.newQuestion.question,
          option_a: this.newQuestion.option_a,
          option_b: this.newQuestion.option_b,
          option_c: this.newQuestion.option_c,
          option_d: this.newQuestion.option_d,
          correct_answer: this.newQuestion.correct_answer
        });

        if (result.success) {
          this.questions.push(result.data);
          this.currentCountryQuestions.push(result.data);
          this.resetQuestionForm();
          this.showQuestionForm = false;
          this.showNotification('Question added successfully', 'success');
        }
      } catch (err) {
        console.error('Error adding question:', err);
        this.showNotification('Failed to add question', 'error');
      }
    },

    validateQuestion(q) {
      if (!q.question.trim()) {
        this.showNotification('Question text is required', 'error', 2000);
        return false;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        this.showNotification('All four options are required', 'error', 2000);
        return false;
      }
      if (!q.correct_answer) {
        this.showNotification('Correct answer must be selected', 'error', 2000);
        return false;
      }
      return true;
    },

    startEditQuestion(question) {
      this.editingQuestionId = question.id;
      this.editingQuestion = { ...question };
    },

    cancelEditQuestion() {
      this.editingQuestionId = null;
      this.editingQuestion = null;
    },

    async saveEditQuestion() {
      try {
        const { updateQuestion } = await import('../library/supabase.js');

        const result = await updateQuestion(this.editingQuestion.id, {
          question: this.editingQuestion.question,
          option_a: this.editingQuestion.option_a,
          option_b: this.editingQuestion.option_b,
          option_c: this.editingQuestion.option_c,
          option_d: this.editingQuestion.option_d,
          correct_answer: this.editingQuestion.correct_answer
        });

        if (result.success) {
          const index = this.questions.findIndex(q => q.id === this.editingQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.editingQuestion };
          }
          const currentIndex = this.currentCountryQuestions.findIndex(q => q.id === this.editingQuestion.id);
          if (currentIndex !== -1) {
            this.currentCountryQuestions[currentIndex] = { ...this.editingQuestion };
          }
          this.cancelEditQuestion();
          this.showNotification('Question updated successfully', 'success');
        }
      } catch (err) {
        console.error('Error updating question:', err);
        this.showNotification('Failed to update question', 'error');
      }
    },

    async deleteQuestion(questionId) {
      if (!confirm('Are you sure you want to delete this question?')) return;

      try {
        const { deleteQuestion } = await import('../library/supabase.js');

        const result = await deleteQuestion(questionId);
        if (result.success) {
          this.questions = this.questions.filter(q => q.id !== questionId);
          this.currentCountryQuestions = this.currentCountryQuestions.filter(q => q.id !== questionId);
          this.showNotification('Question deleted successfully', 'success');
        }
      } catch (err) {
        console.error('Error deleting question:', err);
        this.showNotification('Failed to delete question', 'error');
      }
    },

    resetQuestionForm() {
      this.newQuestion = {
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: ''
      };
    },

    // ===== HELPER METHODS =====
    async ensureCountryExists() {
      let country = this.countries.find(c => c.name === this.selectedCountry);
      
      if (!country) {
        alert('Country not found');
        return null;
      }

      // If it's a temporary country, create it in the database
      if (country.isTemporary) {
        try {
          const { addCountry } = await import('../library/supabase.js');
          const result = await addCountry({
            name: country.name,
            description: country.description,
            region: country.region,
            image_url: null
          });

          if (result.success) {
            // Update the local country object with the real ID
            const newCountry = result.data;
            this.countries.push(newCountry);
            
            // Update selected country ID
            this.selectedCountryId = newCountry.id;
            
            return newCountry;
          } else {
            alert('Failed to create country');
            return null;
          }
        } catch (err) {
          console.error('Error creating country:', err);
          alert('Failed to create country: ' + err.message);
          return null;
        }
      }

      return country;
    },

    // ===== PUZZLE METHODS =====
    async addPuzzle() {
      if (!this.newPuzzle.solution || this.newPuzzle.solution.length === 0) {
        alert('Arrow sequence is required');
        return;
      }

      try {
        // Ensure country exists before adding puzzle
        const country = await this.ensureCountryExists();
        if (!country) return;

        const { addPuzzle } = await import('../library/supabase.js');

        const puzzleData = {
          country_id: country.id,
          puzzle_type: 'arrow',
          puzzle_data: this.newPuzzle.solution,
          solution: JSON.stringify(this.newPuzzle.solution)
        };

        console.log('Adding puzzle with data:', puzzleData);
        const result = await addPuzzle(puzzleData);
        console.log('Result from addPuzzle:', result);

        if (result.success) {
          // Parse solution for display
          const puzzle = {
            ...result.data,
            solution: this.newPuzzle.solution
          };
          this.puzzles.push(puzzle);
          this.currentCountryPuzzles.push(puzzle);
          this.resetPuzzleForm();
          this.showPuzzleForm = false;
          alert('Arrow Puzzle added successfully!');
        } else {
          console.error('Failed to add puzzle:', result.error);
          alert('Failed to add puzzle: ' + (result.error?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error adding puzzle:', err);
        alert('Failed to add puzzle: ' + err.message);
      }
    },

    startEditPuzzle(puzzle) {
      this.editingPuzzleId = puzzle.id;
      // Parse solution if it's a string (from database)
      let solution = puzzle.solution;
      if (typeof solution === 'string') {
        try {
          solution = JSON.parse(solution);
        } catch (e) {
          solution = [];
        }
      }
      this.editingPuzzle = {
        ...puzzle,
        solution: Array.isArray(solution) ? solution : []
      };
    },

    cancelEditPuzzle() {
      this.editingPuzzleId = null;
      this.editingPuzzle = null;
    },

    async saveEditPuzzle() {
      if (!this.editingPuzzle.solution || this.editingPuzzle.solution.length === 0) {
        this.showNotification('Arrow sequence is required', 'error', 2000);
        return;
      }

      try {
        const { updatePuzzle } = await import('../library/supabase.js');

        const result = await updatePuzzle(this.editingPuzzle.id, {
          puzzle_type: 'arrow',
          puzzle_data: this.editingPuzzle.solution,
          solution: JSON.stringify(this.editingPuzzle.solution)
        });

        if (result.success) {
          const index = this.puzzles.findIndex(p => p.id === this.editingPuzzle.id);
          if (index !== -1) {
            // Update with parsed solution for display
            this.puzzles[index] = {
              ...this.editingPuzzle,
              solution: this.editingPuzzle.solution
            };
          }
          const currentIndex = this.currentCountryPuzzles.findIndex(p => p.id === this.editingPuzzle.id);
          if (currentIndex !== -1) {
            this.currentCountryPuzzles[currentIndex] = {
              ...this.editingPuzzle,
              solution: this.editingPuzzle.solution
            };
          }
          this.cancelEditPuzzle();
          this.showNotification('Arrow puzzle updated successfully', 'success');
        }
      } catch (err) {
        console.error('Error updating puzzle:', err);
        this.showNotification('Failed to update puzzle', 'error');
      }
    },

    async deletePuzzle(puzzleId) {
      if (!confirm('Are you sure you want to delete this puzzle?')) return;

      try {
        const { deletePuzzle } = await import('../library/supabase.js');

        const result = await deletePuzzle(puzzleId);
        if (result.success) {
          this.puzzles = this.puzzles.filter(p => p.id !== puzzleId);
          this.currentCountryPuzzles = this.currentCountryPuzzles.filter(p => p.id !== puzzleId);
          this.showNotification('Puzzle deleted successfully', 'success');
        }
      } catch (err) {
        console.error('Error deleting puzzle:', err);
        this.showNotification('Failed to delete puzzle', 'error');
      }
    },

    resetPuzzleForm() {
      this.newPuzzle = {
        solution: []
      };
    },

    handleArrowKeyInput(event) {
      const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };

      if (keyMap[event.key]) {
        event.preventDefault();
        // Check if we're in edit mode by looking at the input field
        if (event.target.closest('.edit-form')) {
          this.editingPuzzle.solution.push(keyMap[event.key]);
        } else {
          this.newPuzzle.solution.push(keyMap[event.key]);
        }
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (event.target.closest('.edit-form')) {
          this.editingPuzzle.solution.pop();
        } else {
          this.newPuzzle.solution.pop();
        }
      }
    },

    formatArrowSequence(sequence) {
      if (!sequence || sequence.length === 0) return '(no sequence yet)';
      const arrowMap = {
        'up': '↑', 'down': '↓', 'left': '←', 'right': '→'
      };
      if (Array.isArray(sequence)) {
        return sequence.map(dir => arrowMap[dir] || dir).join(' ');
      }
      return sequence;
    }
  }
};
</script>

<style scoped>
:root {
  --primary: #5fb3d5;
  --success: #4a9d6f;
  --danger: #c74545;
  --warning: #f0ad4e;
  --dark: #1a2f4a;
  --light: #e8f4f8;
  --border: #3a5f7a;
  --text: #e8f4f8;
  --text-secondary: #a8c5d1;
}

.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%);
  color: var(--text);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.admin-header {
  text-align: center;
  padding: 20px;
  background: rgba(95, 179, 213, 0.1);
  border-bottom: 2px solid var(--primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-header h1 {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: var(--primary);
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.3);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95em;
  margin: 0;
}

/* FULL SCREEN MAP SECTION */
.map-section-full {
  width: 100%;
  height: calc(100vh - 70px);
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.world-map-full {
  width: 90%;
  height: 90%;
  max-width: 1400px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%);
  border: 2px solid #5fb3d5;
  box-shadow: 0 0 30px rgba(95, 179, 213, 0.3);
}

/* MODAL OVERLAY */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

/* MODAL PANEL */
.modal-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(26, 47, 74, 0.95), rgba(10, 22, 40, 0.95));
  border: 2px solid var(--primary);
  border-radius: 15px;
  width: 45%;
  max-width: 700px;
  height: 75vh;
  max-height: 750px;
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(95, 179, 213, 0.3);
  animation: slideUp 0.4s ease;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translate(-50%, calc(-50% + 30px));
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(74, 157, 111, 0.2));
  border-bottom: 2px solid var(--primary);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0 0 5px 0;
  color: var(--primary);
  font-size: 1.8em;
}

.country-stats {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9em;
}

.btn-edit-country {
  background: rgba(95, 179, 213, 0.2);
  border: 2px solid var(--primary);
  color: var(--primary);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85em;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-edit-country:hover {
  background: rgba(95, 179, 213, 0.4);
  transform: translateY(-2px);
}

/* COUNTRY EDIT MODAL */
.country-edit-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(26, 47, 74, 0.95), rgba(10, 22, 40, 0.95));
  border: 2px solid var(--primary);
  border-radius: 15px;
  width: 35%;
  max-width: 500px;
  z-index: 102;
  box-shadow: 0 20px 60px rgba(95, 179, 213, 0.3);
  animation: slideUp 0.4s ease;
}

.country-edit-modal .modal-header {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(74, 157, 111, 0.2));
  border-bottom: 2px solid var(--primary);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 13px 13px 0 0;
}

.country-edit-modal .modal-header h2 {
  margin: 0;
  color: var(--primary);
  font-size: 1.5em;
}

.country-edit-modal .modal-content {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
}

.country-edit-modal .form-group {
  margin-bottom: 20px;
}

.country-edit-modal .form-group label {
  display: block;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95em;
}

.country-edit-modal .input-field {
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.95em;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.country-edit-modal .input-field:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.1);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.2);
}

.country-edit-modal .input-field::placeholder {
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 2px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  justify-content: flex-end;
}

.btn-close {
  background: rgba(199, 69, 69, 0.2);
  border: 2px solid #c74545;
  color: #ff6b6b;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(199, 69, 69, 0.4);
  transform: translateY(-2px);
}

/* TABS CONTAINER */
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  padding: 0 20px;
  flex-shrink: 0;
}

.tab-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  pointer-events: auto;
  z-index: 10;
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-button:hover {
  color: var(--primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--border);
  flex-shrink: 0;
}

.tab-header h3 {
  margin: 0;
  color: var(--primary);
  font-size: 1.2em;
}

/* FORMS */
.form-panel {
  background: rgba(95, 179, 213, 0.05);
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.form-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-section label {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.85em;
}

.current-answer {
  background: rgba(74, 157, 111, 0.2);
  border-left: 3px solid var(--success);
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.85em;
  color: var(--success);
}

.input-field {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.1);
  box-shadow: 0 0 10px rgba(95, 179, 213, 0.2);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* BUTTONS */
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.btn-primary {
  background: var(--primary);
  color: #000;
}

.btn-primary:hover {
  background: #4fa3c5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(95, 179, 213, 0.3);
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

.btn-small {
  padding: 5px 10px;
  font-size: 0.8em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
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

/* CONTENT LIST */
.content-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.empty-list {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.content-card:hover {
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.05);
  box-shadow: 0 5px 15px rgba(95, 179, 213, 0.1);
}

/* QUESTION CARD */
.question-card .card-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-text {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9em;
}

.options-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin: 8px 0;
  padding-left: 8px;
}

.option {
  background: rgba(0, 0, 0, 0.2);
  border-left: 3px solid var(--border);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option.correct {
  border-left-color: var(--success);
  background: rgba(74, 157, 111, 0.15);
}

.option-label {
  color: var(--primary);
  font-weight: 600;
}

.option-text {
  color: var(--text);
}

.badge {
  background: var(--success);
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: 600;
  width: fit-content;
}

/* ARROW PUZZLE STYLES */
.arrow-puzzle-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.arrow-sequence-label {
  color: var(--primary);
  font-weight: bold;
  font-size: 0.95em;
}

.arrow-sequence-display {
  background: rgba(95, 179, 213, 0.1);
  border: 2px solid var(--primary);
  padding: 15px;
  border-radius: 6px;
  font-size: 2em;
  letter-spacing: 10px;
  text-align: center;
  color: var(--primary);
  font-weight: bold;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-raw-code {
  color: var(--text-secondary);
  font-family: monospace;
}

.arrow-input-section {
  margin-bottom: 20px;
}

.arrow-input-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arrow-input-field {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  cursor: text;
  font-family: inherit;
  font-size: 1em;
  transition: all 0.3s ease;
}

.arrow-input-field:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(95, 179, 213, 0.1);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.2);
}

.arrow-symbols {
  background: rgba(95, 179, 213, 0.1);
  border: 2px solid var(--primary);
  padding: 15px;
  border-radius: 6px;
  font-size: 1.8em;
  letter-spacing: 8px;
  text-align: center;
  color: var(--primary);
  font-weight: bold;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PUZZLE CARD */
.puzzle-card .card-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.puzzle-name {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.95em;
}

.puzzle-desc {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.85em;
}

.puzzle-content,
.puzzle-solution {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 6px;
  border-left: 3px solid var(--primary);
  font-size: 0.85em;
}

.puzzle-content strong,
.puzzle-solution strong {
  color: var(--primary);
}

.puzzle-content p,
.puzzle-solution p {
  margin: 6px 0 0 0;
  color: var(--text);
  font-size: 0.85em;
}

.solution-text {
  background: rgba(74, 157, 111, 0.15) !important;
  color: var(--success) !important;
  font-weight: 600;
}

/* CARD ACTIONS */
.card-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.card-edit {
  background: rgba(95, 179, 213, 0.1);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--primary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

/* SCROLLBAR */
.content-list::-webkit-scrollbar {
  width: 6px;
}

.content-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.content-list::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}

.content-list::-webkit-scrollbar-thumb:hover {
  background: #4fa3c5;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .modal-panel {
    width: 95%;
    max-width: 850px;
    height: 85vh;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modal-panel {
    width: 98%;
    max-width: 100%;
    height: 90vh;
    border-radius: 10px;
    top: 5vh;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .options-display {
    grid-template-columns: 1fr;
  }

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .btn-close {
    align-self: flex-end;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-actions,
  .edit-actions {
    flex-direction: column;
  }

  .form-actions .btn,
  .edit-actions .btn-small {
    width: 100%;
  }
}

/* NOTIFICATION STYLES */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.notification {
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border-left: 4px solid !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  animation: slideInRight 0.3s ease !important;
  pointer-events: auto !important;
  font-family: inherit !important;
  font-size: 0.95em !important;
  background: transparent !important;
  border: none !important;
}

.notification-success {
  background: rgba(74, 157, 111, 0.9) !important;
  border-left: 4px solid var(--success) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.notification-success::before,
.notification-success::after {
  display: none !important;
}

.notification-error {
  background: rgba(199, 69, 69, 0.9) !important;
  border-left: 4px solid #c74545 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.notification-error::before,
.notification-error::after {
  display: none !important;
}

.notification-info {
  background: rgba(95, 179, 213, 0.9) !important;
  border-left: 4px solid var(--primary) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.notification-info::before,
.notification-info::after {
  display: none !important;
}

.notification-content {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.notification-icon {
  font-weight: bold !important;
  font-size: 1.1em !important;
}

.notification-message {
  font-size: 0.9em !important;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
