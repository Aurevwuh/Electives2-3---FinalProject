<template>
  <div class="map-container">
    <!-- Flying satellites/drones -->
    <div class="flying-objects">
      <div v-for="(satellite, idx) in satellites" :key="idx" class="satellite" :style="{left: satellite.x + '%', top: satellite.y + '%'}"></div>
    </div>
    
    <!-- Orbital rings (new animation) -->
    <div class="orbital-rings">
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="ring ring-3"></div>
    </div>
    
    <!-- Pulse points -->
    <div class="pulse-points">
      <div v-for="(pulse, idx) in pulsePoints" :key="idx" class="pulse" :style="{left: pulse.x + '%', top: pulse.y + '%', animationDelay: pulse.delay + 's'}"></div>
    </div>
    
    <!-- Country activity indicators -->
    <div class="country-indicators">
      <div v-for="(indicator, idx) in countryIndicators" :key="idx" class="activity-dot" :style="{left: indicator.x + '%', top: indicator.y + '%', animationDelay: indicator.delay + 's'}"></div>
    </div>
    
    <!-- Floating emoji indicators (new animation) -->
    <div class="floating-emojis">
      <div v-for="(emoji, idx) in floatingEmojis" :key="'emoji-' + idx" class="emoji-float" :style="{left: emoji.x + '%', top: emoji.y + '%', animationDelay: emoji.delay + 's'}">{{ emoji.icon }}</div>
    </div>
    
    <!-- Scan lines effect -->
    <div class="scan-lines"></div>
    
    <div class="svg-wrapper" v-html="svgContent"></div>
    
    <!-- Grid overlay -->
    <div class="grid-overlay"></div>
    
    <!-- Ambient glow effect -->
    <div class="ambient-glow"></div>
    
    <!-- Data orbs (new animation) -->
    <div class="data-orbs">
      <div v-for="(orb, idx) in dataOrbs" :key="'orb-' + idx" class="data-orb" :style="{left: orb.x + '%', top: orb.y + '%', animationDelay: orb.delay + 's'}"></div>
    </div>
  </div>
</template>

<script>
import worldSvg from "@/assets/world.svg?raw"; // load as raw text
import { supabase, getCurrentUserId, getPlayerProgress, getSvgIdForCountry, normalizeCountryName, SVG_COUNTRY_MAPPING } from "@/library/supabase.js";
import soundManager from "@/library/soundManager.js";

export default {
  name: "WorldMap",
  props: {
    missionCountries: Array // Example: ['China', 'USA', 'Russia']
  },
  emits: ["country-selected"],

  data() {
    return {
      svgContent: worldSvg,
      selectedId: null,
      satellites: [
        { x: 20, y: 15 },
        { x: 75, y: 30 },
        { x: 45, y: 60 },
        { x: 85, y: 75 }
      ],
      pulsePoints: [
        { x: 30, y: 25, delay: 0 },
        { x: 70, y: 40, delay: 0.5 },
        { x: 50, y: 70, delay: 1 },
        { x: 15, y: 60, delay: 1.5 },
        { x: 80, y: 20, delay: 2 }
      ],
      countryIndicators: [
        { x: 25, y: 35, delay: 0 },      // USA area
        { x: 60, y: 30, delay: 0.3 },    // Europe area
        { x: 72, y: 42, delay: 0.6 },    // Russia area
        { x: 75, y: 52, delay: 0.9 },    // China area
        { x: 85, y: 78, delay: 1.2 },    // Australia area
        { x: 55, y: 65, delay: 1.5 },    // India area
        { x: 68, y: 65, delay: 1.8 }     // Japan area
      ],
      // New: Data orbs for extra dynamism
      dataOrbs: [
        { x: 10, y: 10, delay: 0 },
        { x: 90, y: 15, delay: 0.4 },
        { x: 50, y: 85, delay: 0.8 },
        { x: 5, y: 50, delay: 1.2 },
        { x: 95, y: 60, delay: 1.6 }
      ],
      // New: Floating emojis for visual interest
      floatingEmojis: [
        { x: 15, y: 25, icon: '🛰️', delay: 0 },
        { x: 85, y: 20, icon: '📡', delay: 0.5 },
        { x: 10, y: 75, icon: '🔍', delay: 1 },
        { x: 90, y: 70, icon: '🎯', delay: 1.5 },
        { x: 50, y: 15, icon: '⚡', delay: 2 },
        { x: 30, y: 80, icon: '🌐', delay: 2.5 }
      ],
      // Cleared countries tracking
      clearedCountries: []
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.setupSvg();
      this.animateSatellites();
      // Build country map from Supabase after SVG is set up
      this.buildCountryMapFromSupabase();
      // Load player's cleared countries
      this.loadClearedCountries();
    });
  },

  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },

  watch: {
    missionCountries: {
      handler() {
        this.$nextTick(() => {
          this.colorMissionCountries();
        });
      },
      deep: true
    }
  },

  methods: {
    setupSvg() {
      const svgElement = this.$el.querySelector('svg');
      if (!svgElement) {
        console.error('SVG not found');
        return;
      }

      // Set up SVG to fit container
      svgElement.style.width = '100%';
      svgElement.style.height = '100%';
      svgElement.style.maxWidth = '100%';
      svgElement.style.maxHeight = '100%';
      svgElement.style.objectFit = 'contain';
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Attach event listeners to all paths
      const paths = svgElement.querySelectorAll('path');
      paths.forEach(path => {
        // Ensure pointer events are enabled
        path.style.pointerEvents = 'auto';
        path.style.cursor = 'pointer';
        path.style.transition = 'all 0.2s ease';
        
        path.addEventListener('click', this.onCountryClick);
        path.addEventListener('mouseover', this.onMouseOver);
        path.addEventListener('mouseout', this.onMouseOut);
      });

      this.colorMissionCountries();
    },

    isMissionCountry(svgIdentifier) {
      if (!this.missionCountries || !svgIdentifier) return false;
      
      // svgIdentifier can be either:
      // 1. A 2-letter code (id attribute) like "US", "FR", "RU"
      // 2. A full country name (class attribute) like "United States", "France", "Russian Federation"
      
      // Get the official country name from the SVG identifier
      let svgCountryName;
      if (svgIdentifier.length <= 2) {
        // It's a 2-letter code
        svgCountryName = SVG_COUNTRY_MAPPING[svgIdentifier];
      } else {
        // It's already a full name (class attribute)
        svgCountryName = svgIdentifier;
      }
      
      if (!svgCountryName) return false;
      
      // Normalize the SVG country name
      const normalizedSvgName = normalizeCountryName(svgCountryName).toLowerCase();
      
      // Check if any mission country matches when normalized
      return this.missionCountries.some(missionCountry => {
        const normalizedMissionCountry = normalizeCountryName(missionCountry).toLowerCase();
        return normalizedMissionCountry === normalizedSvgName;
      });
    },

    getCountryName(svgIdentifier) {
      // If it's a short code (2 letters or less), look it up in the mapping
      if (svgIdentifier && svgIdentifier.length <= 2) {
        return SVG_COUNTRY_MAPPING[svgIdentifier] || svgIdentifier;
      }
      
      // Otherwise it's already a full country name from class attribute
      return svgIdentifier;
    },

    colorMissionCountries() {
      const svgElement = this.$el.querySelector('svg');
      if (!svgElement) return;

      const paths = svgElement.querySelectorAll('path');
      paths.forEach(path => {
        const id = path.id || path.getAttribute('id');
        const classAttr = path.getAttribute('class');
        const svgIdentifier = id || classAttr;
        const countryName = this.getCountryName(svgIdentifier);
        
        // Check if country is cleared - need to normalize names for comparison
        const isClearedInDb = this.clearedCountries.some(cleared => {
          const normalizedCleared = normalizeCountryName(cleared);
          const normalizedCurrent = normalizeCountryName(countryName);
          return normalizedCleared.toLowerCase() === normalizedCurrent.toLowerCase();
        });
        
        if (isClearedInDb) {
          // Highlight cleared countries with gold/success color
          path.style.fill = '#4a9d6f';
          path.style.stroke = '#00ff00';
          path.style.strokeWidth = '2';
          path.dataset.isCleared = 'true';
          path.dataset.isMission = 'false';
        } else if (this.isMissionCountry(svgIdentifier)) {
          // Mission countries (not yet cleared)
          path.style.fill = '#1a2332';
          path.style.stroke = '#5fb3d5';
          path.style.strokeWidth = '1.5';
          path.dataset.isMission = 'true';
          path.dataset.isCleared = 'false';
        } else {
          // Non-mission countries
          path.style.fill = '#1a2f4a';
          path.style.stroke = '#7a8fa0';
          path.style.strokeWidth = '0.5';
          path.dataset.isMission = 'false';
          path.dataset.isCleared = 'false';
        }
      });
    },

    async loadClearedCountries() {
      try {
        const userId = getCurrentUserId();
        if (!userId) return;

        const playerProgress = await getPlayerProgress(userId);
        if (!playerProgress || !playerProgress.countries_cleared) {
          this.clearedCountries = [];
          return;
        }

        // Map country IDs to country names from Supabase
        const { data: countries, error } = await supabase
          .from('countries')
          .select('id, name')
          .in('id', playerProgress.countries_cleared);

        if (error) {
          console.error('Error fetching cleared countries:', error);
          return;
        }

        // Extract country names and normalize them to match SVG naming conventions
        // This ensures "USA" becomes "United States", "Russia" becomes "Russian Federation", etc.
        this.clearedCountries = countries.map(c => normalizeCountryName(c.name));
        
        // Re-color the map to show cleared countries
        this.colorMissionCountries();
      } catch (error) {
        console.error('Error loading cleared countries:', error);
      }
    },

    onCountryClick: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      const svgId = el.id || el.getAttribute('id');
      const svgClass = el.getAttribute('class');
      const svgIdentifier = svgId || svgClass;
      
      if (!svgIdentifier) return;

      const component = this;
      // Allow clicks on mission countries OR cleared countries (to replay)
      if (el.dataset.isMission !== 'true' && el.dataset.isCleared !== 'true') return;

      const svgElement = component.$el.querySelector('svg');
      
      // Reset previous selection
      if (component.selectedId) {
        let prevPath = svgElement.querySelector(`path[id="${component.selectedId}"]`);
        if (!prevPath) {
          prevPath = svgElement.querySelector(`path[class="${component.selectedId}"]`);
        }
        if (prevPath) {
          // Restore appropriate color based on data attributes
          if (prevPath.dataset.isCleared === 'true') {
            prevPath.style.fill = '#4a9d6f';
            prevPath.style.stroke = '#00ff00';
            prevPath.style.strokeWidth = '2';
          } else {
            prevPath.style.fill = '#1a2332';
            prevPath.style.stroke = '#5fb3d5';
            prevPath.style.strokeWidth = '1.5';
          }
        }
      }

      // Highlight new selected
      el.style.fill = '#5fb3d5';
      el.style.stroke = '#4a9d6f';
      el.style.strokeWidth = '2';

      component.selectedId = svgIdentifier;
      const countryName = component.getCountryName(svgIdentifier);
      component.$emit("country-selected", countryName);
    },

    onMouseOver: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      const svgId = el.id || el.getAttribute('id');
      const svgClass = el.getAttribute('class');
      const svgIdentifier = svgId || svgClass;
      const component = this;

      // Only apply hover effect if it's not the currently selected country
      if (component.selectedId !== svgIdentifier) {
        if (el.dataset.isMission === 'true') {
          el.style.fill = '#2a4a6a';
          el.style.filter = 'brightness(1.2)';
        } else if (el.dataset.isCleared === 'true') {
          el.style.fill = '#5a9d7f';
          el.style.filter = 'brightness(1.2)';
        }
      }
    },

    onMouseOut: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      const svgId = el.id || el.getAttribute('id');
      const svgClass = el.getAttribute('class');
      const svgIdentifier = svgId || svgClass;
      const component = this;
      
      // Don't reset if it's selected
      if (component.selectedId !== svgIdentifier) {
        if (el.dataset.isCleared === 'true') {
          // Restore cleared country color
          el.style.fill = '#4a9d6f';
          el.style.stroke = '#00ff00';
          el.style.strokeWidth = '2';
          el.style.filter = '';
        } else if (el.dataset.isMission === 'true') {
          // Restore mission country color
          el.style.fill = '#1a2332';
          el.style.stroke = '#5fb3d5';
          el.style.strokeWidth = '1.5';
          el.style.filter = '';
        }
      }
    },

    clearSelection() {
      // Reset the selected country highlight on the map
      if (this.selectedId) {
        const svgElement = this.$el.querySelector('svg');
        if (svgElement) {
          let selectedPath = svgElement.querySelector(`path[id="${this.selectedId}"]`);
          if (!selectedPath) {
            selectedPath = svgElement.querySelector(`path[class="${this.selectedId}"]`);
          }
          
          if (selectedPath) {
            // Restore appropriate color based on country type
            if (selectedPath.dataset.isCleared === 'true') {
              selectedPath.style.fill = '#4a9d6f';
              selectedPath.style.stroke = '#00ff00';
              selectedPath.style.strokeWidth = '2';
            } else if (selectedPath.dataset.isMission === 'true') {
              selectedPath.style.fill = '#1a2332';
              selectedPath.style.stroke = '#5fb3d5';
              selectedPath.style.strokeWidth = '1.5';
            } else {
              selectedPath.style.fill = '#1a2f4a';
              selectedPath.style.stroke = '#7a8fa0';
              selectedPath.style.strokeWidth = '0.5';
            }
            selectedPath.style.filter = '';
          }
        }
      }
      
      // Clear selection ID
      this.selectedId = null;
    },

    animateSatellites() {
      const animate = () => {
        this.satellites.forEach(sat => {
          // Move satellites in circular patterns
          sat.x += Math.random() * 0.8 - 0.4;
          sat.y += Math.random() * 0.8 - 0.4;
          
          // Wrap around edges
          if (sat.x > 100) sat.x = 0;
          if (sat.x < 0) sat.x = 100;
          if (sat.y > 100) sat.y = 0;
          if (sat.y < 0) sat.y = 100;
        });
        
        this.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    },

    /**
     * Fetch all countries from Supabase and build dynamic SVG identifier mapping
     * This allows automatic updates when countries are added/deleted in Supabase
     */
    async buildCountryMapFromSupabase() {
      try {
        // This method no longer needed for mapping, but we can use it for initialization
        // The SVG uses official simplemaps.com IDs, and we now use getSvgIdForCountry() for lookups
        console.log("SVG Country Mapping loaded - using official simplemaps.com mappings");
      } catch (error) {
        console.error("Error in buildCountryMapFromSupabase:", error);
      }
    },
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
  border: 2px solid #5fb3d5;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.svg-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.svg-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

.svg-wrapper :deep(path) {
  transition: all 0.2s ease;
  cursor: pointer;
}

/* Radar overlay */
.radar-overlay {
  display: none;
}

/* Flying satellites */
.data-streams {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.data-stream {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4fff4f, transparent);
  opacity: 0.6;
  box-shadow: 0 0 8px #00ff00;
}

.stream-1 {
  width: 40%;
  top: 20%;
  left: 0;
  animation: flow-left 4s linear infinite;
}

.stream-2 {
  width: 50%;
  top: 50%;
  right: 0;
  animation: flow-right 5s linear infinite;
}

.stream-3 {
  width: 35%;
  top: 75%;
  left: 0;
  animation: flow-left 3.5s linear infinite;
}

@keyframes flow-left {
  0% {
    left: 0;
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes flow-right {
  0% {
    right: 0;
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    right: 100%;
    opacity: 0;
  }
}

/* Pulse points */
.pulse-points {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.pulse {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ff6b9d;
  border-radius: 50%;
  box-shadow: 0 0 8px #ff6b9d;
  animation: pulse-beat 2s ease-out infinite;
}

@keyframes pulse-beat {
  0% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 8px #ff6b9d, 0 0 12px rgba(255, 107, 157, 0.5);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
    box-shadow: 0 0 16px rgba(255, 107, 157, 0.2), 0 0 24px rgba(255, 107, 157, 0);
  }
}

/* Flying satellites */
.flying-objects {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.satellite {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #4fff4f, #00ff00);
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff00, 0 0 20px rgba(0, 255, 0, 0.5);
  transition: all 0.5s ease;
}

.satellite::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: satellite-scan 2s linear infinite;
}

@keyframes satellite-scan {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Scan lines effect */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(95, 179, 213, 0.03) 0px,
    rgba(95, 179, 213, 0.03) 2px,
    transparent 2px,
    transparent 4px
  );
  animation: scan-move 8s linear infinite;
}

@keyframes scan-move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

/* Grid overlay */
.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(95, 179, 213, 0.05) 25%, rgba(95, 179, 213, 0.05) 26%, transparent 27%, transparent 74%, rgba(95, 179, 213, 0.05) 75%, rgba(95, 179, 213, 0.05) 76%, transparent 77%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(95, 179, 213, 0.05) 25%, rgba(95, 179, 213, 0.05) 26%, transparent 27%, transparent 74%, rgba(95, 179, 213, 0.05) 75%, rgba(95, 179, 213, 0.05) 76%, transparent 77%, transparent);
  background-size: 50px 50px;
}

/* Country activity indicators */
.country-indicators {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.activity-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #00ffff, #0088ff);
  border-radius: 50%;
  box-shadow: 0 0 10px #00ffff, 0 0 20px rgba(0, 255, 255, 0.4);
  animation: activity-pulse 2.5s ease-in-out infinite;
}

@keyframes activity-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
    box-shadow: 0 0 5px #00ffff, 0 0 10px rgba(0, 255, 255, 0.2);
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    box-shadow: 0 0 15px #00ffff, 0 0 30px rgba(0, 255, 255, 0.6);
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
    box-shadow: 0 0 5px #00ffff, 0 0 10px rgba(0, 255, 255, 0.2);
  }
}

/* Ambient glow effect */
.ambient-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(ellipse at 30% 20%, rgba(95, 179, 213, 0.1) 0%, transparent 50%);
}

/* ===== NEW ANIMATIONS ===== */

/* Orbital rings - rotating circles around the map */
.orbital-rings {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.ring {
  position: absolute;
  border: 1px solid rgba(95, 179, 213, 0.15);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-1 {
  width: 40%;
  height: 40%;
  animation: rotate-ring 30s linear infinite;
}

.ring-2 {
  width: 60%;
  height: 60%;
  animation: rotate-ring-reverse 40s linear infinite;
  border-color: rgba(74, 157, 111, 0.1);
}

.ring-3 {
  width: 80%;
  height: 80%;
  animation: rotate-ring 50s linear infinite;
  border-color: rgba(139, 90, 141, 0.1);
}

@keyframes rotate-ring {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes rotate-ring-reverse {
  0% { transform: translate(-50%, -50%) rotate(360deg); }
  100% { transform: translate(-50%, -50%) rotate(0deg); }
}

/* Floating emoji indicators - animated icons that add personality */
.floating-emojis {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.emoji-float {
  position: absolute;
  font-size: 24px;
  animation: emoji-float-motion 5s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(95, 179, 213, 0.6));
}

@keyframes emoji-float-motion {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-20px) scale(1.1) rotate(5deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-40px) scale(1.2) rotate(0deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-20px) scale(1.1) rotate(-5deg);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.4;
  }
}

/* Data orbs - floating particles with glow */
.data-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.data-orb {
  position: absolute;
  width: 5px;
  height: 5px;
  background: radial-gradient(circle, #4fff4f, #00ff00);
  border-radius: 50%;
  box-shadow: 0 0 8px #4fff4f, 0 0 15px rgba(79, 255, 79, 0.6);
  animation: float-orbit 6s ease-in-out infinite;
}

@keyframes float-orbit {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(15px, -20px) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translate(0, -30px) scale(1);
    opacity: 1;
  }
  75% {
    transform: translate(-15px, -20px) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
}
</style>
