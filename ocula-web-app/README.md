# OCULA — Omnisense, Localized Alerts Intelligence Platform

[![Platform](https://img.shields.io/badge/Platform-Web%20SPA-blue.svg)](https://ocula.co.in)
[![GIS Engine](https://img.shields.io/badge/GIS-Leaflet%20%7C%20Google%20Tiles-brightgreen.svg)](https://leafletjs.com/)
[![AI Assistant](https://img.shields.io/badge/AI%20Copilot-Gemini%202.0%20Flash-purple.svg)](https://openrouter.ai/)
[![Hardware](https://img.shields.io/badge/Hardware-Arduino%20%7C%20WebSerial-orange.svg)](https://www.arduino.cc/)
[![Live](https://img.shields.io/badge/Live-ocula.co.in-success.svg)](https://ocula.co.in)

A real-time public environmental intelligence and multi-hazard monitoring web platform with live physical Arduino USB sensor telemetry, interactive GIS disaster mapping, satellite orbital observations, and an integrated AI Copilot.

🔗 **Live**: [ocula.co.in](https://ocula.co.in)

---

## 🌟 Key Features

### 1. Live Arduino USB Sensor Telemetry
- Native **WebSerial API** integration for real-time wired USB connection to Arduino Uno R4 / ESP32
- Real-time AQI, PM2.5, CO₂/Gas, VOCs, Temperature, and Humidity streaming with visual pulse indicators
- Universal multi-format serial decoding (JSON, CSV, Key-Value, Analog Read)

### 2. Interactive Multi-Hazard GIS Map
- High-speed vector tile layers with dark and light themes
- 60+ worldwide and regional monitoring hotspots across **7 Hazard Layers**: Flood, Fire, Landslide, AQI, Temperature, Earthquake, and Heatwave
- Point-accurate teardrop pins with embedded hazard icons and custom dark popups
- Global place search and instant **My Location** geolocation tracking

### 3. OCULA AI Assistant
- Integrated OpenRouter AI assistant powered by `google/gemini-2.0-flash-001`
- Environmental telemetry interpretation, safety protocols, and hardware setup assistance
- Rich markdown formatting with offline NLP fallback

### 4. Sensor Blind Spots AI Engine
- AI-driven vulnerability and coverage gap analysis across disaster monitoring networks

### 5. Satellite Data & Emergency Alerts
- Orbital Aerosol Optical Depth (AOD) retrievals and satellite pass schedules
- Real-time emergency alert broadcasting with read/unread tracking

---

## 📁 Project Structure

```
OCULA Web App/
├── index.html          # Main SPA entry point
├── app.js              # Core application controller (~5,300 lines)
├── data.js             # Environmental data store & location catalog
├── map.js              # Multi-hazard GIS engine (Leaflet-based)
├── globe.js            # 3D interactive globe renderer
├── assistant.js        # AI assistant module (OpenRouter + Offline NLP)
├── earth_textures.js   # Base64-encoded globe textures
├── styles.css          # Complete stylesheet (~212KB)
├── favicon.ico         # Site favicon
├── robots.txt          # Search engine directives
├── sitemap.xml         # Sitemap for SEO
├── vercel.json         # Vercel deployment config
├── .nojekyll           # GitHub Pages compatibility
└── assets/
    ├── logo.png        # OCULA logo (PNG)
    ├── logo.svg        # OCULA logo (SVG)
    ├── earth_day.jpg   # Globe day texture
    ├── earth_clouds.png# Globe cloud layer
    ├── disaster-bg.jpg # Landing page background
    ├── disaster-preview.jpg
    ├── leaflet.js      # Leaflet GIS library (vendored)
    └── leaflet.css     # Leaflet styles (vendored)
```

---

## 🚀 Deployment

### Vercel (Current Production)
The app is deployed on Vercel with the custom domain `ocula.co.in`.

### GitHub Pages
1. Create a new repository on GitHub
2. Upload all files from this directory
3. Go to **Settings** → **Pages** → select `main` branch, `/ (root)` folder
4. Your site will be live at `https://<username>.github.io/<repo>/`

> **Note**: GitHub Pages serves over HTTPS, enabling full WebSerial API hardware access in Chrome, Edge, and Opera.

---

## 🔌 Hardware Setup

Connect your Arduino Uno R4 / ESP32 via USB cable and click **⚡ Connect Sensor** in the app to stream live physical telemetry.

**Supported Protocols**: WebSerial (USB), BLE, WiFi (HTTP polling)

---

## 🛡️ Security

- Admin authentication uses SHA-256 hashed password verification
- All telemetry relay channels use obfuscated endpoints
- Security headers configured via `vercel.json` (HSTS, X-Frame-Options, CSP-adjacent protections)

---

## 📄 License

© 2026 OCULA Project. All rights reserved.