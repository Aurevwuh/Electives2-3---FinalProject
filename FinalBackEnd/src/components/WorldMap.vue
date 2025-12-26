<template>
  <div class="map-container">
    <!-- Flying satellites/drones -->
    <div class="flying-objects">
      <div v-for="(satellite, idx) in satellites" :key="idx" class="satellite" :style="{left: satellite.x + '%', top: satellite.y + '%'}"></div>
    </div>
    
    <!-- Pulse points -->
    <div class="pulse-points">
      <div v-for="(pulse, idx) in pulsePoints" :key="idx" class="pulse" :style="{left: pulse.x + '%', top: pulse.y + '%', animationDelay: pulse.delay + 's'}"></div>
    </div>
    
    <!-- Country activity indicators -->
    <div class="country-indicators">
      <div v-for="(indicator, idx) in countryIndicators" :key="idx" class="activity-dot" :style="{left: indicator.x + '%', top: indicator.y + '%', animationDelay: indicator.delay + 's'}"></div>
    </div>
    
    <!-- Scan lines effect -->
    <div class="scan-lines"></div>
    
    <div class="svg-wrapper" v-html="svgContent"></div>
    
    <!-- Grid overlay -->
    <div class="grid-overlay"></div>
    
    <!-- Ambient glow effect -->
    <div class="ambient-glow"></div>
  </div>
</template>

<script>
import worldSvg from "@/assets/world.svg?raw"; // load as raw text
import { supabase } from "@/library/supabase.js";

export default {
  name: "WorldMap",
  props: {
    completedCountries: Array, // Countries that are already cleared
    countriesWithData: Array, // Countries that have questions/puzzles
    showAllCountries: {
      type: Boolean,
      default: true
    }
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
      // Map database country names to SVG path IDs/classes
      // Some countries use id attribute (2-letter codes), others use class attribute (full names)
      countryMap: {
        // North America
        'USA': 'US',
        'United States': 'United States',
        'Canada': 'Canada',
        'Mexico': 'MX',
        
        // South America
        'Brazil': 'BR',
        'Argentina': 'Argentina',
        'Chile': 'CL',
        'Colombia': 'CO',
        'Peru': 'PE',
        'Venezuela': 'VE',
        
        // Europe
        'Russia': 'RU',
        'Russian Federation': 'Russian Federation',
        'France': 'FR',
        'UK': 'GB',
        'United Kingdom': 'GB',
        'Germany': 'DE',
        'Italy': 'IT',
        'Spain': 'ES',
        'Poland': 'PL',
        'Ukraine': 'UA',
        'Turkey': 'TR',
        'Greece': 'GR',
        
        // Asia
        'China': 'CN',
        'India': 'IN',
        'Japan': 'JP',
        'South Korea': 'KR',
        'North Korea': 'KP',
        'Dem. Rep. Korea': 'KP',
        'Democratic Republic of Korea': 'KP',
        'Thailand': 'TH',
        'Vietnam': 'VN',
        'Indonesia': 'Indonesia',
        'Philippines': 'PH',
        'Malaysia': 'MY',
        'Pakistan': 'PK',
        'Bangladesh': 'BD',
        'Iran': 'IR',
        'Iraq': 'IQ',
        'Saudi Arabia': 'SA',
        'United Arab Emirates': 'AE',
        'Israel': 'IL',
        'Kazakhstan': 'KZ',
        
        // Africa
        'Egypt': 'EG',
        'South Africa': 'ZA',
        'Nigeria': 'NG',
        'Kenya': 'KE',
        'Ethiopia': 'ET',
        'Algeria': 'DZ',
        'Morocco': 'MA',
        'Tunisia': 'TN',
        'Sudan': 'SD',
        'Ghana': 'GH',
        
        // Oceania
        'Australia': 'Australia',
        'New Zealand': 'NZ',
        'Fiji': 'Fiji',
        
        // Caribbean/Central America
        'Cuba': 'CU',
        'Jamaica': 'JM',
        'Haiti': 'HT',
        'Dominican Republic': 'DO',
        'Costa Rica': 'CR',
        'Panama': 'PA',
        'Honduras': 'HN',
        'Nicaragua': 'NI',
        'Belize': 'BZ',
        'El Salvador': 'SV',
        'Guatemala': 'GT'
      }
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.setupSvg();
      this.animateSatellites();
      // Build country map from Supabase after SVG is set up
      this.buildCountryMapFromSupabase();
    });
  },

  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },

  watch: {
    completedCountries: {
      handler() {
        this.$nextTick(() => {
          this.colorMissionCountries();
        });
      },
      deep: true
    },
    countriesWithData: {
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

    isMissionCountry(countryIdentifier) {
      // This method is no longer used - keeping for backward compatibility
      return false;
    },

    getCountryName(svgIdentifier) {
      // Map SVG class names to database country names
      const svgClassToDbName = {
        'United States': 'USA',
        'Russian Federation': 'Russia'
      };
      
      // First priority: return the database country name if available
      if (this.countriesWithData && this.countriesWithData.length > 0) {
        for (const dbCountry of this.countriesWithData) {
          if (this.countryMap[dbCountry] && 
              this.countryMap[dbCountry].toLowerCase() === svgIdentifier.toLowerCase()) {
            return dbCountry;
          }
        }
      }
      
      // Second priority: regular reverse lookup
      for (const [country, identifier] of Object.entries(this.countryMap)) {
        if (identifier.toLowerCase() === svgIdentifier.toLowerCase()) {
          // Check if this is a SVG class name that needs to be mapped to database name
          if (svgClassToDbName[country]) {
            return svgClassToDbName[country];
          }
          return country;
        }
      }
      
      // Third: Direct mapping check for SVG class names
      if (svgClassToDbName[svgIdentifier]) {
        return svgClassToDbName[svgIdentifier];
      }
      
      return svgIdentifier;
    },

    colorMissionCountries() {
      const svgElement = this.$el.querySelector('svg');
      if (!svgElement) {
        console.log('SVG not found');
        return;
      }

      console.log('=== Updating country visibility ===');
      console.log('Countries with data:', this.countriesWithData);
      
      const paths = svgElement.querySelectorAll('path');
      let visibleCount = 0;
      let hiddenCount = 0;
      let totalPaths = paths.length;
      
      console.log(`Processing ${totalPaths} SVG paths...`);
      
      paths.forEach((path, idx) => {
        const id = path.id || path.getAttribute('id');
        const classAttr = path.getAttribute('class');
        const svgIdentifier = id || classAttr;
        
        // Check if this country has data
        const hasData = this.hasCountryData(svgIdentifier);
        const isCompleted = this.isCompletedCountry(svgIdentifier);
        
        // Clear all previous styling first
        path.style.fill = '';
        path.style.stroke = '';
        path.style.strokeWidth = '';
        path.style.filter = '';
        path.style.animation = '';
        
        if (hasData) {
          // Highlight countries with data in MUTED GOLD
          path.style.fill = '#DAA520';
          path.style.stroke = '#CD853F';
          path.style.strokeWidth = '2.5';
          path.style.filter = 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))';
          path.style.animation = 'data-glow 3s ease-in-out infinite';
          path.dataset.hasData = 'true';
          visibleCount++;
        } else if (isCompleted) {
          // Highlight completed countries in green
          path.style.fill = '#2d5a3d';
          path.style.stroke = '#4a9d6f';
          path.style.strokeWidth = '2';
          path.style.filter = 'none';
          path.style.animation = 'none';
          path.dataset.isMission = 'completed';
          visibleCount++;
        } else {
          // All countries are visible and clickable
          path.style.fill = '#1a3a4a';
          path.style.stroke = '#5a7a90';
          path.style.strokeWidth = '0.5';
          path.style.filter = 'none';
          path.style.animation = 'none';
          path.dataset.isMission = 'all';
          visibleCount++;
        }
      });
      
      console.log(`Visible countries: ${visibleCount}, Hidden countries: ${hiddenCount}`);
    },

    hasCountryData(svgIdentifier) {
      if (!this.countriesWithData || this.countriesWithData.length === 0) return false;
      
      // Get the country name from SVG identifier
      const countryName = this.getCountryName(svgIdentifier);
      
      // Check if this country name is in the data list
      return this.countriesWithData.some(country => 
        country === countryName || 
        (typeof country === 'object' && country.name === countryName) ||
        country.toLowerCase() === countryName.toLowerCase()
      );
    },

    isCompletedCountry(svgIdentifier) {
      if (!this.completedCountries || this.completedCountries.length === 0) return false;
      
      // Get the country name from SVG identifier
      const countryName = this.getCountryName(svgIdentifier);
      
      // Check if this country name is in completed list
      return this.completedCountries.includes(countryName);
    },

    onCountryClick: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      const svgId = el.id || el.getAttribute('id');
      const svgClass = el.getAttribute('class');
      const svgIdentifier = svgId || svgClass;
      
      if (!svgIdentifier) return;

      const component = this;
      // Allow clicking on mission countries, completed countries, or all countries if showAllCountries is true
      if (el.dataset.isMission !== 'true' && el.dataset.isMission !== 'completed' && el.dataset.isMission !== 'all') return;

      // Simply emit the country selection without changing visual styling
      component.selectedId = svgIdentifier;
      
      // Find the country name that matches the database
      let countryName = component.getCountryName(svgIdentifier);
      
      // Try to find the exact match from countriesWithData
      if (component.countriesWithData) {
        const matchedCountry = component.countriesWithData.find(country =>
          country === countryName || 
          country.toLowerCase() === countryName.toLowerCase()
        );
        if (matchedCountry) {
          countryName = matchedCountry;
        } else {
          // If exact match not found, try all variants
          for (const [name, id] of Object.entries(component.countryMap)) {
            if (id.toLowerCase() === svgIdentifier.toLowerCase()) {
              const variantMatch = component.countriesWithData.find(country =>
                country === name || 
                country.toLowerCase() === name.toLowerCase()
              );
              if (variantMatch) {
                countryName = variantMatch;
                break;
              }
            }
          }
        }
      }
      
      component.$emit("country-selected", countryName);
    },

    onMouseOver: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      el.style.cursor = 'pointer';
      el.style.strokeWidth = '2.5';

      // Add hover glow to data countries
      if (el.dataset.hasData === 'true') {
        el.style.filter = 'drop-shadow(0 0 12px rgba(218, 165, 32, 0.8))';
        return;
      }

      // Don't change hover state if selected
      if (el.dataset.selected === 'true') {
        return;
      }

      // Hover effect for other countries
      if (el.dataset.isMission === 'true' || el.dataset.isMission === 'all' || el.dataset.isMission === 'completed') {
        el.style.fill = '#2a4a6a';
        el.style.filter = 'brightness(1.1)';
      }
    },

    onMouseOut: function(e) {
      const el = e.target;
      if (el.tagName !== 'path') return;

      if (el.dataset.selected !== 'true') {
        if (el.dataset.hasData === 'true') {
          // Restore muted gold glow for countries with data
          el.style.fill = '#DAA520';
          el.style.stroke = '#CD853F';
          el.style.strokeWidth = '2.5';
          el.style.filter = 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.6))';
          el.style.animation = 'data-glow 3s ease-in-out infinite';
        } else if (el.dataset.isMission === 'completed') {
          el.style.fill = '#2d5a3d';
          el.style.stroke = '#4a9d6f';
          el.style.strokeWidth = '2';
          el.style.filter = 'none';
        } else if (el.dataset.isMission === 'true') {
          // Restore mission glow
          el.style.fill = '#3a7ca5';
          el.style.stroke = '#5fb3d5';
          el.style.strokeWidth = '2.5';
          el.style.filter = 'drop-shadow(0 0 8px #5fb3d5) drop-shadow(0 0 4px #3a7ca5)';
          el.style.animation = 'mission-glow 2s ease-in-out infinite';
        } else if (el.dataset.isMission === 'all') {
          el.style.fill = '#1a3a4a';
          el.style.stroke = '#5a7a90';
          el.style.strokeWidth = '0.5';
          el.style.filter = 'none';
          el.style.animation = 'none';
        }
      } else {
        el.style.strokeWidth = '2.5';
      }
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

    async buildCountryMapFromSupabase() {
      // Just call colorMissionCountries without modifying the countryMap
      // The initial countryMap defined in data() should be sufficient
      this.$nextTick(() => {
        this.colorMissionCountries();
      });
    }
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

/* Mission country glow animation */
@keyframes data-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(218, 165, 32, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(218, 165, 32, 0.8));
  }
}

@keyframes mission-glow {
  0% {
    filter: drop-shadow(0 0 8px #5fb3d5) drop-shadow(0 0 4px #3a7ca5);
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 12px #5fb3d5) drop-shadow(0 0 6px #3a7ca5);
    opacity: 0.98;
  }
  100% {
    filter: drop-shadow(0 0 8px #5fb3d5) drop-shadow(0 0 4px #3a7ca5);
    opacity: 1;
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
</style>
