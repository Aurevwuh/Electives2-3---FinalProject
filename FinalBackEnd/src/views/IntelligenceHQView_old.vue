<template>
  <div class="hq-container">
    <!-- Header -->
    <div class="hq-header">
      <h1>🔐 INTELLIGENCE HQ</h1>
      <p class="header-subtitle">Classified Information Analysis & Strategic Overview</p>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Agent Profile Tab -->
    <div v-if="activeTab === 'profile'" class="tab-content">
      <div class="profile-grid">
        <div class="profile-section">
          <h2>🕵️ AGENT PROFILE</h2>
          <div class="profile-card">
            <div class="profile-field">
              <span class="field-label">Agent Status:</span>
              <span class="field-value">{{ agentStatus }}</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Call Sign:</span>
              <span class="field-value">{{ currentUser }}</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Rank:</span>
              <span class="field-value rank">{{ agentRank }}</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Clearance Level:</span>
              <span class="field-value clearance">{{ clearanceLevel }}</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>📊 PERFORMANCE METRICS</h2>
          <div class="metrics-bars">
            <div class="metric-bar">
              <span class="metric-label">ACCURACY</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: successRate + '%' }"></div>
              </div>
              <span class="metric-value">{{ successRate }}%</span>
            </div>
            <div class="metric-bar">
              <span class="metric-label">COMPLETION</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: completionRate + '%' }"></div>
              </div>
              <span class="metric-value">{{ completionRate }}%</span>
            </div>
            <div class="metric-bar">
              <span class="metric-label">INTELLIGENCE POINTS</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: Math.min(intelligencePoints / 10, 100) + '%' }"></div>
              </div>
              <span class="metric-value">{{ intelligencePoints }}/1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Intelligence Database Tab -->
    <div v-if="activeTab === 'database'" class="tab-content">
      <h2>📚 CLASSIFIED INTELLIGENCE DATABASE</h2>
      <div class="database-grid">
        <div v-for="country in countriesData" :key="country.id" class="country-dossier">
          <div class="dossier-header">
            <h3>{{ country.name }}</h3>
            <span v-if="country.completed" class="status-badge completed">✓ CLEARED</span>
            <span v-else class="status-badge pending">⊘ PENDING</span>
          </div>
          <div class="dossier-content">
            <p class="dossier-intel">{{ country.intelligence }}</p>
            <div class="dossier-stats">
              <span v-if="country.questionsCompleted > 0">
                ✓ {{ country.questionsCompleted }} Questions
              </span>
              <span v-if="country.puzzlesCompleted > 0">
                ✓ {{ country.puzzlesCompleted }} Puzzles
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Tab -->
    <div v-if="activeTab === 'achievements'" class="tab-content">
      <h2>🏆 OPERATIONAL ACHIEVEMENTS</h2>
      <div class="achievements-grid">
        <div v-for="achievement in achievements" :key="achievement.id" :class="['achievement-card', { unlocked: achievement.unlocked }]">
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <h3>{{ achievement.name }}</h3>
          <p class="achievement-description">{{ achievement.description }}</p>
          <p v-if="!achievement.unlocked" class="achievement-requirement">
            Requirement: {{ achievement.requirement }}
          </p>
          <p v-else class="achievement-unlocked">UNLOCKED</p>
        </div>
      </div>
    </div>

    <!-- Mission History Tab -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <h2>📜 MISSION HISTORY LOG</h2>
      <div class="history-timeline">
        <div v-for="(event, idx) in missionHistory" :key="idx" :class="['timeline-event', event.type]">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-time">{{ event.time }}</span>
            <p class="timeline-message">{{ event.message }}</p>
            <span class="timeline-country">{{ event.country }}</span>
          </div>
        </div>
        <div v-if="missionHistory.length === 0" class="no-history">
          <p>No mission history yet. Begin your first operation!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntelligenceHQView',
  data() {
    return {
      activeTab: 'profile',
      currentUser: '',
      successRate: 0,
      completionRate: 0,
      intelligencePoints: 0,
      tabs: [
        { id: 'profile', label: 'Agent Profile', icon: '🕵️' },
        { id: 'database', label: 'Intelligence Database', icon: '📚' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'history', label: 'Mission History', icon: '📜' }
      ],
      countriesData: [
        { id: 1, name: 'USA', intelligence: 'Superpower with global influence and technological advancement', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 2, name: 'Russia', intelligence: 'Major geopolitical player with historical significance', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 3, name: 'China', intelligence: 'Rising economic and military power in Asia-Pacific region', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 4, name: 'UK', intelligence: 'Historic nation with significant intelligence apparatus', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 5, name: 'France', intelligence: 'European power with permanent UN Security Council seat', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 6, name: 'Germany', intelligence: 'Economic leader of Europe with strategic importance', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 7, name: 'Japan', intelligence: 'Technological leader and key US ally in Asia', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 8, name: 'India', intelligence: 'Emerging superpower with largest population', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 9, name: 'Iran', intelligence: 'Key regional power in Middle East politics', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 10, name: 'North Korea', intelligence: 'Reclusive regime with nuclear capabilities', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 11, name: 'Cuba', intelligence: 'Island nation with Cold War significance', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 },
        { id: 12, name: 'Australia', intelligence: 'Strategic Pacific ally with growing importance', completed: false, questionsCompleted: 0, puzzlesCompleted: 0 }
      ],
      achievements: [
        { id: 1, name: 'First Steps', icon: '👣', description: 'Complete your first mission', requirement: 'Complete any mission', unlocked: false },
        { id: 2, name: 'Accuracy Agent', icon: '🎯', description: 'Achieve 100% accuracy on questions', requirement: '100% question accuracy', unlocked: false },
        { id: 3, name: 'Puzzle Master', icon: '🧩', description: 'Complete all puzzle challenges', requirement: 'Complete 12+ puzzles', unlocked: false },
        { id: 4, name: 'Global Analyst', icon: '🌍', description: 'Clear all countries', requirement: 'Complete all operations', unlocked: false },
        { id: 5, name: 'Intelligence Elite', icon: '⭐', description: 'Reach Elite rank', requirement: 'Earn 500+ intelligence points', unlocked: false },
        { id: 6, name: 'Perfect Record', icon: '💯', description: 'Achieve 100% success rate', requirement: '100% mission success', unlocked: false }
      ],
      missionHistory: []
    };
  },
  computed: {
    agentStatus() {
      return 'ACTIVE';
    },
    agentRank() {
      if (this.intelligencePoints < 100) return 'RECRUIT';
      if (this.intelligencePoints < 250) return 'OPERATIVE';
      if (this.intelligencePoints < 500) return 'AGENT';
      return 'ELITE';
    },
    clearanceLevel() {
      if (this.intelligencePoints < 100) return 'LEVEL 1';
      if (this.intelligencePoints < 250) return 'LEVEL 2';
      if (this.intelligencePoints < 500) return 'LEVEL 3';
      return 'TOP SECRET';
    }
  },
  mounted() {
    this.loadAgentData();
    this.generateMissionHistory();
    this.checkAchievements();
  },
  methods: {
    loadAgentData() {
      this.currentUser = localStorage.getItem('currentUser') || 'UNKNOWN_AGENT';
      
      // Load player stats from new system
      const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
      const currentUserStats = stats[this.currentUser];
      
      if (currentUserStats) {
        this.intelligencePoints = currentUserStats.totalIntelPoints || 0;
        
        // Calculate success rate from missions completed
        const totalMissions = (currentUserStats.missionsCompleted || 0) + (currentUserStats.missionsFailed || 0);
        this.successRate = totalMissions > 0 ? Math.round((currentUserStats.missionsCompleted / totalMissions) * 100) : 0;
        
        // Calculate completion rate from countries cleared
        const totalCountries = 12; // Total countries in game
        this.completionRate = Math.round((currentUserStats.countriesCleared.length / totalCountries) * 100);
        
        // Update countries data to show which ones are cleared
        this.countriesData.forEach((country, idx) => {
          const countryId = country.id;
          if (currentUserStats.countriesCleared.includes(countryId)) {
            country.completed = true;
          }
        });
      } else {
        this.intelligencePoints = 0;
        this.successRate = 0;
        this.completionRate = 0;
      }
    },

    generateMissionHistory() {
      const progress = JSON.parse(localStorage.getItem('missionProgress') || '{}');
      const history = [];

      const countryNames = ['USA', 'Russia', 'China', 'UK', 'France', 'Germany', 'Japan', 'India', 'Iran', 'North Korea', 'Cuba', 'Australia'];

      Object.entries(progress).forEach(([countryId, data], idx) => {
        if (data.questions) {
          Object.entries(data.questions).forEach(([qId, result]) => {
            history.push({
              type: result ? 'success' : 'failure',
              message: result ? 'Question answered correctly' : 'Question answered incorrectly',
              country: countryNames[idx] || `Country ${idx + 1}`,
              time: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString()
            });
          });
        }
        if (data.puzzles) {
          Object.entries(data.puzzles).forEach(([pId, result]) => {
            history.push({
              type: result ? 'success' : 'failure',
              message: result ? 'Puzzle solved successfully' : 'Puzzle solve attempt',
              country: countryNames[idx] || `Country ${idx + 1}`,
              time: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString()
            });
          });
        }
      });

      this.missionHistory = history.slice(0, 10);
    },

    checkAchievements() {
      // Check achievements based on current stats
      if (this.intelligencePoints > 0) {
        this.achievements[0].unlocked = true; // First Steps
      }
      if (this.successRate === 100 && this.intelligencePoints > 0) {
        this.achievements[1].unlocked = true; // Accuracy Agent
      }
      if (this.intelligencePoints >= 30) {
        // 30 points = 15 correct puzzles/questions (assuming 2 per answer)
        this.achievements[2].unlocked = true; // Puzzle Master
      }
      if (this.completionRate === 100) {
        this.achievements[3].unlocked = true; // Global Analyst
      }
      if (this.intelligencePoints >= 500) {
        this.achievements[4].unlocked = true; // Intelligence Elite
      }
      if (this.successRate === 100 && this.completionRate === 100) {
        this.achievements[5].unlocked = true; // Perfect Record
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

:root {
  --accent-cyan: #5fb3d5;
  --accent-green: #4a9d6f;
  --accent-magenta: #8b5a8d;
  --accent-orange: #d4844a;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
  --bg-dark: #0f1419;
}

.hq-container {
  padding: 40px;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  min-height: 100vh;
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  color: var(--text-primary);
}

.hq-header {
  margin-bottom: 40px;
  border-bottom: 3px solid var(--accent-cyan);
  padding-bottom: 20px;
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.05) 0%, transparent 100%);
}

.hq-header h1 {
  font-size: 32px;
  font-weight: 900;
  color: var(--accent-cyan);
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.4);
  letter-spacing: 3px;
  margin: 0 0 10px 0;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  border-bottom: 2px solid rgba(95, 179, 213, 0.2);
  padding-bottom: 15px;
}

.tab-button {
  padding: 12px 20px;
  background: rgba(95, 179, 213, 0.05);
  border: 2px solid var(--text-secondary);
  color: var(--text-secondary);
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.tab-button.active {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2), rgba(74, 157, 111, 0.1));
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3);
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-content h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-cyan);
  letter-spacing: 2px;
  margin: 0 0 25px 0;
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.2);
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.profile-section {
  padding: 25px;
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-cyan);
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.1);
}

.profile-section h2 {
  font-size: 16px;
  color: var(--accent-cyan);
  margin: 0 0 20px 0;
  letter-spacing: 2px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.profile-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(95, 179, 213, 0.05);
  border-left: 3px solid var(--accent-green);
  border-radius: 2px;
}

.field-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.field-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-cyan);
}

.field-value.rank {
  color: var(--accent-green);
}

.field-value.clearance {
  color: var(--accent-magenta);
}

/* Metrics Bars */
.metrics-bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bar-container {
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--accent-cyan);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  transition: width 0.5s ease;
}

.metric-value {
  font-size: 12px;
  color: var(--accent-cyan);
  font-weight: 600;
}

/* Database Grid */
.database-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.country-dossier {
  padding: 20px;
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-magenta);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.country-dossier:hover {
  box-shadow: 0 0 20px rgba(139, 90, 141, 0.3);
  transform: translateY(-4px);
}

.dossier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--accent-magenta);
}

.dossier-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-magenta);
  margin: 0;
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
}

.status-badge.completed {
  background: rgba(74, 157, 111, 0.2);
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
}

.status-badge.pending {
  background: rgba(122, 143, 160, 0.2);
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
}

.dossier-intel {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.dossier-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 10px;
  color: var(--accent-cyan);
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.achievement-card {
  padding: 20px;
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--text-secondary);
  border-radius: 4px;
  text-align: center;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  opacity: 1;
  border-color: var(--accent-green);
  box-shadow: 0 0 20px rgba(74, 157, 111, 0.2);
}

.achievement-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.achievement-card h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.achievement-description {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0 0 10px 0;
}

.achievement-requirement {
  font-size: 10px;
  color: var(--accent-orange);
  margin: 0;
}

.achievement-unlocked {
  font-size: 10px;
  color: var(--accent-green);
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

/* Mission History Timeline */
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.timeline-event {
  display: flex;
  gap: 20px;
  padding: 15px;
  border-left: 3px solid;
  background: rgba(95, 179, 213, 0.05);
  margin-bottom: 10px;
  position: relative;
}

.timeline-event.success {
  border-left-color: var(--accent-green);
}

.timeline-event.failure {
  border-left-color: #a83e3e;
}

.timeline-marker {
  min-width: 12px;
  width: 12px;
  height: 12px;
  background: var(--accent-cyan);
  border-radius: 50%;
  margin-top: 5px;
  box-shadow: 0 0 8px rgba(95, 179, 213, 0.5);
}

.timeline-content {
  flex: 1;
}

.timeline-time {
  font-size: 10px;
  color: var(--text-secondary);
}

.timeline-message {
  font-size: 12px;
  color: var(--text-primary);
  margin: 5px 0;
}

.timeline-country {
  display: inline-block;
  font-size: 10px;
  padding: 4px 8px;
  background: rgba(95, 179, 213, 0.1);
  border: 1px solid var(--accent-cyan);
  border-radius: 2px;
  color: var(--accent-cyan);
  margin-top: 5px;
}

.no-history {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .hq-container {
    padding: 20px;
  }

  .hq-header h1 {
    font-size: 24px;
  }

  .tabs-navigation {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
  }
}
</style>
