<template>
  <div class="signup-page">
    <div class="signup-container">
      <!-- Terminal-style header -->
      <div class="terminal-header">
        <div class="header-bar">
          <span class="system-label">🕵️ AGENT REGISTRY SYSTEM</span>
          <span class="status-indicator">READY</span>
        </div>
      </div>

      <!-- Main signup form -->
      <div class="signup-content">
        <div class="form-wrapper">
          <h1 class="mission-title">AGENT RECRUITMENT</h1>
          <p class="mission-subtitle">Complete Your Initiation Protocol</p>

          <form @submit.prevent="handleSignup" class="signup-form">
            <!-- Name field -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                <span>AGENT CODENAME</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="name" 
                  placeholder="Enter your operational codename"
                  class="form-input"
                  required 
                />
                <div class="input-indicator"></div>
              </div>
            </div>

            <!-- Email field -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📧</span>
                <span>SECURE EMAIL</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="email" 
                  v-model="email" 
                  placeholder="Enter your secure email"
                  class="form-input"
                  required 
                />
                <div class="input-indicator"></div>
              </div>
            </div>

            <!-- Password field -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔐</span>
                <span>SECURITY PROTOCOL</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="password" 
                  v-model="password" 
                  placeholder="Create your security protocol"
                  class="form-input"
                  required 
                />
                <div class="input-indicator"></div>
              </div>
            </div>

            <!-- Confirm Password field -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔒</span>
                <span>VERIFY PROTOCOL</span>
              </label>
              <div class="input-wrapper">
                <input 
                  type="password" 
                  v-model="confirmPassword" 
                  placeholder="Confirm your security protocol"
                  class="form-input"
                  required 
                />
                <div class="input-indicator"></div>
              </div>
            </div>

            <!-- Error message -->
            <transition name="error-fade">
              <div v-if="error" class="error-alert">
                <span class="error-icon">⚠️</span>
                <span class="error-text">{{ error }}</span>
              </div>
            </transition>

            <!-- Success message -->
            <transition name="success-fade">
              <div v-if="success" class="success-alert">
                <span class="success-icon">✓</span>
                <span class="success-text">{{ success }}</span>
              </div>
            </transition>

            <!-- Signup button -->
            <button type="submit" class="signup-btn" :disabled="success || isSubmitting">
              <span class="btn-text">COMMENCE RECRUITMENT</span>
              <span class="btn-accent">→</span>
            </button>
          </form>

          <!-- Login link -->
          <div class="auth-footer">
            <p class="footer-text">Already recruited?</p>
            <router-link to="/login" class="login-link">
              RETURN TO COMMAND
            </router-link>
          </div>
        </div>
      </div>

      <!-- Terminal-style footer -->
      <div class="terminal-footer">
        <div class="footer-bar">
          <span class="system-time">PROTOCOL ACTIVE</span>
          <span class="system-status">● AWAITING CONFIRMATION</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { registerUser } from '../library/supabase.js'
import soundManager from '@/library/soundManager.js'

export default {
  components: { RouterLink },
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: '',
      isSubmitting: false
    }
  },
  mounted() {
    // Make sure start menu music is playing
    soundManager.playStartMenuMusic();
  },
  methods: {
    async handleSignup() {
      this.error = ''
      this.success = ''

      if (!this.name || !this.email || !this.password || !this.confirmPassword) {
        this.error = 'All fields are required.'
        return
      }

      if (!this.email.includes('@')) {
        this.error = 'Invalid email format.'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match.'
        return
      }

      this.isSubmitting = true

      const result = await registerUser(this.email, this.password, this.name)

      if (result.success) {
        this.success = 'Registration successful! Redirecting to login...'
        // Stop start menu music when registration completes
        soundManager.stopStartMenuMusic();
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } else {
        this.error = result.message || 'Registration failed. Please try again.'
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Mono:wght@400;500;600;700&display=swap');

:root {
  --accent-cyan: #5fb3d5;
  --accent-green: #4a9d6f;
  --accent-magenta: #8b5a8d;
  --text-primary: #c5d3e0;
  --text-secondary: #7a8fa0;
  --bg-dark: #0f1419;
  --bg-darker: #0a0e14;
  --error-color: #a83e3e;
  --success-color: #4a9d6f;
}

.signup-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e14 0%, #0f1419 50%, #1a2332 100%);
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  position: relative;
  overflow: hidden;
}

/* Animated background scanlines */
.signup-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(95, 179, 213, 0.03) 0px,
    rgba(95, 179, 213, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1;
  animation: scanlines 8s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}

.signup-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 500px;
  margin: 0 20px;
}

/* Terminal header */
.terminal-header {
  border: 2px solid var(--accent-cyan);
  border-bottom: none;
  background: linear-gradient(180deg, rgba(95, 179, 213, 0.1) 0%, transparent 100%);
  padding: 12px 20px;
  margin-bottom: 0;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.system-label {
  color: var(--accent-cyan);
  font-weight: 700;
}

.status-indicator {
  color: var(--accent-green);
  font-size: 9px;
  letter-spacing: 1px;
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Main signup content */
.signup-content {
  border: 2px solid var(--accent-cyan);
  border-top: none;
  background: linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%);
  padding: 40px 35px;
  backdrop-filter: blur(10px);
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mission-title {
  color: var(--accent-cyan);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(95, 179, 213, 0.4);
}

.mission-subtitle {
  color: var(--text-secondary);
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

/* Signup form */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-green);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
}

.label-icon {
  font-size: 13px;
}

/* Input styling */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 11px 13px;
  background: rgba(26, 35, 50, 0.6);
  border: 1px solid var(--text-secondary);
  border-radius: 2px;
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.form-input:focus {
  border-color: var(--accent-cyan);
  background: rgba(26, 35, 50, 0.9);
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.3), inset 0 0 10px rgba(95, 179, 213, 0.1);
}

.input-indicator {
  position: absolute;
  right: 10px;
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.form-input:focus ~ .input-indicator {
  background: var(--accent-cyan);
  opacity: 1;
  box-shadow: 0 0 8px var(--accent-cyan);
}

/* Error alert */
.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  background: rgba(168, 62, 62, 0.15);
  border: 1px solid var(--error-color);
  border-radius: 2px;
  color: var(--error-color);
  font-size: 11px;
  font-weight: 500;
  animation: slideInDown 0.3s ease;
}

.error-icon {
  font-size: 13px;
}

.error-text {
  flex: 1;
}

/* Success alert */
.success-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  background: rgba(74, 157, 111, 0.15);
  border: 1px solid var(--success-color);
  border-radius: 2px;
  color: var(--success-color);
  font-size: 11px;
  font-weight: 500;
  animation: slideInDown 0.3s ease;
}

.success-icon {
  font-size: 13px;
}

.success-text {
  flex: 1;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-fade-enter-active,
.error-fade-leave-active,
.success-fade-enter-active,
.success-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to,
.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Signup button */
.signup-btn {
  padding: 13px 20px;
  background: linear-gradient(135deg, rgba(95, 179, 213, 0.2) 0%, rgba(74, 157, 111, 0.1) 100%);
  border: 2px solid var(--accent-cyan);
  color: var(--accent-cyan);
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  outline: none;
  position: relative;
  overflow: hidden;
}

.signup-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(95, 179, 213, 0.3), transparent);
  transition: left 0.5s ease;
}

.signup-btn:hover:not(:disabled) {
  border-color: var(--accent-green);
  color: var(--accent-green);
  box-shadow: 0 0 20px rgba(74, 157, 111, 0.4), inset 0 0 10px rgba(74, 157, 111, 0.1);
  transform: translateY(-2px);
}

.signup-btn:hover:not(:disabled)::before {
  left: 100%;
}

.signup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  font-weight: 700;
}

.btn-accent {
  font-size: 15px;
  transition: transform 0.3s ease;
}

.signup-btn:hover:not(:disabled) .btn-accent {
  transform: translateX(4px);
}

/* Auth footer */
.auth-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(95, 179, 213, 0.2);
}

.footer-text {
  color: var(--text-secondary);
  font-size: 11px;
  margin: 0;
  letter-spacing: 0.5px;
}

.login-link {
  color: var(--accent-magenta);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 2px;
}

.login-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent-magenta);
  transition: width 0.3s ease;
}

.login-link:hover {
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.3);
}

.login-link:hover::after {
  width: 100%;
}

/* Terminal footer */
.terminal-footer {
  border: 2px solid var(--accent-cyan);
  border-top: none;
  background: linear-gradient(180deg, transparent 0%, rgba(95, 179, 213, 0.1) 100%);
  padding: 12px 20px;
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.system-time {
  color: var(--text-secondary);
}

.system-status {
  color: var(--accent-green);
  font-size: 8px;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 600px) {
  .signup-container {
    margin: 0 15px;
  }

  .signup-content {
    padding: 30px 20px;
  }

  .mission-title {
    font-size: 20px;
    letter-spacing: 1px;
  }

  .signup-btn {
    font-size: 11px;
  }
}
</style>
