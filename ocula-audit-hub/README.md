# 🛡️ OCULA Audit Hub — Administrative Security & Telemetry Command Center

[![Platform](https://img.shields.io/badge/Platform-Web%20SPA-blue.svg)](https://ocula.co.in)
[![Security](https://img.shields.io/badge/Auth-SHA--256%20Cryptographic%20Verification-green.svg)](https://ocula.co.in)
[![Sync](https://img.shields.io/badge/Sync-Multi--Device%20Mesh%20Relay-purple.svg)](https://ocula.co.in)

The **OCULA Audit Hub** is the administrative command center for the OCULA environmental intelligence platform. It provides real-time audit event tracking, live multi-device session monitoring, remote killswitch actuation, threat analysis, and cryptographic provenance logging.

---

## 🌟 Key Capabilities

1. **Live Session Intelligence**: Real-time GPS and GeoIP mapping of all active citizen and administrator sessions across web and mobile platforms.
2. **Cryptographic Event Auditing**: Streaming timeline of authentication, hardware connection, sensor calibration, and threat events.
3. **Remote Device Control**: Master remote session termination and IP blacklisting across the mesh network.
4. **Threat Detection & Geofencing**: Automatic detection of unauthorized access attempts and geographic anomalies.
5. **Interactive GIS Operations**: Dark matter vector map with live device status pins and interactive command modals.

---

## 📁 File Structure

```
ocula-audit-hub/
├── index.html          # Audit Hub SPA dashboard
├── audit.js            # Core audit controller & telemetry engine
├── styles.css          # Apple HIG dark glassmorphic styling
├── favicon.ico         # Security hub favicon
└── assets/
    ├── leaflet.js      # GIS mapping engine
    ├── leaflet.css     # Leaflet styles
    ├── logo.png        # OCULA branding
    └── logo.svg        # Scalable vector logo
```

---

## 🔒 Security Architecture

- **Passkey Hashing**: Master authentication verified against client-side SHA-256 digests (`crypto.subtle`).
- **Telemetry Mesh**: Multi-device communication facilitated via obfuscated real-time cloud relay and local BroadcastChannel.
- **Auto-Lockout**: Automated session lockout after consecutive failed authentication attempts.

---

© 2026 OCULA Project. All rights reserved.
