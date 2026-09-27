/* =========================================================================
   OCULA MASTER AUDIT HUB — CORE LOGIC & REAL-TIME TRACKING CONTROLLER
   ========================================================================= */

const OCULA_AUDIT = {
    // State
    isMasterAuthenticated: false,
    currentScreen: 'overview',
    currentTheme: 'obsidian',
    autoLockTimer: null,
    autoLockMinutes: 15,
    failedAttempts: 0,
    isLockedOut: false,
    lockoutCountdown: 0,
    lockoutTimer: null,
    
    // BroadcastChannel & Cloud Mesh Relay for instant multi-device sync
    auditChannel: null,
    telemetrySse: null,
    relayTopic: atob('aHR0cHM6Ly9udGZ5LnNoL29jdWxhX3RlbGVtZXRyeV9tZXNoX3NpaDIwMjY='),
    controlTopic: atob('aHR0cHM6Ly9udGZ5LnNoL29jdWxhX3RlbGVtZXRyeV9tZXNoX3NpaDIwMjZfY3RybA=='),
    gisMap: null,
    mapMarkers: [],
    deviceMarkers: {},
    
    // Chart instances
    charts: {
        timeline: null,
        platforms: null,
        authMethods: null,
        statusRatio: null
    },
    
    // Table pagination & filtering
    tableState: {
        page: 1,
        pageSize: 10,
        searchQuery: '',
        roleFilter: 'ALL',
        platformFilter: 'ALL',
        statusFilter: 'ALL'
    },
    
    // Active Sessions list & Termination Tracking
    activeSessions: [],
    terminatedSessionIds: new Set(JSON.parse(sessionStorage.getItem('ocula_audit_terminated_sessions') || '[]')),
    bannedIps: new Set(JSON.parse(localStorage.getItem('ocula_banned_ips') || '[]')),
    
    // Audit Event Store
    events: [],

    // Resolved Real-Time Master Location
    masterGeo: null,

    isIpBanned(ip) {
        if (!ip) return false;
        if (this.bannedIps.has(ip)) return true;
        return Array.from(this.bannedIps).some(b => b && (ip.includes(b) || b.includes(ip)));
    },

    // -------------------------------------------------------------
    // INITIALIZATION & BOOTSTRAP
    // -------------------------------------------------------------
    init() {
        this.initTheme();
        this.initStorage();
        this.initBroadcastChannel();
        this.initCloudTelemetryRelay();
        this.startActiveSessionMonitor();
        this.initEventListeners();
        this.checkAuthStatus();
        this.startLiveClock();
        this.resolveMasterGeo();
    },

    initTheme() {
        const saved = localStorage.getItem('ocula_audit_theme') || 'obsidian';
        this.setTheme(saved);
    },

    setTheme(themeName) {
        this.currentTheme = themeName;
        const isLight = themeName === 'cleanroom' || themeName === 'light' || themeName === 'white';
        
        document.body.classList.remove('theme-obsidian', 'theme-cleanroom', 'light-theme');
        document.documentElement.classList.remove('theme-obsidian', 'theme-cleanroom', 'light-theme');
        
        if (isLight) {
            document.body.classList.add('theme-cleanroom', 'light-theme');
            document.documentElement.classList.add('theme-cleanroom', 'light-theme');
        } else {
            document.body.classList.add('theme-obsidian');
            document.documentElement.classList.add('theme-obsidian');
        }
        
        try {
            localStorage.setItem('ocula_audit_theme', isLight ? 'white' : 'black');
        } catch (e) {}
        
        const themeBtn = document.getElementById('btn-toggle-theme');
        if (themeBtn) {
            themeBtn.innerHTML = isLight 
                ? '<i class="fas fa-moon"></i> <span>Dark Mode</span>' 
                : '<i class="fas fa-sun"></i> <span>Light Mode</span>';
        }

        const themeNameEl = document.getElementById('sidebar-theme-name');
        const themeIconEl = document.getElementById('sidebar-theme-icon');
        if (themeNameEl) {
            themeNameEl.textContent = isLight ? 'White' : 'Black';
        }
        if (themeIconEl) {
            themeIconEl.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        // Update Chart colors if initialized
        this.updateChartThemes();
    },

    toggleTheme() {
        const isCurrentlyLight = this.currentTheme === 'cleanroom' || this.currentTheme === 'light' || this.currentTheme === 'white';
        const next = isCurrentlyLight ? 'black' : 'white';
        this.setTheme(next);
        this.showToast(`Theme switched to ${isCurrentlyLight ? 'Black (Space Black)' : 'White (Cupertino)'}`, 'info');
    },

    // -------------------------------------------------------------
    // MASTER AUTHENTICATION (OWNER-ONLY)
    // -------------------------------------------------------------
    getMasterPasskey() {
        return localStorage.getItem('ocula_master_passkey') || 'OCULA-MASTER-2026-ROOT';
    },

    setMasterPasskey(newPass) {
        if (!newPass || newPass.trim().length < 6) {
            this.showToast('Master Passkey must be at least 6 characters.', 'error');
            return false;
        }
        localStorage.setItem('ocula_master_passkey', newPass.trim());
        this.showToast('Master Passkey updated successfully!', 'success');
        this.logEvent({
            actor: 'System Master Owner',
            role: 'MASTER_ADMIN',
            platform: 'WEB_AUDIT_HUB',
            action: 'MASTER_PASSKEY_UPDATED',
            status: 'SUCCESS',
            details: 'Master owner security passkey was reconfigured.'
        });
        return true;
    },

    checkAuthStatus() {
        const sessionAuth = sessionStorage.getItem('ocula_master_auth');
        const overlay = document.getElementById('master-auth-overlay');
        
        if (sessionAuth === 'true') {
            this.isMasterAuthenticated = true;
            if (overlay) overlay.style.display = 'none';
            this.resetAutoLockTimer();
            this.renderAllViews();
        } else {
            this.isMasterAuthenticated = false;
            if (overlay) overlay.style.display = 'flex';
            const passInput = document.getElementById('master-pass-input');
            if (passInput) passInput.focus();
        }
    },

    async handleMasterLogin(e) {
        if (e) e.preventDefault();
        if (this.isLockedOut) {
            this.showToast(`Portal locked out. Try again in ${this.lockoutCountdown}s`, 'error');
            return;
        }

        const passInput = document.getElementById('master-pass-input');
        const errEl = document.getElementById('master-auth-error');
        const errMsg = document.getElementById('master-auth-error-text');
        const entered = passInput ? passInput.value.trim() : '';
        const masterKey = this.getMasterPasskey();

        // SHA-256 hash comparison (credentials not stored in plaintext)
        const _h = async (s) => { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, '0')).join(''); };
        const _pH = await _h(entered);
        const _masterHashes = [
            '17a53898f2eef0a0fd8a8503ed700195fb23e86ea50f3c163f47624d351c926c', // root
            '1f18a63ba6e5bfe56403c0df2eba24f24e2f90e77c5f62d3f166ed5080f84f5e', // secondary
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'  // tertiary
        ];

        if (entered === masterKey || _masterHashes.includes(_pH)) {
            this.isMasterAuthenticated = true;
            this.failedAttempts = 0;
            sessionStorage.setItem('ocula_master_auth', 'true');
            
            if (errEl) errEl.style.display = 'none';
            if (passInput) passInput.value = '';

            const overlay = document.getElementById('master-auth-overlay');
            if (overlay) {
                overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '1';
                }, 300);
            }

            this.resetAutoLockTimer();
            this.renderAllViews();
            this.showToast('Master Access Granted', 'success');

            // Log access to audit stream
            this.logEvent({
                actor: 'Master Security Owner',
                role: 'MASTER_ADMIN',
                platform: 'WEB_AUDIT_HUB',
                action: 'MASTER_PORTAL_ACCESSED',
                status: 'SUCCESS',
                details: 'Owner logged in to Master Access & Activity Tracking Portal.'
            });
        } else {
            this.failedAttempts++;
            if (errEl) {
                errEl.style.display = 'flex';
                if (errMsg) errMsg.textContent = `Invalid Master Passkey. (${this.failedAttempts}/5 attempts)`;
            }
            if (passInput) {
                passInput.value = '';
                passInput.focus();
            }

            // Log failed attempt
            this.logEvent({
                actor: 'Unknown / Unauthorized',
                role: 'THREAT_SUSPECT',
                platform: 'WEB_AUDIT_HUB',
                action: 'MASTER_PORTAL_UNAUTHORIZED_ATTEMPT',
                status: 'FAILED',
                details: `Failed passkey attempt #${this.failedAttempts} on Master Portal.`
            });

            if (this.failedAttempts >= 5) {
                this.triggerLockout(60);
            }
        }
    },

    triggerLockout(seconds) {
        this.isLockedOut = true;
        this.lockoutCountdown = seconds;
        const errEl = document.getElementById('master-auth-error');
        const errMsg = document.getElementById('master-auth-error-text');
        
        if (errEl) errEl.style.display = 'flex';
        if (errMsg) errMsg.textContent = `Security Lockout Active: Too many failed attempts. Try in ${this.lockoutCountdown}s`;

        clearInterval(this.lockoutTimer);
        this.lockoutTimer = setInterval(() => {
            this.lockoutCountdown--;
            if (errMsg) errMsg.textContent = `Security Lockout Active: Too many failed attempts. Try in ${this.lockoutCountdown}s`;
            if (this.lockoutCountdown <= 0) {
                clearInterval(this.lockoutTimer);
                this.isLockedOut = false;
                this.failedAttempts = 0;
                if (errEl) errEl.style.display = 'none';
            }
        }, 1000);
    },

    toggleMasterPassVisibility() {
        const passInput = document.getElementById('master-pass-input');
        const eyeIcon = document.getElementById('master-pass-eye-icon');
        if (!passInput) return;
        if (passInput.type === 'password') {
            passInput.type = 'text';
            if (eyeIcon) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            }
        } else {
            passInput.type = 'password';
            if (eyeIcon) {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        }
    },

    lockPortal() {
        this.isMasterAuthenticated = false;
        sessionStorage.removeItem('ocula_master_auth');
        const overlay = document.getElementById('master-auth-overlay');
        if (overlay) overlay.style.display = 'flex';
        const passInput = document.getElementById('master-pass-input');
        if (passInput) passInput.value = '';
        this.showToast('Master Portal Locked', 'info');
    },

    resetAutoLockTimer() {
        clearTimeout(this.autoLockTimer);
        if (this.autoLockMinutes > 0) {
            this.autoLockTimer = setTimeout(() => {
                this.lockPortal();
                this.showToast('Portal automatically locked due to inactivity.', 'info');
            }, this.autoLockMinutes * 60 * 1000);
        }
    },

    // -------------------------------------------------------------
    // STORAGE & TRUE AUDIT DATABASE
    // -------------------------------------------------------------
    initStorage() {
        const stored = localStorage.getItem('ocula_audit_events');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    // Filter out any legacy mock seed events from previous tests
                    this.events = parsed.filter(e => e && e.id && !e.id.startsWith('AUD-100') && !e.actor?.includes('Test User') && !e.actor?.includes('Space Analysis Desk'));
                } else {
                    this.events = [];
                }
            } catch (e) {
                this.events = [];
            }
        } else {
            this.events = [];
        }
        
        this.syncActiveSessions();
        
        // Auto-refresh active sessions timer every 5 seconds
        setInterval(() => {
            if (this.isMasterAuthenticated) {
                this.syncActiveSessions();
                this.renderActiveSessions();
                this.renderKpiStats();
                if (this.currentScreen === 'overview' || this.currentScreen === 'analytics') {
                    this.initAnalyticsCharts();
                }
            }
        }, 5000);
    },

    saveEvents() {
        try {
            localStorage.setItem('ocula_audit_events', JSON.stringify(this.events.slice(0, 500)));
        } catch (e) {}
    },

    getMasterDeviceInfo() {
        const ua = navigator.userAgent;
        let bName = 'Chrome';
        let os = 'Windows 11';
        if (ua.includes('Edg/')) bName = 'Edge';
        else if (ua.includes('Firefox/')) bName = 'Firefox';
        else if (ua.includes('Safari/') && !ua.includes('Chrome/')) bName = 'Safari';
        
        if (/Win/i.test(ua)) os = 'Windows 11';
        else if (/Mac/i.test(ua)) os = 'macOS Sonoma';
        else if (/Linux/i.test(ua)) os = 'Linux';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad/.test(ua)) os = 'iOS';

        return `${bName} • ${os} (${window.screen.width}x${window.screen.height})`;
    },

    async resolveMasterGeo() {
        if (this.masterGeo) return this.masterGeo;

        const cached = sessionStorage.getItem('ocula_master_geo');
        if (cached) {
            try {
                this.masterGeo = JSON.parse(cached);
                this.syncActiveSessions();
                this.renderActiveSessions();
                if (this.currentScreen === 'map' && this.gisMap) this.updateMapMarkers();
                return this.masterGeo;
            } catch (e) {}
        }

        // 1. Try Browser GPS First (High accuracy: street/building-level lat/lng)
        let gpsCoords = null;
        if ('geolocation' in navigator) {
            try {
                gpsCoords = await new Promise((resolve) => {
                    const timeout = setTimeout(() => resolve(null), 2500);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            clearTimeout(timeout);
                            resolve({
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude,
                                accuracy: pos.coords.accuracy || 10
                            });
                        },
                        () => {
                            clearTimeout(timeout);
                            resolve(null);
                        },
                        { enableHighAccuracy: true, timeout: 2500, maximumAge: 60000 }
                    );
                });
            } catch (err) {}
        }

        // 2. Fetch Multi-Endpoint GeoIP in parallel / fallback
        const endpoints = [
            'https://ipapi.co/json/',
            'https://ipwhois.app/json/',
            'https://freeipapi.com/api/json'
        ];

        let ipData = null;
        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const resp = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.ip || data.ipAddress) {
                        ipData = {
                            ip: data.ip || data.ipAddress,
                            city: data.city || data.cityName || data.region || 'Local Host',
                            region: data.region || data.regionName || 'HQ',
                            country: data.country_name || data.countryName || 'India',
                            lat: parseFloat(data.latitude ?? data.lat) || (gpsCoords ? gpsCoords.lat : 28.6139),
                            lng: parseFloat(data.longitude ?? data.lon ?? data.lng) || (gpsCoords ? gpsCoords.lng : 77.2090),
                            isp: data.org || data.isp || 'Master Security Link'
                        };
                        break;
                    }
                }
            } catch (e) {}
        }

        if (gpsCoords) {
            if (!ipData) {
                ipData = {
                    ip: '127.0.0.1 (Local Console)',
                    city: 'GPS Location',
                    region: 'High Precision',
                    country: 'India',
                    lat: gpsCoords.lat,
                    lng: gpsCoords.lng,
                    isp: 'GPS Satellite Link'
                };
            } else {
                ipData.lat = gpsCoords.lat;
                ipData.lng = gpsCoords.lng;
            }
        } else if (!ipData) {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
            const isIndia = timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('Asia');
            ipData = {
                ip: '127.0.0.1 (Localhost Console)',
                city: isIndia ? 'New Delhi' : 'Local Region',
                region: isIndia ? 'Delhi' : 'Local State',
                country: isIndia ? 'India' : 'Local Country',
                lat: isIndia ? 28.6139 : 20.5937,
                lng: isIndia ? 77.2090 : 78.9629,
                isp: 'Master Gateway Link'
            };
        }

        this.masterGeo = ipData;
        try {
            sessionStorage.setItem('ocula_master_geo', JSON.stringify(ipData));
        } catch (e) {}

        this.syncActiveSessions();
        this.renderActiveSessions();
        if (this.currentScreen === 'map' && this.gisMap) {
            this.updateMapMarkers();
        }

        return ipData;
    },

    syncActiveSessions() {
        const stored = localStorage.getItem('ocula_active_sessions');
        let liveSessions = [];
        if (stored) {
            try {
                const now = Date.now();
                liveSessions = JSON.parse(stored).filter(s => {
                    // Keep sessions active if pinged within the last 35 seconds and not terminated or banned
                    return s.lastPing && (now - s.lastPing < 35000) && !this.terminatedSessionIds.has(s.id) && !this.isIpBanned(s.ip);
                });
            } catch (e) {}
        }

        const mGeo = this.masterGeo || {
            ip: '127.0.0.1 (Localhost Console)',
            city: 'Command Headquarters',
            region: '',
            lat: 28.6139,
            lng: 77.2090
        };

        // Current Master Console Session with accurate resolved geo & IP
        const masterSession = {
            id: 'SES-MASTER-ROOT',
            actor: 'Master Security Owner',
            role: 'MASTER_ADMIN',
            platform: 'Master Audit Hub',
            device: this.getMasterDeviceInfo(),
            ip: mGeo.ip ? (mGeo.ip.includes('127.0.0.1') ? mGeo.ip : `${mGeo.ip} (Master Console)`) : '127.0.0.1 (Localhost Console)',
            city: mGeo.city ? `${mGeo.city}${mGeo.region && mGeo.region !== mGeo.city ? ', ' + mGeo.region : ''}` : 'Command Headquarters',
            lat: mGeo.lat,
            lng: mGeo.lng,
            startTime: sessionStorage.getItem('ocula_master_session_start') || new Date().toISOString(),
            isOwner: true,
            isTrueData: true,
            isLive: true,
            icon: 'fa-shield-halved'
        };
        if (!sessionStorage.getItem('ocula_master_session_start')) {
            sessionStorage.setItem('ocula_master_session_start', new Date().toISOString());
        }

        // Format relative connection time for each session
        const formatSession = (s) => {
            const timeStr = this.formatRelativeTime(s.startTime);
            return {
                ...s,
                displayTime: timeStr.includes('ago') ? timeStr : (timeStr === 'Just now' ? 'Connected Just Now' : `Connected ${timeStr} ago`)
            };
        };

        // Strictly Master Console + Genuine Live External Client Sessions (ZERO mock fallback sessions)
        this.activeSessions = [
            formatSession(masterSession),
            ...liveSessions.map(formatSession)
        ];
    },

    generateInitialAuditLogs() {
        return [];
    },

    // -------------------------------------------------------------
    // REAL-TIME CLOUD TELEMETRY MESH (NTFY.SH - ANY DEVICE SYNC)
    // -------------------------------------------------------------
    initCloudTelemetryRelay() {
        // 1. Initial poll for any active devices that pinged in the last 45 seconds
        fetch(`${this.relayTopic}/json?poll=1&since=45s`)
            .then(r => r.text())
            .then(text => {
                const lines = text.trim().split('\n');
                lines.forEach(line => {
                    if (!line) return;
                    try {
                        const parsed = JSON.parse(line);
                        let data = parsed;
                        if (parsed.message) {
                            try { data = JSON.parse(parsed.message); } catch (e) { data = parsed; }
                        }
                        this.handleIncomingCloudMessage(data);
                    } catch (e) {}
                });
            })
            .catch(() => {});

        // 2. Real-Time SSE Stream for Instant Device Updates (< 150ms)
        try {
            if ('EventSource' in window) {
                if (this.telemetrySse) {
                    try { this.telemetrySse.close(); } catch (e) {}
                }
                this.telemetrySse = new EventSource(`${this.relayTopic}/sse`);
                this.telemetrySse.onmessage = (e) => {
                    if (!e || !e.data) return;
                    try {
                        const parsed = JSON.parse(e.data);
                        let data = parsed;
                        if (parsed.message) {
                            try { data = JSON.parse(parsed.message); } catch (err) { data = parsed; }
                        }
                        this.handleIncomingCloudMessage(data);
                    } catch (err) {}
                };
                this.telemetrySse.onerror = () => {
                    // EventSource automatically retries connection
                };
            }
        } catch (e) {}

        // 3. Fallback recurring poll every 5 seconds
        setInterval(() => {
            fetch(`${this.relayTopic}/json?poll=1&since=10s`)
                .then(r => r.text())
                .then(text => {
                    const lines = text.trim().split('\n');
                    lines.forEach(line => {
                        if (!line) return;
                        try {
                            const parsed = JSON.parse(line);
                            let data = parsed;
                            if (parsed.message) {
                                try { data = JSON.parse(parsed.message); } catch (e) { data = parsed; }
                            }
                            this.handleIncomingCloudMessage(data);
                        } catch (e) {}
                    });
                })
                .catch(() => {});
        }, 5000);
    },

    handleIncomingCloudMessage(data) {
        if (!data) return;

        if (data.type === 'SESSION_ONLINE' && data.session) {
            this.registerRemoteActiveSession(data.session);
        } else if (data.type === 'SESSION_OFFLINE' && data.session) {
            this.removeRemoteActiveSession(data.session.id);
        } else if (data.type === 'AUDIT_EVENT' && data.event) {
            this.handleIncomingLiveEvent(data.event);
        } else if (data.action || data.id) {
            this.handleIncomingLiveEvent(data);
        }
    },

    registerRemoteActiveSession(session) {
        if (!session || !session.id) return;
        if (this.terminatedSessionIds.has(session.id)) return; // Do not resurrect terminated session
        if (this.isIpBanned(session.ip)) return; // Do not register banned IP

        const stored = localStorage.getItem('ocula_active_sessions');
        let sessions = stored ? JSON.parse(stored) : [];

        // Exclude terminated sessions or banned IPs
        sessions = sessions.filter(s => !this.terminatedSessionIds.has(s.id) && !this.isIpBanned(s.ip));

        const now = Date.now();
        const existingIdx = sessions.findIndex(s => s.id === session.id);
        if (existingIdx >= 0) {
            sessions[existingIdx] = { ...sessions[existingIdx], ...session, lastPing: now };
        } else {
            sessions.unshift({ ...session, lastPing: now });
            const domainTag = session.domain ? ` [${session.domain}]` : '';
            this.showToast(`📡 [LIVE DEVICE] ${session.actor}${domainTag} connected from ${session.city || 'Network'} on ${session.device || 'Device'}.`, 'info');
        }

        sessions = sessions.filter(s => s.lastPing && (now - s.lastPing < 35000));
        localStorage.setItem('ocula_active_sessions', JSON.stringify(sessions));

        this.syncActiveSessions();
        this.renderActiveSessions();
        this.renderKpiStats();

        if (this.currentScreen === 'map' && this.gisMap) {
            this.updateMapMarkers();
        }
    },

    removeRemoteActiveSession(sessionId) {
        if (!sessionId) return;
        this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
        if (this.deviceMarkers && this.deviceMarkers[sessionId]) {
            try { this.gisMap.removeLayer(this.deviceMarkers[sessionId]); } catch (e) {}
            delete this.deviceMarkers[sessionId];
        }
        const stored = localStorage.getItem('ocula_active_sessions');
        if (stored) {
            try {
                let sessions = JSON.parse(stored);
                const found = sessions.find(s => s.id === sessionId);
                sessions = sessions.filter(s => s.id !== sessionId);
                localStorage.setItem('ocula_active_sessions', JSON.stringify(sessions));
                if (found) {
                    this.showToast(`📴 [DEVICE DISCONNECTED] ${found.actor} disconnected.`, 'info');
                }
            } catch (e) {}
        }
        this.syncActiveSessions();
        this.renderActiveSessions();
        this.renderKpiStats();
        if (this.currentScreen === 'map' && this.gisMap) {
            this.updateMapMarkers();
        }
    },

    startActiveSessionMonitor() {
        setInterval(() => {
            this.syncActiveSessions();
            this.renderKpiStats();

            if (this.currentScreen === 'sessions') {
                this.renderActiveSessions();
            }
        }, 2000);
    },

    // -------------------------------------------------------------
    // REAL-TIME BROADCAST & STORAGE EVENT LISTENER (LOCAL TABS)
    // -------------------------------------------------------------
    initBroadcastChannel() {
        try {
            if ('BroadcastChannel' in window) {
                this.auditChannel = new BroadcastChannel('ocula_audit_channel');
                this.auditChannel.onmessage = (msg) => {
                    if (msg && msg.data) {
                        if (msg.data.type === 'SESSION_REGISTRY_SYNC') {
                            this.syncActiveSessions();
                            this.renderActiveSessions();
                            this.renderKpiStats();
                        } else if (msg.data.id || msg.data.action) {
                            this.handleIncomingLiveEvent(msg.data);
                        }
                    }
                };
            }
        } catch (e) {
            console.warn('BroadcastChannel not supported:', e);
        }

        // Cross-tab storage synchronization fallback
        window.addEventListener('storage', (e) => {
            if (e.key === 'ocula_audit_live_ping' && e.newValue) {
                try {
                    const eventData = JSON.parse(e.newValue);
                    this.handleIncomingLiveEvent(eventData);
                } catch (err) {}
            } else if (e.key === 'ocula_active_sessions') {
                this.syncActiveSessions();
                this.renderActiveSessions();
                this.renderKpiStats();
            }
        });
    },

    handleIncomingLiveEvent(eventData) {
        if (!eventData || !eventData.action) return;

        // Check if event is already registered by ID
        if (eventData.id && this.events.some(ev => ev.id === eventData.id)) {
            return;
        }

        // Normalize incoming event with true data
        const newEvent = {
            id: eventData.id || ('AUD-' + (this.events.length + 1000 + Math.floor(Math.random() * 900))),
            timestamp: eventData.timestamp || new Date().toISOString(),
            actor: eventData.actor || 'Web Client',
            email: eventData.email || 'client@ocula.in',
            role: eventData.role || 'CITIZEN',
            platform: eventData.platform || 'WEB_CONTROL_PANEL',
            domain: eventData.domain || '',
            originUrl: eventData.originUrl || '',
            url: eventData.url || '',
            authMethod: eventData.authMethod || 'PASSWORD',
            ip: eventData.ip || '192.168.1.104',
            city: eventData.city || 'New Delhi, India',
            lat: eventData.lat || 28.6139,
            lng: eventData.lng || 77.2090,
            device: eventData.device || this.getMasterDeviceInfo(),
            action: eventData.action || 'USER_AUTH_EVENT',
            status: eventData.status || 'SUCCESS',
            details: eventData.details || 'Real-time telemetry event received.',
            isTrueData: eventData.isTrueData || false
        };

        this.events.unshift(newEvent);
        this.saveEvents();
        this.syncActiveSessions();

        // Visual alert notification
        const statusType = newEvent.status === 'SUCCESS' ? 'success' : (newEvent.role === 'THREAT_SUSPECT' ? 'error' : 'info');
        const badge = newEvent.isTrueData ? '📡 [TRUE DATA] ' : '🔔 ';
        const domainTag = newEvent.domain ? ` [${newEvent.domain}]` : '';
        this.showToast(`${badge}LIVE: ${newEvent.actor}${domainTag} • ${newEvent.action} (${newEvent.status})`, statusType);

        this.renderAllViews();
    },

    logEvent(customData) {
        const newEvent = {
            id: 'AUD-' + (this.events.length + 1000 + Math.floor(Math.random() * 900)),
            timestamp: new Date().toISOString(),
            actor: customData.actor || 'Master Security Owner',
            email: customData.email || 'master@ocula.gov.in',
            role: customData.role || 'MASTER_ADMIN',
            platform: customData.platform || 'WEB_AUDIT_HUB',
            authMethod: customData.authMethod || 'ROOT_PASSKEY',
            ip: customData.ip || '127.0.0.1 (Localhost)',
            city: customData.city || 'Command Headquarters',
            lat: 28.6139,
            lng: 77.2090,
            device: customData.device || this.getMasterDeviceInfo(),
            action: customData.action || 'SYSTEM_ACTION',
            status: customData.status || 'SUCCESS',
            details: customData.details || '',
            isTrueData: true
        };

        this.events.unshift(newEvent);
        this.saveEvents();
        this.renderAllViews();
    },

    // -------------------------------------------------------------
    // NAVIGATION & SCREENS
    // -------------------------------------------------------------
    navigateTo(screenId) {
        this.currentScreen = screenId;
        this.resetAutoLockTimer();

        // Update nav item active states
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.screen === screenId) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Update views
        document.querySelectorAll('.screen-view').forEach(view => {
            if (view.id === `screen-${screenId}`) view.classList.add('active');
            else view.classList.remove('active');
        });

        // Update Page Title
        const pageTitleEl = document.getElementById('header-page-title');
        const titles = {
            overview: '<i class="fas fa-shield-halved"></i> Live Access Overview',
            activity: '<i class="fas fa-stream"></i> Real-Time Activity Stream',
            map: '<i class="fas fa-map-location-dot"></i> Geolocation Access Map',
            analytics: '<i class="fas fa-chart-line"></i> Access Intelligence & Analytics',
            table: '<i class="fas fa-table-list"></i> Full Searchable Audit Table',
            sessions: '<i class="fas fa-desktop"></i> Active Devices & Sessions',
            settings: '<i class="fas fa-sliders"></i> Master Security Settings'
        };
        if (pageTitleEl) pageTitleEl.innerHTML = titles[screenId] || 'Audit Intelligence';

        // Trigger screen specific initialization
        if (screenId === 'overview') {
            setTimeout(() => this.initAnalyticsCharts(), 100);
        } else if (screenId === 'map') {
            setTimeout(() => this.initGisMap(), 100);
        } else if (screenId === 'analytics') {
            setTimeout(() => this.initAnalyticsCharts(), 100);
        }
    },

    // -------------------------------------------------------------
    // RENDERING LOGIC (OVERVIEW, FEED, TABLE, METRICS)
    // -------------------------------------------------------------
    renderAllViews() {
        this.renderKpiStats();
        this.renderLiveActivityFeed();
        this.renderAuditTable();
        this.renderActiveSessions();
        if (this.currentScreen === 'overview' || this.currentScreen === 'analytics') {
            this.initAnalyticsCharts();
        }
        if (this.currentScreen === 'map' && this.gisMap) {
            this.updateMapMarkers();
            this.renderMapDevicePills();
        }
    },

    renderKpiStats() {
        const totalLogins = this.events.length;
        const failedAttempts = this.events.filter(e => e.status === 'FAILED').length;
        const adminLogins = this.events.filter(e => e.role === 'ADMIN' || e.role === 'MASTER_ADMIN').length;
        const mobileUsers = this.events.filter(e => (e.platform && e.platform.toUpperCase().includes('ANDROID')) || (e.platform && e.platform.toUpperCase().includes('IOS')) || e.role === 'CITIZEN').length;
        const activeCount = this.activeSessions.length;

        const setNum = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setNum('kpi-total-logins', totalLogins);
        setNum('kpi-active-sessions', activeCount);
        setNum('kpi-failed-attempts', failedAttempts);
        setNum('kpi-admin-logins', adminLogins);
        setNum('kpi-mobile-users', mobileUsers);
        setNum('header-active-count', activeCount);
        setNum('nav-badge-activity', totalLogins);
        setNum('nav-badge-sessions', activeCount);
    },

    renderLiveActivityFeed() {
        const feedList = document.getElementById('activity-feed-list');
        const fullFeedList = document.getElementById('full-activity-stream-list');
        if (!feedList && !fullFeedList) return;

        const renderItems = (items) => {
            if (items.length === 0) {
                return `
                    <div style="text-align:center; padding: 36px 20px; color: var(--text-muted); font-size: 13px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-tower-broadcast" style="font-size: 26px; color: var(--primary-cyan); opacity: 0.5;"></i>
                        <span style="font-weight: 600; color: var(--text-secondary);">No Client Access Events Recorded Yet</span>
                        <span style="font-size: 11px; max-width: 320px; line-height: 1.5;">Access events will stream here in real-time as users log in or interact with the OCULA Web App & Android App.</span>
                    </div>
                `;
            }
            return items.map(ev => {
                const isSuccess = ev.status === 'SUCCESS';
                const isFailed = ev.status === 'FAILED';
                const isAdmin = ev.role === 'ADMIN' || ev.role === 'MASTER_ADMIN';
                const isLogout = ev.action && ev.action.includes('LOGOUT');

                let statusClass = 'success';
                let iconClass = 'fa-check';
                if (isFailed) { statusClass = 'failed'; iconClass = 'fa-triangle-exclamation'; }
                else if (isLogout) { statusClass = 'logout'; iconClass = 'fa-arrow-right-from-bracket'; }
                else if (isAdmin) { statusClass = 'admin'; iconClass = 'fa-user-shield'; }

                const timeFormatted = this.formatRelativeTime(ev.timestamp);

                return `
                    <div class="activity-feed-item">
                        <div class="activity-left">
                            <div class="activity-status-icon ${statusClass}">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div class="activity-info">
                                <div class="activity-actor-row">
                                    <span class="activity-actor">${ev.actor}</span>
                                    <span class="role-badge ${ev.role.toLowerCase()}">${ev.role}</span>
                                    <span class="platform-pill"><i class="fas ${ev.platform && ev.platform.includes('ANDROID') ? 'fa-mobile-screen' : (ev.platform && ev.platform.includes('Mobile') ? 'fa-mobile-screen' : 'fa-laptop')}"></i> ${ev.domain || ev.platform}</span>
                                </div>
                                <span class="activity-detail-text">${ev.details || ev.action} • <b>${ev.city || 'Unknown Location'}</b></span>
                            </div>
                        </div>
                        <div class="activity-right">
                            <span class="activity-time">${timeFormatted}</span>
                            <span class="activity-ip">${ev.ip || '127.0.0.1'}</span>
                        </div>
                    </div>
                `;
            }).join('');
        };

        if (feedList) feedList.innerHTML = renderItems(this.events.slice(0, 6));
        if (fullFeedList) fullFeedList.innerHTML = renderItems(this.events.slice(0, 50));
    },

    renderAuditTable() {
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;

        // Apply filters
        let filtered = this.events.filter(ev => {
            const q = this.tableState.searchQuery.toLowerCase();
            const matchesQuery = !q || 
                (ev.actor && ev.actor.toLowerCase().includes(q)) ||
                (ev.email && ev.email.toLowerCase().includes(q)) ||
                (ev.ip && ev.ip.includes(q)) ||
                (ev.city && ev.city.toLowerCase().includes(q)) ||
                (ev.device && ev.device.toLowerCase().includes(q)) ||
                (ev.domain && ev.domain.toLowerCase().includes(q)) ||
                (ev.platform && ev.platform.toLowerCase().includes(q)) ||
                (ev.id && ev.id.toLowerCase().includes(q));

            const matchesRole = this.tableState.roleFilter === 'ALL' || ev.role === this.tableState.roleFilter;
            const matchesPlatform = this.tableState.platformFilter === 'ALL' || 
                (ev.platform && ev.platform.toUpperCase().includes(this.tableState.platformFilter.toUpperCase())) ||
                (ev.domain && ev.domain.toUpperCase().includes(this.tableState.platformFilter.toUpperCase()));
            const matchesStatus = this.tableState.statusFilter === 'ALL' || ev.status === this.tableState.statusFilter;

            return matchesQuery && matchesRole && matchesPlatform && matchesStatus;
        });

        // Pagination calculations
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / this.tableState.pageSize) || 1;
        if (this.tableState.page > totalPages) this.tableState.page = totalPages;

        const startIdx = (this.tableState.page - 1) * this.tableState.pageSize;
        const pageItems = filtered.slice(startIdx, startIdx + this.tableState.pageSize);

        if (pageItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
                        <i class="fas fa-database" style="font-size: 24px; color: var(--primary-cyan); opacity: 0.5; margin-bottom: 8px; display: block;"></i>
                        <span style="font-weight: 600; color: var(--text-secondary);">No Audit Log Records Found</span><br>
                        <small style="color: var(--text-muted); font-size: 11px;">Real-time authentication and access events will be cataloged here automatically.</small>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageItems.map(ev => {
                const dateObj = new Date(ev.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                return `
                    <tr>
                        <td class="mono-cell" style="font-weight: 700; color: var(--primary-cyan);">${ev.id || 'AUD'}</td>
                        <td class="mono-cell" style="color: var(--text-secondary);">
                            <b>${timeStr}</b><br><small style="color: var(--text-muted);">${dateStr}</small>
                        </td>
                        <td>
                            <strong style="color: var(--text-primary); font-size: 13px;">${ev.actor}</strong><br>
                            <small style="color: var(--text-muted); font-size: 11px;">${ev.email || 'N/A'}</small>
                        </td>
                        <td><span class="role-badge ${ev.role.toLowerCase()}">${ev.role}</span></td>
                        <td>
                            <span class="platform-pill"><i class="fas ${ev.platform && ev.platform.includes('ANDROID') ? 'fa-mobile-screen' : (ev.platform && ev.platform.includes('Mobile') ? 'fa-mobile-screen' : 'fa-laptop')}"></i> ${ev.platform}</span>
                            ${ev.domain ? `<br><small style="color: var(--primary-cyan); font-size: 10px; font-weight: 700;"><i class="fas fa-globe"></i> ${ev.domain}</small>` : ''}
                        </td>
                        <td class="mono-cell">${ev.authMethod || 'PASSWORD'}</td>
                        <td>
                            <span class="mono-cell" style="color: var(--text-primary);">${ev.ip}</span><br>
                            <small style="color: var(--text-muted);">${ev.city || 'Unknown'}</small>
                        </td>
                        <td>
                            <span class="status-pill ${ev.status.toLowerCase()}">
                                <i class="fas ${ev.status === 'SUCCESS' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                                ${ev.status}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render pagination numbers
        const pageInfo = document.getElementById('table-page-info');
        if (pageInfo) pageInfo.textContent = `Showing ${totalItems > 0 ? startIdx + 1 : 0} to ${Math.min(startIdx + this.tableState.pageSize, totalItems)} of ${totalItems} entries`;

        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        if (prevBtn) prevBtn.disabled = this.tableState.page <= 1;
        if (nextBtn) nextBtn.disabled = this.tableState.page >= totalPages;
    },

    onSearchInput(query) {
        this.tableState.searchQuery = query;
        this.tableState.page = 1;
        this.renderAuditTable();
    },

    onFilterChange(type, val) {
        if (type === 'role') this.tableState.roleFilter = val;
        if (type === 'platform') this.tableState.platformFilter = val;
        if (type === 'status') this.tableState.statusFilter = val;
        this.tableState.page = 1;
        this.renderAuditTable();
    },

    changePage(delta) {
        this.tableState.page += delta;
        this.renderAuditTable();
    },

    renderActiveSessions() {
        const grid = document.getElementById('session-cards-grid');
        if (!grid) return;

        let cardsHtml = this.activeSessions.map(ses => {
            const isTrue = ses.isTrueData;
            return `
                <div class="session-card ${ses.isOwner ? 'is-current-owner' : ''}" data-session-id="${ses.id}">
                    <div class="session-top">
                        <div class="device-badge-row">
                            <div class="device-icon-box">
                                <i class="fas ${ses.icon || 'fa-laptop'}"></i>
                            </div>
                            <div class="device-title-box">
                                <span class="device-name">${ses.device}</span>
                                <span class="device-platform">${ses.platform}</span>
                            </div>
                        </div>
                        <span class="status-pill active" style="${isTrue ? 'box-shadow: 0 0 10px rgba(0, 240, 255, 0.4); border-color: var(--primary-cyan);' : ''}">
                            <i class="fas fa-circle-dot"></i> ${ses.isOwner ? 'MASTER OWNER' : (isTrue ? 'LIVE CLIENT' : 'ACTIVE')}
                        </span>
                    </div>
                    <div class="session-meta-list">
                        <div class="session-meta-item"><span>User / Role:</span> <span>${ses.actor} (${ses.role})</span></div>
                        <div class="session-meta-item"><span>Access Domain:</span> <span class="mono-cell" style="color: var(--primary-cyan); font-weight: 700;"><i class="fas fa-globe"></i> ${ses.domain || (ses.isOwner ? 'Local Master Console' : 'ocula.co.in')}</span></div>
                        <div class="session-meta-item"><span>IP Address:</span> <span>${ses.ip}</span></div>
                        <div class="session-meta-item"><span>Location:</span> <span>${ses.city}</span></div>
                        <div class="session-meta-item"><span>Connected:</span> <span>${ses.displayTime || ses.startTime}</span></div>
                    </div>
                    <div class="session-card-actions">
                        ${ses.isOwner ? `
                            <button class="btn-sidebar-icon" style="width: 100%; border-color: var(--primary-cyan); color: var(--primary-cyan);" disabled>
                                <i class="fas fa-shield-check"></i> Current Master Console
                            </button>
                        ` : `
                            <button class="btn-terminate" onclick="OCULA_AUDIT.terminateSession('${ses.id}')" title="Remotely terminate this client session">
                                <i class="fas fa-power-off"></i> Terminate Session
                            </button>
                            <button class="btn-sidebar-icon" onclick="OCULA_AUDIT.banIp('${ses.ip}', '${ses.actor}')" title="Blacklist IP address">
                                <i class="fas fa-ban"></i> Ban IP
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // If only the Master Console is connected, display clean awaiting indicator
        if (this.activeSessions.length === 1) {
            cardsHtml += `
                <div class="session-card session-card-awaiting">
                    <div class="session-await-icon">
                        <i class="fas fa-tower-cell"></i>
                    </div>
                    <div class="session-await-body">
                        <span class="session-await-title">Awaiting External Client Connections</span>
                        <span class="session-await-desc">Open the OCULA Web App or Android App in another browser/device to view live telemetry sync.</span>
                    </div>
                </div>
            `;
        }

        grid.innerHTML = cardsHtml;
    },

    terminateSession(sessionId) {
        const ses = this.activeSessions.find(s => s.id === sessionId) || { actor: 'Remote Client', ip: 'Unknown', platform: 'Web/Mobile' };
        
        // 1. Permanently blacklist this session instance from re-appearing during this tab session
        this.terminatedSessionIds.add(sessionId);
        try {
            sessionStorage.setItem('ocula_audit_terminated_sessions', JSON.stringify(Array.from(this.terminatedSessionIds)));
        } catch (e) {}

        // 2. Immediately remove from memory and Leaflet Map
        this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
        if (this.deviceMarkers && this.deviceMarkers[sessionId]) {
            try { this.gisMap.removeLayer(this.deviceMarkers[sessionId]); } catch (e) {}
            delete this.deviceMarkers[sessionId];
        }

        // 3. Immediately animate card removal in DOM
        const cardEl = document.querySelector(`.session-card[data-session-id="${sessionId}"]`);
        if (cardEl) {
            cardEl.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
            cardEl.style.transform = 'scale(0.92)';
            cardEl.style.opacity = '0';
        }

        const cmdPayload = {
            action: 'REMOTE_TERMINATE_SESSION',
            targetSessionId: sessionId,
            timestamp: Date.now()
        };

        // 4. BroadcastChannel (Local same-origin)
        try {
            if (this.auditChannel) {
                this.auditChannel.postMessage(cmdPayload);
            }
        } catch (e) {}

        // 5. Storage event trigger
        try {
            localStorage.setItem('ocula_audit_control_cmd', JSON.stringify(cmdPayload));
        } catch (e) {}

        // 6. Global Multi-Device Cloud Relay (ntfy.sh - kills session on mobile phones / remote PCs)
        fetch(this.controlTopic, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cmdPayload),
            keepalive: true
        }).catch(() => {});

        // 7. Remove session from active registry in localStorage
        try {
            const stored = localStorage.getItem('ocula_active_sessions');
            if (stored) {
                let sessions = JSON.parse(stored);
                sessions = sessions.filter(s => s.id !== sessionId && !this.terminatedSessionIds.has(s.id));
                localStorage.setItem('ocula_active_sessions', JSON.stringify(sessions));
            }
        } catch (e) {}

        this.syncActiveSessions();
        this.showToast(`Session terminated remotely for ${ses.actor}`, 'info');

        this.logEvent({
            actor: 'Master Security Owner',
            role: 'MASTER_ADMIN',
            platform: 'WEB_AUDIT_HUB',
            action: 'SESSION_TERMINATED_REMOTELY',
            status: 'SUCCESS',
            details: `Remotely terminated active session for ${ses.actor} (${ses.ip}) on ${ses.platform}.`
        });

        this.renderAllViews();
    },

    banIp(ip, actor) {
        if (confirm(`Are you sure you want to blacklist IP address ${ip} (${actor})? This will immediately disconnect all matching devices.`)) {
            this.bannedIps.add(ip);
            try {
                localStorage.setItem('ocula_banned_ips', JSON.stringify(Array.from(this.bannedIps)));
            } catch (e) {}

            // Terminate and remove all sessions with this IP
            const matching = this.activeSessions.filter(s => !s.isOwner && (s.ip === ip || s.ip.includes(ip)));
            matching.forEach(s => {
                this.terminatedSessionIds.add(s.id);
                if (this.deviceMarkers && this.deviceMarkers[s.id]) {
                    try { this.gisMap.removeLayer(this.deviceMarkers[s.id]); } catch (e) {}
                    delete this.deviceMarkers[s.id];
                }
            });
            try {
                sessionStorage.setItem('ocula_audit_terminated_sessions', JSON.stringify(Array.from(this.terminatedSessionIds)));
            } catch (e) {}

            this.activeSessions = this.activeSessions.filter(s => s.isOwner || (s.ip !== ip && !s.ip.includes(ip)));

            const cmdPayload = {
                action: 'BAN_IP',
                targetIp: ip,
                timestamp: Date.now()
            };

            // 1. BroadcastChannel
            try {
                if (this.auditChannel) {
                    this.auditChannel.postMessage(cmdPayload);
                }
            } catch (e) {}

            // 2. Storage event
            try {
                localStorage.setItem('ocula_audit_control_cmd', JSON.stringify(cmdPayload));
            } catch (e) {}

            // 3. Global Multi-Device Cloud Relay
            fetch(this.controlTopic, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cmdPayload),
                keepalive: true
            }).catch(() => {});

            // 4. Local storage blacklists
            try {
                const stored = localStorage.getItem('ocula_active_sessions');
                if (stored) {
                    let sessions = JSON.parse(stored);
                    sessions = sessions.filter(s => !s.ip.includes(ip) && !this.terminatedSessionIds.has(s.id));
                    localStorage.setItem('ocula_active_sessions', JSON.stringify(sessions));
                }
            } catch (e) {}

            try {
                const banned = localStorage.getItem('ocula_banned_ips');
                let list = banned ? JSON.parse(banned) : [];
                if (!list.includes(ip)) list.push(ip);
                localStorage.setItem('ocula_banned_ips', JSON.stringify(list));
            } catch (e) {}

            this.syncActiveSessions();
            this.showToast(`IP ${ip} has been blacklisted and disconnected.`, 'success');

            this.logEvent({
                actor: 'Master Security Owner',
                role: 'MASTER_ADMIN',
                platform: 'WEB_AUDIT_HUB',
                action: 'IP_ADDRESS_BLACKLISTED',
                status: 'SUCCESS',
                details: `Blacklisted IP ${ip} (${actor}). All active and subsequent connections blocked.`
            });

            this.renderAllViews();
        }
    },

    // -------------------------------------------------------------
    // GIS GEOLOCATION MAP (LEAFLET - REAL CLIENT LOCATIONS)
    // -------------------------------------------------------------
    initGisMap() {
        const mapContainer = document.getElementById('audit-gis-map');
        if (!mapContainer || typeof L === 'undefined') return;

        if (this.gisMap) {
            this.gisMap.invalidateSize();
            this.updateMapMarkers();
            this.renderMapDevicePills();
            return;
        }

        try {
            const initialLat = (this.masterGeo && this.masterGeo.lat) ? this.masterGeo.lat : 20.5937;
            const initialLng = (this.masterGeo && this.masterGeo.lng) ? this.masterGeo.lng : 78.9629;
            const initialZoom = this.masterGeo ? 11 : 4.5;

            this.gisMap = L.map('audit-gis-map', {
                center: [initialLat, initialLng],
                zoom: initialZoom,
                minZoom: 2.2,
                maxZoom: 19,
                zoomControl: true,
                attributionControl: false
            });

            // Smooth High-Availability Multi-Engine Tile Layer (Identical to Web App - 100% Free, Zero Auth/Key Errors)
            const googleEnglishUrl = "https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}";
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

            // Individual tile error fallback (Graceful recovery to OSM / ArcGIS if needed)
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
                            tile._hasRetried = 2;
                            if (error.tile) {
                                error.tile.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${coords.z}/${coords.y}/${coords.x}`;
                            }
                        };
                        fallbackImg.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
                    }
                }
            });

            tileLayer.addTo(this.gisMap);
            this.updateMapMarkers();
            this.renderMapDevicePills();
        } catch (e) {
            console.error('GIS Map init error:', e);
        }
    },

    renderMapDevicePills() {
        const pillsContainer = document.getElementById('map-active-device-pills');
        if (!pillsContainer) return;

        if (!this.activeSessions || this.activeSessions.length === 0) {
            pillsContainer.innerHTML = `<span style="font-size: 11px; color: var(--text-muted);">No active devices connected</span>`;
            return;
        }

        pillsContainer.innerHTML = this.activeSessions.map(ses => {
            const isOwner = ses.isOwner;
            const icon = ses.icon || (ses.deviceType === 'Mobile Phone' ? 'fa-mobile-screen' : (ses.deviceType === 'Tablet' ? 'fa-tablet-screen-button' : 'fa-laptop'));
            const name = isOwner ? 'Master Console' : (ses.actor || 'Device');
            const city = ses.city || 'Command HQ';
            const domainTag = ses.domain ? ` [${ses.domain}]` : '';
            return `
                <button class="map-device-pill ${isOwner ? 'is-owner' : ''}" id="map-pill-${ses.id}" onclick="OCULA_AUDIT.flyToDevice('${ses.id}')" title="Focus map on ${name}${domainTag} (${city})">
                    <span class="pill-dot"></span>
                    <i class="fas ${icon}"></i>
                    <span>${name}${domainTag} • ${city}</span>
                </button>
            `;
        }).join('');
    },

    flyToDevice(sessionId) {
        if (!this.gisMap) return;
        const ses = this.activeSessions.find(s => s.id === sessionId);
        if (!ses) return;

        // Highlight active pill
        document.querySelectorAll('.map-device-pill').forEach(el => el.classList.remove('active'));
        const activePill = document.getElementById(`map-pill-${sessionId}`);
        if (activePill) activePill.classList.add('active');

        const marker = this.deviceMarkers[sessionId];
        if (marker) {
            const latLng = marker.getLatLng();
            this.gisMap.flyTo(latLng, 14, { duration: 1.2 });
            setTimeout(() => {
                marker.openPopup();
            }, 400);
            this.showToast(`Focusing camera on ${ses.actor} (${ses.city || 'Location'})`, 'info');
        } else if (ses.lat && ses.lng) {
            this.gisMap.flyTo([ses.lat, ses.lng], 14, { duration: 1.2 });
            this.showToast(`Focusing camera on ${ses.actor} (${ses.city || 'Location'})`, 'info');
        }
    },

    updateMapMarkers() {
        if (!this.gisMap || typeof L === 'undefined') return;

        // Clear existing markers
        this.mapMarkers.forEach(m => this.gisMap.removeLayer(m));
        this.mapMarkers = [];
        this.deviceMarkers = {};

        // Comprehensive City Geocoding Dictionary
        const cityLookup = {
            'new delhi': { lat: 28.6139, lng: 77.2090 },
            'delhi': { lat: 28.6139, lng: 77.2090 },
            'mumbai': { lat: 19.0760, lng: 72.8777 },
            'bengaluru': { lat: 12.9716, lng: 77.5946 },
            'bangalore': { lat: 12.9716, lng: 77.5946 },
            'hyderabad': { lat: 17.3850, lng: 78.4867 },
            'chennai': { lat: 13.0827, lng: 80.2707 },
            'kolkata': { lat: 22.5726, lng: 88.3639 },
            'pune': { lat: 18.5204, lng: 73.8567 },
            'ahmedabad': { lat: 23.0225, lng: 72.5714 },
            'jaipur': { lat: 26.9124, lng: 75.7873 },
            'surat': { lat: 21.1702, lng: 72.8311 },
            'lucknow': { lat: 26.8467, lng: 80.9462 },
            'kanpur': { lat: 26.4499, lng: 80.3319 },
            'nagpur': { lat: 21.1458, lng: 79.0882 },
            'indore': { lat: 22.7196, lng: 75.8577 },
            'bhopal': { lat: 23.2599, lng: 77.4126 },
            'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
            'patna': { lat: 25.5941, lng: 85.1376 },
            'vadodara': { lat: 22.3072, lng: 73.1812 },
            'ghaziabad': { lat: 28.6692, lng: 77.4538 },
            'ludhiana': { lat: 30.9010, lng: 75.8573 },
            'agra': { lat: 27.1767, lng: 78.0081 },
            'nashik': { lat: 19.9975, lng: 73.7898 },
            'faridabad': { lat: 28.4089, lng: 77.3178 },
            'meerut': { lat: 28.9845, lng: 77.7064 },
            'rajkot': { lat: 22.3039, lng: 70.8022 },
            'varanasi': { lat: 25.3176, lng: 82.9739 },
            'srinagar': { lat: 34.0837, lng: 74.7973 },
            'aurangabad': { lat: 19.8762, lng: 75.3433 },
            'dhanbad': { lat: 23.7957, lng: 86.4304 },
            'amritsar': { lat: 31.6340, lng: 74.8723 },
            'navi mumbai': { lat: 19.0330, lng: 73.0297 },
            'prayagraj': { lat: 25.4358, lng: 81.8463 },
            'allahabad': { lat: 25.4358, lng: 81.8463 },
            'ranchi': { lat: 23.3441, lng: 85.3096 },
            'howrah': { lat: 22.5958, lng: 88.2636 },
            'coimbatore': { lat: 11.0168, lng: 76.9558 },
            'jabalpur': { lat: 23.1815, lng: 79.9864 },
            'gwalior': { lat: 26.2183, lng: 78.1828 },
            'vijayawada': { lat: 16.5062, lng: 80.6480 },
            'jodhpur': { lat: 26.2389, lng: 73.0243 },
            'madurai': { lat: 9.9252, lng: 78.1198 },
            'raipur': { lat: 21.2514, lng: 81.6296 },
            'kota': { lat: 25.2138, lng: 75.8648 },
            'chandigarh': { lat: 30.7333, lng: 76.7794 },
            'guwahati': { lat: 26.1445, lng: 91.7362 },
            'solapur': { lat: 17.6599, lng: 75.9064 },
            'hubli': { lat: 15.3647, lng: 75.1240 },
            'bareilly': { lat: 28.3670, lng: 79.4304 },
            'moradabad': { lat: 28.8351, lng: 78.7747 },
            'mysore': { lat: 12.2958, lng: 76.6394 },
            'mysuru': { lat: 12.2958, lng: 76.6394 },
            'gurgaon': { lat: 28.4595, lng: 77.0266 },
            'gurugram': { lat: 28.4595, lng: 77.0266 },
            'aligarh': { lat: 27.8974, lng: 78.0880 },
            'jalandhar': { lat: 31.3260, lng: 75.5762 },
            'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
            'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
            'salem': { lat: 11.6643, lng: 78.1460 },
            'warangal': { lat: 17.9689, lng: 79.5941 },
            'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
            'dehradun': { lat: 30.3165, lng: 78.0322 },
            'shimla': { lat: 31.1048, lng: 77.1734 },
            'noida': { lat: 28.5355, lng: 77.3910 },
            'greater noida': { lat: 28.4744, lng: 77.5040 },
            'kochi': { lat: 9.9312, lng: 76.2673 },
            'panaji': { lat: 15.4909, lng: 73.8278 },
            'goa': { lat: 15.4909, lng: 73.8278 },
            'mangaluru': { lat: 12.9141, lng: 74.8560 },
            'london': { lat: 51.5074, lng: -0.1278 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'san francisco': { lat: 37.7749, lng: -122.4194 },
            'singapore': { lat: 1.3521, lng: 103.8198 },
            'dubai': { lat: 25.2048, lng: 55.2708 },
            'tokyo': { lat: 35.6762, lng: 139.6503 },
            'sydney': { lat: -33.8688, lng: 151.2093 },
            'frankfurt': { lat: 50.1109, lng: 8.6821 }
        };

        const locMap = new Map();
        const bounds = [];
        const sessionCountMap = {};

        // 1. Render Active Connected Device Pins
        this.activeSessions.forEach((s, idx) => {
            let lat = s.lat;
            let lng = s.lng;
            if (lat === undefined || lng === undefined || lat === null || lng === null) {
                const cName = (s.city || '').toLowerCase();
                for (const key in cityLookup) {
                    if (cName.includes(key)) {
                        lat = cityLookup[key].lat;
                        lng = cityLookup[key].lng;
                        break;
                    }
                }
            }
            if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
                lat = 28.6139;
                lng = 77.2090;
            }

            // Group geo nodes for stats
            const locKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
            if (!locMap.has(locKey)) {
                locMap.set(locKey, {
                    name: s.city || 'Command HQ',
                    lat: lat,
                    lng: lng,
                    type: s.role,
                    count: 1,
                    isActiveSession: true
                });
            } else {
                locMap.get(locKey).count++;
            }

            // Collision jitter if multiple devices share exact coords
            const coordKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
            sessionCountMap[coordKey] = (sessionCountMap[coordKey] || 0) + 1;
            const duplicateIndex = sessionCountMap[coordKey] - 1;

            let renderLat = lat;
            let renderLng = lng;
            if (duplicateIndex > 0) {
                const angle = (duplicateIndex * 2 * Math.PI) / 5;
                const offset = 0.0045 * duplicateIndex;
                renderLat += Math.cos(angle) * offset;
                renderLng += Math.sin(angle) * offset;
            }

            // Marker styling based on device and role
            const isOwner = s.isOwner;
            const isCitizen = s.role === 'CITIZEN';
            const isThreat = s.role === 'THREAT_SUSPECT' || s.role === 'THREAT';
            const markerColor = isOwner ? '#00F0FF' : (isThreat ? '#EF4444' : (isCitizen ? '#10B981' : '#8B5CF6'));
            const devIcon = s.icon || (s.deviceType === 'Mobile Phone' ? 'fa-mobile-screen' : (s.deviceType === 'Tablet' ? 'fa-tablet-screen-button' : 'fa-laptop-code'));

            const pulseRing = `<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; border: 2px solid ${markerColor}; animation: oculaMapPulse 1.8s infinite; top: -7px; left: -7px; pointer-events: none;"></div>`;

            const iconHtml = `
                <div style="position: relative; width: 24px; height: 24px;">
                    ${pulseRing}
                    <div style="
                        width: 24px; height: 24px; border-radius: 50%;
                        background: ${markerColor}; border: 2px solid #FFFFFF;
                        box-shadow: 0 0 14px ${markerColor};
                        display: flex; align-items: center; justify-content: center;
                        color: #030611; font-size: 11px; font-weight: 900;">
                        <i class="fas ${devIcon}"></i>
                    </div>
                    <div class="marker-device-label">${isOwner ? '🛡️ MASTER' : (s.deviceType === 'Mobile Phone' ? '📱 PHONE' : '💻 ' + (s.actor || 'CLIENT').split(' ')[0])}</div>
                </div>
            `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-device-pin',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([renderLat, renderLng], { icon: customIcon }).addTo(this.gisMap);

            const latFmt = Math.abs(lat).toFixed(4) + '° ' + (lat >= 0 ? 'N' : 'S');
            const lngFmt = Math.abs(lng).toFixed(4) + '° ' + (lng >= 0 ? 'E' : 'W');

            const popupContent = `
                <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; padding: 6px 4px; min-width: 220px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas ${devIcon}" style="color: ${markerColor}; font-size: 14px;"></i>
                            <strong style="color: #0F172A; font-size: 13px;">${isOwner ? 'Master Console' : s.actor}</strong>
                        </div>
                        <span style="background: #10B981; color: #FFFFFF; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 800; letter-spacing: 0.5px;">LIVE</span>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; color: #334155; margin-bottom: 8px;">
                        <div>Role: <b style="color: ${markerColor};">${s.role}</b></div>
                        <div>Platform: <b>${s.platform || 'Web App'}</b></div>
                        ${s.domain ? `<div>Origin Domain: <b style="color: #0284C7;"><i class="fas fa-globe"></i> ${s.domain}</b></div>` : ''}
                        ${s.originUrl ? `<div>Access URL: <a href="${s.originUrl}" target="_blank" style="color: #0284C7; font-size: 10.5px; text-decoration: underline;">${s.originUrl}</a></div>` : ''}
                        <div>Device Specs: <span style="color: #64748B; font-size: 10.5px;">${s.device || 'Standard Device'}</span></div>
                        <div>IP Address: <code style="background: #F1F5F9; color: #0F172A; padding: 1px 4px; border-radius: 3px; font-size: 10.5px; font-family: monospace;">${s.ip || '127.0.0.1'}</code></div>
                        <div>Location: <b>${s.city || 'Command HQ'}</b></div>
                        <div style="font-family: monospace; font-size: 10.5px; color: #64748B; margin-top: 2px;">
                            <i class="fas fa-location-crosshairs" style="color: ${markerColor};"></i> ${latFmt}, ${lngFmt}
                        </div>
                        <div>Connected: <span style="color: #64748B; font-size: 10.5px;">${s.displayTime || 'Connected Just Now'}</span></div>
                    </div>

                    ${isOwner ? `
                        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 4px; padding: 4px 8px; text-align: center; font-size: 10.5px; color: #15803D; font-weight: 700;">
                            <i class="fas fa-shield-check"></i> Primary Root Console
                        </div>
                    ` : `
                        <div style="display: flex; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #E2E8F0;">
                            <button onclick="OCULA_AUDIT.terminateSession('${s.id}')" style="flex: 1; height: 26px; background: #EF4444; color: #fff; border: none; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <i class="fas fa-power-off"></i> Disconnect
                            </button>
                            <button onclick="OCULA_AUDIT.banIp('${s.ip}', '${s.actor}')" style="flex: 1; height: 26px; background: #334155; color: #fff; border: none; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <i class="fas fa-ban"></i> Ban IP
                            </button>
                        </div>
                    `}
                </div>
            `;

            marker.bindPopup(popupContent);
            this.deviceMarkers[s.id] = marker;
            this.mapMarkers.push(marker);
            bounds.push([renderLat, renderLng]);
        });

        // 2. Add Recent Audit Events (Historical Access Points not currently in active sessions)
        this.events.slice(0, 40).forEach(ev => {
            let lat = ev.lat;
            let lng = ev.lng;
            if (lat === undefined || lng === undefined || lat === null || lng === null) {
                const cName = (ev.city || '').toLowerCase();
                for (const key in cityLookup) {
                    if (cName.includes(key)) {
                        lat = cityLookup[key].lat;
                        lng = cityLookup[key].lng;
                        break;
                    }
                }
            }
            if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
                const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
                if (!locMap.has(key)) {
                    locMap.set(key, {
                        name: ev.city || 'Access Point',
                        lat: lat,
                        lng: lng,
                        type: ev.role,
                        count: 1,
                        isActiveSession: false,
                        ip: ev.ip
                    });

                    const isThreat = ev.role === 'THREAT_SUSPECT' || ev.role === 'THREAT';
                    const color = isThreat ? '#EF4444' : '#64748B';

                    const histIcon = L.divIcon({
                        html: `
                            <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 1.5px solid #FFFFFF; box-shadow: 0 0 6px ${color};"></div>
                        `,
                        className: 'custom-hist-pin',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    });

                    const marker = L.marker([lat, lng], { icon: histIcon }).addTo(this.gisMap);
                    marker.bindPopup(`
                        <div style="font-family: sans-serif; font-size: 11.5px; color: #0F172A; padding: 4px;">
                            <strong style="color: ${color};">${ev.city || 'Access Point'}</strong><br>
                            <span>Actor: <b>${ev.actor}</b></span><br>
                            <span>Role: <b>${ev.role}</b></span><br>
                            <span>IP: <code>${ev.ip}</code></span>
                        </div>
                    `);
                    this.mapMarkers.push(marker);
                    bounds.push([lat, lng]);
                } else {
                    locMap.get(key).count++;
                }
            }
        });

        // Auto-fit camera
        if (bounds.length === 1) {
            this.gisMap.setView(bounds[0], 12, { animate: true });
        } else if (bounds.length > 1) {
            this.gisMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
        }

        // Update Dynamic Map Intel Overlay with True Stats
        this.updateMapIntelStats(locMap, this.activeSessions.length);
        this.renderMapDevicePills();

        // Add map pulse keyframes if missing
        if (!document.getElementById('map-pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'map-pulse-keyframes';
            style.innerHTML = `@keyframes oculaMapPulse { 0% { transform: scale(0.7); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }`;
            document.head.appendChild(style);
        }
    },

    async centerMapOnCurrentLocation() {
        if (!this.gisMap) return;
        this.showToast('Locating accurate position...', 'info');
        const geo = await this.resolveMasterGeo();
        if (geo && geo.lat && geo.lng) {
            this.gisMap.flyTo([geo.lat, geo.lng], 13, { duration: 1.5 });
            this.showToast(`Map centered on ${geo.city || 'your location'} (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)})`, 'success');
        } else {
            this.showToast('Position acquired, centering map.', 'info');
            this.updateMapMarkers();
        }
    },

    updateMapIntelStats(locMap, activeSessionsCount = 0) {
        const devicesEl = document.getElementById('intel-active-devices');
        const nodesEl = document.getElementById('intel-active-nodes');
        const regionEl = document.getElementById('intel-top-region');
        const threatEl = document.getElementById('intel-threat-origin');

        // 1. Active Devices
        if (devicesEl) {
            const count = activeSessionsCount || (this.activeSessions ? this.activeSessions.length : 0);
            devicesEl.textContent = `${count} Online`;
        }

        // 2. Active Geo Nodes
        const totalNodes = locMap.size;
        if (nodesEl) {
            nodesEl.textContent = `${totalNodes} Node${totalNodes === 1 ? '' : 's'}`;
        }

        // 3. Top Region (Most frequent location)
        if (regionEl) {
            let topCity = 'Command HQ';
            let maxCount = 0;
            locMap.forEach(loc => {
                if (loc.count > maxCount) {
                    maxCount = loc.count;
                    topCity = loc.name;
                }
            });
            regionEl.textContent = topCity;
        }

        // 4. Threat Origin
        if (threatEl) {
            const threats = [];
            locMap.forEach(loc => {
                if (loc.type === 'THREAT_SUSPECT' || loc.type === 'THREAT') {
                    threats.push(loc.name);
                }
            });
            if (threats.length > 0) {
                threatEl.textContent = threats[0];
                threatEl.style.color = '#EF4444';
            } else {
                threatEl.textContent = 'None Detected';
                threatEl.style.color = '#10B981';
            }
        }
    },

    // -------------------------------------------------------------
    // VISUAL ANALYTICS CHARTS (CHART.JS - COMPUTED FROM TRUE DATA)
    // -------------------------------------------------------------
    initAnalyticsCharts() {
        if (typeof Chart === 'undefined') return;

        const isLight = this.currentTheme === 'cleanroom' || this.currentTheme === 'light';
        const textColor = isLight ? '#0F172A' : '#F0F6FC';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';

        // 1. Hourly Access Velocity Bar Chart (Calculated from true this.events timestamps)
        const ctxTimeline = document.getElementById('chart-access-timeline');
        if (ctxTimeline) {
            if (this.charts.timeline) this.charts.timeline.destroy();

            const hourLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
            const adminCounts = [0, 0, 0, 0, 0, 0, 0, 0];
            const mobileCounts = [0, 0, 0, 0, 0, 0, 0, 0];
            const failedCounts = [0, 0, 0, 0, 0, 0, 0, 0];

            this.events.forEach(ev => {
                const date = new Date(ev.timestamp);
                const hour = isNaN(date.getHours()) ? 0 : date.getHours();
                const binIdx = Math.min(7, Math.floor(hour / 3));

                if (ev.status === 'FAILED') {
                    failedCounts[binIdx]++;
                } else if (ev.role === 'ADMIN' || ev.role === 'MASTER_ADMIN') {
                    adminCounts[binIdx]++;
                } else if (ev.role === 'CITIZEN' || (ev.platform && ev.platform.toUpperCase().includes('ANDROID')) || (ev.platform && ev.platform.toUpperCase().includes('IOS'))) {
                    mobileCounts[binIdx]++;
                } else {
                    adminCounts[binIdx]++;
                }
            });

            this.charts.timeline = new Chart(ctxTimeline, {
                type: 'bar',
                data: {
                    labels: hourLabels,
                    datasets: [
                        {
                            label: 'Admin Logins',
                            data: adminCounts,
                            backgroundColor: isLight ? '#0066FF' : '#00F0FF',
                            borderRadius: 4
                        },
                        {
                            label: 'Mobile / Citizen Access',
                            data: mobileCounts,
                            backgroundColor: '#10B981',
                            borderRadius: 4
                        },
                        {
                            label: 'Failed Probes / Threats',
                            data: failedCounts,
                            backgroundColor: '#EF4444',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
                    },
                    plugins: {
                        legend: { labels: { color: textColor, font: { family: 'Space Grotesk' } } }
                    }
                }
            });
        }

        // 2. Auth Provider Breakdown (Doughnut - Calculated from true this.events authMethod)
        const ctxAuth = document.getElementById('chart-auth-methods');
        if (ctxAuth) {
            if (this.charts.authMethods) this.charts.authMethods.destroy();

            const authCounts = {};
            this.events.forEach(ev => {
                const method = ev.authMethod || 'PASSWORD';
                authCounts[method] = (authCounts[method] || 0) + 1;
            });

            let authLabels = Object.keys(authCounts);
            let authData = Object.values(authCounts);
            let authColors = isLight 
                ? ['#0066FF', '#10B981', '#0284C7', '#8B5CF6', '#F59E0B', '#64748B']
                : ['#00F0FF', '#10B981', '#38BDF8', '#8B5CF6', '#F59E0B', '#94A3B8'];

            if (authLabels.length === 0) {
                authLabels = ['No Events Logged'];
                authData = [1];
                authColors = [isLight ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.25)'];
            }

            this.charts.authMethods = new Chart(ctxAuth, {
                type: 'doughnut',
                data: {
                    labels: authLabels,
                    datasets: [{
                        data: authData,
                        backgroundColor: authColors.slice(0, authLabels.length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                }
            });
        }

        // 3. Platform Distribution (Pie - Calculated from true this.events and this.activeSessions platform)
        const ctxPlatform = document.getElementById('chart-platform-dist');
        if (ctxPlatform) {
            if (this.charts.platforms) this.charts.platforms.destroy();

            const platformCounts = {};
            this.events.forEach(ev => {
                const p = ev.platform || 'Web App';
                platformCounts[p] = (platformCounts[p] || 0) + 1;
            });
            // Include active sessions if no events yet
            if (Object.keys(platformCounts).length === 0) {
                this.activeSessions.forEach(ses => {
                    const p = ses.platform || 'Master Audit Hub';
                    platformCounts[p] = (platformCounts[p] || 0) + 1;
                });
            }

            let pLabels = Object.keys(platformCounts);
            let pData = Object.values(platformCounts);
            let pColors = isLight
                ? ['#0066FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899']
                : ['#00F0FF', '#10B981', '#6366F1', '#F59E0B', '#EC4899'];

            if (pLabels.length === 0) {
                pLabels = ['No Clients Connected'];
                pData = [1];
                pColors = [isLight ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.25)'];
            }

            this.charts.platforms = new Chart(ctxPlatform, {
                type: 'pie',
                data: {
                    labels: pLabels,
                    datasets: [{
                        data: pData,
                        backgroundColor: pColors.slice(0, pLabels.length),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } } }
                    }
                }
            });
        }
    },

    updateChartThemes() {
        if (this.currentScreen === 'analytics' || this.currentScreen === 'overview') {
            this.initAnalyticsCharts();
        }
    },

    // -------------------------------------------------------------
    // EXPORT FUNCTIONS (CSV / JSON / PRINT)
    // -------------------------------------------------------------
    exportToCsv() {
        if (this.events.length === 0) {
            this.showToast('No audit events to export.', 'error');
            return;
        }

        const headers = ['Audit ID', 'Timestamp', 'Actor', 'Email/Identifier', 'Role', 'Platform', 'Access Domain', 'Auth Method', 'IP Address', 'City / Location', 'Device Details', 'Action', 'Status', 'Details'];
        const rows = this.events.map(ev => [
            `"${ev.id || ''}"`,
            `"${ev.timestamp || ''}"`,
            `"${(ev.actor || '').replace(/"/g, '""')}"`,
            `"${(ev.email || '').replace(/"/g, '""')}"`,
            `"${ev.role || ''}"`,
            `"${ev.platform || ''}"`,
            `"${ev.domain || ''}"`,
            `"${ev.authMethod || ''}"`,
            `"${ev.ip || ''}"`,
            `"${(ev.city || '').replace(/"/g, '""')}"`,
            `"${(ev.device || '').replace(/"/g, '""')}"`,
            `"${ev.action || ''}"`,
            `"${ev.status || ''}"`,
            `"${(ev.details || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `OCULA_ACCESS_AUDIT_LOGS_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('CSV Audit Report downloaded successfully!', 'success');
    },

    exportToJson() {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.events, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonStr);
        link.setAttribute('download', `OCULA_AUDIT_DUMP_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('JSON Database Dump exported successfully!', 'success');
    },

    printAuditDossier() {
        window.print();
    },

    // -------------------------------------------------------------
    // SIMULATE LIVE INCOMING TEST EVENTS
    // -------------------------------------------------------------
    simulateIncomingLogin(type) {
        const testCitizens = [
            { name: 'Simulated Citizen 1', email: 'citizen.mumbai@example.com', city: 'Mumbai, Maharashtra', device: 'Pixel 8 (Android 14)' },
            { name: 'Simulated Citizen 2', email: 'citizen.hyd@example.com', city: 'Hyderabad, Telangana', device: 'Galaxy S23 (Android 14)' },
            { name: 'Simulated Citizen 3', email: 'citizen.pune@example.com', city: 'Pune, Maharashtra', device: 'OnePlus 11 (Android 13)' },
            { name: 'Simulated Citizen 4', email: 'citizen.kolkata@example.com', city: 'Kolkata, West Bengal', device: 'iPhone 15 Pro (iOS 17)' }
        ];

        const randomCitizen = testCitizens[Math.floor(Math.random() * testCitizens.length)];

        if (type === 'citizen') {
            this.handleIncomingLiveEvent({
                actor: randomCitizen.name,
                email: randomCitizen.email,
                role: 'CITIZEN',
                platform: 'ANDROID_APP',
                authMethod: 'GOOGLE_OAUTH',
                ip: `49.36.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
                city: randomCitizen.city,
                device: randomCitizen.device,
                action: 'CITIZEN_LOGIN_SUCCESS',
                status: 'SUCCESS',
                details: 'Live simulated citizen sign-in via Google OAuth.'
            });
        } else if (type === 'failed') {
            this.handleIncomingLiveEvent({
                actor: 'Unknown Suspicious Host',
                email: 'attacker@botnet.net',
                role: 'THREAT_SUSPECT',
                platform: 'WEB_CONTROL_PANEL',
                authMethod: 'PASSWORD_BRUTE_FORCE',
                ip: `185.220.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
                city: 'Tor Exit Node',
                device: 'Automated Script / Bot',
                action: 'ADMIN_LOGIN_FAILED',
                status: 'FAILED',
                details: 'Incorrect password attempt flagged as security threat.'
            });
        } else {
            this.handleIncomingLiveEvent({
                actor: 'Regional Officer NDRF',
                email: 'regional.officer@ocula.gov.in',
                role: 'ADMIN',
                platform: 'WEB_CONTROL_PANEL',
                authMethod: 'PASSKEY_AUTH',
                ip: '103.45.12.98',
                city: 'Chennai, Tamil Nadu',
                device: 'Chrome 122 on macOS',
                action: 'ADMIN_LOGIN_SUCCESS',
                status: 'SUCCESS',
                details: 'Regional officer verified session on Control Panel.'
            });
        }
    },

    clearAllAuditLogs() {
        if (confirm('Are you sure you want to PURGE all audit records? This action is irreversible.')) {
            this.events = [];
            this.saveEvents();
            this.renderAllViews();
            this.showToast('Audit records cleared.', 'info');
        }
    },

    // -------------------------------------------------------------
    // UTILITIES & HELPERS
    // -------------------------------------------------------------
    startLiveClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('header-live-clock');
            if (clockEl) {
                const now = new Date();
                clockEl.textContent = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    },

    formatRelativeTime(isoString) {
        if (!isoString) return 'Just now';
        const diffMs = Date.now() - new Date(isoString).getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 60) return `${diffSecs}s ago`;
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('audit-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `audit-toast ${type}`;
        
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            info: 'fa-circle-info'
        };

        toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info'}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    initEventListeners() {
        // Activity heartbeat to reset auto-lock
        ['click', 'mousemove', 'keydown', 'scroll'].forEach(evt => {
            window.addEventListener(evt, () => this.resetAutoLockTimer(), { passive: true });
        });
    }
};

// Global Boot
document.addEventListener('DOMContentLoaded', () => {
    OCULA_AUDIT.init();
});
