<script>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { logoutUser } from './library/supabase.js'

export default {
  name: 'App',
  components: { RouterLink, RouterView },
  data() {
    return {
      route: useRoute()
    }
  },
  computed: {
    hideLayout() {
      return this.route.path === '/login' || this.route.path === '/signup' || this.route.path === '/'
    }
  },
  methods: {
    logout() {
      logoutUser()
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <div class="wrap">
    <header class="header" v-if="!hideLayout">
      <div class="logo-placeholder">
        <img src="/images/Logo.png" alt="Spy Espionage" class="logo-image" />
        <span class="logo-text">Spy Espionage</span>
        <span class="logo-status">ONLINE</span>
      </div>
    </header>

    <div class="main">
      <div class="content">
        <div class="content-inner">
          <Transition name="fade-slide" mode="out-in">
            <RouterView />
          </Transition>
        </div>
      </div>
    </div>

    <nav class="nav-bottom" v-if="!hideLayout">
      <div class="nav-container">
        <RouterLink to="/dashboard" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </RouterLink>
        <RouterLink to="/about" class="nav-item">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-label">About</span>
        </RouterLink>
        <RouterLink to="/worldoverview" class="nav-item">
          <span class="nav-icon">🗺️</span>
          <span class="nav-label">World</span>
        </RouterLink>
        <RouterLink to="/intelligence-hq" class="nav-item">
          <span class="nav-icon">🔐</span>
          <span class="nav-label">HQ</span>
        </RouterLink>
        <a href="#" @click.prevent="logout" class="nav-item logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Logout</span>
        </a>
      </div>
    </nav>
  </div>
</template>



<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');

:root {
  --primary-color: #0f1419;
  --secondary-color: #1a2332;
  --accent-green: #4a9d6f;
  --accent-cyan: #5fb3d5;
  --accent-magenta: #8b5a8d;
  --accent-orange: #6b4423;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
  --border-primary: #5fb3d5;
  --border-secondary: #8b5a8d;
  --nav-height: 90px;
}

* {
  font-family: 'Space Mono', 'Orbitron', 'Courier New', monospace;
}

body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #0f1419 0%, #1a2f4a 50%, #0f1419 100%);
}

/* ============ ANIMATIONS ============ */
@keyframes glitchText {
  0% { text-shadow: 0 0 15px var(--accent-cyan), 0 0 30px rgba(0, 217, 255, 0.5); }
  50% { text-shadow: 0 0 20px var(--accent-magenta), 0 0 40px rgba(255, 0, 110, 0.5); }
  100% { text-shadow: 0 0 15px var(--accent-cyan), 0 0 30px rgba(0, 217, 255, 0.5); }
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}

@keyframes glow {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 10px rgba(0, 217, 255, 0.4); }
  50% { opacity: 1; box-shadow: 0 0 20px rgba(0, 217, 255, 0.8); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes borderPulse {
  0%, 100% { border-color: var(--accent-cyan); }
  50% { border-color: var(--accent-magenta); }
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

@keyframes slideOutDown {
  from { 
    opacity: 1;
    transform: translateY(0);
  }
  to { 
    opacity: 0;
    transform: translateY(30px);
  }
}

/* ============ HEADER ============ */
.header {
  background: linear-gradient(to right, #1a2f4a 0%, #2a3f5a 50%, #1a2f4a 100%);
  color: var(--accent-cyan);
  padding: 20px 30px;
  flex-shrink: 0;
  font-weight: bold;
  border-bottom: 3px solid;
  border-image: linear-gradient(to right, var(--accent-cyan), var(--accent-magenta), var(--accent-cyan)) 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(0, 217, 255, 0.05) 50%, transparent 70%);
  pointer-events: none;
  animation: slideInUp 0.8s ease-out;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 1;
}

.logo-image {
  height: 60px;
  width: auto;
  max-width: 70px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(95, 179, 213, 0.4));
  transition: filter 0.3s ease;
}

.logo-text {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 4px;
  color: var(--accent-cyan);
  animation: glitchText 3s ease-in-out infinite;
}

.logo-status {
  font-size: 11px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(255, 0, 110, 0.1));
  border: 2px solid var(--accent-green);
  border-radius: 20px;
  color: var(--accent-green);
  letter-spacing: 2px;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

/* ============ MAIN CONTENT ============ */
.main {
  display: flex;
  flex: 1;
  min-height: 0;
  background: linear-gradient(135deg, #0f1419 0%, #1a2f4a 50%, #0f1419 100%);
  overflow: hidden;
  flex-direction: column;
}

.content {
  flex: 1;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 2px solid rgba(95, 179, 213, 0.15);
  border-bottom: 2px solid rgba(139, 90, 141, 0.15);
  box-shadow: inset 0 10px 40px rgba(0, 0, 0, 0.6);
  position: relative;
}

.content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(95, 179, 213, 0.01) 0px,
    rgba(95, 179, 213, 0.01) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: scanlines 8s linear infinite;
}

.content-inner {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: radial-gradient(ellipse at center, rgba(95, 179, 213, 0.02) 0%, transparent 100%);
  animation: slideInUp 0.6s ease-out 0.1s both;
  position: relative;
  z-index: 1;
}

/* Content transition animations */
:deep(.content-inner > *) {
  animation: slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.content-inner::-webkit-scrollbar {
  width: 12px;
}

.content-inner::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.8);
  border-left: 2px solid var(--accent-cyan);
}

.content-inner::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--accent-cyan), var(--accent-magenta));
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(95, 179, 213, 0.3);
}

.content-inner::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--accent-magenta), var(--accent-cyan));
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.5);
}

/* ============ BOTTOM NAVIGATION ============ */
.nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: linear-gradient(to top, #1a2f4a 0%, #2a3f5a 50%, #1a2f4a 100%);
  border-top: 3px solid;
  border-image: linear-gradient(to right, var(--accent-magenta), var(--accent-cyan), var(--accent-magenta)) 1;
  box-shadow: 0 -0 30px rgba(95, 179, 213, 0.2), inset 0 2px 20px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: slideInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.nav-bottom::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(95, 179, 213, 0.03) 50%, transparent 100%);
  pointer-events: none;
}

.nav-container {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 0 30px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 3px solid transparent;
  background: rgba(95, 179, 213, 0.05);
  cursor: pointer;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(95, 179, 213, 0.15), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.15) 0%, rgba(139, 90, 141, 0.08) 100%);
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
  text-shadow: 0 0 12px rgba(95, 179, 213, 0.6);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.2), inset 0 0 15px rgba(95, 179, 213, 0.08);
  transform: translateY(-4px);
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2) 0%, rgba(139, 90, 141, 0.12) 100%);
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-magenta);
  text-shadow: 0 0 15px rgba(95, 179, 213, 0.7), 0 0 8px rgba(139, 90, 141, 0.6);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.3), inset 0 0 20px rgba(95, 179, 213, 0.1);
}

.nav-item.logout {
  border-bottom-color: transparent;
  background: rgba(139, 90, 141, 0.08);
}

.nav-item.logout:hover {
  border-bottom-color: var(--accent-magenta);
  background: linear-gradient(135deg, rgba(139, 90, 141, 0.15) 0%, rgba(95, 179, 213, 0.08) 100%);
  color: var(--accent-magenta);
  text-shadow: 0 0 12px rgba(139, 90, 141, 0.7);
  box-shadow: 0 0 15px rgba(139, 90, 141, 0.2), inset 0 0 15px rgba(139, 90, 141, 0.08);
}

.nav-icon {
  font-size: 24px;
  display: inline-block;
  filter: drop-shadow(0 0 6px rgba(95, 179, 213, 0.4));
  transition: filter 0.3s ease;
}

.nav-item:hover .nav-icon {
  filter: drop-shadow(0 0 12px rgba(95, 179, 213, 0.7));
}

.nav-item.logout:hover .nav-icon {
  filter: drop-shadow(0 0 12px rgba(139, 90, 141, 0.7));
}

.nav-item.router-link-active .nav-icon {
  filter: drop-shadow(0 0 12px rgba(74, 157, 111, 0.7));
}

.nav-label {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

/* ============ UTILITY ANIMATIONS ============ */
/* View transition animations */
:deep(.router-view-enter-active) {
  animation: slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.router-view-leave-active) {
  animation: slideOutDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Transition Component Styles */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Responsive Design */
@media (max-width: 768px) {
  :root {
    --nav-height: 100px;
  }

  .header {
    padding: 15px 20px;
  }

  .logo-text {
    font-size: 20px;
    letter-spacing: 2px;
  }

  .content-inner {
    padding: 20px;
  }

  .nav-container {
    gap: 10px;
    padding: 0 15px;
  }

  .nav-item {
    padding: 10px 15px;
  }

  .nav-label {
    font-size: 9px;
  }

  .nav-icon {
    font-size: 20px;
  }
}

</style>
