// OCULA AI Assistant Module (OpenRouter API Integration & Secure Offline NLP)

const AURA_ASSISTANT = {
    apiKey: (typeof localStorage !== 'undefined' ? localStorage.getItem('ocula_ai_key') : '') || (typeof window !== 'undefined' ? window.__OCULA_AI_KEY__ : '') || "",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "google/gemini-2.0-flash-001",
    history: [],

    systemPrompt: `You are OCULA Assistant, an intelligent Omnisense, Localized Alerts Intelligence Assistant for the OCULA (Omnisense, Localized Alerts) platform.

Identity & Introduction Rules:
1. Identity: Whenever you introduce yourself or state who you are, ALWAYS refer to yourself strictly as "OCULA Assistant". Never call yourself "AI Copilot", "Copilot", or any other name.
2. Expertise & Directives:
   - Provide clear, accurate, and direct responses regarding multi-hazard detection (Floods, Wildfires, Landslides, Earthquakes, Heatwaves, Air Quality & Toxic Smog), environmental science, disaster safety, and ESP32 hardware telemetry.
   - Answer both platform-specific questions and general global environmental inquiries concisely without unnecessary filler.
   - Use clean markdown formatting with bold key terms and structured bullet points when helpful.`,

    init() {
        this.history = [
            {
                role: "assistant",
                content: `👋 Hello! I am **OCULA Assistant**.\n\nI can assist you with real-time multi-hazard alerts, disaster preparedness, environmental data analysis, and ESP32 telemetry hardware setups. How can I help you today?`
            }
        ];
        this.renderChat();
    },

    async sendMessage(userText) {
        if (!userText || !userText.trim()) return;
        const text = userText.trim();

        // Push user message
        this.history.push({ role: "user", content: text });
        this.renderChat();

        // Show typing indicator
        this.showTyping(true);

        const currentKey = this.apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('ocula_ai_key') : '');

        if (currentKey && currentKey.trim().length > 10) {
            try {
                const messages = [
                    { role: "system", content: this.systemPrompt },
                    ...this.history.slice(-10)
                ];

                const response = await fetch(this.apiUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentKey.trim()}`,
                        "HTTP-Referer": window.location.href,
                        "X-Title": "OCULA — Omnisense, Localized Alerts",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

                if (response.ok) {
                    const json = await response.json();
                    const reply = json.choices?.[0]?.message?.content;
                    if (reply) {
                        this.history.push({ role: "assistant", content: reply.trim() });
                        this.showTyping(false);
                        this.renderChat();
                        return;
                    }
                }
            } catch (e) {
                console.error("AI Assistant API error:", e);
            }
        }

        // Offline fallback response
        const fallback = this.getOfflineResponse(text);
        this.history.push({ role: "assistant", content: fallback });
        this.showTyping(false);
        this.renderChat();
    },

    getOfflineResponse(query) {
        const lower = query.toLowerCase();
        if (lower.includes("pinout") || lower.includes("wiring") || lower.includes("circuit") || lower.includes("hardware") || lower.includes("nrf24") || lower.includes("relay") || lower.includes("optocoupler") || lower.includes("water") || lower.includes("vibration")) {
            return `### 🛠️ ESP32 Multi-Hazard Field Circuit Pinout & Wiring

Here is the exact hardware connection scheme for your shopping list components:

| Component | Pin / Signal | ESP32 / Power Pin | Function & Notes |
|---|---|---|---|
| **Water Level Sensor** | VCC / GND / SIG | 3.3V / GND / **GPIO34 (ADC1)** | Reads flood water depth in analog values (0–4095). |
| **Soil Moisture Sensor** | VCC / GND / AOUT | 3.3V / GND / **GPIO35 (ADC1)** | Corrosion-free analog soil moisture for landslide detection. |
| **Flame / Fire Sensor** | VCC / GND / DO / AO | 3.3V / GND / **GPIO14 (DO) or GPIO32 (AO)** | Detects IR flame wavelengths for active fire alarms. |
| **Seismic & Tremor Sensor** | VCC / GND / SDA / SCL | 3.3V / GND / **GPIO21 (SDA) / GPIO22 (SCL)** (I2C) | 3-axis accelerometer measuring seismic tremors & vibration shocks. |
| **NRF24L01+ RF Mesh** | VCC / GND | **AMS1117 3.3V Out** / GND | Needs clean 3.3V supply + 10µF filter cap. |
| **NRF24L01+ RF Mesh** | CE / CSN | **GPIO22 / GPIO21** | Chip Enable & SPI Chip Select. |
| **NRF24L01+ RF Mesh** | SCK / MOSI / MISO | **GPIO18 / GPIO23 / GPIO19** | Hardware SPI bus communication. |
| **Optocoupler (PC817)** | Pin 1 (Anode) | **GPIO25 via 220Ω Resistor** | Current-limiting protection for IR LED. |
| **Optocoupler (PC817)** | Pin 2 (Cathode) | **GND** | Logic return ground. |
| **Optocoupler (PC817)** | Pin 3 (Emitter) | **Relay IN Signal** | Activates relay when GPIO25 is HIGH. |
| **Optocoupler (PC817)** | Pin 4 (Collector) | **5V (VCC)** | Power source for relay coil trigger. |
| **Relay Module** | NO / COM | **Siren / Pump / Valve** | Automated physical hazard actuator. |
| **AMS1117 (3.3V LDO)** | VIN / GND / VOUT | **5V (USB/Batt) / GND / 3.3V** | Low-dropout clean rail (up to 800mA). |

**Prototyping Tip**: Use the **Expansion Board** screw terminals for 5V and GND distribution to the breadboard, and use the **Wire Cutter** to keep jumper wire lengths clean and noise-free.`;
        } else if (lower.includes("aqi") || lower.includes("air quality") || lower.includes("pollution") || lower.includes("pm2.5")) {
            return `**Air Quality & Particulate Intelligence**:\n- **Health Thresholds**: AQI 0–50 (Good), 51–100 (Moderate), 101–200 (Unhealthy for Sensitive Groups), 201–300 (Very Unhealthy), 300+ (Hazardous).\n- **High AQI Advisories**: At AQI > 250, wear certified N95 respirators, avoid outdoor cardio, and run HEPA-filtered indoor air purifiers.\n- **Primary Atmospheric Metrics**: PM2.5 fine particulates, CO₂/Hazardous Gas, and VOC load.`;
        } else if (lower.includes("flood") || lower.includes("monsoon") || lower.includes("rain")) {
            return `**Flood & Flash Flood Safety Protocols**:\n1. **Immediate Action**: Move to higher ground immediately; never attempt to walk or drive through moving floodwaters (*"Turn Around, Don't Drown"*).\n2. **Electrical Safety**: Switch off the main circuit breaker and unplug major appliances before water enters.\n3. **Water Purification**: Boil all drinking water or use purification tablets as municipal supply lines can become contaminated.`;
        } else if (lower.includes("wildfire") || lower.includes("fire") || lower.includes("smoke") || lower.includes("heatwave") || lower.includes("heat")) {
            return `**Wildfire & Extreme Heat Management**:\n- **Smoke Defense**: Keep windows and doors tightly sealed; create a clean air room with a recirculating HEPA filtration unit.\n- **Evacuation Readiness**: Keep a "Go-Bag" ready with 72 hours of water, medications, documents, and N95 masks.\n- **Extreme Heatwaves**: Stay hydrated, avoid direct sun between 12 PM – 4 PM, and monitor Wet-Bulb Globe Temperature (WBGT) limits.`;
        } else if (lower.includes("climate") || lower.includes("news") || lower.includes("global") || lower.includes("trend") || lower.includes("hazard")) {
            return `**Global Environmental & Climate Overview**:\n- **Rising Extreme Weather**: Warmer ocean temperatures (e.g. El Niño/La Niña cycles) have intensified tropical cyclones and erratic precipitation patterns worldwide.\n- **Aerosol & Satellite Monitoring**: Spaceborne sensors like MODIS and Sentinel-5P track optical aerosol depth (AOD) and tropospheric NO2 to forecast air pollution transport across continents.`;
        } else {
            return `**OCULA Assistant**:\nI can assist you with environmental news, multi-hazard disaster safety protocols, air quality intelligence, and ESP32 telemetry hardware integrations. How can I help you today?`;
        }
    },

    parseMarkdown(md) {
        if (!md) return "";
        let html = md;

        // 1. Escape HTML
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // 2. Protect Code blocks: ```code```
        const codeBlocks = [];
        html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
            const id = `@@CODEBLOCK${codeBlocks.length}@@`;
            codeBlocks.push(`<pre class="code-block"><code>${p1.trim()}</code></pre>`);
            return id;
        });

        // 3. Protect & parse Markdown Tables
        const tableBlocks = [];
        html = html.replace(/((?:^[ \t]*\|.+?\|[ \t]*(?:\r?\n|$))+)/gm, (match) => {
            const lines = match.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) return match;

            let headerLine = null;
            const dataLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (/^\|?[-:\s|]+\|?$/.test(line) && line.includes("-")) {
                    continue; // Skip separator line |---|---|
                }
                if (!headerLine) {
                    headerLine = line;
                } else {
                    dataLines.push(line);
                }
            }

            if (!headerLine) return match;

            const parseCells = (row) => {
                let r = row.trim();
                if (r.startsWith("|")) r = r.substring(1);
                if (r.endsWith("|")) r = r.substring(0, r.length - 1);
                return r.split("|").map(c => c.trim());
            };

            const headerCells = parseCells(headerLine);
            let tableHtml = '<div class="md-table-wrapper"><table class="md-table"><thead><tr>';
            headerCells.forEach(hc => {
                tableHtml += `<th>${hc}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';

            dataLines.forEach(dl => {
                const cells = parseCells(dl);
                tableHtml += '<tr>';
                cells.forEach(c => {
                    tableHtml += `<td>${c}</td>`;
                });
                tableHtml += '</tr>';
            });

            tableHtml += '</tbody></table></div>';
            
            const id = `@@TABLEBLOCK${tableBlocks.length}@@`;
            tableBlocks.push(tableHtml);
            return id;
        });

        // 4. Inline code: `code`
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // 5. Headings
        html = html.replace(/^### (.*$)/gim, '<h4 class="md-h3">$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3 class="md-h2">$1</h3>');
        html = html.replace(/^# (.*$)/gim, '<h2 class="md-h1">$1</h2>');

        // 6. Bold & Italic: ***text***
        html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');

        // 7. Bold: **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // 8. Italic: *text* or _text_
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');

        // 9. Bullet lists
        html = html.replace(/^\s*[-*•]\s+(.*$)/gim, '<div class="md-bullet"><span class="bullet-dot">•</span><span>$1</span></div>');

        // 10. Numbered lists
        html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<div class="md-bullet"><span class="bullet-num">$1.</span><span>$2</span></div>');

        // 11. Line breaks (preserving paragraphs)
        html = html.replace(/\n\n+/g, '<div class="md-spacer"></div>');
        html = html.replace(/\n/g, '<br>');

        // 12. Restore Tables (and process bold/code inside table cells)
        tableBlocks.forEach((tb, i) => {
            let processedTb = tb;
            processedTb = processedTb.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            processedTb = processedTb.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            processedTb = processedTb.replace(/\b_([^_]+)_\b/g, '<em>$1</em>');
            processedTb = processedTb.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
            html = html.replace(`@@TABLEBLOCK${i}@@`, processedTb);
        });

        // 13. Restore Code blocks
        codeBlocks.forEach((cb, i) => {
            html = html.replace(`@@CODEBLOCK${i}@@`, cb);
        });

        // Clean up redundant breaks directly next to block elements
        html = html.replace(/<br>\s*<div class="md-table-wrapper">/g, '<div class="md-table-wrapper">');
        html = html.replace(/<\/div>\s*<br>/g, '</div>');

        return html;
    },

    renderChat() {
        const container = document.getElementById("chat-messages-container");
        if (!container) return;

        let html = "";
        this.history.forEach(msg => {
            if (msg.role === "user") {
                html += `
                    <div class="chat-row user-row">
                        <div class="msg-bubble user-bubble">${this.parseMarkdown(msg.content)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="chat-row bot-row">
                        <div class="bot-avatar-wrapper">
                            <img src="assets/logo.svg" alt="OCULA Logo" class="bot-avatar-img">
                        </div>
                        <div class="msg-bubble bot-bubble">${this.parseMarkdown(msg.content)}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    showTyping(isTyping) {
        const el = document.getElementById("assistant-typing-indicator");
        if (el) {
            el.style.display = isTyping ? "flex" : "none";
        }
        const container = document.getElementById("chat-messages-container");
        if (container) container.scrollTop = container.scrollHeight;
    }
};
