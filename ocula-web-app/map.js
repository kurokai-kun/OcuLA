// OCULA Multi-Hazard GIS & Small Mapview Controller
// Ultra-Smooth Zero-Glitch Zooming + 100% Offline Tactical GIS Engine

// 1. Embedded Offline Tactical Vector Grid & Graticule Layer (Zero Internet Dependency)
if (typeof L !== 'undefined' && L.GridLayer) {
    L.OfflineTacticalGrid = L.GridLayer.extend({
        options: {
            tileSize: 256,
            minZoom: 1,
            maxZoom: 20,
            keepBuffer: 12,
            updateWhenZooming: false,
            updateWhenIdle: true
        },

        createTile: function(coords) {
            const tile = document.createElement('canvas');
            const size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;
            const ctx = tile.getContext('2d');
            if (!ctx) return tile;

            const isDark = document.body ? !document.body.classList.contains('light-theme') : true;

            // Background fill (Clean Light Theme)
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(0, 0, size.x, size.y);

            // Major & Minor Tactical Grid Lines
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
            ctx.lineWidth = 1;

            const step = 32;
            for (let x = 0; x < size.x; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, size.y);
                ctx.stroke();
            }
            for (let y = 0; y < size.y; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size.x, y);
                ctx.stroke();
            }

            // Outer Tile Border & Tactical Corner Crosshairs
            ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(148, 163, 184, 0.25)';
            ctx.strokeRect(0, 0, size.x, size.y);

            // Coordinate Subtext on Tile Corner (Tactical HUD Feel)
            if (coords.z <= 6 || (coords.x % 2 === 0 && coords.y % 2 === 0)) {
                ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.6)';
                ctx.font = '9px "JetBrains Mono", monospace, sans-serif';
                const latEstimate = ((180 / Math.PI) * (2 * Math.atan(Math.exp((1 - 2 * (coords.y / Math.pow(2, coords.z))) * Math.PI)) - Math.PI / 2)).toFixed(1);
                const lngEstimate = ((coords.x / Math.pow(2, coords.z)) * 360 - 180).toFixed(1);
                ctx.fillText(`Z${coords.z} • ${latEstimate}°N, ${lngEstimate}°E`, 6, 14);
            }

            return tile;
        }
    });

    L.offlineTacticalGrid = function(opts) {
        return new L.OfflineTacticalGrid(opts);
    };
}

const AURA_MAP = {
    map: null,
    layers: {},
    activeLayers: new Set(["FLOOD", "FIRE", "LANDSLIDE", "AIR_QUALITY", "TEMPERATURE", "EARTHQUAKE", "HEATWAVE"]),
    userMarker: null,
    hardwareSensorMarker: null,
    miniHardwareSensorMarker: null,
    miniSelectedMarker: null,
    miniMap: null,
    miniCityLayer: null,
    tileLayer: null,
    miniTileLayer: null,
    offlineLayer: null,
    miniOfflineLayer: null,
    isOffline: false,

    // Smooth High-Availability Multi-Engine Tile Layer (100% Clean, Zero Watermarks, Instant Load)
    getEnglishTileLayer(forMiniMap = false) {
        // High-Definition English Vector Tiles (100% Free, Zero Watermarks, Zero Auth Locks)
        const googleEnglishUrl = "https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}";
        const osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
        const esriUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

        const tileLayer = L.tileLayer(googleEnglishUrl, {
            attribution: '&copy; OCULA GIS Telemetry',
            minZoom: 2.2,
            maxZoom: 19,
            maxNativeZoom: 18,
            subdomains: ['0', '1', '2', '3'],
            bounds: [[-85.05, -180], [85.05, 180]],
            keepBuffer: 18,
            edgeBufferTiles: 2,
            updateWhenZooming: true,
            updateWhenIdle: false,
            updateInterval: 20,
            crossOrigin: true
        });

        // Individual tile error fallback (Graceful recovery without flashing whole map)
        tileLayer.on('tileerror', function(error, tile) {
            if (tile && !tile._hasRetried) {
                tile._hasRetried = 1;
                const coords = error.coords;
                if (coords) {
                    const fallbackImg = new Image();
                    fallbackImg.crossOrigin = "anonymous";
                    fallbackImg.onload = function() {
                        if (error.tile) error.tile.src = fallbackImg.src;
                    };
                    fallbackImg.onerror = function() {
                        if (!navigator.onLine || tile._hasRetried >= 2) {
                            if (error.tile) {
                                error.tile.style.opacity = '0.35';
                                error.tile.style.background = isDark ? '#070B19' : '#F1F5F9';
                            }
                        } else {
                            tile._hasRetried = 2;
                            error.tile.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${coords.z}/${coords.y}/${coords.x}`;
                        }
                    };
                    fallbackImg.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
                }
            }
        });

        // Cache tiles locally in browser CacheStorage when online
        if ('caches' in window) {
            tileLayer.on('tileload', function(event) {
                if (event.tile && event.tile.src && event.tile.src.startsWith('http')) {
                    const src = event.tile.src;
                    caches.open('ocula-gis-tiles-v1').then(cache => {
                        cache.match(src).then(matched => {
                            if (!matched) {
                                fetch(src, { mode: 'cors' }).then(res => {
                                    if (res.ok) cache.put(src, res);
                                }).catch(() => {});
                            }
                        });
                    }).catch(() => {});
                }
            });
        }

        return tileLayer;
    },

    setMapplsApiKey(newKey) {
        if (!newKey || !newKey.trim()) return;
        this.apiKey = newKey.trim();
        this.refreshTileLayers();
    },

    refreshTileLayers() {
        if (this.map) {
            if (this.tileLayer) this.map.removeLayer(this.tileLayer);
            this.tileLayer = this.getEnglishTileLayer();
            this.tileLayer.addTo(this.map);
        }
        if (this.miniMap) {
            if (this.miniTileLayer) this.miniMap.removeLayer(this.miniTileLayer);
            this.miniTileLayer = this.getEnglishTileLayer(true);
            this.miniTileLayer.addTo(this.miniMap);
        }
    },

    init() {
        const mapContainer = document.getElementById("mappls-map") || document.getElementById("leaflet-map");
        if (!mapContainer || this.map) return;

        try {
            this.map = L.map(mapContainer, {
                center: [22.5, 79.0],
                zoom: 4.8,
                minZoom: 2.5,
                maxZoom: 18,
                maxBounds: [[-85.05, -180], [85.05, 180]],
                maxBoundsViscosity: 1.0,
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true,
                zoomAnimation: true,
                zoomAnimationThreshold: 8,
                fadeAnimation: true,
                markerZoomAnimation: true,
                wheelPxPerZoomLevel: 100,
                wheelDebounceTime: 30,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                inertia: true,
                inertiaDeceleration: 3400,
                inertiaMaxSpeed: 1800,
                easeLinearity: 0.15
            });

            // 1. Offline Vector Graticule Layer (Permanent Base Underlay)
            if (L.offlineTacticalGrid) {
                this.offlineLayer = L.offlineTacticalGrid({ zIndex: 1 }).addTo(this.map);
            }

            // 2. High-Availability Multi-Engine Online Tile Layer
            this.tileLayer = this.getEnglishTileLayer();
            this.tileLayer.addTo(this.map);

            // 3. Multi-Hazard Layer Groups
            this.layers = {
                FLOOD: L.layerGroup().addTo(this.map),
                FIRE: L.layerGroup().addTo(this.map),
                LANDSLIDE: L.layerGroup().addTo(this.map),
                AIR_QUALITY: L.layerGroup().addTo(this.map),
                TEMPERATURE: L.layerGroup().addTo(this.map),
                EARTHQUAKE: L.layerGroup().addTo(this.map),
                HEATWAVE: L.layerGroup().addTo(this.map)
            };

            this.loadHotspots();
            this.renderDefaultPointDetailsPrompt();

            this.map.whenReady(() => {
                this.map.invalidateSize(false);
            });

            window.addEventListener("online", () => this.handleNetworkChange(true));
            window.addEventListener("offline", () => this.handleNetworkChange(false));

            window.addEventListener("resize", () => {
                if (this.map) this.map.invalidateSize(false);
            });
        } catch (e) {
            console.error("[OCULA Map] Map initialization error:", e);
        }
    },

    handleNetworkChange(isOnline) {
        this.isOffline = !isOnline;
        if (this.map && this.tileLayer) {
            if (isOnline) {
                this.tileLayer.redraw();
                if (window.AURA_APP) AURA_APP.showToast("🌐 Online GIS link restored");
            } else {
                if (window.AURA_APP) AURA_APP.showToast("⚡ Offline Mode: Local GIS Telemetry Active");
            }
        }
        if (this.miniMap && this.miniTileLayer && isOnline) {
            this.miniTileLayer.redraw();
        }
    },

    createGlowingIcon(colorHex, iconClass = "fa-triangle-exclamation") {
        return L.divIcon({
            className: "custom-div-pin",
            html: `
                <div class="disaster-pin-wrapper" style="--pin-color: ${colorHex};">
                    <div class="disaster-pin-body">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="disaster-pin-pulse"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    },

    createCityTagIcon(aqi, cityName, colorHex) {
        return L.divIcon({
            className: "custom-city-tag-pin",
            html: `
                <div class="mini-city-tag" style="--c: ${colorHex};">
                    <span class="mini-tag-badge">${aqi}</span>
                    <span class="mini-tag-name">${cityName}</span>
                </div>
            `,
            iconSize: [110, 28],
            iconAnchor: [55, 14],
            popupAnchor: [0, -18]
        });
    },

    loadHotspots() {
        const hotspots = [
            // ==================== 1. FLOOD HOTSPOTS (Blue #3B82F6) ====================
            { name: "Yamuna River Basin, Delhi", lat: 28.6692, lng: 77.2315, type: "FLOOD", color: "#3B82F6", info: "Water level +1.4m above danger mark. Low-lying evacuation alerts active.", badge: "Critical Flood" },
            { name: "Mithi River Corridor, Mumbai", lat: 19.0607, lng: 72.8681, type: "FLOOD", color: "#3B82F6", info: "High tide storm surge telemetry active. Sluice gates open.", badge: "Flood Warning" },
            { name: "Brahmaputra Floodplain, Assam", lat: 26.1445, lng: 91.7362, type: "FLOOD", color: "#3B82F6", info: "Severe embankment overflow. Over 14 telemetry stations reporting inundation.", badge: "Emergency" },
            { name: "Kosi River Delta, Bihar", lat: 25.5941, lng: 85.1376, type: "FLOOD", color: "#3B82F6", info: "River flow speed 4.2 m/s. Early warning flood siren triggered.", badge: "High Risk" },
            { name: "Godavari Basin, Rajahmundry", lat: 17.0005, lng: 81.8040, type: "FLOOD", color: "#3B82F6", info: "Upstream dam release. Water level rising 8cm/hour.", badge: "Flood Alert" },
            { name: "Houston Bayou, Texas, USA", lat: 29.7604, lng: -95.3698, type: "FLOOD", color: "#3B82F6", info: "Hurricane storm surge and drainage overflow sensors active.", badge: "Flash Flood" },
            { name: "Rhine River Basin, Cologne, Germany", lat: 50.9375, lng: 6.9603, type: "FLOOD", color: "#3B82F6", info: "Alpine snowmelt runoff telemetry +8.2m depth.", badge: "Flood Watch" },
            { name: "Venice Lagoon, Italy", lat: 45.4408, lng: 12.3155, type: "FLOOD", color: "#3B82F6", info: "Acqua Alta tidal barrier (MOSE) deployed. Sea level +110cm.", badge: "Tidal Surge" },
            { name: "Yangtze River, Wuhan, China", lat: 30.5928, lng: 114.3055, type: "FLOOD", color: "#3B82F6", info: "Monsoon river crest monitoring. Level 26.8m.", badge: "High Water" },
            { name: "Chao Phraya River, Bangkok, Thailand", lat: 13.7563, lng: 100.5018, type: "FLOOD", color: "#3B82F6", info: "High tide backflow protection engaged along canals.", badge: "Canal Surge" },
            { name: "Ciliwung River, Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, type: "FLOOD", color: "#3B82F6", info: "Katulampa sluice gate alert 2. Rapid runoff monitoring.", badge: "Flash Warning" },

            // ==================== 2. WILDFIRE HOTSPOTS (Red #EF4444) ====================
            { name: "Kumaun Pine Forest, Uttarakhand", lat: 29.5892, lng: 79.6467, type: "FIRE", color: "#EF4444", info: "Active forest wildfire detected via satellite thermal sensor (~14 hectares).", badge: "Active Fire" },
            { name: "Simlipal National Park, Odisha", lat: 21.8654, lng: 86.3879, type: "FIRE", color: "#EF4444", info: "Dry deciduous leaf litter fire. Thermal radiation anomaly 48MW.", badge: "Wildfire" },
            { name: "Bandipur Tiger Reserve, Karnataka", lat: 11.6664, lng: 76.6291, type: "FIRE", color: "#EF4444", info: "Brush fire alert on south perimeter corridor.", badge: "Fire Watch" },
            { name: "Angeles National Forest, California", lat: 34.2000, lng: -118.1500, type: "FIRE", color: "#EF4444", info: "Santa Ana dry winds driving fast-moving chaparral fire (8% humidity).", badge: "Extreme Threat" },
            { name: "Blue Mountains, Sydney, Australia", lat: -33.7152, lng: 150.3115, type: "FIRE", color: "#EF4444", info: "Eucalyptus bushfire smoke plume tracking. High fire danger rating.", badge: "Bushfire" },
            { name: "Valencia Hills, Spain", lat: 39.4699, lng: -0.3763, type: "FIRE", color: "#EF4444", info: "Thermal imaging anomaly detected in Mediterranean pine forest.", badge: "High Risk" },
            { name: "Peloponnese Forests, Greece", lat: 37.5089, lng: 22.3784, type: "FIRE", color: "#EF4444", info: "Dry Meltemi winds spreading brush fires across eastern slopes.", badge: "Wildfire Alert" },
            { name: "Amazon Basin Rainforest, Manaus, Brazil", lat: -3.1190, lng: -60.0217, type: "FIRE", color: "#EF4444", info: "Satellite thermal detection of deforestation fire clusters.", badge: "Active Burn" },
            { name: "Fort McMurray Boreal Forest, Canada", lat: 56.7264, lng: -111.3803, type: "FIRE", color: "#EF4444", info: "Lightning strike ignitions in dry peatland forest corridor.", badge: "Boreal Fire" },

            // ==================== 3. LANDSLIDE HOTSPOTS (Amber #F59E0B) ====================
            { name: "Mandi Highway Corridor, Himachal", lat: 31.7087, lng: 76.9320, type: "LANDSLIDE", color: "#F59E0B", info: "Soil displacement sensor reading 14mm/day. Road closure advised.", badge: "Critical Slope" },
            { name: "Shimla Ridge & Hills, Himachal", lat: 31.1048, lng: 77.1734, type: "LANDSLIDE", color: "#F59E0B", info: "AI Blind Spot: Slope saturation index 92%. InSAR deformation flagged.", badge: "AI Risk 92" },
            { name: "Wayanad Ghats, Kerala", lat: 11.6854, lng: 76.1320, type: "LANDSLIDE", color: "#F59E0B", info: "Heavy monsoon saturation triggering debris flow sensors.", badge: "Debris Threat" },
            { name: "Darjeeling Hill Slopes, West Bengal", lat: 27.0410, lng: 88.2663, type: "LANDSLIDE", color: "#F59E0B", info: "Tea estate hillside tiltmeter warning: 8° displacement.", badge: "Slope Alert" },
            { name: "Joshimath Subsidence Zone, Uttarakhand", lat: 30.5564, lng: 79.5668, type: "LANDSLIDE", color: "#F59E0B", info: "Geotechnical ground crack monitoring. Subsurface water pressure high.", badge: "Subsidence" },
            { name: "Amalfi Coast Highway, Italy", lat: 40.6333, lng: 14.6029, type: "LANDSLIDE", color: "#F59E0B", info: "Limestone cliff erosion sensors active along coastal route.", badge: "Rockfall" },
            { name: "Nagano Mountain Slopes, Japan", lat: 36.6513, lng: 138.1810, type: "LANDSLIDE", color: "#F59E0B", info: "Typhoon rainfall soil moisture threshold exceeded (320mm).", badge: "Mudslide Alert" },
            { name: "Machu Picchu Ridge, Peru", lat: -13.1631, lng: -72.5450, type: "LANDSLIDE", color: "#F59E0B", info: "Urumbamba river gorge slope seismic tilt telemetry.", badge: "Slope Watch" },

            // ==================== 4. AIR QUALITY HOTSPOTS (Purple #8B5CF6) ====================
            { name: "Anand Vihar, New Delhi", lat: 28.6469, lng: 77.3160, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 387 — Severe smog and particulate concentration (PM2.5: 185 µg/m³).", badge: "Hazardous 387" },
            { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 142 — Sensitive Groups advisory. Hardware node link active.", badge: "Moderate 142" },
            { name: "Bandra Kurla Complex (BKC), Mumbai", lat: 19.0657, lng: 72.8644, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 175 — Industrial dust and vehicle emissions.", badge: "Unhealthy 175" },
            { name: "Park Street, Kolkata", lat: 22.5535, lng: 88.3519, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 210 — Atmospheric inversion trapping industrial pollutants.", badge: "Very Unhealthy" },
            { name: "MG Road, Bengaluru", lat: 12.9756, lng: 77.6066, type: "AIR_QUALITY", color: "#10B981", info: "AQI 42 — Clean atmospheric circulation and forest buffer.", badge: "Good 42" },
            { name: "Lahore Mall Road, Pakistan", lat: 31.5204, lng: 74.3587, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 440 — Winter agricultural stubble burn smog corridor.", badge: "Hazardous 440" },
            { name: "Chaoyang District, Beijing, China", lat: 39.9219, lng: 116.4430, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 162 — Urban particulate tracking (PM2.5: 85 µg/m³).", badge: "Unhealthy 162" },
            { name: "Manhattan Midtown, New York, USA", lat: 40.7589, lng: -73.9851, type: "AIR_QUALITY", color: "#10B981", info: "AQI 38 — Coastal marine ventilation.", badge: "Good 38" },
            { name: "Westminster, London, UK", lat: 51.5074, lng: -0.1278, type: "AIR_QUALITY", color: "#10B981", info: "AQI 32 — Low emission zone monitoring.", badge: "Good 32" },
            { name: "Champs-Élysées, Paris, France", lat: 48.8566, lng: 2.3522, type: "AIR_QUALITY", color: "#10B981", info: "AQI 45 — Urban air sensors reporting green index.", badge: "Good 45" },
            { name: "Downtown Dubai, UAE", lat: 25.2048, lng: 55.2708, type: "AIR_QUALITY", color: "#8B5CF6", info: "AQI 155 — Fine desert sand dust aerosol density.", badge: "Sensitive 155" },

            // ==================== 5. EXTREME TEMPERATURE HOTSPOTS (Orange #F97316) ====================
            { name: "Churu Desert Corridor, Rajasthan", lat: 28.2900, lng: 74.9600, type: "TEMPERATURE", color: "#F97316", info: "Ground thermal sensors reporting 48.4°C ambient temperature.", badge: "48.4°C" },
            { name: "Nagpur Urban Heat Island, Maharashtra", lat: 21.1458, lng: 79.0882, type: "TEMPERATURE", color: "#F97316", info: "Peak temperature 46.8°C with elevated humidity index.", badge: "46.8°C" },
            { name: "Jacobabad Thermal Basin, Pakistan", lat: 28.2810, lng: 68.4388, type: "TEMPERATURE", color: "#F97316", info: "Wet-bulb temperature near physiological limit: 51.2°C.", badge: "51.2°C Extreme" },
            { name: "Kuwait City Coastal Corridor", lat: 29.3759, lng: 47.9774, type: "TEMPERATURE", color: "#F97316", info: "Direct solar radiation sensor reading 50.1°C.", badge: "50.1°C" },
            { name: "Furnace Creek, Death Valley, USA", lat: 36.4622, lng: -116.8669, type: "TEMPERATURE", color: "#F97316", info: "Global record surface heat telemetry 53.4°C (128°F).", badge: "53.4°C Record" },
            { name: "Phoenix Metro, Arizona, USA", lat: 33.4484, lng: -112.0740, type: "TEMPERATURE", color: "#F97316", info: "Asphalt surface heat anomaly 47.2°C.", badge: "47.2°C" },
            { name: "Seville Valley, Andalusia, Spain", lat: 37.3891, lng: -5.9845, type: "TEMPERATURE", color: "#F97316", info: "Iberian thermal plume driving temperatures to 43.6°C.", badge: "43.6°C" },
            { name: "Alice Springs Outback, Australia", lat: -23.6980, lng: 133.8807, type: "TEMPERATURE", color: "#F97316", info: "Central desert heatwave conditions 42.5°C.", badge: "42.5°C" },
            { name: "Oymyakon Siberia, Russia", lat: 63.4641, lng: 142.7737, type: "TEMPERATURE", color: "#06B6D4", info: "Extreme cold weather anomaly: -48.2°C cryosphere monitoring.", badge: "-48.2°C Cold" },

            // ==================== 6. EARTHQUAKE HOTSPOTS (Cyan/Teal #06B6D4) ====================
            { name: "Chamoli Thrust Fault, Himalayas", lat: 30.4100, lng: 79.3300, type: "EARTHQUAKE", color: "#06B6D4", info: "Micro-seismicity detected: Magnitude 4.8 at 12km depth.", badge: "M4.8 Seismic" },
            { name: "Kathmandu Valley Fault, Nepal", lat: 27.7172, lng: 85.3240, type: "EARTHQUAKE", color: "#06B6D4", info: "Main Himalayan Thrust strain gauge: M5.2 tremor recorded.", badge: "M5.2 Quake" },
            { name: "Hindu Kush Range, Afghanistan", lat: 36.5000, lng: 70.5000, type: "EARTHQUAKE", color: "#06B6D4", info: "Deep seismic event: M5.9 at 190km depth.", badge: "M5.9 Deep" },
            { name: "Noto Peninsula, Japan", lat: 37.5000, lng: 137.0000, type: "EARTHQUAKE", color: "#06B6D4", info: "Coastal seismic swarm and rapid tsunami sensor network active.", badge: "M6.2 Alert" },
            { name: "San Andreas Fault, Parkfield, USA", lat: 35.9000, lng: -120.4000, type: "EARTHQUAKE", color: "#06B6D4", info: "Creepmeter displacement and micro-quake cluster M4.4.", badge: "M4.4 Fault" },
            { name: "Santiago Subduction Zone, Chile", lat: -33.4489, lng: -70.6693, type: "EARTHQUAKE", color: "#06B6D4", info: "Nazca-South American plate interlock: M6.0 recorded.", badge: "M6.0 Quake" },
            { name: "Aegean Sea, Izmir, Turkey", lat: 38.4237, lng: 27.1428, type: "EARTHQUAKE", color: "#06B6D4", info: "Shallow tectonic tremor M5.4 with structural vibration warnings.", badge: "M5.4 Active" },
            { name: "Wellington Fault Line, New Zealand", lat: -41.2865, lng: 174.7762, type: "EARTHQUAKE", color: "#06B6D4", info: "Subsurface acoustic sensors reporting tectonic stress shift.", badge: "M4.9 Event" },
            { name: "Sumatra Subduction Trench, Indonesia", lat: -0.5897, lng: 100.3543, type: "EARTHQUAKE", color: "#06B6D4", info: "Offshore buoy array telemetry active: M6.3 deep tremor.", badge: "M6.3 Alert" },

            // ==================== 7. HEATWAVE HOTSPOTS (Crimson #DC2626) ====================
            { name: "National Capital Region (NCR), Delhi", lat: 28.7041, lng: 77.1025, type: "HEATWAVE", color: "#DC2626", info: "Red Alert Heatwave: High humidity + 47.5°C feels-like index 54°C.", badge: "Red Alert Heat" },
            { name: "Ahmedabad Urban Center, Gujarat", lat: 23.0225, lng: 72.5714, type: "HEATWAVE", color: "#DC2626", info: "Severe Heat Action Plan Level 3 triggered. Public cool zones active.", badge: "Severe Heat" },
            { name: "Riyadh Urban Corridor, Saudi Arabia", lat: 24.7136, lng: 46.6753, type: "HEATWAVE", color: "#DC2626", info: "Arabian high pressure heat dome: 49.2°C ambient thermal index.", badge: "Heat Dome" },
            { name: "Madrid Central Plateau, Spain", lat: 40.4168, lng: -3.7038, type: "HEATWAVE", color: "#DC2626", info: "Sahara desert air mass intrusion. Heatwave warning Level Orange.", badge: "43°C Heatwave" },
            { name: "Baghdad Metropole, Iraq", lat: 33.3152, lng: 44.3661, type: "HEATWAVE", color: "#DC2626", info: "Extreme thermal wave 50.8°C. Power grid load monitoring active.", badge: "50.8°C Extreme" },
            { name: "Las Vegas Valley, Nevada, USA", lat: 36.1699, lng: -115.1398, type: "HEATWAVE", color: "#DC2626", info: "Excessive Heat Warning: Nighttime low temperature remains above 34°C.", badge: "Excessive Heat" }
        ];

        const iconMap = {
            FLOOD: "fa-water",
            FIRE: "fa-fire",
            LANDSLIDE: "fa-mountain",
            AIR_QUALITY: "fa-wind",
            TEMPERATURE: "fa-temperature-high",
            EARTHQUAKE: "fa-wave-square",
            HEATWAVE: "fa-sun"
        };

        hotspots.forEach(spot => {
            const iconClass = iconMap[spot.type] || "fa-triangle-exclamation";
            const icon = this.createGlowingIcon(spot.color, iconClass);
            const marker = L.marker([spot.lat, spot.lng], { icon: icon });

            const popupContent = `
                <div class="popup-title"><i class="fas ${iconClass}" style="color: ${spot.color}; margin-right: 6px;"></i>${spot.name}</div>
                <div class="popup-info">${spot.info}</div>
                <div class="popup-badge" style="background: ${spot.color}25; color: ${spot.color}; border: 1px solid ${spot.color}66;">${spot.badge}</div>
            `;

            marker.bindPopup(popupContent, { className: "custom-popup", offset: [0, -4] });

            marker.on('click', () => {
                this.showPointDetails(spot);
            });

            marker.on('popupopen', () => {
                this.showPointDetails(spot);
            });

            if (this.layers[spot.type]) {
                this.layers[spot.type].addLayer(marker);
            }
        });
        this.hotspots = hotspots;
    },

    selectedPoint: null,

    showPointDetails(point) {
        if (!point) return;
        this.selectedPoint = point;
        const container = document.getElementById("map-point-details-panel");
        if (!container) return;

        const iconMap = {
            FLOOD: { icon: "fa-water", label: "Flood Hazard Zone", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.35)" },
            FIRE: { icon: "fa-fire", label: "Wildfire Incident", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.35)" },
            LANDSLIDE: { icon: "fa-mountain", label: "Landslide Risk Zone", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.35)" },
            AIR_QUALITY: { icon: "fa-wind", label: "Air Quality Station", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.35)" },
            TEMPERATURE: { icon: "fa-temperature-high", label: "Thermal Telemetry", color: "#F97316", bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.35)" },
            EARTHQUAKE: { icon: "fa-wave-square", label: "Seismic Fault Line", color: "#06B6D4", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.35)" },
            HEATWAVE: { icon: "fa-sun", label: "Heatwave Alert Zone", color: "#DC2626", bg: "rgba(220, 38, 38, 0.15)", border: "rgba(220, 38, 38, 0.35)" },
            NODE: { icon: "fa-tower-cell", label: "IoT Mesh Node", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.35)" },
            LOCATION: { icon: "fa-location-crosshairs", label: "Selected Location", color: "#6366F1", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.35)" }
        };

        const config = iconMap[point.type] || iconMap.LOCATION;
        const color = point.color || config.color;
        const aiScore = point.ai || (point.type === "FLOOD" ? 94 : point.type === "FIRE" ? 88 : point.type === "LANDSLIDE" ? 82 : point.type === "AIR_QUALITY" ? 91 : point.type === "HEATWAVE" ? 96 : 90);
        
        let safetyText = "";
        let satelliteText = "Sentinel-5P / MODIS Aqua Pass Synchronized";
        const metricValue = point.badge || "Live Monitored";

        if (point.type === "FLOOD") {
            safetyText = "Move to higher ground immediately. Evacuate low-lying riverbanks. Disconnect main power grid switches.";
            satelliteText = "Sentinel-1 Synthetic Aperture Radar (SAR) Inundation Mapping";
        } else if (point.type === "FIRE") {
            safetyText = "Maintain upwind evacuation corridors. Keep emergency Go-Bags accessible and wear N95 smoke filtration masks.";
            satelliteText = "VIIRS (375m) & MODIS Thermal Anomaly Detection";
        } else if (point.type === "LANDSLIDE") {
            safetyText = "Evacuate steep slope bases. Avoid highway mountain corridors and report soil fissures to disaster management.";
            satelliteText = "InSAR Surface Deformation & GPM IMERG Precipitation Saturation";
        } else if (point.type === "AIR_QUALITY") {
            safetyText = "High particulate load. Restrict outdoor aerobic activity, seal windows, and operate HEPA-filtered purifiers.";
            satelliteText = "Sentinel-5P NO2 / Tropospheric Aerosol Optical Depth (AOD)";
        } else if (point.type === "TEMPERATURE" || point.type === "HEATWAVE") {
            safetyText = "Extreme thermal stress. Hydrate continuously, seek cooling centers, and monitor Wet-Bulb physiological limits.";
            satelliteText = "INSAT-3D Land Surface Temperature & GOES-16 ABI Thermal IR";
        } else if (point.type === "EARTHQUAKE") {
            safetyText = "Drop, Cover, and Hold On. Stay clear of structural overhangs, unreinforced masonry, and power lines.";
            satelliteText = "USGS Real-Time Seismic Array & Regional Accelerometer Mesh";
        } else {
            safetyText = "Continuous environmental monitoring and IoT telemetry active.";
        }

        const latVal = typeof point.lat === 'number' ? point.lat.toFixed(4) : point.lat;
        const lngVal = typeof point.lng === 'number' ? point.lng.toFixed(4) : point.lng;

        container.innerHTML = `
            <div class="map-point-card" style="border-left: 4px solid ${color};">
                <!-- Top Header Row -->
                <div class="map-point-header">
                    <div class="map-point-title-group">
                        <div class="map-point-icon-box" style="background: ${config.bg}; color: ${color}; border: 1px solid ${config.border};">
                            <i class="fas ${config.icon}"></i>
                        </div>
                        <div>
                            <div class="map-point-category" style="color: ${color};">
                                • ${config.label.toUpperCase()}
                                <span class="map-point-status-pill" style="background: ${color}22; color: ${color}; border: 1px solid ${color}55;">
                                    ${metricValue}
                                </span>
                            </div>
                            <h3 class="map-point-name">${point.name}</h3>
                            <span class="map-point-coords"><i class="fas fa-compass"></i> Coordinates: Lat ${latVal}°, Lng ${lngVal}°</span>
                        </div>
                    </div>
                    <div class="map-point-header-actions">
                        <button class="map-point-close-btn" onclick="AURA_MAP.clearPointDetails()" title="Close Details">&times;</button>
                    </div>
                </div>

                <!-- 3-Column Telemetry & Incident Grid -->
                <div class="map-point-grid">
                    <!-- Column 1: Live Status & Sensor Log -->
                    <div class="map-point-stat-box">
                        <div class="map-point-box-title"><i class="fas fa-satellite-dish"></i> Telemetry & Incident Log</div>
                        <p class="map-point-desc">${point.info || 'Station telemetry reporting active operational status.'}</p>
                        <div class="map-point-subtag"><i class="fas fa-satellite"></i> ${satelliteText}</div>
                    </div>

                    <!-- Column 2: AI Predictive Risk & Safety Directives -->
                    <div class="map-point-stat-box">
                        <div class="map-point-box-title"><i class="fas fa-shield-halved"></i> AI Risk & Emergency Directives</div>
                        <div class="map-point-ai-row">
                            <span>AI Predictive Confidence:</span>
                            <strong style="color: ${color};">${aiScore}%</strong>
                        </div>
                        <div class="map-point-progress-bar">
                            <div class="map-point-progress-fill" style="width: ${aiScore}%; background: ${color};"></div>
                        </div>
                        <p class="map-point-safety">${safetyText}</p>
                    </div>

                    <!-- Column 3: Quick Action Controls -->
                    <div class="map-point-actions-box">
                        <div class="map-point-box-title"><i class="fas fa-bolt"></i> Incident Actions</div>
                        <button class="btn-point-action btn-dispatch-point" onclick="AURA_MAP.dispatchPointAlert()">
                            <i class="fas fa-paper-plane"></i><span>Dispatch Incident Alert</span>
                        </button>
                        <button class="btn-point-action btn-focus-point" onclick="AURA_MAP.flyTo(${point.lat}, ${point.lng}, 14)">
                            <i class="fas fa-crosshairs"></i><span>Re-Center Satellite View</span>
                        </button>
                        <button class="btn-point-action btn-ask-point" onclick="AURA_MAP.askAssistantAboutPoint()">
                            <i class="fas fa-wand-magic-sparkles"></i><span>Ask OCULA Assistant</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    clearPointDetails() {
        this.selectedPoint = null;
        this.renderDefaultPointDetailsPrompt();
    },

    renderDefaultPointDetailsPrompt() {
        const container = document.getElementById("map-point-details-panel");
        if (!container) return;
        container.innerHTML = `
            <div class="map-point-empty-card">
                <div class="map-point-empty-icon"><i class="fas fa-map-location-dot"></i></div>
                <div class="map-point-empty-info">
                    <h4>Select Any Marked Hazard Point on the Map</h4>
                    <p>Click on any active Flood, Wildfire, Landslide, AQI, Temperature, Earthquake, or Heatwave marker above to inspect live environmental telemetry, risk indicators, and safety directives.</p>
                </div>
                <div class="map-point-empty-pills">
                    <span class="map-empty-pill"><i class="fas fa-layer-group"></i> 50+ Monitored Telemetry Points</span>
                    <span class="map-empty-pill"><i class="fas fa-satellite"></i> Sentinel-5P & MODIS Linked</span>
                </div>
            </div>
        `;
    },

    dispatchPointAlert() {
        if (!this.selectedPoint) return;
        const p = this.selectedPoint;
        const alertObj = {
            id: `MAP-${Date.now().toString().slice(-4)}`,
            type: p.type || "HAZARD",
            severity: (p.type === "FLOOD" || p.type === "FIRE" || p.badge?.includes("Critical") || p.badge?.includes("Hazardous") || p.badge?.includes("Red Alert")) ? "CRITICAL" : "HIGH",
            location: p.name,
            time: "Just now",
            ai: p.ai || 94,
            desc: p.info || `Hazard condition detected at ${p.name}. Rapid response unit dispatch initiated.`,
            critical: true
        };

        if (window.AURA_APP && (AURA_APP.sendEmergencyAlertSMS || AURA_APP.sendEmergencyAlertEmail)) {
            if (AURA_APP.sendEmergencyAlertSMS) {
                AURA_APP.sendEmergencyAlertSMS(alertObj, false);
            } else {
                AURA_APP.sendEmergencyAlertEmail(alertObj, false);
            }
        }
    },

    askAssistantAboutPoint() {
        if (!this.selectedPoint) return;
        const p = this.selectedPoint;
        if (window.AURA_APP && AURA_APP.navigateTo) {
            AURA_APP.navigateTo("assistant");
            setTimeout(() => {
                if (window.AURA_ASSISTANT && AURA_ASSISTANT.sendMessage) {
                    AURA_ASSISTANT.sendMessage(`What are the safety measures, risk factors, and latest environmental situation for ${p.name} (${p.type})?`);
                }
            }, 300);
        }
    },

    toggleLayer(layerKey, btnElement) {
        if (!this.map || !this.layers[layerKey]) return;

        if (this.activeLayers.has(layerKey)) {
            this.activeLayers.delete(layerKey);
            this.map.removeLayer(this.layers[layerKey]);
            if (btnElement) btnElement.classList.remove("active");
        } else {
            this.activeLayers.add(layerKey);
            this.map.addLayer(this.layers[layerKey]);
            if (btnElement) btnElement.classList.add("active");
        }
    },

    zoomIn() {
        if (this.map) this.map.zoomIn();
    },

    zoomOut() {
        if (this.map) this.map.zoomOut();
    },

    resetView() {
        if (this.map) {
            this.map.flyTo([22.5, 79.0], 4.8, { duration: 1.2 });
        }
    },

    flyTo(lat, lng, zoom = 12) {
        if (this.map) {
            this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
        }
    },

    setUserLocation(lat, lng, placeName = "Your Current Location") {
        if (!this.map) return;
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        const userIcon = L.divIcon({
            className: "custom-div-pin",
            html: `
                <div class="disaster-pin-wrapper" style="--pin-color: #06B6D4;">
                    <div class="disaster-pin-body" style="background: linear-gradient(135deg, #06B6D4, #3B82F6);">
                        <i class="fas fa-location-crosshairs"></i>
                    </div>
                    <div class="disaster-pin-pulse"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const userPoint = {
            name: placeName,
            lat: lat,
            lng: lng,
            type: "LOCATION",
            color: "#06B6D4",
            badge: "Active Coordinates",
            info: `Live telemetry and multi-hazard monitoring active for your coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°).`,
            ai: 95
        };

        this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map);
        this.userMarker.bindPopup(`
            <div class="popup-title">📍 ${placeName}</div>
            <div class="popup-info">Live telemetry and hazard monitoring active for your coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).</div>
        `, { className: "custom-popup", offset: [0, -4] }).openPopup();

        this.userMarker.on('click', () => {
            this.showPointDetails(userPoint);
        });

        this.showPointDetails(userPoint);
        this.map.flyTo([lat, lng], 13, { duration: 1.2 });
    },

    // ==================== DASHBOARD SMALL MAPVIEW (IQ AIR MAP) ====================
    initMini2DMap() {
        const el = document.getElementById("globe-mini-map");
        if (!el) return;

        const activeLoc = (window.AURA_APP && AURA_APP.activeLocation) ? AURA_APP.activeLocation : null;
        const initialCenter = activeLoc ? [activeLoc.lat, activeLoc.lng] : [22.5, 79.0];
        const initialZoom = activeLoc ? 8 : 4.5;

        if (!this.miniMap) {
            this.miniMap = L.map(el, {
                center: initialCenter,
                zoom: initialZoom,
                minZoom: 2.5,
                maxZoom: 18,
                maxBounds: [[-85.05, -180], [85.05, 180]],
                maxBoundsViscosity: 1.0,
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true,
                zoomAnimation: true,
                zoomAnimationThreshold: 8,
                fadeAnimation: true,
                markerZoomAnimation: true,
                wheelPxPerZoomLevel: 100,
                wheelDebounceTime: 30,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                inertia: true,
                inertiaDeceleration: 3400,
                inertiaMaxSpeed: 1800,
                easeLinearity: 0.15
            });

            // 1. Offline Vector Graticule Underlay for Mini Map
            if (L.offlineTacticalGrid) {
                this.miniOfflineLayer = L.offlineTacticalGrid({ zIndex: 1 }).addTo(this.miniMap);
            }

            // 2. High-Availability Multi-Engine Online Tile Layer
            this.miniTileLayer = this.getEnglishTileLayer(true);
            this.miniTileLayer.addTo(this.miniMap);

            // Small Mapview Global Air Quality Hotspots with High-Contrast Visible Tags
            const cities = [
                { name: "Delhi NCR", lat: 28.6139, lng: 77.2090, aqi: 78, pm25: 29.0, color: "#F59E0B", advice: "Sensitive individuals should limit outdoor exertion." },
                { name: "Mumbai", lat: 19.0760, lng: 72.8777, aqi: 65, pm25: 22.4, color: "#10B981", advice: "Air quality is acceptable for most people." },
                { name: "Bengaluru", lat: 12.9716, lng: 77.5946, aqi: 42, pm25: 11.2, color: "#10B981", advice: "Ideal for outdoor recreation." },
                { name: "Kolkata", lat: 22.5726, lng: 88.3639, aqi: 110, pm25: 48.0, color: "#F97316", advice: "Wear a mask if sensitive to pollution." },
                { name: "Jakarta", lat: -6.2088, lng: 106.8456, aqi: 137, pm25: 58.5, color: "#EA580C", advice: "Reduce prolonged outdoor exertion." },
                { name: "Zurich", lat: 46.8182, lng: 8.2275, aqi: 155, pm25: 64.0, color: "#EF4444", advice: "Limit outdoor activities." },
                { name: "Riyadh", lat: 24.7136, lng: 46.6753, aqi: 174, pm25: 88.0, color: "#EF4444", advice: "Dust storm advisory active." },
                { name: "Shanghai", lat: 31.2304, lng: 121.4737, aqi: 112, pm25: 46.2, color: "#F97316", advice: "Close windows during peak rush hour." },
                { name: "Tokyo", lat: 35.6762, lng: 139.6503, aqi: 35, pm25: 8.5, color: "#10B981", advice: "Air quality is excellent." },
                { name: "London", lat: 51.5074, lng: -0.1278, aqi: 48, pm25: 12.0, color: "#10B981", advice: "Air quality is satisfactory." },
                { name: "New York", lat: 40.7128, lng: -74.0060, aqi: 44, pm25: 10.8, color: "#10B981", advice: "Air quality is satisfactory." }
            ];

            this.miniCityLayer = L.layerGroup().addTo(this.miniMap);

            cities.forEach(c => {
                const tagIcon = this.createCityTagIcon(c.aqi, c.name, c.color);
                const marker = L.marker([c.lat, c.lng], { icon: tagIcon, zIndexOffset: 200 }).addTo(this.miniCityLayer);
                const cityPct = Math.min(96, Math.max(4, (c.aqi / 500) * 100));
                marker.bindPopup(`
                    <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
                        <div style="font-weight: 800; font-size: 13.5px; margin-bottom: 4px; color: #FFF;">${c.name}</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                            <span style="font-size: 11px; font-weight: 800; background: ${c.color}; color: #FFF; padding: 2px 7px; border-radius: 4px;">AQI ${c.aqi}</span>
                            <span style="font-size: 11px; color: #94A3B8;">PM2.5: ${c.pm25} µg/m³</span>
                        </div>
                        <!-- AQI Range Spectrum Bar -->
                        <div style="margin: 6px 0; background: rgba(0,0,0,0.3); padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; margin-bottom: 3px;">
                                <span><i class="fas fa-gauge-high" style="color: ${c.color}; margin-right: 3px;"></i>AQI Spectrum</span>
                                <strong style="color: ${c.color}; font-weight: 800;">${c.aqi} AQI</strong>
                            </div>
                            <div style="position: relative; height: 7px; border-radius: 4px; background: linear-gradient(to right, #10B981 0%, #10B981 10%, #F59E0B 10%, #F59E0B 20%, #F97316 20%, #F97316 30%, #EF4444 30%, #EF4444 40%, #8B5CF6 40%, #8B5CF6 60%, #7F1D1D 60%, #7F1D1D 100%); margin: 3px 0;">
                                <div style="position: absolute; left: ${cityPct}%; top: -3px; width: 5px; height: 13px; background: #FFFFFF; border: 1.5px solid ${c.color}; border-radius: 2px; box-shadow: 0 0 6px rgba(0,0,0,0.8); transform: translateX(-50%);"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 7.5px; color: #64748B; margin-top: 2px;">
                                <span style="color: #10B981;">0 Good</span>
                                <span style="color: #F59E0B;">50</span>
                                <span style="color: #F97316;">100</span>
                                <span style="color: #EF4444;">150</span>
                                <span style="color: #8B5CF6;">200</span>
                                <span style="color: #7F1D1D;">300+</span>
                            </div>
                `, { offset: [0, -14] });
            });
        }
        this.miniMap.invalidateSize(false);
    },

    _currentSearchedCoords: null,

    updateDashboardLocation(placeName, lat, lng, aqi, pm25 = null, temp = null, hum = null, shouldOpenPopup = false) {
        this.initMini2DMap();
        if (!this.miniMap) return;

        const numAqi = Math.round(Number(aqi) || 78);
        const colorHex = numAqi > 300 ? '#7F1D1D' :
                         numAqi > 200 ? '#8B5CF6' :
                         numAqi > 150 ? '#EF4444' :
                         numAqi > 100 ? '#F97316' :
                         numAqi > 50  ? '#F59E0B' : '#10B981';

        const statusLabel = numAqi > 300 ? 'Hazardous' :
                            numAqi > 200 ? 'Very Unhealthy' :
                            numAqi > 150 ? 'Unhealthy' :
                            numAqi > 100 ? 'Sensitive' :
                            numAqi > 50  ? 'Moderate' : 'Good';

        const advice = numAqi > 150 ? 'Avoid outdoor exertion. Wear an N95 respirator mask.' :
                       numAqi > 100 ? 'Sensitive individuals should reduce prolonged outdoor exertion.' :
                       numAqi > 50  ? 'Acceptable air quality for most individuals.' :
                                     'Optimal clean air. Ideal for outdoor recreation.';

        const displayPm25 = pm25 || (numAqi * 0.38).toFixed(1);
        const displayTemp = temp !== null && temp !== undefined ? temp : '26.4';
        const displayHum = hum !== null && hum !== undefined ? hum : '58';

        const shortName = placeName.split(',')[0].trim();
        const indicatorPercent = Math.min(96, Math.max(4, (numAqi / 500) * 100));

        const tagIcon = L.divIcon({
            className: "custom-city-tag-pin active-search-pin",
            html: `
                <div class="mini-city-tag active-searched-tag" style="--c: ${colorHex};">
                    <span class="mini-tag-badge">${numAqi}</span>
                    <span class="mini-tag-name">${shortName}</span>
                </div>
            `,
            iconSize: [120, 32],
            iconAnchor: [60, 16],
            popupAnchor: [0, -16]
        });

        const popupHtml = `
            <div style="font-family: 'Inter', sans-serif; min-width: 225px; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px;">
                    <div style="font-weight: 800; font-size: 13.5px; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 145px;" title="${placeName}">${placeName}</div>
                    <span style="font-size: 10px; font-weight: 800; background: ${colorHex}; color: #FFF; padding: 2px 7px; border-radius: 4px; white-space: nowrap;">${statusLabel}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px;">
                    <div><span style="color: #94A3B8;">AQI:</span> <strong style="color: ${colorHex}; font-weight: 800;">${numAqi}</strong></div>
                    <div><span style="color: #94A3B8;">PM2.5:</span> <strong style="color: #F1F5F9;">${displayPm25} µg</strong></div>
                    <div><span style="color: #94A3B8;">Temp:</span> <strong style="color: #F1F5F9;">${displayTemp}°C</strong></div>
                    <div><span style="color: #94A3B8;">Humidity:</span> <strong style="color: #F1F5F9;">${displayHum}%</strong></div>
                </div>

                <!-- Dedicated AQI Spectrum Range Bar for Searched Location -->
                <div style="margin: 6px 0; background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                    <div style="display: flex; justify-content: space-between; font-size: 9.5px; color: #94A3B8; margin-bottom: 4px;">
                        <span><i class="fas fa-gauge-high" style="color: ${colorHex}; margin-right: 3px;"></i>AQI Range Spectrum</span>
                        <strong style="color: ${colorHex}; font-weight: 800;">${numAqi} AQI</strong>
                    </div>
                    <div style="position: relative; height: 8px; border-radius: 4px; background: linear-gradient(to right, #10B981 0%, #10B981 10%, #F59E0B 10%, #F59E0B 20%, #F97316 20%, #F97316 30%, #EF4444 30%, #EF4444 40%, #8B5CF6 40%, #8B5CF6 60%, #7F1D1D 60%, #7F1D1D 100%); margin: 4px 0;">
                        <div style="position: absolute; left: ${indicatorPercent}%; top: -3px; width: 6px; height: 14px; background: #FFFFFF; border: 2px solid ${colorHex}; border-radius: 2px; box-shadow: 0 0 6px rgba(0,0,0,0.8); transform: translateX(-50%);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748B; margin-top: 2px;">
                        <span style="color: #10B981;">0 Good</span>
                        <span style="color: #F59E0B;">50</span>
                        <span style="color: #F97316;">100</span>
                        <span style="color: #EF4444;">150</span>
                        <span style="color: #8B5CF6;">200</span>
                        <span style="color: #7F1D1D;">300+</span>
                    </div>
                </div>

                <div style="font-size: 11px; color: #CBD5E1; line-height: 1.35; margin-top: 4px;">${advice}</div>
            </div>
        `;

        if (!this.miniSelectedMarker) {
            this.miniSelectedMarker = L.marker([lat, lng], { icon: tagIcon, zIndexOffset: 2000 }).addTo(this.miniMap);
        } else {
            this.miniSelectedMarker.setLatLng([lat, lng]);
            this.miniSelectedMarker.setIcon(tagIcon);
        }

        this.miniSelectedMarker.bindPopup(popupHtml, { offset: [0, -14], autoPan: false });
        if (shouldOpenPopup) {
            this.miniSelectedMarker.openPopup();
        }

        // Check if coordinates changed to avoid interrupting current flight animation
        const isSameLoc = this._currentSearchedCoords && 
                          Math.abs(this._currentSearchedCoords[0] - lat) < 0.0001 && 
                          Math.abs(this._currentSearchedCoords[1] - lng) < 0.0001;

        if (!isSameLoc) {
            this._currentSearchedCoords = [lat, lng];
            this.miniMap.flyTo([lat, lng], 8, {
                animate: true,
                duration: 0.8,
                easeLinearity: 0.25
            });
        }
    },

    updateHardwareSensor(aqi, pm25, co2, temp, hum, voc = "Normal", isConnected = true) {
        const lat = 28.6139;
        const lng = 77.2090;

        if (!isConnected) {
            if (this.hardwareSensorMarker && this.map) {
                this.map.removeLayer(this.hardwareSensorMarker);
                this.hardwareSensorMarker = null;
            }
            if (this.miniHardwareSensorMarker && this.miniMap) {
                this.miniMap.removeLayer(this.miniHardwareSensorMarker);
                this.miniHardwareSensorMarker = null;
            }
            return;
        }

        const icon = L.divIcon({
            className: "custom-div-pin",
            html: `
                <div class="disaster-pin-wrapper" style="--pin-color: #10B981;">
                    <div class="disaster-pin-body" style="background: linear-gradient(135deg, #10B981, #059669); color: #FFF; box-shadow: 0 0 16px #10B981;">
                        <i class="fas fa-microchip"></i>
                    </div>
                    <div class="disaster-pin-pulse" style="border-color: #10B981;"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const popupHtml = `
            <div style="font-family: sans-serif; min-width: 200px; padding: 2px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
                    <strong style="font-size: 13px; color: #FFF;">ESP32 Node Sensor (Live)</strong>
                </div>
                <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 6px 8px; margin-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #FFF;">
                        <span>AQI: <strong style="color: #10B981;">${aqi}</strong></span>
                        <span>PM2.5: ${pm25} µg/m³</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; margin-top: 4px;">
                        <span>Gas: ${String(co2).includes('%') ? co2 : (parseFloat(co2) <= 100 ? co2 + '%' : Math.round(((parseFloat(co2)-400)/1600)*100) + '%')}</span>
                        <span>VOC: ${voc}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; margin-top: 2px;">
                        <span>Temp: ${temp} °C</span>
                        <span>Humidity: ${hum}%</span>
                    </div>
                </div>
                <div style="font-size: 10.5px; color: #10B981; font-weight: 600;">• Physical ESP32 Stream Synced (115200 Baud)</div>
            </div>
        `;

        if (this.map) {
            if (!this.hardwareSensorMarker) {
                this.hardwareSensorMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(this.map);
                this.hardwareSensorMarker.bindPopup(popupHtml, { className: "custom-popup", offset: [0, -4] }).openPopup();
            } else {
                this.hardwareSensorMarker.setLatLng([lat, lng]);
                const p = this.hardwareSensorMarker.getPopup();
                if (p) p.setContent(popupHtml);
            }
        }

        if (this.miniMap) {
            if (!this.miniHardwareSensorMarker) {
                this.miniHardwareSensorMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(this.miniMap);
                this.miniHardwareSensorMarker.bindPopup(popupHtml, { className: "custom-popup", offset: [0, -4] }).openPopup();
            } else {
                this.miniHardwareSensorMarker.setLatLng([lat, lng]);
                const p = this.miniHardwareSensorMarker.getPopup();
                if (p) p.setContent(popupHtml);
            }
        }
    },

    invalidateSize() {
        if (this.map) {
            setTimeout(() => this.map.invalidateSize(false), 40);
        }
        if (this.miniMap) {
            setTimeout(() => this.miniMap.invalidateSize(false), 40);
        }
    }
};

window.AURA_MAP = AURA_MAP;

