<template>
  <div class="splash-container" @click="handleSplashClick">
    <!-- Animated background scan lines -->
    <div class="scan-lines"></div>
    
    <!-- Side glitch effects -->
    <div class="side-glitch left"></div>
    <div class="side-glitch right"></div>
    
    <!-- Vertical light beams -->
    <div class="light-beam left"></div>
    <div class="light-beam right"></div>
    
    <!-- Image with glitch effect -->
    <img src="/images/GameCover.png" alt="Game Cover" class="splash-image" />
    
    <!-- Overlay with animated elements -->
    <div class="splash-overlay">
      <div class="click-to-enter">
        <span class="glitch" data-text="CLICK TO ENTER">CLICK TO ENTER</span>
      </div>
      <div class="pulse-ring"></div>
    </div>
    
    <!-- Floating particles -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="{ '--delay': i * 0.1 + 's' }"></div>
    </div>
  </div>
</template>

<script>
import soundManager from '@/library/soundManager.js';

export default {
  name: 'SplashView',
  data() {
    return {
      musicStarted: false
    };
  },
  mounted() {
    // Try to play music on mount with a delay
    setTimeout(() => {
      soundManager.playStartMenuMusic();
      this.musicStarted = true;
    }, 100);
  },
  beforeUnmount() {
    // Keep music playing as user goes to login
  },
  methods: {
    handleSplashClick() {
      // Ensure music is playing on click (handles browser autoplay policies)
      if (!this.musicStarted) {
        soundManager.playStartMenuMusic();
        this.musicStarted = true;
      }
      // Navigate to login
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e14 0%, #0f1419 50%, #1a2332 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  z-index: 9999;
}

.splash-image {
  width: 75%;
  height: 85%;
  object-fit: contain;
  animation: fadeIn 0.8s ease-in-out, glitchEffect 0.3s ease-in-out 0.8s;
  position: relative;
  z-index: 10;
  filter: drop-shadow(0 0 30px rgba(95, 179, 213, 0.3));
}

/* Border frame styling */
.image-border {
  display: none;
}

/* Corner accents */
.corner {
  display: none;
}

/* Scan lines effect */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 20;
  animation: scanlineMove 8s linear infinite;
}

@keyframes scanlineMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

/* Side glitch effects */
.side-glitch {
  position: absolute;
  top: 0;
  width: 15%;
  height: 100%;
  z-index: 12;
}

.side-glitch.left {
  left: 0;
  background: linear-gradient(90deg, rgba(95, 179, 213, 0.15) 0%, transparent 100%);
  animation: sideGlitchLeft 6s ease-in-out infinite;
}

.side-glitch.right {
  right: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(95, 179, 213, 0.15) 100%);
  animation: sideGlitchRight 6s ease-in-out infinite;
}

@keyframes sideGlitchLeft {
  0%, 100% {
    box-shadow: inset 0 0 50px rgba(95, 179, 213, 0.1);
  }
  50% {
    box-shadow: inset 0 0 80px rgba(95, 179, 213, 0.25);
  }
}

@keyframes sideGlitchRight {
  0%, 100% {
    box-shadow: inset 0 0 50px rgba(95, 179, 213, 0.1);
  }
  50% {
    box-shadow: inset 0 0 80px rgba(95, 179, 213, 0.25);
  }
}

/* Vertical light beams */
.light-beam {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(95, 179, 213, 0.3), transparent);
  z-index: 11;
  animation: beamFlicker 4s ease-in-out infinite;
}

.light-beam.left {
  left: 20%;
}

.light-beam.right {
  right: 20%;
}

@keyframes beamFlicker {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Glitch effect on image */
@keyframes glitchEffect {
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(-2px, 2px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-2px, -2px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(2px, 2px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(2px, -2px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(0);
  }
}

.splash-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 50px;
  z-index: 15;
}

.click-to-enter {
  position: relative;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 3px;
  font-family: 'Orbitron', 'Space Mono', monospace;
}

.glitch {
  position: relative;
  color: #5fb3d5;
  text-shadow: 
    0 0 10px rgba(95, 179, 213, 0.5),
    0 0 20px rgba(95, 179, 213, 0.3),
    0 0 40px rgba(95, 179, 213, 0.2);
  animation: glitchText 4s ease-in-out infinite, subtlePulse 3s ease-in-out infinite;
  display: inline-block;
  letter-spacing: 3px;
}

@keyframes glitchText {
  0% {
    text-shadow: 
      0 0 10px rgba(95, 179, 213, 0.5),
      0 0 20px rgba(95, 179, 213, 0.3),
      0 0 40px rgba(95, 179, 213, 0.2);
  }
  10% {
    text-shadow: 
      -1px 0 #ff006e,
      1px 0 #00d9ff,
      0 0 10px rgba(95, 179, 213, 0.5);
    transform: skewX(-1deg);
  }
  20% {
    text-shadow: 
      1px 0 #ff006e,
      -1px 0 #00d9ff,
      0 0 10px rgba(95, 179, 213, 0.5);
    transform: skewX(1deg);
  }
  30% {
    text-shadow: 
      0 0 10px rgba(95, 179, 213, 0.5),
      0 0 20px rgba(95, 179, 213, 0.3),
      0 0 40px rgba(95, 179, 213, 0.2);
    transform: skewX(0);
  }
  100% {
    text-shadow: 
      0 0 10px rgba(95, 179, 213, 0.5),
      0 0 20px rgba(95, 179, 213, 0.3),
      0 0 40px rgba(95, 179, 213, 0.2);
  }
}

@keyframes subtlePulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Pulse ring effect */
.pulse-ring {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  background: #5fb3d5;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(95, 179, 213, 0.7);
  animation: ringPulse 3s infinite;
}

@keyframes ringPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(95, 179, 213, 0.7);
  }
  70% {
    box-shadow: 0 0 0 40px rgba(95, 179, 213, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(95, 179, 213, 0);
  }
}

/* Floating particles */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 1px;
  height: 1px;
  background: #5fb3d5;
  border-radius: 50%;
  opacity: 0;
  animation: float 6s ease-in infinite;
}

@keyframes float {
  0% {
    opacity: 0;
    transform: translateY(100vh) translateX(0);
  }
  10% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) translateX(100px);
  }
}

.particle:nth-child(1) { left: 10%; --delay: 0s; animation-delay: 0s; }
.particle:nth-child(2) { left: 20%; animation-delay: 0.5s; }
.particle:nth-child(3) { left: 30%; animation-delay: 1s; }
.particle:nth-child(4) { left: 40%; animation-delay: 1.5s; }
.particle:nth-child(5) { left: 50%; animation-delay: 2s; }
.particle:nth-child(6) { left: 60%; animation-delay: 2.5s; }
.particle:nth-child(7) { left: 70%; animation-delay: 3s; }
.particle:nth-child(8) { left: 80%; animation-delay: 3.5s; }
.particle:nth-child(9) { left: 90%; animation-delay: 4s; }
.particle:nth-child(10) { left: 15%; animation-delay: 4.5s; }
.particle:nth-child(n+11) { animation-delay: calc((var(--index) - 10) * 0.5s + 5s); }

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .splash-image {
    width: 90%;
    height: 70%;
  }

  .click-to-enter {
    font-size: 20px;
    letter-spacing: 2px;
  }
}
</style>
