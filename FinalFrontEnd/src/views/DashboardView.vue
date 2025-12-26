<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>MISSION COMMAND CENTER</h1>
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
          <p class="stat-detail">{{ failureRate }}% failure rate</p>
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
          <p class="stat-detail">{{ completionPercentage }}% completion</p>
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

    <!-- Leaderboard -->
    <div class="leaderboard">
      <div class="leaderboard-header">
        <h2>🏆 GLOBAL LEADERBOARD</h2>
        <span class="leaderboard-status">TOP AGENTS</span>
      </div>

      <div class="leaderboard-content">
        <div v-for="(agent, idx) in leaderboard" :key="idx" :class="['leaderboard-row', { 'current-agent': agent.isCurrentUser }]">
          <span class="rank">{{ idx + 1 }}</span>
          <span class="agent-name">{{ agent.name }}</span>
          <span class="agent-score">{{ agent.score }} pts</span>
          <span class="agent-rank-badge">{{ agent.rank }}</span>
        </div>

        <div v-if="leaderboard.length === 0" class="no-data">
          <p>Loading leaderboard data...</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getPlayerProgress, getCurrentUserId, getTotalCountries, getAllPlayers, getPlayerRank } from '../library/supabase.js';
import soundManager from '../library/soundManager.js';
import { useRoute } from 'vue-router';

export default {
  name: 'DashboardView',
  setup() {
    return {
      route: useRoute()
    };
  },
  data() {
    return {
      completedMissions: 0,
      failedMissions: 0,
      intelligencePoints: 0,
      countriesCleared: 0,
      totalCountries: 0,
      missionLogs: [],
      leaderboard: [],
      currentUserId: null,
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
    failureRate() {
      if (this.totalAttempts === 0) return 0;
      return Math.round((this.failedMissions / this.totalAttempts) * 100);
    },
    agentRank() {
      if (this.intelligencePoints < 100) return 'RECRUIT';
      if (this.intelligencePoints < 250) return 'OPERATIVE';
      if (this.intelligencePoints < 500) return 'AGENT';
      return 'ELITE';
    },
    completionPercentage() {
      if (this.totalCountries === 0) return 0;
      return Math.round((this.countriesCleared / this.totalCountries) * 100);
    }
  },
  watch: {
    // Watch for route changes and refresh data when navigating back to dashboard
    'route.path'(newPath) {
      if (newPath === '/dashboard') {
        this.refreshDashboardData();
      }
    }
  },
  mounted() {
    this.currentUserId = getCurrentUserId();
    this.loadMissionProgress();
    this.loadLeaderboard().catch(err => console.error('Leaderboard error:', err));
    soundManager.playBackgroundMusic();
  },
  methods: {
    async refreshDashboardData() {
      // Refresh all dashboard data
      await this.loadMissionProgress();
      await this.loadLeaderboard().catch(err => console.error('Leaderboard error:', err));
    },

    async loadMissionProgress() {
      this.isLoading = true;
      const userId = getCurrentUserId();
      
      // Fetch total countries count from Supabase
      this.totalCountries = await getTotalCountries();
      
      if (userId) {
        const playerStats = await getPlayerProgress(userId);
        
        if (playerStats) {
          this.completedMissions = playerStats.missions_completed || 0;
          this.failedMissions = playerStats.missions_failed || 0;
          this.intelligencePoints = playerStats.total_intel_points || 0;
          this.countriesCleared = (playerStats.countries_cleared || []).length;
        }
      }
      
      this.generateMissionLogs();
      this.isLoading = false;
    },

    generateMissionLogs() {
      const logs = [];
      
      // System initialization
      logs.push({ 
        message: 'Agent logged into Command Center', 
        icon: '🔓', 
        type: 'info' 
      });
      
      // Show status based on actual data
      if (this.totalAttempts === 0) {
        logs.push({ 
          message: 'No missions attempted yet. Ready for deployment.', 
          icon: '📋', 
          type: 'info' 
        });
      } else {
        // Most recent activity indicator
        if (this.completedMissions > 0) {
          logs.push({ 
            message: `Last mission: SUCCESSFUL (${this.successRate}% success rate)`, 
            icon: '✅', 
            type: 'success' 
          });
        }
        if (this.failedMissions > 0) {
          logs.push({ 
            message: `Recent failures detected: ${this.failedMissions} mission(s) below threshold`, 
            icon: '⚠️', 
            type: 'warning' 
          });
        }
      }
      
      // Countries cleared status
      if (this.countriesCleared > 0) {
        logs.push({ 
          message: `${this.countriesCleared} of ${this.totalCountries} countries cleared`, 
          icon: '🌍', 
          type: 'info' 
        });
      }
      
      // Agent rank milestone
      logs.push({ 
        message: `Agent Rank: ${this.agentRank} (${this.intelligencePoints} points)`, 
        icon: '⭐', 
        type: 'success' 
      });
      
      // System operational message
      logs.push({ 
        message: 'All systems operational - Ready for next deployment', 
        icon: '🛡️', 
        type: 'info' 
      });

      // Generate timestamps (more recent at bottom)
      const now = new Date();
      this.missionLogs = logs.map((log, idx) => ({
        ...log,
        time: new Date(now - (logs.length - idx - 1) * 15000).toLocaleTimeString()
      }));
    },

    async loadLeaderboard() {
      try {
        const allPlayers = await getAllPlayers(100);
        
        // Transform data for display
        this.leaderboard = allPlayers.map(player => ({
          name: player.username.toUpperCase(),
          score: player.score,
          rank: getPlayerRank(player.score),
          isCurrentUser: player.userId === this.currentUserId
        })).sort((a, b) => b.score - a.score);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        // Fallback to empty leaderboard
        this.leaderboard = [];
      }
    },

    getCurrentUserName() {
      // Get current user's name - you can enhance this with actual user data
      return 'CURRENT AGENT';
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

/* Leaderboard */
.leaderboard {
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border: 2px solid var(--accent-orange);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(212, 132, 74, 0.2);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid var(--accent-orange);
  background: linear-gradient(90deg, rgba(212, 132, 74, 0.1) 0%, transparent 100%);
}

.leaderboard-header h2 {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
  color: var(--accent-orange);
}

.leaderboard-status {
  font-size: 10px;
  color: var(--accent-orange);
  letter-spacing: 1px;
  font-weight: 700;
}

.leaderboard-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 0;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 40px 1fr 100px 100px;
  gap: 15px;
  padding: 12px 25px;
  border-bottom: 1px solid rgba(212, 132, 74, 0.1);
  align-items: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.leaderboard-row:hover {
  background: rgba(212, 132, 74, 0.05);
}

.leaderboard-row.current-agent {
  background: rgba(212, 132, 74, 0.15);
  border-left: 3px solid var(--accent-orange);
}

.rank {
  font-weight: 700;
  color: var(--accent-orange);
  font-size: 14px;
  text-align: center;
}

.agent-name {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.agent-score {
  color: var(--accent-cyan);
  text-align: right;
  font-weight: 700;
}

.agent-rank-badge {
  background: rgba(212, 132, 74, 0.2);
  color: var(--accent-orange);
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary);
  font-size: 12px;
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
