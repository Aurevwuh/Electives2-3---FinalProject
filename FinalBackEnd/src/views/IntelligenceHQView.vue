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
              <span class="field-value">ACTIVE</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Call Sign:</span>
              <span class="field-value">{{ playerEmail }}</span>
            </div>
            <div class="profile-field">
              <span class="field-label">Rank:</span>
              <span class="field-value rank">{{ playerRank }}</span>
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
                <div class="bar-fill" :style="{ width: accuracyPercent + '%' }"></div>
              </div>
              <span class="metric-value">{{ accuracyPercent }}%</span>
            </div>
            <div class="metric-bar">
              <span class="metric-label">COMPLETION</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: completionPercent + '%' }"></div>
              </div>
              <span class="metric-value">{{ completionPercent }}%</span>
            </div>
            <div class="metric-bar">
              <span class="metric-label">INTELLIGENCE POINTS</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: Math.min(playerPoints / 10, 100) + '%' }"></div>
              </div>
              <span class="metric-value">{{ playerPoints }}/1000</span>
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
            {{ achievement.requirement }}
          </p>
          <p v-else class="achievement-unlocked">✓ UNLOCKED</p>
        </div>
      </div>
    </div>

    <!-- Mission Summary Tab -->
    <div v-if="activeTab === 'summary'" class="tab-content">
      <h2>📋 MISSION SUMMARY</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Missions Completed</div>
          <div class="summary-value">{{ missionsCompleted }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Questions Answered</div>
          <div class="summary-value">{{ correctAnswers }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ciphers Solved</div>
          <div class="summary-value">{{ ciphersSolved }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Countries Cleared</div>
          <div class="summary-value">{{ countriesCleared }}/13</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlayerProgress, getCurrentUserId } from '../library/supabase.js';

export default {
  name: 'IntelligenceHQView',
  data() {
    return {
      activeTab: 'profile',
      playerEmail: 'UNKNOWN',
      playerPoints: 0,
      missionsCompleted: 0,
      correctAnswers: 0,
      ciphersSolved: 0,
      countriesCleared: 0,
      accuracyPercent: 0,
      completionPercent: 0,
      isLoading: true,
      tabs: [
        { id: 'profile', label: 'Agent Profile', icon: '🕵️' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'summary', label: 'Mission Summary', icon: '📋' }
      ],
      achievements: [
        { id: 1, name: 'First Steps', icon: '👣', description: 'Complete your first mission', requirement: 'Earn any intel points', unlocked: false },
        { id: 2, name: 'Accuracy Agent', icon: '🎯', description: 'Achieve 100% accuracy on questions', requirement: 'Maintain 100% accuracy', unlocked: false },
        { id: 3, name: 'Puzzle Master', icon: '🧩', description: 'Solve 15+ puzzles correctly', requirement: 'Solve 15 puzzles', unlocked: false },
        { id: 4, name: 'Global Analyst', icon: '🌍', description: 'Clear all countries', requirement: 'Clear all 13 countries', unlocked: false },
        { id: 5, name: 'Intelligence Elite', icon: '⭐', description: 'Reach Elite rank', requirement: 'Earn 500+ points', unlocked: false },
        { id: 6, name: 'Perfect Record', icon: '💯', description: 'Achieve 100% success rate', requirement: '100% missions + 100% completion', unlocked: false }
      ]
    };
  },
  computed: {
    playerRank() {
      if (this.playerPoints < 100) return 'RECRUIT';
      if (this.playerPoints < 250) return 'OPERATIVE';
      if (this.playerPoints < 500) return 'AGENT';
      return 'ELITE';
    },
    clearanceLevel() {
      if (this.playerPoints < 100) return 'LEVEL 1';
      if (this.playerPoints < 250) return 'LEVEL 2';
      if (this.playerPoints < 500) return 'LEVEL 3';
      return 'TOP SECRET';
    }
  },
  mounted() {
    this.loadPlayerData();
  },
  methods: {
    async loadPlayerData() {
      this.isLoading = true;
      try {
        const userId = getCurrentUserId();
        this.playerEmail = localStorage.getItem('currentUser') || 'UNKNOWN';

        if (userId) {
          const playerStats = await getPlayerProgress(userId);

          if (playerStats) {
            this.playerPoints = playerStats.total_intel_points || 0;
            this.missionsCompleted = playerStats.missions_completed || 0;
            this.ciphersSolved = playerStats.ciphers_correct || 0;
            this.countriesCleared = (playerStats.countries_cleared || []).length;

            // Calculate accuracy - assume every 2 points = 1 correct answer
            const totalAnswers = Math.floor(this.playerPoints / 2);
            this.correctAnswers = totalAnswers;
            this.accuracyPercent = this.missionsCompleted > 0 ? Math.round((this.correctAnswers / (this.missionsCompleted * 5)) * 100) : 0;
            this.accuracyPercent = Math.min(this.accuracyPercent, 100);
          }
        }

        // Calculate completion percentage
        this.completionPercent = Math.round((this.countriesCleared / 13) * 100);
        
        // Check achievements
        this.checkAchievements();
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    checkAchievements() {
      try {
        // First Steps - Have any intel points
        this.achievements[0].unlocked = this.playerPoints > 0;

        // Accuracy Agent - 100% accuracy
        this.achievements[1].unlocked = this.accuracyPercent === 100 && this.correctAnswers > 0;

        // Puzzle Master - 15+ puzzles
        this.achievements[2].unlocked = this.ciphersSolved >= 15;

        // Global Analyst - All 13 countries
        this.achievements[3].unlocked = this.countriesCleared === 13;

        // Intelligence Elite - 500+ points
        this.achievements[4].unlocked = this.playerPoints >= 500;

        // Perfect Record - 100% everything
        this.achievements[5].unlocked = this.accuracyPercent === 100 && this.completionPercent === 100 && this.missionsCompleted > 0;
      } catch (error) {
        console.error('Error checking achievements:', error);
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
  font-size: 11px;
  color: var(--accent-green);
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  padding: 25px;
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-magenta);
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 0 15px rgba(139, 90, 141, 0.1);
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 32px;
  font-weight: 900;
  color: var(--accent-magenta);
  text-shadow: 0 0 10px rgba(139, 90, 141, 0.3);
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
