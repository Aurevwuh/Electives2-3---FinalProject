<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>🕵️ MISSION COMMAND CENTER</h1>
      <p class="header-subtitle">Real-time operational status and agent statistics</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card stat-active">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <p class="stat-label">MISSIONS COMPLETED</p>
          <p class="stat-value">{{ completedMissions }}</p>
          <p class="stat-detail">{{ successRate }}% success rate</p>
        </div>
      </div>

      <div class="stat-card stat-warning">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <p class="stat-label">MISSIONS FAILED</p>
          <p class="stat-value">{{ failedMissions }}</p>
          <p class="stat-detail">{{ totalAttempts }} total attempts</p>
        </div>
      </div>

      <div class="stat-card stat-success">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <p class="stat-label">INTELLIGENCE POINTS</p>
          <p class="stat-value">{{ intelligencePoints }}</p>
          <p class="stat-detail">Rank: {{ agentRank }}</p>
        </div>
      </div>

      <div class="stat-card stat-info">
        <div class="stat-icon">🌍</div>
        <div class="stat-content">
          <p class="stat-label">COUNTRIES CLEARED</p>
          <p class="stat-value">{{ countriesCleared }}/{{ totalCountries }}</p>
          <p class="stat-detail">{{ totalCountries > 0 ? Math.round(countriesCleared/totalCountries*100) : 0 }}% completion</p>
        </div>
      </div>
    </div>

    <!-- Mission Log Feed -->
    <div class="mission-feed">
      <div class="feed-header">
        <h2>📡 LIVE INTELLIGENCE FEED</h2>
        <span class="feed-status">● ACTIVE</span>
      </div>

      <div class="feed-content">
        <div v-for="(log, idx) in missionLogs" :key="idx" :class="['feed-item', log.type]">
          <span class="feed-time">{{ log.time }}</span>
          <span class="feed-message">{{ log.message }}</span>
          <span class="feed-icon">{{ log.icon }}</span>
        </div>

        <div v-if="missionLogs.length === 0" class="no-activity">
          <p>No recent activity. All systems operational.</p>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="system-status">
      <h2>🛡️ SYSTEM STATUS</h2>
      <div class="status-grid">
        <div class="status-item">
          <span class="status-name">Database Connection</span>
          <span class="status-indicator online">● ONLINE</span>
        </div>
        <div class="status-item">
          <span class="status-name">Mission Server</span>
          <span class="status-indicator online">● ONLINE</span>
        </div>
        <div class="status-item">
          <span class="status-name">Authentication</span>
          <span class="status-indicator online">● ONLINE</span>
        </div>
        <div class="status-item">
          <span class="status-name">Intelligence API</span>
          <span class="status-indicator online">● ONLINE</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlayerProgress, getCurrentUserId } from '../library/supabase.js';

export default {
  name: 'DashboardView',
  data() {
    return {
      completedMissions: 0,
      failedMissions: 0,
      intelligencePoints: 0,
      countriesCleared: 0,
      totalCountries: 0,
      missionLogs: [],
      isLoading: true
    };
  },
  computed: {
    totalAttempts() {
      return this.completedMissions + this.failedMissions;
    },
    successRate() {
      if (this.totalAttempts === 0) return 0;
      return Math.round((this.completedMissions / this.totalAttempts) * 100);
    },
    agentRank() {
      if (this.intelligencePoints < 100) return 'RECRUIT';
      if (this.intelligencePoints < 250) return 'OPERATIVE';
      if (this.intelligencePoints < 500) return 'AGENT';
      return 'ELITE';
    }
  },
  mounted() {
    this.loadMissionProgress();
  },
  methods: {
    async loadMissionProgress() {
      this.isLoading = true;
      
      // Load total countries (Supabase + admin-created)
      this.totalCountries = await this.loadTotalCountries();
      
      const userId = getCurrentUserId();
      
      if (userId) {
        const playerStats = await getPlayerProgress(userId);
        
        if (playerStats) {
          this.completedMissions = playerStats.missions_completed || 0;
          this.failedMissions = playerStats.missions_failed || 0;
          this.intelligencePoints = playerStats.total_intel_points || 0;
          this.countriesCleared = (playerStats.countries_cleared || []).length;
        }
      }
      
      // Load completed countries from Supabase
      const completedCountries = await this.getCompletedCountries();
      this.countriesCleared = completedCountries.length;
      
      this.generateMissionLogs();
      this.isLoading = false;
    },

    async loadTotalCountries() {
      try {
        const { getCountriesByIds } = await import('../library/supabase.js');
        
        // Load all countries from Supabase only
        const result = await getCountriesByIds();
        
        if (result.success && result.data) {
          return result.data.length;
        }
        
        return 13; // fallback to original count
      } catch (err) {
        return 13; // fallback to original count
      }
    },

    async getCompletedCountries() {
      try {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
          return [];
        }
        
        const { getCompletedCountries } = await import('../library/supabase.js');
        const result = await getCompletedCountries(userId);
        
        if (result.success) {
          return result.data || [];
        }
        
        return [];
      } catch (err) {
        console.error('Error loading completed countries:', err);
        return [];
      }
    },

    saveCompletedCountries(countries) {
      // No longer needed - saving happens via markCountryCompleted in Supabase.vue
      // This method is kept for backwards compatibility
    },

    generateMissionLogs() {
      const logMessages = [
        { message: 'Agent logged into Command Center', icon: '🔓', type: 'info' },
        { message: 'Mission briefing files accessed', icon: '📂', type: 'info' },
        { message: `Mission success rate: ${this.successRate}%`, icon: '📈', type: 'success' },
        { message: `Intelligence database updated: +${this.intelligencePoints} points`, icon: '⭐', type: 'success' },
        { message: 'All systems operational', icon: '✅', type: 'info' },
        { message: 'Threat level: MINIMAL', icon: '🛡️', type: 'info' }
      ];

      const now = new Date();
      this.missionLogs = logMessages.map((log, idx) => ({
        ...log,
        time: new Date(now - idx * 60000).toLocaleTimeString()
      })).reverse();
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
  --bg-darker: #0a0e14;
}

.dashboard {
  padding: 40px;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  min-height: 100vh;
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  color: var(--text-primary);
}

.dashboard-header {
  margin-bottom: 40px;
  border-bottom: 3px solid var(--accent-cyan);
  padding-bottom: 20px;
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.05) 0%, transparent 100%);
}

.dashboard-header h1 {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  border-radius: 4px;
  border: 2px solid;
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.1) 0%, rgba(74, 157, 111, 0.05) 100%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 25px rgba(95, 179, 213, 0.2);
}

.stat-active {
  border-color: var(--accent-cyan);
}

.stat-success {
  border-color: var(--accent-green);
}

.stat-warning {
  border-color: #a83e3e;
}

.stat-info {
  border-color: var(--accent-magenta);
}

.stat-icon {
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--accent-cyan);
  margin: 0 0 4px 0;
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.3);
}

.stat-detail {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

/* Mission Feed */
.mission-feed {
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-cyan);
  border-radius: 4px;
  margin-bottom: 40px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.6);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--accent-cyan);
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.1) 0%, transparent 100%);
}

.feed-header h2 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
  color: var(--accent-cyan);
}

.feed-status {
  font-size: 10px;
  color: var(--accent-green);
  letter-spacing: 1px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.feed-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 20px;
}

.feed-item {
  display: flex;
  gap: 15px;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-left: 3px solid;
  border-radius: 2px;
  background: rgba(95, 179, 213, 0.05);
  font-size: 12px;
  align-items: center;
}

.feed-item.info {
  border-left-color: var(--accent-cyan);
}

.feed-item.success {
  border-left-color: var(--accent-green);
}

.feed-item.warning {
  border-left-color: var(--accent-orange);
}

.feed-time {
  color: var(--text-secondary);
  min-width: 80px;
  font-size: 10px;
}

.feed-message {
  flex: 1;
  color: var(--text-primary);
}

.feed-icon {
  font-size: 14px;
}

.no-activity {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary);
  font-size: 12px;
}

/* System Status */
.system-status {
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-magenta);
  border-radius: 4px;
  padding: 25px;
  box-shadow: 0 0 20px rgba(139, 90, 141, 0.2);
}

.system-status h2 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--accent-magenta);
  margin: 0 0 20px 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(139, 90, 141, 0.05);
  border: 1px solid rgba(139, 90, 141, 0.2);
  border-radius: 3px;
}

.status-name {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.status-indicator {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 5px 10px;
  border-radius: 3px;
}

.status-indicator.online {
  color: var(--accent-green);
  background: rgba(74, 157, 111, 0.1);
  border: 1px solid var(--accent-green);
}

/* Scrollbar */
.feed-content::-webkit-scrollbar {
  width: 8px;
}

.feed-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.5);
}

.feed-content::-webkit-scrollbar-thumb {
  background: var(--accent-cyan);
  border-radius: 4px;
}

.feed-content::-webkit-scrollbar-thumb:hover {
  background: var(--accent-green);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
