<template>
  <div class="about-container">
    <!-- Header -->
    <div class="about-header">
      <h1>SPY ESPIONAGE: OPERATION DOSSIER</h1>
      <p class="subtitle">Intelligence Operations Framework v1.0</p>
    </div>

    <!-- Mission Overview -->
    <div class="section">
      <h2 class="section-title">📋 MISSION OVERVIEW</h2>
      <p class="content-text">
        Spy Espionage is an interactive educational platform designed to test and enhance your knowledge 
        of global geopolitics, history, and intelligence operations. Navigate through carefully crafted 
        missions spanning different critical countries, each containing challenging quizzes and mind-bending puzzles.
      </p>
    </div>

    <!-- How It Works -->
    <div class="section">
      <h2 class="section-title">🎮 HOW IT WORKS</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🗺️</div>
          <h3>WORLD MAP</h3>
          <p>Click on any highlighted country to access its mission briefing and intelligence dossier.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">❓</div>
          <h3>INTELLIGENCE TESTS</h3>
          <p>Answer multiple-choice questions to demonstrate your knowledge. Wrong answers will advance to the next mission.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🧩</div>
          <h3>PUZZLE CHALLENGES</h3>
          <p>Solve arrow sequence puzzles using keyboard controls (Arrow Keys) or on-screen buttons.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3>RANKING SYSTEM</h3>
          <p>Earn Intelligence Points and climb the ranks: Recruit → Operative → Agent → Elite.</p>
        </div>
      </div>
    </div>

    <!-- Game Mechanics -->
    <div class="section">
      <h2 class="section-title">🛠️ GAME MECHANICS</h2>
      <div class="mechanics-list">
        <div class="mechanic-item">
          <span class="mechanic-icon">+10</span>
          <span class="mechanic-text">Points earned for each correct answer in intelligence tests</span>
        </div>
        <div class="mechanic-item">
          <span class="mechanic-icon">+15</span>
          <span class="mechanic-text">Points earned for each successfully completed puzzle</span>
        </div>
        <div class="mechanic-item">
          <span class="mechanic-icon">3</span>
          <span class="mechanic-text">Maximum attempts allowed per puzzle challenge</span>
        </div>
        <div class="mechanic-item">
          <span class="mechanic-icon">6s</span>
          <span class="mechanic-text">Flash sequence display time before solving begins</span>
        </div>
        <div class="mechanic-item">
          <span class="mechanic-icon">🔙</span>
          <span class="mechanic-text">Press Backspace/Delete to undo arrow entries during puzzles</span>
        </div>
      </div>
    </div>

    <!-- Countries -->
    <div class="section">
      <h2 class="section-title">🌍 OPERATIONAL THEATERS</h2>
      <p class="content-text">
        Missions are available across strategically important nations worldwide:
      </p>
      <div class="countries-grid">
        <div v-for="country in countries" :key="country.id" class="country-badge">
          {{ country.name }}
        </div>
      </div>
    </div>

    <!-- Dashboard -->
    <div class="section">
      <h2 class="section-title">📊 COMMAND CENTER</h2>
      <p class="content-text">
        Visit the Dashboard to track your operational statistics, including missions completed, 
        success rates, intelligence points earned, and countries cleared. Monitor system status and 
        receive real-time intelligence updates.
      </p>
    </div>

    <!-- Tips & Strategies -->
    <div class="section tips-section">
      <h2 class="section-title">💡 OPERATIONAL TIPS</h2>
      <div class="tips-grid">
        <div class="tip-card">
          <p class="tip-title">Read Carefully</p>
          <p class="tip-text">Pay close attention to question wording. Details matter in intelligence operations.</p>
        </div>

        <div class="tip-card">
          <p class="tip-title">Memory Training</p>
          <p class="tip-text">Use the 6-second flash sequence to memorize arrow patterns before attempting to replicate them.</p>
        </div>

        <div class="tip-card">
          <p class="tip-title">Strategic Planning</p>
          <p class="tip-text">Plan your arrows before entering them. Use Backspace to correct mistakes.</p>
        </div>

        <div class="tip-card">
          <p class="tip-title">Practice</p>
          <p class="tip-text">Revisit missions to improve scores and climb the agent ranking system.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="about-footer">
      <p>🔐 Classified Intelligence Platform | Secure Communication Protocol Enabled</p>
      <p>© 2025 Spy Espionage Operations | All Rights Reserved</p>
    </div>
  </div>
</template>

<script>
import { getAllCountries } from '../library/supabase.js';

export default {
  name: 'AboutView',
  data() {
    return {
      countries: []
    };
  },
  async mounted() {
    this.countries = await getAllCountries();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

:root {
  --accent-cyan: #5fb3d5;
  --accent-green: #4a9d6f;
  --accent-magenta: #8b5a8d;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
  --bg-dark: #0f1419;
}

.about-container {
  padding: 40px;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  min-height: 100vh;
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  color: var(--text-primary);
}

.about-header {
  margin-bottom: 50px;
  text-align: center;
  border-bottom: 3px solid var(--accent-cyan);
  padding-bottom: 30px;
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.05) 0%, transparent 50%, rgba(95, 179, 213, 0.05) 100%);
}

.about-header h1 {
  font-size: 36px;
  font-weight: 900;
  color: var(--accent-cyan);
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.4);
  letter-spacing: 3px;
  margin: 0 0 15px 0;
}

.subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
}

/* Sections */
.section {
  margin-bottom: 50px;
  padding: 30px;
  background: linear-gradient(135deg, #1a2f4a 0%, #1a1f33 100%);
  border-left: 4px solid var(--accent-cyan);
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-cyan);
  letter-spacing: 2px;
  margin: 0 0 20px 0;
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.2);
}

.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  padding: 20px;
  background: rgba(74, 157, 111, 0.08);
  border: 2px solid var(--accent-green);
  border-radius: 4px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(74, 157, 111, 0.15);
  box-shadow: 0 0 20px rgba(74, 157, 111, 0.3);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}

.feature-card h3 {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-green);
  letter-spacing: 1px;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.feature-card p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Mechanics List */
.mechanics-list {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.mechanic-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: rgba(139, 90, 141, 0.05);
  border-left: 3px solid var(--accent-magenta);
  border-radius: 3px;
}

.mechanic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(139, 90, 141, 0.2), rgba(95, 179, 213, 0.1));
  border: 2px solid var(--accent-magenta);
  border-radius: 4px;
  font-weight: 700;
  color: var(--accent-magenta);
}

.mechanic-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.6;
}

/* Countries Grid */
.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.country-badge {
  padding: 12px;
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.15), rgba(74, 157, 111, 0.1));
  border: 2px solid var(--accent-cyan);
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: var(--accent-cyan);
  transition: all 0.3s ease;
  cursor: default;
}

.country-badge:hover {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.25), rgba(74, 157, 111, 0.15));
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3);
}

/* Tips Section */
.tips-section {
  border-left-color: var(--accent-green);
}

.tips-section .section-title {
  color: var(--accent-green);
  text-shadow: 0 0 10px rgba(74, 157, 111, 0.2);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tip-card {
  padding: 20px;
  background: rgba(74, 157, 111, 0.08);
  border: 1px solid var(--accent-green);
  border-radius: 4px;
}

.tip-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-green);
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.tip-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Footer */
.about-footer {
  text-align: center;
  padding: 30px;
  border-top: 2px solid var(--accent-cyan);
  margin-top: 50px;
  background: rgba(95, 179, 213, 0.05);
}

.about-footer p {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin: 8px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .about-container {
    padding: 20px;
  }

  .about-header h1 {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .section {
    padding: 20px;
  }

  .features-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
