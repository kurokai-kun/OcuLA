import os
import math

out_dir = r"d:\Coding\Antigravity\images\methodology_report"
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. FIG 1: SLOPE STABILITY FACTOR OF SAFETY VS SATURATION (SVG)
# -------------------------------------------------------------
def make_fig1_slope_stability():
    w, h = 750, 400
    pad_l, pad_r, pad_t, pad_b = 80, 50, 45, 55
    pw = w - pad_l - pad_r
    ph = h - pad_t - pad_b
    
    def fs_calc(m):
        num = 8.5 + (46.25 - 24.525 * m) * 0.39878
        denom = 20.027
        return num / denom
    
    y_min, y_max = 0.7, 1.5
    def to_x(m): return pad_l + m * pw
    def to_y(fs): return pad_t + (1 - (fs - y_min) / (y_max - y_min)) * ph
    
    pts = []
    for i in range(101):
        m = i / 100.0
        fs = fs_calc(m)
        pts.append((to_x(m), to_y(fs)))
    
    poly_line = " ".join([f"{x:.1f},{y:.1f}" for x, y in pts])
    
    m_crit = 0.707
    x_crit = to_x(m_crit)
    y_crit = to_y(1.0)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <defs>
    <linearGradient id="stableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A7A5B" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#4A7A5B" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="unstableGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#A13D3D" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#A13D3D" stop-opacity="0.18"/>
    </linearGradient>
  </defs>

  <rect width="{w}" height="{h}" fill="#FFFFFF" rx="8" />

  <!-- Zones -->
  <rect x="{pad_l}" y="{pad_t}" width="{pw}" height="{y_crit - pad_t}" fill="url(#stableGrad)" />
  <rect x="{pad_l}" y="{y_crit}" width="{pw}" height="{ph - (y_crit - pad_t)}" fill="url(#unstableGrad)" />

  <!-- Horizontal grid -->
"""
    for val in [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]:
        y = to_y(val)
        dash = "stroke-dasharray='4,4'" if val != 1.0 else ""
        color = "#CBD5E1" if val != 1.0 else "#A13D3D"
        width = 1 if val != 1.0 else 2
        svg += f'  <line x1="{pad_l}" y1="{y}" x2="{pad_l+pw}" y2="{y}" stroke="{color}" stroke-width="{width}" {dash} />\n'
        svg += f'  <text x="{pad_l-12}" y="{y+4}" font-family="Inter, sans-serif" font-size="11" fill="{color}" text-anchor="end" font-weight="{600 if val==1.0 else 400}">{val:.1f}</text>\n'

    for m in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
        x = to_x(m)
        svg += f'  <line x1="{x}" y1="{pad_t}" x2="{x}" y2="{pad_t+ph}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3" />\n'
        svg += f'  <text x="{x}" y="{pad_t+ph+18}" font-family="Inter, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">{m:.1f}</text>\n'

    svg += f"""
  <!-- Critical Failure Threshold Label -->
  <rect x="{pad_l+pw-210}" y="{y_crit-28}" width="200" height="24" rx="4" fill="#FEE2E2" stroke="#FECACA" stroke-width="1"/>
  <text x="{pad_l+pw-110}" y="{y_crit-12}" font-family="JetBrains Mono, monospace" font-size="10.5" fill="#A13D3D" text-anchor="middle" font-weight="700">CRITICAL FAILURE (FS = 1.00)</text>

  <!-- Curve -->
  <polyline points="{poly_line}" fill="none" stroke="#1E293B" stroke-width="3" stroke-linecap="round" />

  <!-- Critical Point Marker -->
  <circle cx="{x_crit}" cy="{y_crit}" r="6" fill="#A13D3D" stroke="#FFFFFF" stroke-width="2" />
  <line x1="{x_crit}" y1="{y_crit}" x2="{x_crit}" y2="{pad_t+ph}" stroke="#A13D3D" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="{x_crit}" y="{pad_t+ph-8}" font-family="JetBrains Mono, monospace" font-size="10" fill="#A13D3D" text-anchor="middle" font-weight="700">m_crit = 0.71 (570mm/48h)</text>

  <!-- Labels -->
  <text x="{pad_l + pw/2}" y="{h-12}" font-family="Inter, sans-serif" font-size="12" fill="#1E293B" font-weight="600" text-anchor="middle">Soil Saturation Ratio (m = h_w / z)</text>
  <text transform="rotate(-90)" x="-{pad_t + ph/2}" y="28" font-family="Inter, sans-serif" font-size="12" fill="#1E293B" font-weight="600" text-anchor="middle">Factor of Safety (FS)</text>

  <!-- Zone Badges -->
  <text x="{pad_l+20}" y="{pad_t+26}" font-family="Inter, sans-serif" font-size="11.5" fill="#2E7D4F" font-weight="700">STABLE REGIME (FS &gt; 1.0)</text>
  <text x="{pad_l+20}" y="{pad_t+ph-18}" font-family="Inter, sans-serif" font-size="11.5" fill="#A13D3D" font-weight="700">SLOPE FAILURE &amp; DEBRIS FLOW (FS &lt; 1.0)</text>
</svg>"""
    with open(os.path.join(out_dir, "fig1_slope_stability.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("Wrote fig1_slope_stability.svg")

# -------------------------------------------------------------
# 2. FIG 2: PIPELINE LATENCY COMPARISON (LOG SCALE SVG)
# -------------------------------------------------------------
def make_fig2_pipeline_latency():
    w, h = 750, 340
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <rect width="{w}" height="{h}" fill="#FFFFFF" rx="8" />

  <!-- Title (font-size 18px to prevent truncation) -->
  <text x="50" y="36" font-family="Barlow Condensed, sans-serif" font-size="18.5" font-weight="800" fill="#0F172A" text-transform="uppercase" letter-spacing="0.5">DETECTION-TO-ESCALATION PIPELINE LATENCY (LOG10 SCALE)</text>
  <text x="50" y="56" font-family="Inter, sans-serif" font-size="12" fill="#64748B">Administrative manual forwarding chain vs. OcuLA autonomous edge closed loop</text>

  <!-- Bar 1: Status Quo -->
  <g transform="translate(50, 85)">
    <text x="0" y="16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#A13D3D">STATUS QUO (JULY 2024)</text>
    <text x="650" y="16" font-family="Barlow Condensed, sans-serif" font-size="22" font-weight="800" fill="#A13D3D" text-anchor="end">13.5 Hours (48,600 s)</text>
    
    <rect x="0" y="26" width="650" height="32" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/>
    <rect x="0" y="26" width="608" height="32" rx="4" fill="#A13D3D"/>
    <text x="595" y="47" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="end">Log10 = 4.69 (48,600 s)</text>
    <text x="0" y="74" font-family="Inter, sans-serif" font-size="11" fill="#64748B">09:00 AM Hume alert forwarded into WhatsApp group → Inter-agency delay until 10:35 PM text</text>
  </g>

  <!-- Bar 2: OcuLA Target -->
  <g transform="translate(50, 190)">
    <text x="0" y="16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#2E7D4F">OCULA AUTONOMOUS LOOP</text>
    <text x="650" y="16" font-family="Barlow Condensed, sans-serif" font-size="22" font-weight="800" fill="#2E7D4F" text-anchor="end">&lt; 1.2 Seconds (560 ms typ.)</text>
    
    <rect x="0" y="26" width="650" height="32" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/>
    <rect x="0" y="26" width="22" height="32" rx="4" fill="#2E7D4F"/>
    <text x="32" y="47" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#2E7D4F">Log10 = 0.08 (&lt; 1.2 s) • TinyML FFT (85ms) + LoRaWAN ToA (56.6ms) + Gateway Trip (200ms)</text>
    <text x="0" y="74" font-family="Inter, sans-serif" font-size="11" fill="#64748B">Edge inference on ESP32-S3 directly actuates local 110 dB sirens without manual forwarding</text>
  </g>

  <!-- Speedup Callout -->
  <g transform="translate(50, 290)">
    <rect x="0" y="0" width="650" height="28" rx="4" fill="#F0FDF4" stroke="#BBF7D0" />
    <text x="14" y="18" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#166534">SPEEDUP FACTOR: 40,500× FASTER (48,600s → 1.2s) • Eliminates 13.5-hour manual human handoff bottleneck</text>
  </g>
</svg>"""
    with open(os.path.join(out_dir, "fig2_pipeline_latency.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("Wrote fig2_pipeline_latency.svg")

# -------------------------------------------------------------
# 3. FIG 3: EVACUATION CLEARANCE MARGIN (SVG)
# -------------------------------------------------------------
def make_fig3_evacuation_kinematics():
    w, h = 750, 340
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <rect width="{w}" height="{h}" fill="#FFFFFF" rx="8" />

  <!-- Title (font-size 16px to prevent clipping on all system fonts) -->
  <text x="50" y="36" font-family="Barlow Condensed, sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-transform="uppercase">EVACUATION CLEARANCE KINEMATICS (W_LATERAL = 75m, V_WALK = 1.1 m/s)</text>
  <text x="50" y="56" font-family="Inter, sans-serif" font-size="12" fill="#64748B">Required clearance time: t_clear = 90s (reaction) + [75m / 1.1m/s] = 158.2s (2.64 min)</text>

  <!-- Timeline 1: Status Quo -->
  <g transform="translate(50, 85)">
    <text x="0" y="16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#A13D3D">STATUS QUO REALITY (02:00 AM STRIKE)</text>
    <text x="650" y="16" font-family="Barlow Condensed, sans-serif" font-size="22" font-weight="800" fill="#A13D3D" text-anchor="end">-2.6 MIN DEFICIT</text>
    
    <rect x="0" y="26" width="650" height="32" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/>
    <rect x="0" y="26" width="160" height="32" rx="4" fill="#A13D3D"/>
    <text x="80" y="47" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">Deficit: -158.2s</text>
    <text x="175" y="47" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600" fill="#A13D3D">0s lead time: Debris smashed homes during sleep → 298 fatalities</text>
  </g>

  <!-- Timeline 2: OcuLA -->
  <g transform="translate(50, 175)">
    <text x="0" y="16" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#2E7D4F">OCULA 22-MIN PRECURSOR TRIGGER (01:38 AM)</text>
    <text x="650" y="16" font-family="Barlow Condensed, sans-serif" font-size="22" font-weight="800" fill="#2E7D4F" text-anchor="end">+19.4 MIN SURVIVAL BUFFER (8.4×)</text>
    
    <rect x="0" y="26" width="650" height="32" rx="4" fill="#F1F5F9" stroke="#E2E8F0"/>
    <rect x="0" y="26" width="78" height="32" rx="4" fill="#3B82F6"/>
    <text x="39" y="47" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">Exit: 2.6m</text>
    
    <rect x="82" y="26" width="568" height="32" rx="4" fill="#2E7D4F"/>
    <text x="366" y="47" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">+19.4 MIN BUFFER REMAINING ON SAFE TERRACE</text>
    
    <text x="0" y="74" font-family="Inter, sans-serif" font-size="11" fill="#64748B">ADXL345 detects 8-18 Hz shear tremors 22 min early; villagers evacuate 75m corridor 19+ mins before impact</text>
  </g>

  <!-- Legend & Math Box -->
  <g transform="translate(50, 275)">
    <rect x="0" y="0" width="650" height="42" rx="4" fill="#FAFBF9" stroke="#E2E8F0"/>
    <circle cx="20" cy="21" r="5" fill="#3B82F6"/>
    <text x="32" y="25" font-family="Inter, sans-serif" font-size="11" fill="#1E293B" font-weight="600">t_clear = 2.64 min (evacuation phase)</text>
    <circle cx="250" cy="21" r="5" fill="#2E7D4F"/>
    <text x="262" y="25" font-family="Inter, sans-serif" font-size="11" fill="#1E293B" font-weight="600">Survival Buffer: +19.4 min</text>
    <text x="470" y="25" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#2E7D4F">Safety Factor: 8.33× (~8.4×)</text>
  </g>
</svg>"""
    with open(os.path.join(out_dir, "fig3_evacuation_kinematics.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("Wrote fig3_evacuation_kinematics.svg")

# -------------------------------------------------------------
# 4. FIG 4: ACOUSTIC PROPAGATION DECAY CURVE (SVG)
# -------------------------------------------------------------
def make_fig4_acoustic_decay():
    w, h = 750, 380
    pad_l, pad_r, pad_t, pad_b = 75, 45, 45, 55
    pw = w - pad_l - pad_r
    ph = h - pad_t - pad_b
    
    y_min, y_max = 30, 115
    def to_x(r): return pad_l + (r / 600.0) * pw
    def to_y(lp): return pad_t + (1 - (lp - y_min) / (y_max - y_min)) * ph
    
    pts = []
    for r in range(1, 601, 5):
        lp = 110.0 - 20.0 * math.log10(r) - 0.005 * r
        pts.append((to_x(r), to_y(lp)))
    
    poly_line = " ".join([f"{x:.1f},{y:.1f}" for x, y in pts])
    
    y_wake = to_y(75)
    y_rain = to_y(50)
    y_sms = to_y(35)
    y_85 = to_y(85)
    y_100 = to_y(100)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <rect width="{w}" height="{h}" fill="#FFFFFF" rx="8" />

  <!-- Title (font-size 17.5px) -->
  <text x="50" y="32" font-family="Barlow Condensed, sans-serif" font-size="17.5" font-weight="800" fill="#0F172A" text-transform="uppercase">ACOUSTIC PROPAGATION DECAY IN TROPICAL MONSOON CONDITIONS</text>

  <!-- 85-100 dB Target Penetration Band (from slide 5) -->
  <rect x="{pad_l}" y="{y_100}" width="{pw}" height="{y_85 - y_100}" fill="#2E7D4F" fill-opacity="0.08" />
  <line x1="{pad_l}" y1="{y_85}" x2="{pad_l+pw}" y2="{y_85}" stroke="#2E7D4F" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="{pad_l}" y1="{y_100}" x2="{pad_l+pw}" y2="{y_100}" stroke="#2E7D4F" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="{pad_l+14}" y="{y_100+16}" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#166534" font-weight="700">85–100 dB TARGET AUDIBILITY ZONE (Per Slide 5 Inset)</text>

  <!-- Threshold lines -->
  <line x1="{pad_l}" y1="{y_wake}" x2="{pad_l+pw}" y2="{y_wake}" stroke="#D97706" stroke-width="1.5" stroke-dasharray="5,4"/>
  <rect x="{pad_l+pw-240}" y="{y_wake-22}" width="235" height="20" rx="3" fill="#FEF3C7" stroke="#FDE68A"/>
  <text x="{pad_l+pw-122}" y="{y_wake-8}" font-family="JetBrains Mono, monospace" font-size="10" fill="#B45309" font-weight="700" text-anchor="middle">NOCTURNAL WAKING THRESHOLD (75 dB)</text>

  <line x1="{pad_l}" y1="{y_rain}" x2="{pad_l+pw}" y2="{y_rain}" stroke="#64748B" stroke-width="1.5" stroke-dasharray="3,3"/>
  <rect x="{pad_l+pw-240}" y="{y_rain+6}" width="235" height="20" rx="3" fill="#F1F5F9" stroke="#E2E8F0"/>
  <text x="{pad_l+pw-122}" y="{y_rain+20}" font-family="JetBrains Mono, monospace" font-size="10" fill="#475569" font-weight="700" text-anchor="middle">AMBIENT RAIN NOISE ON TIN ROOFS (50 dB)</text>

  <line x1="{pad_l}" y1="{y_sms}" x2="{pad_l+pw}" y2="{y_sms}" stroke="#A13D3D" stroke-width="1.5" stroke-dasharray="2,2"/>
  <text x="{pad_l+pw-10}" y="{y_sms+14}" font-family="JetBrains Mono, monospace" font-size="10" fill="#A13D3D" font-weight="600" text-anchor="end">Phone Vibration / SMS Notification (35 dB) — Inaudible (0 dB Lead)</text>

  <!-- Y axis ticks -->
"""
    for db in range(40, 120, 20):
        y = to_y(db)
        svg += f'  <line x1="{pad_l}" y1="{y}" x2="{pad_l+pw}" y2="{y}" stroke="#F1F5F9" stroke-width="1"/>\n'
        svg += f'  <text x="{pad_l-10}" y="{y+4}" font-family="Inter, sans-serif" font-size="11" fill="#64748B" text-anchor="end">{db} dB</text>\n'

    for r in [0, 100, 200, 300, 400, 500, 600]:
        x = to_x(r)
        svg += f'  <line x1="{x}" y1="{pad_t}" x2="{x}" y2="{pad_t+ph}" stroke="#F1F5F9" stroke-width="1"/>\n'
        svg += f'  <text x="{x}" y="{pad_t+ph+18}" font-family="Inter, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">{r}m</text>\n'

    svg += f"""
  <polyline points="{poly_line}" fill="none" stroke="#2E7D4F" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Siren source callout -->
  <circle cx="{to_x(1)}" cy="{to_y(110)}" r="5" fill="#2E7D4F" />
  <text x="{to_x(1)+10}" y="{to_y(110)-6}" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" fill="#2E7D4F">110 dB Siren Node (r = 1m)</text>

  <!-- 500m overlap cluster label -->
  <line x1="{to_x(500)}" y1="{pad_t}" x2="{to_x(500)}" y2="{pad_t+ph}" stroke="#2E7D4F" stroke-width="1" stroke-dasharray="4,4"/>
  <rect x="{to_x(500)-80}" y="{pad_t+ph-35}" width="160" height="22" rx="3" fill="#DCFCE7" stroke="#BBF7D0"/>
  <text x="{to_x(500)}" y="{pad_t+ph-20}" font-family="JetBrains Mono, monospace" font-size="10" fill="#166534" font-weight="700" text-anchor="middle">500m Cluster Cell Boundary</text>

  <text x="{pad_l + pw/2}" y="{h-12}" font-family="Inter, sans-serif" font-size="11.5" fill="#1E293B" font-weight="600" text-anchor="middle">Radial Distance from Siren Node (r, meters)</text>
  <text transform="rotate(-90)" x="-{pad_t + ph/2}" y="24" font-family="Inter, sans-serif" font-size="11.5" fill="#1E293B" font-weight="600" text-anchor="middle">Sound Pressure Level (SPL, dB)</text>
</svg>"""
    with open(os.path.join(out_dir, "fig4_acoustic_decay.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("Wrote fig4_acoustic_decay.svg")

# -------------------------------------------------------------
# 5. FIG 5: HIERARCHICAL STAR-MESH TOPOLOGY (SVG)
# -------------------------------------------------------------
def make_fig5_topology_mesh():
    w, h = 750, 400
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B"/>
    </marker>
  </defs>

  <rect width="{w}" height="{h}" fill="#FFFFFF" rx="8" />

  <text x="40" y="32" font-family="Barlow Condensed, sans-serif" font-size="20" font-weight="800" fill="#0F172A" text-transform="uppercase">OCULA 2-TIER HIERARCHICAL STAR-MESH ARCHITECTURE</text>
  <text x="40" y="52" font-family="Inter, sans-serif" font-size="11.5" fill="#64748B">16-Node Micro-Catchment Cluster (1 Parent Node + 15 Child Nodes • ₹60,000 Hardware BOM)</text>

  <!-- Parent Node (Center-Right) -->
  <g transform="translate(480, 80)">
    <rect x="0" y="0" width="230" height="245" rx="8" fill="#FAFBF9" stroke="#2E7D4F" stroke-width="2" />
    <rect x="0" y="0" width="230" height="32" rx="8" fill="#2E7D4F"/>
    <text x="115" y="21" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="#FFFFFF" text-anchor="middle">PARENT NODE (Raspberry Pi 3B+)</text>

    <text x="14" y="54" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#0F172A">• SX1276 LoRa / ChirpStack</text>
    <text x="14" y="70" font-family="Inter, sans-serif" font-size="9.5" fill="#475569">Open-source LoRaWAN Server</text>

    <text x="14" y="94" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#0F172A">• Mosquitto MQTT Broker</text>
    <text x="14" y="110" font-family="Inter, sans-serif" font-size="9.5" fill="#475569">Internal message pipeline</text>

    <text x="14" y="134" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#0F172A">• PyKrige + Flower + XGBoost</text>
    <text x="14" y="150" font-family="Inter, sans-serif" font-size="9.5" fill="#475569">Spatial Kriging &amp; Federated AI</text>

    <text x="14" y="174" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#0F172A">• SHA-256 Merkle Ledger</text>
    <text x="14" y="190" font-family="Inter, sans-serif" font-size="9.5" fill="#475569">Immutable tamper-evident audit</text>

    <rect x="12" y="206" width="206" height="24" rx="4" fill="#EDF4EE" />
    <text x="115" y="222" font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700" fill="#2E7D4F" text-anchor="middle">Solar Array + Battery Buffer</text>
  </g>

  <!-- Child Nodes (Left) -->
  <g transform="translate(40, 75)">
    <rect x="0" y="0" width="270" height="72" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2" />
    <text x="12" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#0F172A">CHILD NODE 01 (Crown Scarp Probe)</text>
    <text x="12" y="34" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#A13D3D" font-weight="600">ADXL345: 8-18 Hz Shear Tremors</text>
    <text x="12" y="50" font-family="Inter, sans-serif" font-size="9" fill="#475569">TFLite Micro Inference + CUSUM Drift</text>
    <text x="12" y="64" font-family="Inter, sans-serif" font-size="9" fill="#64748B">Solar + TP4056 + Battery (Off-Grid)</text>
  </g>

  <g transform="translate(40, 158)">
    <rect x="0" y="0" width="270" height="72" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2" />
    <text x="12" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#0F172A">CHILD NODE 02-08 (Slope Saturation)</text>
    <text x="12" y="34" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#475569" font-weight="600">Water Level + MQ-135 + DHT11 + Flame</text>
    <text x="12" y="50" font-family="Inter, sans-serif" font-size="9" fill="#475569">Continuous multi-sensor sampling</text>
    <text x="12" y="64" font-family="Inter, sans-serif" font-size="9" fill="#64748B">LoRaWAN SX1276 Uplink (5-10km range)</text>
  </g>

  <g transform="translate(40, 242)">
    <rect x="0" y="0" width="270" height="72" rx="6" fill="#F8FAFC" stroke="#2E7D4F" stroke-width="1.2" />
    <text x="12" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#2E7D4F">CHILD NODE 09-15 (Valley Siren Nodes)</text>
    <text x="12" y="34" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#2E7D4F" font-weight="700">85–100 dB Siren + 128×64 OLED (SH1106G)</text>
    <text x="12" y="50" font-family="Inter, sans-serif" font-size="9" fill="#475569">Active buzzer &amp; display for instant local alert</text>
    <text x="12" y="64" font-family="Inter, sans-serif" font-size="9" fill="#64748B">Triggered in &lt;1.2s • Wakes residents</text>
  </g>

  <!-- RF Links -->
  <line x1="310" y1="111" x2="480" y2="150" stroke="#64748B" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <line x1="310" y1="194" x2="480" y2="194" stroke="#64748B" stroke-width="1.8" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <line x1="480" y1="240" x2="310" y2="278" stroke="#2E7D4F" stroke-width="2.2" marker-end="url(#arrow)"/>
  
  <!-- Pill Badges positioned cleanly over link lines -->
  <g transform="translate(320, 116)">
    <rect x="0" y="0" width="135" height="18" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="67" y="13" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#475569" font-weight="700" text-anchor="middle">LoRa 868MHz (56.6ms)</text>
  </g>
  <g transform="translate(320, 252)">
    <rect x="0" y="0" width="135" height="18" rx="4" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1"/>
    <text x="67" y="13" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#166534" font-weight="700" text-anchor="middle">Siren Trip Downlink (&lt;1.2s)</text>
  </g>

  <!-- Bottom Metric Box -->
  <g transform="translate(40, 340)">
    <rect x="0" y="0" width="670" height="34" rx="4" fill="#FAFBF9" stroke="#E2E8F0"/>
    <text x="18" y="21" font-family="Inter, sans-serif" font-size="10.5" fill="#1E293B">
      <tspan font-weight="700">Star-Mesh Protocol:</tspan> Star topology for deterministic sub-second ToA; mesh fallback on link degradation.
    </text>
  </g>
</svg>"""
    with open(os.path.join(out_dir, "fig5_topology_mesh.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print("Wrote fig5_topology_mesh.svg")

if __name__ == "__main__":
    make_fig1_slope_stability()
    make_fig2_pipeline_latency()
    make_fig3_evacuation_kinematics()
    make_fig4_acoustic_decay()
    make_fig5_topology_mesh()
    print("All updated SVGs generated!")
