<template>
  <div class="crud-container">
    <h1 class="crud-title">🔐 Mission Control Center</h1>

    <div class="crud-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'countries' }]"
        @click="activeTab = 'countries'"
      >
        🌍 Countries
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'missions' }]"
        @click="activeTab = 'missions'"
        :disabled="!selectedCountry"
        :title="!selectedCountry ? 'Select a country first' : ''"
      >
        🎯 Missions
      </button>
    </div>

    <!-- COUNTRIES TAB -->
    <div v-if="activeTab === 'countries'" class="tab-content">
      <div class="section-title">
        <h2>Manage Countries</h2>
        <span v-if="selectedCountry" class="selected-info">Selected: {{ selectedCountry }}</span>
      </div>

      <div class="form-section">
        <div class="form-group">
          <input 
            v-model="newCountry" 
            placeholder="Enter country name" 
            @keyup.enter="addCountry"
            class="input-field"
          />
          <button @click="addCountry" class="btn btn-primary">
            ➕ Add Country
          </button>
        </div>
      </div>

      <div class="countries-grid">
        <div 
          v-for="country in countries" 
          :key="country.id"
          :class="['country-card', { selected: selectedCountry === country.name }]"
        >
          <div class="country-name">{{ country.name }}</div>
          <div class="country-missions">{{ country.missionCount }} missions</div>
          <div class="country-actions">
            <button 
              @click="selectCountry(country)"
              :class="['btn-select', { selected: selectedCountry === country.name }]"
              title="Select this country"
            >
              ✓ Select
            </button>
            <button 
              @click="editCountryStart(country)"
              class="btn btn-small btn-edit"
            >
              ✎ Edit
            </button>
            <button 
              @click="deleteCountry(country.id)"
              class="btn btn-small btn-delete"
            >
              ✕ Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Country Modal -->
      <div v-if="editingCountry" class="modal-overlay" @click.self="editingCountry = null">
        <div class="modal-content">
          <h3>Edit Country</h3>
          <input 
            v-model="editingCountry.name" 
            class="input-field"
          />
          <div class="modal-actions">
            <button @click="saveCountry" class="btn btn-primary">Save</button>
            <button @click="editingCountry = null" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MISSIONS TAB -->
    <div v-if="activeTab === 'missions'" class="tab-content">
      <div class="section-title">
        <h2>Missions for {{ selectedCountry }}</h2>
      </div>

      <div v-if="selectedCountry" class="form-section">
        <div class="form-group">
          <input 
            v-model="newMission.name" 
            placeholder="Mission name" 
            @keyup.enter="addMission"
            class="input-field"
          />
          <input 
            v-model="newMission.status" 
            placeholder="Status (e.g., Active, Completed, Planning)" 
            @keyup.enter="addMission"
            class="input-field"
          />
          <textarea 
            v-model="newMission.description" 
            placeholder="Mission description" 
            class="input-field textarea"
            rows="3"
          ></textarea>
          <button @click="addMission" class="btn btn-primary">
            ➕ Add Mission
          </button>
        </div>
      </div>

      <div v-if="filteredMissions.length > 0" class="missions-table">
        <table>
          <thead>
            <tr>
              <th>Mission Name</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mission in filteredMissions" :key="mission.id">
              <td v-if="editingMissionId !== mission.id">{{ mission.name }}</td>
              <td v-else><input v-model="editingMission.name" class="input-field" /></td>

              <td v-if="editingMissionId !== mission.id" :class="['status', mission.status.toLowerCase()]">
                {{ mission.status }}
              </td>
              <td v-else><input v-model="editingMission.status" class="input-field" /></td>

              <td v-if="editingMissionId !== mission.id">{{ mission.description }}</td>
              <td v-else><textarea v-model="editingMission.description" class="input-field textarea" rows="2"></textarea></td>

              <td class="actions">
                <button 
                  v-if="editingMissionId !== mission.id"
                  @click="editMissionStart(mission)"
                  class="btn btn-small btn-edit"
                >
                  ✎ Edit
                </button>
                <button 
                  v-else
                  @click="saveMission"
                  class="btn btn-small btn-save"
                >
                  ✓ Save
                </button>
                <button 
                  v-if="editingMissionId !== mission.id"
                  @click="deleteMission(mission.id)"
                  class="btn btn-small btn-delete"
                >
                  ✕ Delete
                </button>
                <button 
                  v-else
                  @click="editingMissionId = null"
                  class="btn btn-small btn-cancel"
                >
                  ✗ Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p>No missions yet for {{ selectedCountry }}</p>
        <p class="hint">Add your first mission using the form above</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CrudView",
  data() {
    return {
      activeTab: 'countries',
      countries: [],
      missions: [],
      selectedCountry: null,
      newCountry: "",
      newMission: { name: "", status: "Planning", description: "" },
      editingCountry: null,
      editingMissionId: null,
      editingMission: { name: "", status: "", description: "" },
      nextCountryId: 1,
      nextMissionId: 1,
      currentUser: null
    };
  },
  computed: {
    filteredMissions() {
      if (!this.selectedCountry) return [];
      return this.missions.filter(m => m.countryId === this.selectedCountry);
    }
  },
  mounted() {
    const currentEmail = localStorage.getItem("currentUser");
    if (!currentEmail) {
      this.$router.push('/login');
      return;
    }
    this.currentUser = currentEmail;
    this.loadData();
  },
  methods: {
    loadData() {
      const crudData = JSON.parse(localStorage.getItem("crudData") || "{}");
      const userData = crudData[this.currentUser] || { countries: [], missions: [] };
      
      let playerCountries = userData.countries || [];
      let playerMissions = userData.missions || [];
      
      // Also load admin-created countries so players can see them
      const adminCrudData = JSON.parse(localStorage.getItem("adminCrudData") || "{}");
      const adminCountries = [];
      const adminMissions = [];
      
      // Collect all admin countries and missions from all admins
      for (const adminUser in adminCrudData) {
        const adminData = adminCrudData[adminUser];
        if (adminData.countries) {
          adminCountries.push(...adminData.countries);
        }
        if (adminData.missions) {
          adminMissions.push(...adminData.missions);
        }
      }
      
      // Merge admin countries with player countries (avoid duplicates by name)
      const mergedCountriesMap = new Map();
      // Add player countries first
      playerCountries.forEach(c => mergedCountriesMap.set(c.name, c));
      // Add admin countries (they will override if same name)
      adminCountries.forEach(c => mergedCountriesMap.set(c.name, c));
      
      this.countries = Array.from(mergedCountriesMap.values());
      this.missions = [...playerMissions, ...adminMissions];
      
      // Recalculate mission counts for all countries
      this.countries.forEach(country => {
        country.missionCount = this.missions.filter(m => m.countryId === country.name).length;
      });
      
      this.nextCountryId = this.countries.length > 0 
        ? Math.max(...this.countries.map(c => c.id)) + 1 
        : 1;
      this.nextMissionId = this.missions.length > 0 
        ? Math.max(...this.missions.map(m => m.id)) + 1 
        : 1;
    },
    saveData() {
      const crudData = JSON.parse(localStorage.getItem("crudData") || "{}");
      crudData[this.currentUser] = {
        countries: this.countries,
        missions: this.missions
      };
      localStorage.setItem("crudData", JSON.stringify(crudData));
    },
    // COUNTRY METHODS
    addCountry() {
      if (!this.newCountry.trim()) {
        alert("Please enter a country name");
        return;
      }
      
      if (this.countries.some(c => c.name.toLowerCase() === this.newCountry.toLowerCase())) {
        alert("This country already exists");
        return;
      }

      this.countries.push({
        id: this.nextCountryId++,
        name: this.newCountry.trim(),
        createdAt: new Date().toISOString(),
        missionCount: 0
      });
      
      this.newCountry = "";
      this.saveData();
    },
    selectCountry(country) {
      this.selectedCountry = country.name;
      this.activeTab = 'missions';
    },
    editCountryStart(country) {
      this.editingCountry = { ...country };
    },
    saveCountry() {
      if (!this.editingCountry.name.trim()) {
        alert("Country name cannot be empty");
        return;
      }

      const index = this.countries.findIndex(c => c.id === this.editingCountry.id);
      if (index > -1) {
        this.countries[index].name = this.editingCountry.name.trim();
        this.countries[index].updatedAt = new Date().toISOString();
        
        // Update missions if country name changed
        const oldName = this.countries[index].name;
        this.missions.forEach(m => {
          if (m.countryId === oldName) {
            m.countryId = this.editingCountry.name.trim();
          }
        });
        
        if (this.selectedCountry === oldName) {
          this.selectedCountry = this.editingCountry.name.trim();
        }
      }
      
      this.editingCountry = null;
      this.saveData();
    },
    deleteCountry(id) {
      const country = this.countries.find(c => c.id === id);
      if (!country) return;

      if (confirm(`Are you sure you want to delete "${country.name}"? This will also delete all its missions.`)) {
        // Delete all missions for this country
        this.missions = this.missions.filter(m => m.countryId !== country.name);
        
        // Delete the country
        this.countries = this.countries.filter(c => c.id !== id);
        
        // Reset selection if this country was selected
        if (this.selectedCountry === country.name) {
          this.selectedCountry = null;
          this.activeTab = 'countries';
        }
        
        this.saveData();
      }
    },
    // MISSION METHODS
    addMission() {
      if (!this.selectedCountry) {
        alert("Please select a country first");
        return;
      }

      if (!this.newMission.name.trim()) {
        alert("Please enter a mission name");
        return;
      }

      this.missions.push({
        id: this.nextMissionId++,
        countryId: this.selectedCountry,
        name: this.newMission.name.trim(),
        status: this.newMission.status.trim() || "Planning",
        description: this.newMission.description.trim(),
        createdAt: new Date().toISOString()
      });

      // Update mission count for the country
      const country = this.countries.find(c => c.name === this.selectedCountry);
      if (country) {
        country.missionCount = this.missions.filter(m => m.countryId === this.selectedCountry).length;
      }

      this.newMission = { name: "", status: "Planning", description: "" };
      this.saveData();
    },
    editMissionStart(mission) {
      this.editingMissionId = mission.id;
      this.editingMission = { ...mission };
    },
    saveMission() {
      if (!this.editingMission.name.trim()) {
        alert("Mission name cannot be empty");
        return;
      }

      const index = this.missions.findIndex(m => m.id === this.editingMissionId);
      if (index > -1) {
        this.missions[index].name = this.editingMission.name.trim();
        this.missions[index].status = this.editingMission.status.trim() || "Planning";
        this.missions[index].description = this.editingMission.description.trim();
        this.missions[index].updatedAt = new Date().toISOString();
      }

      this.editingMissionId = null;
      this.saveData();
    },
    deleteMission(id) {
      const mission = this.missions.find(m => m.id === id);
      if (!mission) return;

      if (confirm(`Are you sure you want to delete the mission "${mission.name}"?`)) {
        this.missions = this.missions.filter(m => m.id !== id);
        
        // Update mission count for the country
        const country = this.countries.find(c => c.name === this.selectedCountry);
        if (country) {
          country.missionCount = this.missions.filter(m => m.countryId === this.selectedCountry).length;
        }

        this.saveData();
      }
    }
  },
};
</script>

<style scoped>
:root {
  --primary-color: #0f1419;
  --secondary-color: #1a2332;
  --accent-green: #4a9d6f;
  --accent-cyan: #5fb3d5;
  --accent-magenta: #8b5a8d;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
}

.crud-container {
  max-width: 1200px;
  margin: 0 auto;
}

.crud-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: var(--accent-cyan);
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.5);
  letter-spacing: 2px;
  animation: glitchText 3s ease-in-out infinite;
}

@keyframes glitchText {
  0% { text-shadow: 0 0 15px var(--accent-cyan), 0 0 30px rgba(0, 217, 255, 0.5); }
  50% { text-shadow: 0 0 20px var(--accent-magenta), 0 0 40px rgba(255, 0, 110, 0.5); }
  100% { text-shadow: 0 0 15px var(--accent-cyan), 0 0 30px rgba(0, 217, 255, 0.5); }
}

/* TABS */
.crud-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(95, 179, 213, 0.2);
  justify-content: center;
}

.tab-btn {
  padding: 12px 30px;
  border: none;
  background: rgba(95, 179, 213, 0.1);
  color: var(--text-primary);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-bottom: 3px solid transparent;
  letter-spacing: 1px;
}

.tab-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(139, 90, 141, 0.1));
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(139, 90, 141, 0.1));
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3);
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-content {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(95, 179, 213, 0.3);
}

.section-title h2 {
  color: var(--accent-cyan);
  font-size: 1.8rem;
  margin: 0;
}

.selected-info {
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.2), rgba(95, 179, 213, 0.2));
  padding: 8px 15px;
  border-radius: 20px;
  color: var(--accent-green);
  font-size: 0.9rem;
  border: 1px solid var(--accent-green);
}

/* FORMS */
.form-section {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.08), rgba(139, 90, 141, 0.05));
  border: 2px solid rgba(95, 179, 213, 0.2);
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.form-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.input-field {
  flex: 1;
  min-width: 200px;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(95, 179, 213, 0.3);
  color: var(--text-primary);
  border-radius: 6px;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3);
}

.input-field.textarea {
  flex-basis: 100%;
}

/* BUTTONS */
.btn {
  padding: 10px 20px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-cyan), rgba(95, 179, 213, 0.7));
  color: var(--primary-color);
  border-color: var(--accent-cyan);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.5);
}

.btn-secondary {
  background: rgba(139, 90, 141, 0.2);
  color: var(--accent-magenta);
  border-color: var(--accent-magenta);
}

.btn-secondary:hover {
  background: rgba(139, 90, 141, 0.3);
  box-shadow: 0 0 15px rgba(139, 90, 141, 0.3);
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-edit {
  background: rgba(74, 157, 111, 0.2);
  color: var(--accent-green);
  border-color: var(--accent-green);
}

.btn-edit:hover {
  background: rgba(74, 157, 111, 0.3);
  box-shadow: 0 0 12px rgba(74, 157, 111, 0.4);
}

.btn-delete {
  background: rgba(200, 80, 80, 0.2);
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.btn-delete:hover {
  background: rgba(200, 80, 80, 0.3);
  box-shadow: 0 0 12px rgba(255, 107, 107, 0.4);
}

.btn-save {
  background: rgba(100, 200, 100, 0.2);
  color: var(--accent-green);
  border-color: var(--accent-green);
}

.btn-save:hover {
  background: rgba(100, 200, 100, 0.3);
  box-shadow: 0 0 12px rgba(100, 200, 100, 0.4);
}

.btn-cancel {
  background: rgba(180, 100, 100, 0.2);
  color: #ff9999;
  border-color: #ff9999;
}

.btn-cancel:hover {
  background: rgba(180, 100, 100, 0.3);
}

/* COUNTRIES GRID */
.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.country-card {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.1), rgba(139, 90, 141, 0.05));
  border: 2px solid rgba(95, 179, 213, 0.3);
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.country-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(95, 179, 213, 0.1), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}

.country-card:hover::before {
  left: 100%;
}

.country-card:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.3);
  transform: translateY(-4px);
}

.country-card.selected {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(74, 157, 111, 0.1));
  border-color: var(--accent-green);
  box-shadow: 0 0 25px rgba(74, 157, 111, 0.4);
}

.country-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.country-missions {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.country-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-select {
  flex: 1;
  padding: 8px 12px;
  background: rgba(95, 179, 213, 0.15);
  color: var(--accent-cyan);
  border: 2px solid var(--accent-cyan);
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 12px;
}

.btn-select:hover {
  background: rgba(95, 179, 213, 0.25);
  box-shadow: 0 0 12px rgba(95, 179, 213, 0.4);
}

.btn-select.selected {
  background: rgba(74, 157, 111, 0.3);
  border-color: var(--accent-green);
  color: var(--accent-green);
  box-shadow: 0 0 12px rgba(74, 157, 111, 0.4);
}

/* MISSIONS TABLE */
.missions-table {
  overflow-x: auto;
  margin-top: 20px;
}

.missions-table table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.missions-table thead {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(139, 90, 141, 0.1));
}

.missions-table th {
  padding: 15px;
  text-align: left;
  color: var(--accent-cyan);
  font-weight: 700;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(95, 179, 213, 0.3);
}

.missions-table td {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(95, 179, 213, 0.1);
  color: var(--text-primary);
}

.missions-table tbody tr {
  transition: all 0.3s ease;
}

.missions-table tbody tr:hover {
  background: rgba(95, 179, 213, 0.08);
}

.missions-table td.status {
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.missions-table td.status.planning {
  background: rgba(255, 200, 100, 0.2);
  color: #ffc864;
}

.missions-table td.status.active {
  background: rgba(100, 200, 100, 0.2);
  color: var(--accent-green);
}

.missions-table td.status.completed {
  background: rgba(100, 150, 200, 0.2);
  color: #64b3ff;
}

.missions-table td.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #1a2332 0%, #1a2f4a 100%);
  border: 2px solid rgba(95, 179, 213, 0.3);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 40px rgba(95, 179, 213, 0.2);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h3 {
  color: var(--accent-cyan);
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.modal-actions .btn {
  flex: 1;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 30px;
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.05), rgba(139, 90, 141, 0.02));
  border: 2px dashed rgba(95, 179, 213, 0.2);
  border-radius: 10px;
  margin: 30px 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 10px 0;
  font-size: 1.1rem;
}

.empty-state .hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
  opacity: 0.7;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .countries-grid {
    grid-template-columns: 1fr;
  }

  .form-group {
    flex-direction: column;
  }

  .input-field {
    min-width: auto;
  }

  .crud-tabs {
    flex-direction: column;
  }

  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .missions-table {
    font-size: 0.9rem;
  }

  .missions-table th,
  .missions-table td {
    padding: 10px 8px;
  }
}
</style>
