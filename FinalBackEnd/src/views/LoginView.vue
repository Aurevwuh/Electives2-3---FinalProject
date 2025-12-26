<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Terminal-style header -->
      <div class="terminal-header">
        <div class="header-bar">
          <span class="system-label">🕵️ SPY COMMAND SYSTEM</span>
          <span class="status-indicator">ACTIVE</span>
        </div>
      </div>

      <!-- Main login form -->
      <div class="login-content">
        <div class="form-wrapper">
          <h1 class="mission-title">AGENT LOGIN</h1>
          <p class="mission-subtitle">Access Restricted to Authorized Personnel Only</p>

          <form @submit.prevent="login" class="login-form">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📧</span>
                <span>AGENT EMAIL</span>
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

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔐</span>
                <span>SECURITY PASS</span>
              </label>
              <div class="input-wrapper">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password" 
                  placeholder="Enter your secure password"
                  class="form-input"
                  required 
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="toggle-password-btn"
                  :title="showPassword ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword ? '👁️‍🗨️' : '🔐' }}
                </button>
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

            <!-- Login button -->
            <button type="submit" class="login-btn">
              <span class="btn-text">AUTHENTICATE</span>
              <span class="btn-accent">→</span>
            </button>
          </form>

          <!-- Sign up link -->
          <div class="auth-footer">
            <p class="footer-text">New to the operation?</p>
            <router-link to="/signup" class="signup-link">
              REQUEST ACCESS
            </router-link>
          </div>
        </div>
      </div>

      <!-- Terminal-style footer -->
      <div class="terminal-footer">
        <div class="footer-bar">
          <span class="system-time">INITIALIZED 2025-12-02</span>
          <span class="system-status">● SYSTEM READY</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authenticateUser } from '../library/supabase.js'

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      error: "",
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    async login() {
      this.error = "";
      this.isLoading = true;

      if (!this.email || !this.password) {
        this.error = "Email and password are required!";
        this.isLoading = false;
        return;
      }

      const result = await authenticateUser(this.email, this.password);
      
      if (result.success) {
        // Store the user role as admin only
        localStorage.setItem('userRole', 'admin');
        this.$router.push("/admin-crud");
      } else {
        this.error = result.message || "Authentication failed!";
      }

      this.isLoading = false;
    }
  }
};
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
}

.login-page {
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
.login-page::before {
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

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
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

/* Main login content */
.login-content {
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
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
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

/* Login form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
}

.label-icon {
  font-size: 14px;
}

/* Input styling */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(26, 35, 50, 0.6);
  border: 1px solid var(--text-secondary);
  border-radius: 2px;
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
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

.toggle-password-btn {
  position: absolute;
  right: 12px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-cyan);
  transition: all 0.3s ease;
}

.toggle-password-btn:hover {
  transform: scale(1.1);
  color: var(--accent-green);
}

.input-indicator {
  position: absolute;
  right: 45px;
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.form-input:focus ~ .toggle-password-btn {
  color: var(--accent-green);
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
  padding: 12px 14px;
  background: rgba(168, 62, 62, 0.15);
  border: 1px solid var(--error-color);
  border-radius: 2px;
  color: var(--error-color);
  font-size: 12px;
  font-weight: 500;
  animation: slideInDown 0.3s ease;
}

.error-icon {
  font-size: 14px;
}

.error-text {
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
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Login button */
.login-btn {
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(74, 157, 111, 0.2) 0%, rgba(95, 179, 213, 0.1) 100%);
  border: 2px solid var(--accent-green);
  color: var(--accent-green);
  font-family: 'Roboto Mono', 'Orbitron', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  outline: none;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(74, 157, 111, 0.3), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(95, 179, 213, 0.4), inset 0 0 10px rgba(95, 179, 213, 0.1);
  transform: translateY(-2px);
}

.login-btn:hover::before {
  left: 100%;
}

.btn-text {
  font-weight: 700;
}

.btn-accent {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.login-btn:hover .btn-accent {
  transform: translateX(4px);
}

/* Auth footer */
.auth-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(95, 179, 213, 0.2);
}

.footer-text {
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
  letter-spacing: 0.5px;
}

.signup-link {
  color: var(--accent-magenta);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 2px;
}

.signup-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent-magenta);
  transition: width 0.3s ease;
}

.signup-link:hover {
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(95, 179, 213, 0.3);
}

.signup-link:hover::after {
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
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.system-time {
  color: var(--text-secondary);
}

.system-status {
  color: var(--accent-green);
  font-size: 9px;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 600px) {
  .login-container {
    margin: 0 15px;
  }

  .login-content {
    padding: 30px 20px;
  }

  .mission-title {
    font-size: 22px;
    letter-spacing: 2px;
  }

  .login-btn {
    font-size: 12px;
  }
}
</style>
