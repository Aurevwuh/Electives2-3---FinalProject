<template>
  <div class="leaflet-container">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'LeafletMap',
  props: {
    countries: Array
  },
  emits: ['country-selected'],

  data() {
    return {
      map: null,
      geoJsonLayer: null,
      selectedLayer: null,
      missionCountriesSet: new Set(),
      geoJsonData: null,

      // NORMALIZED name map
      canonicalMap: {
        'united states of america': 'usa',
        'united states': 'usa',
        'russian federation': 'russia',
        'russia': 'russia',
        "people's republic of china": 'china',
        'china': 'china',
        'united kingdom': 'uk',
        'britain': 'uk',
        'great britain': 'uk',
        'uk': 'uk',
        'france': 'france',
        'germany': 'germany',
        'japan': 'japan',
        'india': 'india',
        'iran': 'iran',
        'north korea': 'north korea',
        'cuba': 'cuba',
        'australia': 'australia'
      },

      debounceTimer: null
    };
  },

  watch: {
    countries: {
      handler(newCountries) {
        this.missionCountriesSet.clear();

        if (newCountries && newCountries.length > 0) {
          newCountries.forEach(c => {
            const canonical = this.normalizeName(c.name);
            this.missionCountriesSet.add(canonical);
          });
        }

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          if (this.geoJsonData) {
            this.rebuildGeoJsonLayer();
          }
        }, 100);
      },
      deep: true,
      immediate: false
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initializeMap();
    });
  },

  activated() {
    // Called when component is reactivated (e.g., returning from another view)
    if (!this.map || !this.map._container || !this.map._container.parentNode) {
      // Map doesn't exist, reinitialize completely
      this.initializeMap();
    } else {
      // Map exists, refresh the display and rebuild highlighting
      this.$nextTick(() => {
        this.map.invalidateSize();
        
        // Force rebuild of highlighting based on current countries prop
        this.missionCountriesSet.clear();
        if (this.countries && this.countries.length > 0) {
          this.countries.forEach(c => {
            const canonical = this.normalizeName(c.name);
            this.missionCountriesSet.add(canonical);
          });
        }
        
        // Rebuild the GeoJSON layer with updated highlighting
        if (this.geoJsonData) {
          this.rebuildGeoJsonLayer();
        }
      });
    }
  },

  methods: {
    initializeMap() {
      // Clean up any existing map
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      // Reset GeoJSON layer
      this.geoJsonLayer = null;
      this.selectedLayer = null;

      // Check if DOM element exists
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.warn('Map element not found, retrying in 100ms');
        setTimeout(() => this.initializeMap(), 100);
        return;
      }

      this.map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomAnimation: true,
        fadeAnimation: false,
        markerZoomAnimation: false
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
          maxZoom: 19,
          updateWhenIdle: true,
          keepBuffer: 2
        }
      ).addTo(this.map);

      this.loadWorldData();
    },

    /** NORMALIZE country names for 100% matching */
    normalizeName(name) {
      if (!name) return '';
      const key = name.toLowerCase().trim();
      return this.canonicalMap[key] || key;
    },

    /** Load world GeoJSON **/
    async loadWorldData() {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
        );
        const geoJson = await response.json();

        // Normalize all feature names
        geoJson.features = geoJson.features.map(f => {
          const raw =
            f.properties.ADMIN ||
            f.properties.name ||
            f.properties.FORMAL_EN ||
            '';
          f._countryName = raw;
          f._canonical = this.normalizeName(raw);
          return f;
        });

        this.geoJsonData = geoJson;
        this.rebuildGeoJsonLayer();
      } catch (error) {
        console.error('Error loading world data:', error);
      }
    },

    /** Rebuild the GeoJSON layer **/
    rebuildGeoJsonLayer() {
      if (!this.map || !this.geoJsonData) return;

      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
        this.geoJsonLayer = null;
      }

      this.selectedLayer = null;

      this.geoJsonLayer = L.geoJSON(this.geoJsonData, {
        style: (feature) => this.getFeatureStyle(feature),
        onEachFeature: (feature, layer) => this.onEachFeature(feature, layer)
      }).addTo(this.map);
    },

    /** Mission country detection **/
    isCountryInMissions(canonicalName) {
      return this.missionCountriesSet.has(canonicalName);
    },

    /** Styling **/
    getFeatureStyle(feature) {
      const isMission = this.isCountryInMissions(feature._canonical);

      if (isMission) {
        return {
          fillColor: '#1a2332',
          weight: 2,
          opacity: 1,
          color: '#5fb3d5',
          fillOpacity: 0.5
        };
      } else {
        return {
          fillColor: '#0f1419',
          weight: 1,
          opacity: 0.5,
          color: '#2a3f5a',
          fillOpacity: 0.2
        };
      }
    },

    /** Click + hover handling **/
    onEachFeature(feature, layer) {
      const canonical = feature._canonical;

      layer._canonical = canonical;
      layer._countryName = feature._countryName;

      if (!this.isCountryInMissions(canonical)) return;

      layer.on('click', () => {
        this.$emit('country-selected', feature._countryName);
        this.highlightLayer(layer);
      });

      layer.on('mouseover', () => {
        layer.setStyle({
          color: '#4a9d6f',
          fillColor: '#2a3f5a',
          fillOpacity: 0.8,
          weight: 3
        });
        layer.bringToFront();
      });

      layer.on('mouseout', () => {
        if (layer !== this.selectedLayer) {
          layer.setStyle({
            color: '#5fb3d5',
            fillColor: '#1a2332',
            fillOpacity: 0.5,
            weight: 2
          });
        }
      });
    },

    /** Selected layer highlight **/
    highlightLayer(layer) {
      if (this.selectedLayer && this.selectedLayer !== layer) {
        this.selectedLayer.setStyle({
          color: '#5fb3d5',
          fillColor: '#1a2332',
          fillOpacity: 0.5,
          weight: 2
        });
      }

      layer.setStyle({
        color: '#4a9d6f',
        fillColor: '#5fb3d5',
        fillOpacity: 0.8,
        weight: 3
      });

      this.selectedLayer = layer;
      layer.bringToFront();
    }
  },

  beforeUnmount() {
    clearTimeout(this.debounceTimer);
    this.missionCountriesSet.clear();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },

  deactivated() {
    // Called when component is hidden (e.g., navigating away)
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
};
</script>

<style scoped>
/* your same CSS, unchanged */
.leaflet-container {
  width: 100%;
  height: 500px;
  border: 3px solid #5fb3d5;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(95, 179, 213, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
  background: #0f1419;
  overflow: hidden;
  position: relative;
}
#map {
  width: 100%;
  height: 100%;
  background: #0f1419;
}
</style>
