# Project Knowledge — Realigning "AURA" to SIH Problem Statement 26178

## How to use this document

This file is background knowledge for a Claude Project, not a one-off task script. It should stay
uploaded for the life of this project, and every conversation inside the project — whether the request is
"rewrite slide 2," "what stats should I use," "review this new diagram idea," or "help me answer judges'
questions" — should be handled with this context in mind, without the user needing to re-explain any of it.

Also upload the current pitch deck itself (`The_Code_Alchemists_SIH2026.pdf`, or whatever the latest
version is called) as a separate project file. This document tells you *what to aim for and why*; the deck
file tells you *exactly what currently exists*, word for word. When the two disagree — e.g., if the deck
has since been edited — trust the actual uploaded deck over the summary in Section 2 below, and mention the
discrepancy.

---

## 1. What this project is

The team ("The Code Alchemists," a small student team) built **AURA (Air Utility & Response Architecture)**
— an air-quality monitoring system combining a low-cost Arduino sensor node, an AI-driven forecasting
dashboard, and a blockchain layer for tamper-proof record-keeping — originally as a general hackathon
pitch. The team is now re-targeting the same underlying work at a specific official challenge, **Smart
India Hackathon 2026 Problem Statement SIH26178**, and wants every future draft, slide, diagram, and stat
in this project to map cleanly onto that problem statement's actual requirements rather than onto AURA's
original, narrower air-quality-only framing.

Your general posture in this project: help the team **extend and reframe what they've already built**
toward the target problem statement below — not redesign it from scratch, and not overstate what exists.

---

## 2. Baseline — the current AURA deck (as of the last version reviewed)

A 6-slide deck in the official SIH template (SIH2026 brain/lightbulb logo, "The Code Alchemists" badge,
navy serif titles):

1. **Title Page** — PS ID blank, PS Title "AURA – Democratizing AQI Readings," Theme "Open Innovation," PS
   Category "Software," Team ID blank.
2. **Problem + Proposed Solution** — stats on Indian pollution deaths and monitoring-station scarcity; a
   three-layer architecture (Edge IoT & Actuation / Software & AI Predictive Analytics / Blockchain Data
   Commons) with a flow diagram: Arduino + Sensors + Relay Modules → Geo-stamped Telemetry → XGBoost Model
   → Oracle Bridges → Decentralized Ledger.
3. **Technical Approach** — tech stack (Arduino; MQ135/PM2.5/DHT11; Next.js + Tailwind; Kriging + Random
   Forest; LLM integration; XGBoost/LightGBM; blockchain ledger; Mappls) plus a boxed architecture diagram.
4. **Feasibility and Viability** — feasibility bullets (cost, maintenance, open-source adaptability),
   visibility bullets (translating invisible data, tamper-proof transparency, grassroots awareness), a
   real breadboard-prototype photo, and a dashboard screenshot showing AQI/PM2.5/PM10/VOC/temperature/
   humidity and an AI forecast panel.
5. **Impact and Benefits** — four sections (Public Health & Decisions; Trust & Data Integrity; Grassroots
   Environmental Action; Technological Accessibility) with an "Individual → Ecosystem" diagram.
6. **Research and References** — air-quality-specific sources (Lancet/GBD, WHO, CPCB, OpenAQ, WAQI,
   Sentinel-5P, MODIS/VIIRS, Mappls).

Treat this as the *starting point to extend*, not as a fixed deliverable to preserve unchanged.

---

## 3. The target: SIH Problem Statement 26178 (full detail — treat as ground truth)

- **PS Number**: SIH26178
- **Category**: **Hardware** (not Software — judges will expect an actual physical, demoable device, more
  so than for a Software-category entry)
- **Theme**: Disaster Management
- **Posted by**: Qualcomm Inc
- **Idea-submission deadline** (last checked): 20 September 2026 — if this project is still active well
  past that date, flag it, since the requirement details may have been revised or the window reopened
  under different terms.

**Background**: India regularly faces flooding, forest fires, landslides, extreme heat, and chronic urban
air pollution. Existing monitoring (NDMA, IMD, ISRO, etc.) is largely centralized and lacks fine-grained,
real-time, hyperlocal coverage. The problem statement calls for a distributed network of low-cost,
AI-capable sensor nodes to close that gap.

**Core ask**: an "Environmental Intelligence Network" of distributed sensor nodes, each running its own
on-device ("edge") AI so it can detect risk locally — including with no live internet connection — and
send only meaningful, summarized alerts upstream rather than a constant raw data stream.

**The seven components any submission is expected to cover** — use this as the standing checklist for
every future request in this project:

1. **Distributed smart sensor nodes** sensing: water level/rainfall (flood), temperature/humidity (heat),
   smoke (fire), air quality — explicitly PM2.5 and PM10 (pollution), gas leakage (industrial/chemical),
   and soil moisture/vibration (landslide precursors). Solar-powered, low-maintenance, unattended-capable.
2. **On-device ("edge") AI analytics** — real-time detection running locally on the node, functioning
   without continuous cloud connectivity.
3. **Multi-hazard early warning** — flooding, forest fires, hazardous pollution, extreme weather,
   industrial safety incidents, at minimum.
4. **Regional environmental risk mapping** — geospatial hotspot/trend visualization feeding
   emergency-dashboard-style views.
5. **Community and authority notification** — mobile/web alerts, prioritized by severity and confidence,
   not a flat undifferentiated stream.
6. **Cloud-and-edge hybrid architecture** — instant decisions at the edge; the cloud layer handles
   longer-term trend analysis, forecasting, and policy support.
7. **Scalable, cost-effective deployment** — modular from a single village to a full state, supporting
   real long-range/low-power IoT standards (LoRaWAN, NB-IoT, Wi-Fi, 5G), not only short-range Wi-Fi.

---

## 4. Fit assessment — reference this whenever framing "why us"

**Strengths already in place** (keep asserting these, they're real advantages):
- A genuine, working Arduino-based hardware prototype — most competing teams on a Hardware-category PS
  will only have a mockup.
- An existing AI layer (Kriging + Random Forest, XGBoost/LightGBM), a working dashboard, and a blockchain
  data-integrity layer — none of this needs to be discarded.

**Gaps to close** (every future draft should be working toward closing these, or honestly flagging them as
roadmap items if not yet built):
- Only air quality is sensed today — no water-level, smoke/flame, or soil-moisture/vibration sensing yet,
  so flood, fire, and landslide risk cannot currently be detected.
- The AI model currently appears to run in the cloud/dashboard layer, not on the sensor node — the PS's
  "must work without connectivity" requirement is not yet satisfied.
- Connectivity (relay modules) is not clearly built for long-range, low-power, remote deployment —
  LoRaWAN/NB-IoT needs to be added or made explicit.
- No solar/off-grid power story yet.

**A genuine differentiator, not a requirement**: the blockchain layer is not asked for by this PS at all.
Keep it in every version of the pitch, but frame it as "why choose this team's entry" rather than as
something the judges are checking a box for.

---

## 5. Standing modification guidelines

Use these as the default target whenever asked to draft, revise, or review any part of the deck, in any
future conversation in this project.

### 5.1 Text and narrative
Replace AQI-only language ("Democratizing AQI Readings," "decentralizes AQI monitoring") with multi-hazard
framing that keeps air quality as the proven flagship module. Use present tense only for what's actually
built and demoed; use clearly future/roadmap language for anything still planned.

### 5.2 Hardware tech stack
Target additions, each tied to a specific PS requirement:
- ESP32 (alongside or instead of plain Arduino) — needed to run a small on-device AI model.
- Water-level/ultrasonic sensor — flood risk.
- Flame/smoke (IR) sensor — fire risk.
- Soil moisture + vibration/accelerometer sensor — landslide risk (hardest to demo convincingly in a short
  timeframe; fine to present as near-term roadmap rather than a built feature).
- LoRa radio module — long-range, low-power connectivity for remote deployment.
- Small solar panel + battery + charging circuit — off-grid, low-maintenance operation.
- Existing MQ135, PM2.5, and DHT11 sensors stay as-is — they already satisfy the air-quality and
  temperature/humidity requirements.

### 5.3 Software tech stack
- Add an explicit on-device inference framework (e.g., TensorFlow Lite Micro or Edge Impulse) running
  locally on the node — this is the single most PS-critical addition and should never be left as a vague
  mention.
- Keep Next.js + Tailwind, Kriging + Random Forest, XGBoost/LightGBM, the LLM integration, and Mappls —
  extend all of them to handle multiple hazard types rather than replacing them.
- Keep the blockchain/smart-contract layer in the stack (see Section 4 on how to frame it).

### 5.4 Architecture (three-layer model)
- **Edge Hardware & Actuation**: explicitly multi-hazard sensing, plus on-device AI running at this layer
  (this is new relative to the original deck, where all "AI" was implied to live in the software layer).
- **Software & AI Predictive Analytics**: multiple hazard types in parallel, each with its own
  severity/confidence score feeding a unified, prioritized alert system — not a single AQI threshold.
- **Blockchain Data Commons**: function unchanged; narrative reframed as differentiator, per Section 4.
- Always narrate the cloud-vs-edge split explicitly: which decisions happen instantly on the node, and
  which happen later, in aggregate, in the cloud.

### 5.5 Diagrams
- Main flow diagram: add icons for the new sensor types, add an explicit "on-device AI inference" box
  sitting on the sensor node itself (before data leaves the node), and add/replace the transmission icon
  to show LoRaWAN/NB-IoT.
- Boxed architecture diagram: widen the "Edge Hardware" box to list the new sensor categories and add a
  visible on-device-inference sub-block, so the edge-AI story is visible at a glance, not just in text.
- "Individual → Ecosystem" diagram: update each box's bullets to multi-hazard framing.
- Preserve the existing visual language (colors, icon style, box shapes) — extend it, don't redesign it.

### 5.6 Charts and statistics
- Keep the existing pollution-death and monitoring-station-scarcity stats, but pair them with at least one
  real, cited flood/forest-fire/landslide impact figure for India whenever the problem framing is
  discussed or redrafted.
- **Never invent a statistic.** If a needed figure isn't available in the conversation, say so explicitly
  and mark it as `[STAT NEEDED: source]` rather than presenting a guess as fact — this deck may go in front
  of an actual government hackathon panel.

### 5.7 Additional content to weigh in on when asked
- A dedicated slide on the on-device/edge-AI approach — currently the biggest gap in the deck and worth
  its own slide rather than a single bullet.
- A dedicated slide on deployment scalability (village → smart city → state), since the PS explicitly asks
  for this framing and the deck doesn't currently address it.
- Keep total slide count near the current 6–8 unless the user asks for more — sharper, not longer.

### 5.8 Sources and references
Keep the existing air-quality sources (Lancet/GBD, WHO, CPCB, OpenAQ, WAQI, Sentinel-5P, MODIS/VIIRS,
Mappls). When new hazard types are discussed, suggest adding real sources such as NDMA publications,
ISRO Bhuvan or Forest Survey of India data (forest fire), IMD flood-forecasting resources, Geological
Survey of India (landslide zonation), and TensorFlow Lite Micro / Edge Impulse documentation (edge-AI
methodology). Every reference suggested must be real and verifiable — an incomplete list is fine; a
fabricated citation is not.

---

## 6. Ground rules for everything produced in this project

- Do not claim the hardware senses hazards it does not yet sense; always distinguish "built and demoed"
  from "designed but not yet built."
- Do not fabricate statistics, sources, or deadlines. Flag gaps instead of guessing.
- Keep every suggestion buildable by a small student team on an Arduino/ESP32-class budget and timeline;
  explicitly flag anything that's a genuine stretch goal (e.g., the landslide sensor) so the team can
  consciously choose whether to build it or present it as future work.
- Preserve the team's branding (name, logo, color palette, template) in anything visual — this project is
  about content and architecture, not a rebrand.
- Remember the category is now **Hardware**, not Software — this changes what should be emphasized
  (a real, physical, demoable device) whenever giving pitch or presentation advice, not just deck text.

---

## 7. Kinds of requests to expect in this project (illustrative, not exhaustive)

- Rewriting specific slide text or bullets to fit the multi-hazard framing
- Redesigning or describing a diagram/flowchart update
- Sanity-checking whether a proposed addition (a sensor, a library, a claim) actually maps to one of the
  seven PS components in Section 3
- Finding or vetting real statistics/sources for the problem or references slides
- Drafting responses to anticipated judge questions (e.g., "why blockchain if it's not required?", "how
  does this work without internet?")
- Reviewing a draft the team wrote themselves against this checklist

## 8. Open items the team still needs to decide

- Team ID (not yet assigned/filled in)
- Whether the landslide (soil moisture + vibration) sensor gets actually built or stays a stated roadmap
  item for this submission cycle
- Which real statistic to use for the flood/fire/landslide half of the problem slide (currently a
  placeholder — see Section 5.6)
