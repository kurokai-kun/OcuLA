// OCULA Environmental Intelligence Data Store

const AURA_DATA = {
    locations: [
        // India
        { title: "Connaught Place", subtitle: "New Delhi, India • AQI 78 (Moderate)", lat: 28.6315, lng: 77.2167, aqi: 78, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Anand Vihar", subtitle: "New Delhi, India • AQI 387 (Hazardous)", lat: 28.6469, lng: 77.3160, aqi: 387, status: "Hazardous", type: "AIR_QUALITY" },
        { title: "Yamuna River Bank", subtitle: "Delhi, India • Flood Warning +1.2m", lat: 28.6692, lng: 77.2315, aqi: 160, status: "Critical Alert", type: "FLOOD" },
        { title: "Noida Sector 62", subtitle: "Uttar Pradesh, India • AQI 76 (Moderate)", lat: 28.6280, lng: 77.3649, aqi: 76, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Bandra West", subtitle: "Mumbai, India • AQI 65 (Moderate)", lat: 19.0596, lng: 72.8295, aqi: 65, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Andheri East", subtitle: "Mumbai, India • AQI 175 (Unhealthy)", lat: 19.1136, lng: 72.8697, aqi: 175, status: "Unhealthy", type: "AIR_QUALITY" },
        { title: "MG Road", subtitle: "Bengaluru, India • AQI 42 (Good)", lat: 12.9756, lng: 77.6066, aqi: 42, status: "Good", type: "AIR_QUALITY" },
        { title: "Koramangala", subtitle: "Bengaluru, India • AQI 95 (Moderate)", lat: 12.9352, lng: 77.6245, aqi: 95, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Park Street", subtitle: "Kolkata, India • AQI 210 (Very Unhealthy)", lat: 22.5535, lng: 88.3519, aqi: 210, status: "Very Unhealthy", type: "AIR_QUALITY" },
        { title: "Marina Beach", subtitle: "Chennai, India • AQI 55 (Moderate)", lat: 13.0500, lng: 80.2824, aqi: 55, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Charminar", subtitle: "Hyderabad, India • AQI 78 (Moderate)", lat: 17.3616, lng: 78.4747, aqi: 78, status: "Moderate", type: "AIR_QUALITY" },
        { title: "Pink City", subtitle: "Jaipur, India • AQI 115 (Sensitive)", lat: 26.9124, lng: 75.7873, aqi: 115, status: "Sensitive", type: "AIR_QUALITY" },
        { title: "Shivaji Nagar", subtitle: "Pune, India • AQI 32 (Good)", lat: 18.5314, lng: 73.8446, aqi: 32, status: "Good", type: "AIR_QUALITY" },
        { title: "Shimla Hills", subtitle: "Himachal Pradesh, India • Landslide Risk 90", lat: 31.1048, lng: 77.1734, aqi: 35, status: "Critical Risk", type: "LANDSLIDE" },
        { title: "Guwahati Brahmaputra", subtitle: "Assam, India • Flood Blind Spot Risk 85", lat: 26.1445, lng: 91.7362, aqi: 60, status: "Critical Alert", type: "FLOOD" },
        { title: "Kumaon Forest", subtitle: "Uttarakhand, India • Wildfire Corridor ~12ha", lat: 29.5892, lng: 79.6467, aqi: 190, status: "High Risk", type: "FIRE" },

        // Global
        { title: "Manhattan, New York", subtitle: "New York, USA • AQI 45 (Good)", lat: 40.7128, lng: -74.0060, aqi: 45, status: "Good", type: "AIR_QUALITY" },
        { title: "Los Angeles", subtitle: "California, USA • Wildfire Smoke Risk 68", lat: 34.0522, lng: -118.2437, aqi: 95, status: "High Threat", type: "FIRE" },
        { title: "Westminster, London", subtitle: "United Kingdom • AQI 35 (Good)", lat: 51.5074, lng: -0.1278, aqi: 35, status: "Good", type: "AIR_QUALITY" },
        { title: "Champs-Élysées, Paris", subtitle: "France • AQI 48 (Good)", lat: 48.8566, lng: 2.3522, aqi: 48, status: "Good", type: "AIR_QUALITY" }
    ],

    readings: [
        { id: "DEL-001", location: "Connaught Place, Delhi", aqi: 142, status: "Unhealthy (Sensitive)", severity: "sensitive", pm25: "58", gas: "35%", voc: "High", temp: "32°C", humidity: "65%", source: "Sensor", lat: 28.6315, lng: 77.2167 },
        { id: "DEL-002", location: "Noida Sector 62", aqi: 88, status: "Moderate", severity: "moderate", pm25: "35", gas: "22%", voc: "Normal", temp: "30°C", humidity: "70%", source: "Sensor", lat: 28.6280, lng: 77.3649 },
        { id: "MUM-001", location: "Bandra, Mumbai", aqi: 65, status: "Moderate", severity: "moderate", pm25: "28", gas: "18%", voc: "Normal", temp: "29°C", humidity: "78%", source: "Sensor", lat: 19.0596, lng: 72.8295 },
        { id: "MUM-002", location: "Andheri East, Mumbai", aqi: 175, status: "Unhealthy", severity: "unhealthy", pm25: "82", gas: "48%", voc: "High", temp: "31°C", humidity: "72%", source: "Sensor", lat: 19.1136, lng: 72.8697 },
        { id: "BLR-001", location: "MG Road, Bengaluru", aqi: 42, status: "Good", severity: "good", pm25: "15", gas: "10%", voc: "Optimal", temp: "24°C", humidity: "60%", source: "Sensor", lat: 12.9756, lng: 77.6066 },
        { id: "BLR-002", location: "Koramangala, Bengaluru", aqi: 95, status: "Moderate", severity: "moderate", pm25: "40", gas: "26%", voc: "Moderate", temp: "26°C", humidity: "55%", source: "Sensor", lat: 12.9352, lng: 77.6245 },
        { id: "KOL-001", location: "Park Street, Kolkata", aqi: 210, status: "Very Unhealthy", severity: "very-unhealthy", pm25: "105", gas: "55%", voc: "High", temp: "33°C", humidity: "75%", source: "Sensor", lat: 22.5535, lng: 88.3519 },
        { id: "CHN-001", location: "Marina Beach, Chennai", aqi: 55, status: "Moderate", severity: "moderate", pm25: "22", gas: "14%", voc: "Optimal", temp: "30°C", humidity: "80%", source: "Sensor", lat: 13.0500, lng: 80.2824 },
        { id: "CHN-002", location: "T Nagar, Chennai", aqi: 128, status: "Unhealthy (Sensitive)", severity: "sensitive", pm25: "52", gas: "32%", voc: "Moderate", temp: "32°C", humidity: "68%", source: "Sensor", lat: 13.0418, lng: 80.2341 },
        { id: "JPR-001", location: "Pink City, Jaipur", aqi: 115, status: "Unhealthy (Sensitive)", severity: "sensitive", pm25: "48", gas: "28%", voc: "Moderate", temp: "35°C", humidity: "40%", source: "Sensor", lat: 26.9124, lng: 75.7873 },
        { id: "HYD-001", location: "Charminar, Hyderabad", aqi: 78, status: "Moderate", severity: "moderate", pm25: "32", gas: "20%", voc: "Normal", temp: "28°C", humidity: "62%", source: "Sensor", lat: 17.3616, lng: 78.4747 },
        { id: "PUN-001", location: "Shivaji Nagar, Pune", aqi: 32, status: "Good", severity: "good", pm25: "12", gas: "8%", voc: "Optimal", temp: "22°C", humidity: "50%", source: "Satellite", lat: 18.5314, lng: 73.8446 }
    ],

    trends: [
        { day: "Tue", aqi: 68, pm25: 25, temp: 28, humidity: 62 },
        { day: "Wed", aqi: 72, pm25: 27, temp: 29, humidity: 60 },
        { day: "Thu", aqi: 76, pm25: 28, temp: 30, humidity: 58 },
        { day: "Fri", aqi: 82, pm25: 31, temp: 31, humidity: 55 },
        { day: "Sat", aqi: 78, pm25: 29, temp: 29, humidity: 58 },
        { day: "Sun", aqi: 70, pm25: 26, temp: 27, humidity: 62 },
        { day: "Mon", aqi: 78, pm25: 29, temp: 26, humidity: 58 }
    ],

    blindSpots: [
        { id: "BS-01", location: "Guwahati, Assam", type: "Flood", risk: 85, severity: "critical", lat: 26.1445, lng: 91.7362, desc: "Highly prone to annual Brahmaputra river flooding with no current infrastructure coverage in the region." },
        { id: "BS-02", location: "Lucknow, Uttar Pradesh", type: "Air Quality", risk: 75, severity: "critical", lat: 26.8467, lng: 80.9462, desc: "Rapidly growing urban center with significant vehicular emissions lacking real-time air quality monitoring." },
        { id: "BS-03", location: "Shimla, Himachal Pradesh", type: "Landslide", risk: 90, severity: "critical", lat: 31.1048, lng: 77.1734, desc: "Critical mountainous terrain vulnerable to slope failure and urban expansion destabilizing the hillside." },
        { id: "BS-04", location: "Nagpur, Maharashtra", type: "Air Quality", risk: 65, severity: "high", lat: 21.1458, lng: 79.0882, desc: "Strategic logistics hub with high truck traffic that remains unmonitored for air quality." },
        { id: "BS-05", location: "Bandhavgarh, Madhya Pradesh", type: "Fire", risk: 70, severity: "high", lat: 23.6855, lng: 80.9388, desc: "Large forest region at high risk of seasonal wildfires during dry months." }
    ],

    satelliteMetrics: [
        { title: "AOD (Optical)", value: "0.42", unit: "τ", desc: "• Moderate particulate load", icon: "sun" },
        { title: "NO₂ Column", value: "128", unit: "µmol/m²", desc: "Urban emissions", icon: "cloud" },
        { title: "SO₂ Column", value: "14.6", unit: "µmol/m²", desc: "• Industrial corridor", icon: "wind" },
        { title: "CO Column", value: "2.1", unit: "g/m²", desc: "• Biomass burning", icon: "pulse" },
        { title: "Cloud Cover", value: "22", unit: "%", desc: "• Clear retrieval", icon: "cloud_clear" },
        { title: "Thermal Anomaly", value: "None", unit: "", desc: "in domain", icon: "fire" },
        { title: "Dust Score", value: "37", unit: "/100", desc: "• Low dust activity", icon: "dust" }
    ],

    regionalSatellite: [
        { region: "Delhi NCR", aod: "0.58", status: "Unhealthy", color: "#EF4444" },
        { region: "Mumbai", aod: "0.36", status: "Moderate", color: "#F59E0B" },
        { region: "Bengaluru", aod: "0.21", status: "Good", color: "#10B981" },
        { region: "Kolkata", aod: "0.48", status: "Unhealthy", color: "#EF4444" },
        { region: "New York", aod: "0.19", status: "Good", color: "#10B981" }
    ],

    satellitePasses: [
        { live: true, satellite: "MODIS / Aqua", type: "Overpass", time: "2025-08-14 14:11:30 IST", res: "1 km", coverage: "Northern Sector Pass" },
        { live: false, satellite: "VIIRS / NOAA-20", type: "Overpass", time: "2025-08-14 15:45 IST", res: "375 m", coverage: "Direct Overpass" }
    ],

    // Central Water Commission (CWC) Official River Basin Benchmarks & Danger Thresholds
    cwcRiverBasins: {
        "delhi": { name: "Yamuna Basin (Old Railway Bridge, Delhi)", warningLevel: 204.50, dangerLevel: 205.33, hfl: 208.66, unit: "m", river: "Yamuna", basin: "Ganga-Yamuna" },
        "assam": { name: "Brahmaputra Delta (Guwahati, Assam)", warningLevel: 48.68, dangerLevel: 49.68, hfl: 51.46, unit: "m", river: "Brahmaputra", basin: "Brahmaputra" },
        "mumbai": { name: "Mithi River (Kurla/BKC, Mumbai)", warningLevel: 2.70, dangerLevel: 3.50, hfl: 4.20, unit: "m", river: "Mithi", basin: "Konkan Coastal" },
        "ap": { name: "Godavari Delta (Bhadrachalam, AP)", warningLevel: 13.11, dangerLevel: 14.63, hfl: 16.76, unit: "m", river: "Godavari", basin: "Godavari Basin" },
        "tn": { name: "Kaveri Basin (Grand Anicut, TN)", warningLevel: 708, dangerLevel: 1133, hfl: 1420, unit: "m³/s", river: "Kaveri", basin: "Cauvery Delta" }
    },

    satelliteDataByHazard: {
        flood: {
            title: "Flood & Inundation Monitoring",
            metrics4: [
                { label: "Inundation Area", val: "148", unit: "km²", sub: "• SAR water-threshold estimation", provenance: "DERIVED SAR", provenanceClass: "copernicus" },
                { label: "River Stage (Yamuna)", val: "204.8", unit: "m", sub: "CWC Danger Mark: 205.33m", provenance: "CWC BENCHMARK", provenanceClass: "cwc" },
                { label: "Soil Saturation", val: "84.2", unit: "%", sub: "• Capacitive probe ground truth", provenance: "GROUND TRUTH", provenanceClass: "sensor" },
                { label: "SAR Backscatter", val: "-16.4", unit: "dB", sub: "• Sentinel-1 C-Band specular reflection", provenance: "COPERNICUS SAR", provenanceClass: "copernicus" }
            ],
            metrics3: [
                { label: "Sentinel-1 SAR Status", val: "Active (IW)", unit: "", sub: "• 10m GRD dual-pol (VV+VH)", provenance: "SGP4 ORBITAL", provenanceClass: "orbit" },
                { label: "Drainage Outflow Rate", val: "1,180", unit: "m³/s", sub: "Live GloFAS hydrograph discharge", provenance: "LIVE GLOFAS", provenanceClass: "live" },
                { label: "Flood Risk Index", val: "76", unit: "/100", sub: "• Multi-variable weighted composite", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Yamuna Basin, Delhi", metricLabel: "Stage: 204.8 m (CWC Danger: 205.33m)", status: "Alert Stage", statusClass: "moderate", cwcKey: "delhi" },
                { region: "Brahmaputra Delta, Assam", metricLabel: "Stage: 49.1 m (CWC Danger: 49.68m)", status: "High Risk", statusClass: "unhealthy", cwcKey: "assam" },
                { region: "Mithi River, Mumbai", metricLabel: "Tide Stage: 2.9 m (CWC Danger: 3.50m)", status: "Moderate", statusClass: "moderate", cwcKey: "mumbai" },
                { region: "Godavari Delta, AP", metricLabel: "Discharge: 8,400 m³/s (CWC Normal)", status: "Normal", statusClass: "good", cwcKey: "ap" },
                { region: "Kaveri Basin, TN", metricLabel: "Outflow: 520 m³/s (CWC Normal)", status: "Normal", statusClass: "good", cwcKey: "tn" }
            ],
            passes: [
                { satellite: "Sentinel-1A (C-SAR)", time: "Auto-Calculated", desc: "Interferometric Wide (IW) Swath • 10m Res" },
                { satellite: "RADARSAT Constellation", time: "Auto-Calculated", desc: "Flood Rapid Inundation Stripmap • 5m Res" }
            ]
        },
        fire: {
            title: "Thermal Radiative & Wildfire Monitoring",
            metrics4: [
                { label: "Thermal Radiative Power", val: "285", unit: "MW", sub: "• MODIS/VIIRS 4μm radiance", provenance: "NASA FIRMS", provenanceClass: "firms" },
                { label: "Active Fire Clusters", val: "8", unit: "zones", sub: "Thermal pixel clustering", provenance: "NASA FIRMS", provenanceClass: "firms" },
                { label: "Burned Area Est.", val: "142", unit: "ha", sub: "• NBR delta spectral estimate", provenance: "DERIVED NBR", provenanceClass: "copernicus" },
                { label: "Smoke Plume Altitude", val: "2.1", unit: "km", sub: "• MISR stereo height retrieval", provenance: "DERIVED", provenanceClass: "copernicus" }
            ],
            metrics3: [
                { label: "MODIS Thermal Band", val: "324", unit: "K", sub: "• Brightness temp anomaly (4μm)", provenance: "NASA FIRMS", provenanceClass: "firms" },
                { label: "Wind Propagation", val: "16", unit: "km/h", sub: "Live 10m vector speed", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Wildfire Hazard Index", val: "78", unit: "/100", sub: "• Fuel dryness + wind factor", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Kumaon Forest, Uttarakhand", metricLabel: "Thermal: 180 MW (MODIS Hotspot)", status: "Critical", statusClass: "unhealthy" },
                { region: "Western Ghats, Maharashtra", metricLabel: "Thermal: 95 MW (VIIRS Active)", status: "High Risk", statusClass: "unhealthy" },
                { region: "Bandhavgarh Reserve, MP", metricLabel: "Thermal: 42 MW (Minor Hotspot)", status: "Moderate", statusClass: "moderate" },
                { region: "Simlipal Reserve, Odisha", metricLabel: "Thermal: 15 MW (Controlled)", status: "Good", statusClass: "good" },
                { region: "Gir National Park, Gujarat", metricLabel: "Thermal: 8 MW (Baseline)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "MODIS / Aqua (Thermal)", time: "Auto-Calculated", desc: "Thermal Infrared Radiometry • Res: 1 km" },
                { satellite: "VIIRS / NOAA-20", time: "Auto-Calculated", desc: "Active Fire 375m I-Band Thermal Detection" }
            ]
        },
        landslide: {
            title: "InSAR Ground Deformation & Landslide Risk",
            metrics4: [
                { label: "InSAR Slope Velocity", val: "12.4", unit: "mm/yr", sub: "• Multi-temporal PS-InSAR", provenance: "COPERNICUS SAR", provenanceClass: "copernicus" },
                { label: "72h Rainfall Accumulation", val: "186", unit: "mm", sub: "Live precipitation sum", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Soil Shear Strength", val: "31.2", unit: "kPa", sub: "• In-situ pore pressure sensor", provenance: "GROUND TRUTH", provenanceClass: "sensor" },
                { label: "DEM Slope Angle", val: "44.6", unit: "°", sub: "• GSI NLSM 1:50,000 baseline", provenance: "STATIC BASELINE", provenanceClass: "static" }
            ],
            metrics3: [
                { label: "InSAR Coherence", val: "0.48", unit: "", sub: "• Phase stability metric (0-1)", provenance: "COPERNICUS SAR", provenanceClass: "copernicus" },
                { label: "Slope Moisture Index", val: "79", unit: "%", sub: "Capacitive moisture probe", provenance: "GROUND TRUTH", provenanceClass: "sensor" },
                { label: "Landslide Risk Index", val: "82", unit: "/100", sub: "• GSI baseline + rain trigger", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Mandi Highway, HP", metricLabel: "Displacement: 18 mm/yr (GSI High Susceptibility)", status: "Critical", statusClass: "unhealthy" },
                { region: "Kedarnath Sector, UK", metricLabel: "Displacement: 14 mm/yr (NLSM Zone V)", status: "High Risk", statusClass: "unhealthy" },
                { region: "Wayanad Hills, Kerala", metricLabel: "Displacement: 9 mm/yr (Debris Slope)", status: "Moderate", statusClass: "moderate" },
                { region: "Darjeeling Ridge, WB", metricLabel: "Displacement: 5 mm/yr (Stable)", status: "Good", statusClass: "good" },
                { region: "Mahabaleshwar, MH", metricLabel: "Displacement: 3 mm/yr (Stable)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "Sentinel-1B (InSAR)", time: "Auto-Calculated", desc: "Differential Interferometric SAR • 10m Res" },
                { satellite: "ALOS-2 PALSAR-2", time: "Auto-Calculated", desc: "L-Band Crustal & Slope Deformation Pass" }
            ]
        },
        aqi: {
            title: "Atmospheric Trace Gases & Aerosol Optical Depth",
            metrics4: [
                { label: "AOD (Optical Depth)", val: "0.46", unit: "τ", sub: "• Moderate particulate load", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "NO₂ Column Density", val: "115", unit: "µmol/m²", sub: "Sentinel-5P TROPOMI retrieval", provenance: "SENTINEL-5P", provenanceClass: "copernicus" },
                { label: "SO₂ Column Density", val: "12.8", unit: "µmol/m²", sub: "• Industrial trace gas column", provenance: "SENTINEL-5P", provenanceClass: "copernicus" },
                { label: "CO Total Column", val: "1.9", unit: "g/m²", sub: "• TROPOMI carbon monoxide", provenance: "SENTINEL-5P", provenanceClass: "copernicus" }
            ],
            metrics3: [
                { label: "Cloud Cover", val: "18", unit: "%", sub: "• High retrieval clarity", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Aerosol Index (AI)", val: "1.6", unit: "UV", sub: "Absorbing dust/smoke aerosols", provenance: "DERIVED", provenanceClass: "copernicus" },
                { label: "Dust Score", val: "32", unit: "/100", sub: "• Surface dust load metric", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Delhi NCR (Anand Vihar)", metricLabel: "AOD: 0.58 τ (CPCB CAAQMS Linked)", status: "Unhealthy", statusClass: "unhealthy" },
                { region: "Kolkata (Victoria)", metricLabel: "AOD: 0.48 τ (CAAQMS Station)", status: "Unhealthy", statusClass: "unhealthy" },
                { region: "Mumbai (Bandra)", metricLabel: "AOD: 0.36 τ (Moderate Load)", status: "Moderate", statusClass: "moderate" },
                { region: "Bengaluru (BTM Layout)", metricLabel: "AOD: 0.21 τ (Low Particulates)", status: "Good", statusClass: "good" },
                { region: "Shimla (Ridge)", metricLabel: "AOD: 0.14 τ (Clean Alpine Air)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "Sentinel-5P / TROPOMI", time: "Auto-Calculated", desc: "High-Res Atmospheric Trace Gases • 3.5 km" },
                { satellite: "MODIS / Terra", time: "Auto-Calculated", desc: "Aerosol Optical Depth (AOD) Overpass" }
            ]
        },
        temp: {
            title: "Thermal Infrared & Land Surface Temperature",
            metrics4: [
                { label: "Land Surface Temp (LST)", val: "38.5", unit: "°C", sub: "• Landsat-9 TIRS-2 / Open-Meteo", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Urban Heat Island (UHI)", val: "+4.2", unit: "°C", sub: "Apparent vs Ambient differential", provenance: "DERIVED UHI", provenanceClass: "calc" },
                { label: "Thermal IR Radiance", val: "9.2", unit: "W/m²", sub: "• Stefan-Boltzmann emission", provenance: "DERIVED", provenanceClass: "calc" },
                { label: "Vegetation Index (NDVI)", val: "0.32", unit: "", sub: "• Sentinel-2 MSI spectral ratio", provenance: "SENTINEL-2", provenanceClass: "copernicus" }
            ],
            metrics3: [
                { label: "Albedo Reflectance", val: "0.19", unit: "", sub: "• Surface solar absorption rate", provenance: "DERIVED", provenanceClass: "copernicus" },
                { label: "Night Cooling Lag", val: "2.8", unit: "hrs", sub: "Thermal inertia dissipation", provenance: "CALCULATED", provenanceClass: "calc" },
                { label: "Thermal Stress Score", val: "74", unit: "/100", sub: "• Composite heat index score", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Thar Desert, Rajasthan", metricLabel: "LST: 44.8 °C (Extreme Thermal Load)", status: "Critical", statusClass: "unhealthy" },
                { region: "Delhi Urban Core", metricLabel: "LST: 39.5 °C (UHI Peak Zone)", status: "High Risk", statusClass: "unhealthy" },
                { region: "Nagpur, Maharashtra", metricLabel: "LST: 37.2 °C (Elevated)", status: "Moderate", statusClass: "moderate" },
                { region: "Shimla, Himachal Pradesh", metricLabel: "LST: 21.4 °C (Temperate)", status: "Good", statusClass: "good" },
                { region: "Ooty, Tamil Nadu", metricLabel: "LST: 18.9 °C (Temperate)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "Landsat-9 / TIRS-2", time: "Auto-Calculated", desc: "Thermal Infrared Sensor • Res: 100 m" },
                { satellite: "ECOSTRESS / ISS", time: "Auto-Calculated", desc: "Evapotranspiration & Surface Temp • Res: 70 m" }
            ]
        },
        quake: {
            title: "Crustal Deformation & Tectonic Strain Telemetry",
            metrics4: [
                { label: "Crustal Strain Rate", val: "7.8", unit: "nstrain/yr", sub: "• GNSS plate motion vector", provenance: "STATIC BASELINE", provenanceClass: "static" },
                { label: "InSAR Ground Shift", val: "2.4", unit: "cm", sub: "Sentinel-1 ascending/descending InSAR", provenance: "COPERNICUS SAR", provenanceClass: "copernicus" },
                { label: "Seismic Moment Est.", val: "4.8", unit: "Mw", sub: "• Background micro-tremors", provenance: "DERIVED", provenanceClass: "calc" },
                { label: "Fault Line Stress Index", val: "71", unit: "/100", sub: "• Tectonic boundary stress", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            metrics3: [
                { label: "GNSS Station Drift", val: "3.2", unit: "mm/yr", sub: "• Indian Plate NNE motion", provenance: "STATIC BASELINE", provenanceClass: "static" },
                { label: "Atmospheric Pressure", val: "1012", unit: "hPa", sub: "Barometric crust load", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Seismic Hazard Index", val: "78", unit: "/100", sub: "• BIS Seismic Zone IV/V", provenance: "STATIC BASELINE", provenanceClass: "static" }
            ],
            regional: [
                { region: "Himalayan Frontal Thrust", metricLabel: "Strain: 12.8 ns/yr (Zone V High Risk)", status: "Critical", statusClass: "unhealthy" },
                { region: "Kutch Fault Zone, Gujarat", metricLabel: "Strain: 8.2 ns/yr (Zone V Active)", status: "High Risk", statusClass: "unhealthy" },
                { region: "Delhi-Haridwar Ridge", metricLabel: "Strain: 5.4 ns/yr (Zone IV Fault)", status: "Moderate", statusClass: "moderate" },
                { region: "Narmada-Son Fault, MP", metricLabel: "Strain: 2.1 ns/yr (Zone III)", status: "Good", statusClass: "good" },
                { region: "Deccan Plateau, MH", metricLabel: "Strain: 0.8 ns/yr (Stable Craton)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "Sentinel-1A (InSAR)", time: "Auto-Calculated", desc: "Interferometric Crustal Displacement Mapping" },
                { satellite: "GRACE-FO Follow-On", time: "Auto-Calculated", desc: "Subsurface Mass & Tectonic Gravity Field" }
            ]
        },
        heat: {
            title: "Heatwave & Wet-Bulb Extreme Temperature",
            metrics4: [
                { label: "Peak Heat Index (HI)", val: "44.2", unit: "°C", sub: "• NOAA Heat Index equation", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Wet-Bulb Globe Temp", val: "29.8", unit: "°C", sub: "Stull simplified WBGT equation", provenance: "CALCULATED WBGT", provenanceClass: "calc" },
                { label: "Solar UV Index", val: "9.2", unit: "UVI", sub: "• Very High UV Exposure", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Night Minimum Temp", val: "28.4", unit: "°C", sub: "• Night heat recovery lag", provenance: "LIVE OPEN-METEO", provenanceClass: "live" }
            ],
            metrics3: [
                { label: "Relative Humidity", val: "54", unit: "%", sub: "Air moisture saturation", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Wind Cooling Effect", val: "14", unit: "km/h", sub: "Boundary layer ventilation", provenance: "LIVE OPEN-METEO", provenanceClass: "live" },
                { label: "Heatwave Alert Level", val: "86", unit: "/100", sub: "• IMD Heatwave Warning Scale", provenance: "CALCULATED", provenanceClass: "calc" }
            ],
            regional: [
                { region: "Churu, Rajasthan", metricLabel: "Heat Index: 48.5 °C (IMD Red Alert)", status: "Critical", statusClass: "unhealthy" },
                { region: "Banda, Uttar Pradesh", metricLabel: "Heat Index: 46.2 °C (Severe Heat)", status: "Critical", statusClass: "unhealthy" },
                { region: "Delhi NCR", metricLabel: "Heat Index: 43.8 °C (Orange Alert)", status: "High Risk", statusClass: "unhealthy" },
                { region: "Nagpur, Maharashtra", metricLabel: "Heat Index: 41.5 °C (Yellow Alert)", status: "Moderate", statusClass: "moderate" },
                { region: "Bengaluru, Karnataka", metricLabel: "Heat Index: 30.2 °C (Comfortable)", status: "Good", statusClass: "good" }
            ],
            passes: [
                { satellite: "INSAT-3D (Sounder)", time: "Auto-Calculated", desc: "Hourly Land Surface Temp & Insolation" },
                { satellite: "GOES-16 / ABI", time: "Auto-Calculated", desc: "Continental Heat Dome Tracking" }
            ]
        }
    },

    alerts: [
        { id: "EA-01", read: false, location: "Yamuna River, Delhi", type: "FLOOD", severity: "CRITICAL", time: "2 min ago", ai: 94, desc: "Water level exceeded danger mark by 1.2m. Evacuation advised for low-lying riverbanks.", critical: true },
        { id: "EA-02", read: false, location: "Kumaon Forest, Uttarakhand", type: "FIRE", severity: "HIGH", time: "8 min ago", ai: 88, desc: "Active wildfire detected via IR thermal imaging (~12 hectares affected).", critical: false },
        { id: "EA-03", read: false, location: "Mandi Highway, Himachal Pradesh", type: "LANDSLIDE", severity: "HIGH", time: "15 min ago", ai: 82, desc: "Soil displacement detected on slope. Highway closure recommended.", critical: false },
        { id: "EA-04", read: false, location: "Anand Vihar, Delhi", type: "AIR_QUALITY", severity: "HIGH", time: "41 min ago", ai: 91, desc: "AQI 387 — Hazardous particulate density. Sensitive groups should stay indoors.", critical: false },
        { id: "EA-05", read: false, location: "Mithi River, Mumbai", type: "FLOOD", severity: "MODERATE", time: "23 min ago", ai: 76, desc: "Water level rising steadily with high tide. Monitoring tide gate operations.", critical: false },
        { id: "EA-06", read: false, location: "Western Ghats, Maharashtra", type: "FIRE", severity: "MODERATE", time: "34 min ago", ai: 71, desc: "Thermal plume detected by satellite. Ground response dispatched.", critical: false }
    ],

    nodes: [
        { id: "NDE-01", name: "Delhi Gateway (ESP32)", aqi: 78, batt: 92, sig: 94, ping: "12s ago", status: "ONLINE", type: "online", sensor: "Air Quality + Climate Telemetry" },
        { id: "NDE-02", name: "Mumbai Coastal (Water Probe)", aqi: 65, batt: 84, sig: 87, ping: "8s ago", status: "ONLINE", type: "online", sensor: "Submersible Water Level + Relay" },
        { id: "NDE-03", name: "Uttarakhand Hub (Seismic)", aqi: 41, batt: 41, sig: 76, ping: "2m ago", status: "DEGRADED", type: "degraded", sensor: "3-Axis Seismic Tremor + RF Mesh" },
        { id: "NDE-04", name: "Kumaon Forest (NRF Mesh)", aqi: 190, batt: 12, sig: 96, ping: "18s ago", status: "FIRE ALERT", type: "fire-alert", sensor: "Flame Detection + Actuator Siren" },
        { id: "NDE-05", name: "Kolkata Delta (Flood Node)", aqi: 85, batt: 91, sig: 93, ping: "5s ago", status: "ONLINE", type: "online", sensor: "Water Depth + Drainage Relay" },
        { id: "NDE-06", name: "Wayanad Slope (Landslide)", aqi: 55, batt: 55, sig: 81, ping: "4m ago", status: "DEGRADED", type: "degraded", sensor: "Soil Moisture + Ground Tremor" },
        { id: "NDE-07", name: "Mandi Highway (Seismic)", aqi: 180, batt: 16, sig: 90, ping: "21s ago", status: "FIRE ALERT", type: "fire-alert", sensor: "Rockfall Sensor + Siren Relay" },
        { id: "NDE-08", name: "Jaipur Ridge (ESP32-S3)", aqi: 88, batt: 48, sig: 71, ping: "5m ago", status: "DEGRADED", type: "degraded", sensor: "Thermal Climate + Power Regulator" },
        { id: "NDE-09", name: "Kerala Coast (Flood Gateway)", aqi: 35, batt: 95, sig: 98, ping: "30s ago", status: "ONLINE", type: "online", sensor: "Water Probe + NRF24 Mesh" }
    ],

    bleDevices: [
        { name: "OCULA-Node-01 (ESP32 Multi-Hazard)", addr: "24:6F:28:B4:A1:02", rssi: -54, paired: true, connected: false },
        { name: "OCULA-Water-Probe-02 (ESP32)", addr: "30:AE:A4:C2:59:7E", rssi: -68, paired: true, connected: false },
        { name: "OCULA-Seismic-Node-03", addr: "DC:4F:22:18:99:A0", rssi: -82, paired: false, connected: false },
        { name: "OCULA-Landslide-Soil-04", addr: "E8:65:D8:19:44:BC", rssi: -71, paired: true, connected: false },
        { name: "OCULA-NRF24-Gateway-Mesh", addr: "F4:12:FA:83:B7:11", rssi: -75, paired: false, connected: false }
    ]
};

// Satellite Hazard Aliases
if (typeof AURA_DATA !== 'undefined' && AURA_DATA.satelliteDataByHazard) {
    AURA_DATA.satelliteDataByHazard.temperature = AURA_DATA.satelliteDataByHazard.temp;
    AURA_DATA.satelliteDataByHazard.earthquake = AURA_DATA.satelliteDataByHazard.quake;
    AURA_DATA.satelliteDataByHazard.heatwave = AURA_DATA.satelliteDataByHazard.heat;
    AURA_DATA.satelliteDataByHazard.air_quality = AURA_DATA.satelliteDataByHazard.aqi;
    AURA_DATA.satelliteDataByHazard.AIR_QUALITY = AURA_DATA.satelliteDataByHazard.aqi;
    AURA_DATA.satelliteDataByHazard.FLOOD = AURA_DATA.satelliteDataByHazard.flood;
    AURA_DATA.satelliteDataByHazard.FIRE = AURA_DATA.satelliteDataByHazard.fire;
    AURA_DATA.satelliteDataByHazard.LANDSLIDE = AURA_DATA.satelliteDataByHazard.landslide;
    AURA_DATA.satelliteDataByHazard.AQI = AURA_DATA.satelliteDataByHazard.aqi;
    AURA_DATA.satelliteDataByHazard.TEMPERATURE = AURA_DATA.satelliteDataByHazard.temp;
    AURA_DATA.satelliteDataByHazard.EARTHQUAKE = AURA_DATA.satelliteDataByHazard.quake;
    AURA_DATA.satelliteDataByHazard.HEATWAVE = AURA_DATA.satelliteDataByHazard.heat;
}

if (typeof window !== 'undefined') {
    window.AURA_DATA = AURA_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AURA_DATA;
}


