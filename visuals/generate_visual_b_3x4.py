import os
import asyncio
from playwright.async_api import async_playwright

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Visual B (3:4 Format) — Quantitative System Deltas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; border: none; outline: none; }
  html, body {
    width: 960px; height: 1280px; background-color: #FFFFFF; color: #111111;
    font-family: 'Inter', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased; overflow: hidden;
  }
  .canvas {
    width: 960px; height: 1280px; background: #FFFFFF;
    padding: 28px 36px 20px 36px;
    display: flex; flex-direction: column; justify-content: space-between;
  }

  /* HEADER */
  .slide-header { display: flex; flex-direction: column; gap: 4px; }
  .eyebrow-row { display: flex; align-items: center; gap: 10px; }
  .eyebrow-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; color: #4A7A5B; background: #EDF4EE;
    padding: 2.5px 8px; border-radius: 4px;
  }
  .eyebrow-context {
    font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase; color: #64748B;
  }
  .slide-title {
    font-family: 'Barlow Condensed', sans-serif; font-size: 33px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.5px; color: #1E293B; line-height: 1.1; margin-top: 2px;
  }
  .slide-subtitle { font-family: 'Inter', sans-serif; font-size: 13px; color: #555555; }

  /* 3 DELTA SECTIONS CONTAINER */
  .deltas-container { display: flex; flex-direction: column; gap: 14px; margin: 4px 0; }

  .delta-card {
    background: #FAFBF9; border: 1px solid #E2E8F0; border-radius: 8px;
    padding: 14px 18px 12px 18px; display: flex; flex-direction: column; gap: 10px;
  }
  .delta-top {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #EDF2F7; padding-bottom: 6px;
  }
  .delta-title {
    font-family: 'Barlow Condensed', sans-serif; font-size: 18.5px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.6px; color: #1E293B;
  }
  .delta-kpi-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700;
    color: #4A7A5B; background: #EDF4EE; padding: 2.5px 9px; border-radius: 4px;
    border: 1px solid #DCFCE7;
  }

  /* DIRECT COMPARISON ROWS: NUMBER FOLLOWED BY LINE LENGTH */
  .comparison-block {
    display: flex; flex-direction: column; gap: 10px;
  }

  .timeline-row {
    display: grid; grid-template-columns: 195px 1fr; gap: 14px; align-items: flex-start;
  }

  /* LEFT SIDE: ENTITY & NUMERIC METRIC */
  .row-meta-col {
    display: flex; flex-direction: column; gap: 2px;
  }
  .meta-tag-line {
    display: flex; align-items: center; gap: 6px;
  }
  .entity-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase; padding: 1.5px 5px; border-radius: 3px;
  }
  .entity-tag.status-quo { color: #A13D3D; background: #FEE2E2; }
  .entity-tag.ocula { color: #4A7A5B; background: #DCFCE7; }

  .meta-label {
    font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600; color: #64748B;
  }
  .metric-headline {
    font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 800; line-height: 1;
    margin-top: 1px;
  }
  .metric-headline.status-quo { color: #A13D3D; }
  .metric-headline.ocula { color: #4A7A5B; }
  .metric-sub {
    font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 500; color: #64748B;
  }

  /* RIGHT SIDE: LINE LENGTH (THE BAR) & EXPLANATION */
  .row-line-col {
    display: flex; flex-direction: column; gap: 4px; padding-top: 2px;
  }

  .line-track {
    width: 100%; height: 22px; background: #EEF2F6; border-radius: 4px;
    border: 1px solid #E2E8F0; position: relative; display: flex; align-items: center;
    overflow: hidden;
  }
  .line-fill {
    height: 100%; border-radius: 3px; display: flex; align-items: center;
    padding: 0 10px; justify-content: flex-end;
  }
  .line-fill.sq-latency { background: #A13D3D; width: 95%; }
  .line-fill.sq-zero { background: #CBD5E1; width: 3%; min-width: 8px; }
  .line-fill.sq-deficit { background: #A13D3D; width: 28%; }

  .line-fill.oc-latency { background: #4A7A5B; width: 3.5%; min-width: 14px; }
  .line-fill.oc-audio { background: #4A7A5B; width: 92%; }
  .line-fill.oc-buffer { background: #4A7A5B; width: 88%; }

  .bar-text {
    font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700;
    color: #FFFFFF; letter-spacing: 0.5px; white-space: nowrap;
  }
  .outside-bar-text {
    position: absolute; left: 42px; font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; font-weight: 700; color: #4A7A5B;
  }
  .outside-bar-text.alert {
    left: 18px; color: #A13D3D;
  }
  .outside-bar-text.deficit {
    left: 31%; color: #A13D3D;
  }

  .row-desc {
    font-family: 'Inter', sans-serif; font-size: 11px; color: #555555; line-height: 1.3;
  }

  /* DELTA BANNER */
  .delta-banner {
    background: #F1F5F2; border-left: 3px solid #4A7A5B; border-radius: 0 4px 4px 0;
    padding: 6px 10px; display: flex; align-items: center; gap: 8px; margin-top: 2px;
  }
  .delta-tag-mini {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800;
    color: #4A7A5B; text-transform: uppercase; letter-spacing: 0.8px;
  }
  .delta-banner-text {
    font-family: 'Inter', sans-serif; font-size: 11.2px; color: #1E293B; line-height: 1.25;
  }
  .delta-banner-text strong { color: #0F172A; font-weight: 700; }

  /* BOTTOM KPI STRIP */
  .summary-strip {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
    background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px;
  }
  .kpi-box { display: flex; flex-direction: column; gap: 2px; }
  .kpi-title { font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; }
  .kpi-num { font-family: 'Barlow Condensed', sans-serif; font-size: 25px; font-weight: 800; line-height: 1; color: #1E293B; }
  .kpi-num.green { color: #4A7A5B; }
  .kpi-caption { font-family: 'Inter', sans-serif; font-size: 9.5px; color: #718096; }

  /* FOOTER */
  .slide-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid #EDF2F7; padding-top: 6px; font-size: 9.5px;
    color: #718096; font-family: 'Inter', sans-serif;
  }
  .footer-tag { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #475569; }
</style>
</head>
<body>
<div class="canvas">

  <!-- HEADER -->
  <div class="slide-header">
    <div class="eyebrow-row">
      <span class="eyebrow-tag">Visual B (3:4 Format)</span>
      <span class="eyebrow-context">Smart India Hackathon 2026 &bull; PS 26178 &bull; Slide Inset</span>
    </div>
    <div class="slide-title">Wayanad 2024: Quantitative System Deltas</div>
    <div class="slide-subtitle">Sequential timeline comparison: Status Quo (July 2024) vs. OcuLA Autonomous Edge Layer</div>
  </div>

  <!-- DELTAS CONTAINER -->
  <div class="deltas-container">

    <!-- SECTION 1: LATENCY -->
    <div class="delta-card">
      <div class="delta-top">
        <span class="delta-title">1. Detection-to-Escalation Pipeline Latency</span>
        <span class="delta-kpi-badge">40,500&times; FASTER ACTUATION</span>
      </div>

      <div class="comparison-block">
        <!-- 1A: STATUS QUO: 13.5 HOURS FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag status-quo">Status Quo</span>
              <span class="meta-label">Deliberation</span>
            </div>
            <div class="metric-headline status-quo">13.5 Hours</div>
            <span class="metric-sub">48,600s administrative delay</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill sq-latency">
                <span class="bar-text">13.5 Hours (Bureaucratic Deliberation)</span>
              </div>
            </div>
            <div class="row-desc">
              09:00 AM Hume NGO alert forwarded into collectorate WhatsApp group; un-automated inter-agency deliberation delay until 10:35 PM SMS.
            </div>
          </div>
        </div>

        <!-- 1B: OCULA: < 1.2 SECONDS FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag ocula">OcuLA Edge</span>
              <span class="meta-label">Autonomous Loop</span>
            </div>
            <div class="metric-headline ocula">&lt; 1.2 Seconds</div>
            <span class="metric-sub">TinyML + LoRa star-mesh</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill oc-latency"></div>
              <span class="outside-bar-text">&lt; 1.2s &bull; ESP32 TinyML FFT (&lt;100ms) + LoRa Uplink (56.6ms)</span>
            </div>
            <div class="row-desc">
              Autonomous on-device inference executes without cloud or manual forwarding; directly trips local physical sirens.
            </div>
          </div>
        </div>
      </div>

      <!-- DELTA BANNER -->
      <div class="delta-banner">
        <span class="delta-tag-mini">System Delta</span>
        <span class="delta-banner-text"><strong>40,500&times; faster escalation</strong> &bull; Replaces manual administrative WhatsApp forwarding with sub-second autonomous edge actuation.</span>
      </div>
    </div>

    <!-- SECTION 2: RESILIENCE & AUDIBILITY -->
    <div class="delta-card">
      <div class="delta-top">
        <span class="delta-title">2. Infrastructure Resilience &amp; Audibility Under Storm Conditions</span>
        <span class="delta-kpi-badge">+110 dB ACOUSTIC PENETRATION</span>
      </div>

      <div class="comparison-block">
        <!-- 2A: STATUS QUO: 0 dB FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag status-quo">Status Quo</span>
              <span class="meta-label">Passive SMS</span>
            </div>
            <div class="metric-headline status-quo">0 dB (Silent)</div>
            <span class="metric-sub">0% waking probability</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill sq-zero"></div>
              <span class="outside-bar-text alert">0 dB &bull; Ambient room rain noise (45 dB) drowned out silent nighttime phone vibration</span>
            </div>
            <div class="row-desc">
              Sent at 10:35 PM to sleeping villagers. 100% dependent on commercial telecom towers (which regularly fail in storms).
            </div>
          </div>
        </div>

        <!-- 2B: OCULA: 110 dB SIREN FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag ocula">OcuLA Edge</span>
              <span class="meta-label">Acoustic Siren</span>
            </div>
            <div class="metric-headline ocula">110 dB Siren</div>
            <span class="metric-sub">100% waking probability</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill oc-audio">
                <span class="bar-text">110 dB Outdoor Siren (Sleep-waking threshold: &gt;75 dB at bed)</span>
              </div>
            </div>
            <div class="row-desc">
              Solar + supercap buffered siren nodes operate through total grid collapse; penetrates rainfall noise across 500m radius.
            </div>
          </div>
        </div>
      </div>

      <!-- DELTA BANNER -->
      <div class="delta-banner">
        <span class="delta-tag-mini">System Delta</span>
        <span class="delta-banner-text"><strong>Physical acoustic waking vs. inaudible text</strong> &bull; Complete immunity from grid failure (Cyclone Amphan 70% dark, Michaung diesel fails).</span>
      </div>
    </div>

    <!-- SECTION 3: EVACUATION MARGIN -->
    <div class="delta-card">
      <div class="delta-top">
        <span class="delta-title">3. Life-Safety Evacuation Clearance Margin</span>
        <span class="delta-kpi-badge">8.4&times; SAFETY FACTOR</span>
      </div>

      <div class="comparison-block">
        <!-- 3A: STATUS QUO: -2.6 MIN DEFICIT FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag status-quo">Status Quo</span>
              <span class="meta-label">Notice at Strike</span>
            </div>
            <div class="metric-headline status-quo">-2.6 min Deficit</div>
            <span class="metric-sub">Fatal reaction shortfall</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill sq-deficit">
                <span class="bar-text">-2.6 min Deficit</span>
              </div>
              <span class="outside-bar-text alert" style="left: 30%;">0s acoustic alert vs. 158.2s needed to exit 75m debris path (298 dead)</span>
            </div>
            <div class="row-desc">
              Villagers' first notice was roaring mud and boulders smashing homes at 02:00 AM. Zero lead time caused catastrophic entrapment.
            </div>
          </div>
        </div>

        <!-- 3B: OCULA: +19.4 MIN BUFFER FOLLOWED BY LINE LENGTH -->
        <div class="timeline-row">
          <div class="row-meta-col">
            <div class="meta-tag-line">
              <span class="entity-tag ocula">OcuLA Edge</span>
              <span class="meta-label">01:38 AM Alert</span>
            </div>
            <div class="metric-headline ocula">+19.4 min Buffer</div>
            <span class="metric-sub">Safe terrace clearance</span>
          </div>
          <div class="row-line-col">
            <div class="line-track">
              <div class="line-fill oc-buffer">
                <span class="bar-text">+19.4 min Safe Buffer (22 min Precursor &minus; 2.6 min Escape)</span>
              </div>
            </div>
            <div class="row-desc">
              ADXL345 detects 8&ndash;18 Hz shear tremors at 01:38 AM (22m early). Families evacuate 75m lateral path with 19+ mins to spare.
            </div>
          </div>
        </div>
      </div>

      <!-- DELTA BANNER -->
      <div class="delta-banner">
        <span class="delta-tag-mini">System Delta</span>
        <span class="delta-banner-text"><strong>+19.4 minute survival margin</strong> &bull; 8.4&times; clearance factor converts certain nighttime fatality into completed lateral evacuation.</span>
      </div>
    </div>

  </div>

  <!-- BOTTOM KPI STRIP -->
  <div class="summary-strip">
    <div class="kpi-box">
      <span class="kpi-title">Handoff Speedup</span>
      <span class="kpi-num green">40,500&times;</span>
      <span class="kpi-caption">13.5 hrs &rarr; &lt; 1.2s</span>
    </div>
    <div class="kpi-box">
      <span class="kpi-title">Acoustic Penetration</span>
      <span class="kpi-num green">+110 dB</span>
      <span class="kpi-caption">vs 0 dB silent text</span>
    </div>
    <div class="kpi-box">
      <span class="kpi-title">Evacuation Margin</span>
      <span class="kpi-num green">+19.4 min</span>
      <span class="kpi-caption">8.4&times; safety buffer</span>
    </div>
    <div class="kpi-box">
      <span class="kpi-title">Hardware BOM</span>
      <span class="kpi-num">&#8377;60,000</span>
      <span class="kpi-caption">1 Parent + 15 Child Nodes</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="slide-footer">
    <span><strong>Physics Formulation:</strong> t_clear = t_react (90s) + [W_lateral (75m) / v_walk (1.1 m/s)] = 158.2s (2.6 min). Sources: GSI 2024 Wayanad Survey; NCESS Debris Velocity (16 m/s); Official Toll (298 dead).</span>
    <span class="footer-tag">OCULA &bull; SIH 2026 &bull; PS 26178</span>
  </div>

</div>
</body>
</html>
"""

async def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_file = os.path.join(base_dir, "visual_b_3x4.html")
    png_file = os.path.join(base_dir, "visual_b_3x4.png")
    
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Wrote {html_file}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="msedge", headless=True)
        # 3:4 aspect ratio: 960 x 1280
        page = await browser.new_page(viewport={"width": 960, "height": 1280}, device_scale_factor=2)
        await page.goto(f"file:///{html_file.replace(os.sep, '/')}")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=png_file)
        print(f"Captured {png_file} (3:4 ratio: 960x1280 @ 2x = 1920x2560)")
        
        # Also copy/save as visual_b_comparative_deltas_3x4.png
        png_copy = os.path.join(base_dir, "visual_b_comparative_deltas_3x4.png")
        await page.screenshot(path=png_copy)
        print(f"Captured {png_copy}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
