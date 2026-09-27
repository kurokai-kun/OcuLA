// Aura 3D Photorealistic Interactive Earth Globe Engine
const AURA_GLOBE = {
    container: null,
    scene: null,
    camera: null,
    renderer: null,
    earthGroup: null,
    earthMesh: null,
    cloudsMesh: null,
    atmosphereMesh: null,
    pinGroup: null,
    starsGroup: null,
    sunGroup: null,
    ambientLight: null,
    sunLight: null,
    fillLight: null,
    isDarkMode: true,
    animationFrameId: null,
    isDragging: false,
    hasDragged: false,
    dragStartPos: { x: 0, y: 0 },
    previousMousePosition: { x: 0, y: 0 },
    targetRotation: { x: 0.25, y: -1.35 },
    currentRotation: { x: 0.25, y: -1.35 },
    zoomLevel: 1.0,
    currentMode: '3d', // '3d' or '2d'
    raycaster: null,
    mouseVector: null,
    sprites: [],
    hoveredSprite: null,

    // Live Hardware Sensor 3D Pin State
    hardwareSensorSprite: null,
    hardwarePulseSprite: null,
    hardwareSensorData: null,
    isSensorFocused: false,

    // 40+ Rich Global Real-Time AQI & Weather Hotspots
    hotspots: [
        // Asia
        { id: "delhi", name: "Delhi NCR, India", shortName: "Delhi", lat: 28.6139, lng: 77.2090, aqi: 78, status: "Moderate air quality", type: "moderate", temp: 26, hum: 58, wind: "11.5 km/h", xCoord: 28.6139, yCoord: 77.2090 },
        { id: "mumbai", name: "Mumbai, India", shortName: "Mumbai", lat: 19.0760, lng: 72.8777, aqi: 65, status: "Moderate coastal air", type: "moderate", temp: 30, hum: 78, wind: "14.2 km/h", xCoord: 19.0760, yCoord: 72.8777 },
        { id: "bengaluru", name: "Bengaluru, India", shortName: "Bengaluru", lat: 12.9716, lng: 77.5946, aqi: 42, status: "Good air quality", type: "good", temp: 24, hum: 62, wind: "8.6 km/h", xCoord: 12.9716, yCoord: 77.5946 },
        { id: "kolkata", name: "Kolkata, India", shortName: "Kolkata", lat: 22.5726, lng: 88.3639, aqi: 85, status: "Moderate urban density", type: "moderate", temp: 29, hum: 74, wind: "9.8 km/h", xCoord: 22.5726, yCoord: 88.3639 },
        { id: "jakarta", name: "Jakarta, Indonesia", shortName: "Jakarta", lat: -6.2088, lng: 106.8456, aqi: 137, status: "Unhealthy for sensitive people", type: "sensitive", temp: 34, hum: 50, wind: "13.2 km/h", xCoord: -6.2088, yCoord: 106.8456 },
        { id: "shanghai", name: "Shanghai, China", shortName: "Shanghai", lat: 31.2304, lng: 121.4737, aqi: 112, status: "Unhealthy for sensitive groups", type: "sensitive", temp: 29, hum: 68, wind: "14.1 km/h", xCoord: 31.2304, yCoord: 121.4737 },
        { id: "beijing", name: "Beijing, China", shortName: "Beijing", lat: 39.9042, lng: 116.4074, aqi: 145, status: "Elevated particulate haze", type: "sensitive", temp: 22, hum: 40, wind: "12.0 km/h", xCoord: 39.9042, yCoord: 116.4074 },
        { id: "tokyo", name: "Tokyo, Japan", shortName: "Tokyo", lat: 35.6762, lng: 139.6503, aqi: 35, status: "Good air quality", type: "good", temp: 21, hum: 55, wind: "10.4 km/h", xCoord: 35.6762, yCoord: 139.6503 },
        { id: "seoul", name: "Seoul, South Korea", shortName: "Seoul", lat: 37.5665, lng: 126.9780, aqi: 58, status: "Moderate ambient quality", type: "moderate", temp: 19, hum: 52, wind: "11.0 km/h", xCoord: 37.5665, yCoord: 126.9780 },
        { id: "bangkok", name: "Bangkok, Thailand", shortName: "Bangkok", lat: 13.7563, lng: 100.5018, aqi: 95, status: "Moderate urban smog", type: "moderate", temp: 33, hum: 70, wind: "8.5 km/h", xCoord: 13.7563, yCoord: 100.5018 },
        { id: "singapore", name: "Singapore", shortName: "Singapore", lat: 1.3521, lng: 103.8198, aqi: 38, status: "Good clean maritime air", type: "good", temp: 31, hum: 80, wind: "12.5 km/h", xCoord: 1.3521, yCoord: 103.8198 },
        { id: "dubai", name: "Dubai, UAE", shortName: "Dubai", lat: 25.2048, lng: 55.2708, aqi: 125, status: "Desert dust & ozone load", type: "sensitive", temp: 38, hum: 35, wind: "16.8 km/h", xCoord: 25.2048, yCoord: 55.2708 },
        { id: "riyadh", name: "Riyadh, Saudi Arabia", shortName: "Riyadh", lat: 24.7136, lng: 46.6753, aqi: 174, status: "High dust & thermal inversion", type: "unhealthy", temp: 41, hum: 18, wind: "19.0 km/h", xCoord: 24.7136, yCoord: 46.6753 },
        { id: "tehran", name: "Tehran, Iran", shortName: "Tehran", lat: 35.6892, lng: 51.3890, aqi: 132, status: "Basin smog & particulate", type: "sensitive", temp: 25, hum: 30, wind: "7.5 km/h", xCoord: 35.6892, yCoord: 51.3890 },

        // Europe
        { id: "london", name: "London, UK", shortName: "London", lat: 51.5074, lng: -0.1278, aqi: 48, status: "Good air quality", type: "good", temp: 18, hum: 65, wind: "15.2 km/h", xCoord: 51.5074, yCoord: -0.1278 },
        { id: "paris", name: "Paris, France", shortName: "Paris", lat: 48.8566, lng: 2.3522, aqi: 44, status: "Good air quality", type: "good", temp: 20, hum: 58, wind: "11.8 km/h", xCoord: 48.8566, yCoord: 2.3522 },
        { id: "europe", name: "Zurich / Alps, Europe", shortName: "Zurich", lat: 47.3769, lng: 8.5417, aqi: 155, status: "Alpine valley inversion alert", type: "unhealthy", temp: 22, hum: 45, wind: "8.4 km/h", xCoord: 47.3769, yCoord: 8.5417 },
        { id: "berlin", name: "Berlin, Germany", shortName: "Berlin", lat: 52.5200, lng: 13.4050, aqi: 36, status: "Good clean atmosphere", type: "good", temp: 19, hum: 54, wind: "13.0 km/h", xCoord: 52.5200, yCoord: 13.4050 },
        { id: "rome", name: "Rome, Italy", shortName: "Rome", lat: 41.9028, lng: 12.4964, aqi: 52, status: "Moderate Mediterranean air", type: "moderate", temp: 26, hum: 48, wind: "9.2 km/h", xCoord: 41.9028, yCoord: 12.4964 },
        { id: "madrid", name: "Madrid, Spain", shortName: "Madrid", lat: 40.4168, lng: -3.7038, aqi: 45, status: "Good air quality", type: "good", temp: 28, hum: 32, wind: "10.5 km/h", xCoord: 40.4168, yCoord: -3.7038 },
        { id: "moscow", name: "Moscow, Russia", shortName: "Moscow", lat: 55.7558, lng: 37.6173, aqi: 39, status: "Good crisp northern air", type: "good", temp: 14, hum: 60, wind: "14.0 km/h", xCoord: 55.7558, yCoord: 37.6173 },
        { id: "istanbul", name: "Istanbul, Turkey", shortName: "Istanbul", lat: 41.0082, lng: 28.9784, aqi: 88, status: "Moderate Bosphorus corridor", type: "moderate", temp: 23, hum: 66, wind: "18.5 km/h", xCoord: 41.0082, yCoord: 28.9784 },
        { id: "athens", name: "Athens, Greece", shortName: "Athens", lat: 37.9838, lng: 23.7275, aqi: 62, status: "Moderate dry coastal air", type: "moderate", temp: 29, hum: 42, wind: "12.2 km/h", xCoord: 37.9838, yCoord: 23.7275 },

        // North America
        { id: "newyork", name: "New York, USA", shortName: "New York", lat: 40.7128, lng: -74.0060, aqi: 44, status: "Good air quality", type: "good", temp: 23, hum: 55, wind: "14.5 km/h", xCoord: 40.7128, yCoord: -74.0060 },
        { id: "losangeles", name: "Los Angeles, USA", shortName: "Los Angeles", lat: 34.0522, lng: -118.2437, aqi: 68, status: "Moderate valley particulate", type: "moderate", temp: 27, hum: 45, wind: "9.0 km/h", xCoord: 34.0522, yCoord: -118.2437 },
        { id: "chicago", name: "Chicago, USA", shortName: "Chicago", lat: 41.8781, lng: -87.6298, aqi: 48, status: "Good lake breeze quality", type: "good", temp: 20, hum: 62, wind: "21.0 km/h", xCoord: 41.8781, yCoord: -87.6298 },
        { id: "toronto", name: "Toronto, Canada", shortName: "Toronto", lat: 43.6532, lng: -79.3832, aqi: 32, status: "Good clean air", type: "good", temp: 18, hum: 56, wind: "12.3 km/h", xCoord: 43.6532, yCoord: -79.3832 },
        { id: "vancouver", name: "Vancouver, Canada", shortName: "Vancouver", lat: 49.2827, lng: -123.1207, aqi: 25, status: "Optimal Pacific clean baseline", type: "good", temp: 17, hum: 72, wind: "11.0 km/h", xCoord: 49.2827, yCoord: -123.1207 },
        { id: "mexicocity", name: "Mexico City, Mexico", shortName: "Mexico City", lat: 19.4326, lng: -99.1332, aqi: 118, status: "Sensitive valley basin smog", type: "sensitive", temp: 24, hum: 45, wind: "8.0 km/h", xCoord: 19.4326, yCoord: -99.1332 },

        // South America
        { id: "saopaulo", name: "Sao Paulo, Brazil", shortName: "Sao Paulo", lat: -23.5505, lng: -46.6333, aqi: 72, status: "Moderate metropolitan area", type: "moderate", temp: 25, hum: 65, wind: "10.0 km/h", xCoord: -23.5505, yCoord: -46.6333 },
        { id: "buenosaires", name: "Buenos Aires, Argentina", shortName: "Buenos Aires", lat: -34.6037, lng: -58.3816, aqi: 35, status: "Good coastal air quality", type: "good", temp: 19, hum: 58, wind: "16.5 km/h", xCoord: -34.6037, yCoord: -58.3816 },
        { id: "santiago", name: "Santiago, Chile", shortName: "Santiago", lat: -33.4489, lng: -70.6693, aqi: 82, status: "Moderate valley particulate", type: "moderate", temp: 21, hum: 40, wind: "7.8 km/h", xCoord: -33.4489, yCoord: -70.6693 },
        { id: "bogota", name: "Bogota, Colombia", shortName: "Bogota", lat: 4.7110, lng: -74.0721, aqi: 55, status: "Moderate high-altitude air", type: "moderate", temp: 16, hum: 75, wind: "9.5 km/h", xCoord: 4.7110, yCoord: -74.0721 },

        // Africa
        { id: "cairo", name: "Cairo, Egypt", shortName: "Cairo", lat: 30.0444, lng: 31.2357, aqi: 148, status: "Sensitive desert dust & traffic", type: "sensitive", temp: 32, hum: 38, wind: "14.2 km/h", xCoord: 30.0444, yCoord: 31.2357 },
        { id: "lagos", name: "Lagos, Nigeria", shortName: "Lagos", lat: 6.5244, lng: 3.3792, aqi: 78, status: "Moderate coastal breeze", type: "moderate", temp: 29, hum: 84, wind: "11.0 km/h", xCoord: 6.5244, yCoord: 3.3792 },
        { id: "johannesburg", name: "Johannesburg, South Africa", shortName: "Johannesburg", lat: -26.2041, lng: 28.0473, aqi: 62, status: "Moderate highveld air", type: "moderate", temp: 22, hum: 48, wind: "13.5 km/h", xCoord: -26.2041, yCoord: 28.0473 },
        { id: "nairobi", name: "Nairobi, Kenya", shortName: "Nairobi", lat: -1.2921, lng: 36.8219, aqi: 45, status: "Good highland air quality", type: "good", temp: 23, hum: 60, wind: "12.0 km/h", xCoord: -1.2921, yCoord: 36.8219 },
        { id: "africa", name: "Congo Basin, Central Africa", shortName: "Congo Basin", lat: -0.2280, lng: 21.8277, aqi: 132, status: "Biomass smoke & particulate", type: "sensitive", temp: 31, hum: 75, wind: "6.2 km/h", xCoord: -0.2280, yCoord: 21.8277 },

        // Oceania & Maritime
        { id: "sydney", name: "Sydney, Australia", shortName: "Sydney", lat: -33.8688, lng: 151.2093, aqi: 28, status: "Good clean oceanic air", type: "good", temp: 22, hum: 60, wind: "18.0 km/h", xCoord: -33.8688, yCoord: 151.2093 },
        { id: "melbourne", name: "Melbourne, Australia", shortName: "Melbourne", lat: -37.8136, lng: 144.9631, aqi: 30, status: "Good maritime baseline", type: "good", temp: 19, hum: 64, wind: "20.5 km/h", xCoord: -37.8136, yCoord: 144.9631 },
        { id: "auckland", name: "Auckland, New Zealand", shortName: "Auckland", lat: -36.8485, lng: 174.7633, aqi: 22, status: "Optimal pristine maritime air", type: "good", temp: 18, hum: 70, wind: "22.0 km/h", xCoord: -36.8485, yCoord: 174.7633 },
        { id: "atlantic", name: "South Atlantic Maritime", shortName: "South Atlantic", lat: -28.0000, lng: -14.0000, aqi: 90, status: "Clean marine aerosol baseline", type: "moderate", temp: 18, hum: 60, wind: "22.4 km/h", xCoord: -28.0000, yCoord: -14.0000 }
    ],

    init(containerId = 'globe-3d-canvas-container') {
        this.container = document.getElementById(containerId);
        if (!this.container || typeof THREE === 'undefined') return;

        // Clean up any previous canvas
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        const width = this.container.clientWidth || 580;
        const height = this.container.clientHeight || 460;

        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 3.1);

        // 3. Raycaster for clicking AQI bubbles
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();

        // 4. Photorealistic WebGL Renderer with ACES Tone Mapping
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        // 5. Cosmic Galaxy Starfield Background (Dark Mode)
        this.createGalaxyStarfield();

        // 6. Radiant Golden Sun & Atmospheric Sky Wisps (Light Mode)
        this.createSunAndAtmosphericSky();

        // 7. Earth Pivot Group
        this.earthGroup = new THREE.Group();
        this.scene.add(this.earthGroup);

        // 8. Balanced Lighting System
        this.ambientLight = new THREE.AmbientLight(0x0c1526, 0.65);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.45);
        this.sunLight.position.set(5.0, 3.2, 4.5);
        this.scene.add(this.sunLight);

        this.fillLight = new THREE.DirectionalLight(0x1d3557, 0.35);
        this.fillLight.position.set(-5.0, -2.0, -3.0);
        this.scene.add(this.fillLight);

        // 9. Build Genuine Photographic Earth
        this.buildPhotographicEarth();

        // 10. Subtle Rayleigh Atmosphere Rim
        const atmosphereGeometry = new THREE.SphereGeometry(1.025, 64, 64);
        const atmosphereMaterial = this.createRealisticAtmosphereMaterial();
        this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earthGroup.add(this.atmosphereMesh);

        // 11. 3D Clickable Hotspot Bubbles
        this.pinGroup = new THREE.Group();
        this.earthGroup.add(this.pinGroup);
        this.createHotspotBubbles();

        // 12. Robust Orbit Drag, Zoom & Click Detection with NaN Guards
        this.setupInteractions();

        // 13. Sync Theme with App Initial State
        const isDark = !document.body.classList.contains("light-theme");
        this.setTheme(isDark);

        // 14. Window Resize Handler
        window.addEventListener('resize', () => this.onWindowResize());

        // 15. Start Animation Loop
        this.animate();
    },

    createGalaxyStarfield() {
        this.starsGroup = new THREE.Group();
        this.scene.add(this.starsGroup);

        // 1. Create crisp round luminous star texture
        const starCanvas = document.createElement('canvas');
        starCanvas.width = 64;
        starCanvas.height = 64;
        const sctx = starCanvas.getContext('2d');
        const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.25, 'rgba(240, 248, 255, 0.85)');
        grad.addColorStop(0.55, 'rgba(120, 180, 255, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 64, 64);
        const starTexture = new THREE.CanvasTexture(starCanvas);

        // 2. Distant Deep Space Galaxy Stars (1,600 particles)
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 1600;
        const positions = new Float32Array(starsCount * 3);
        const colors = new Float32Array(starsCount * 3);

        const colorPalette = [
            new THREE.Color(0xffffff), // Pure white
            new THREE.Color(0xdbeafe), // Icy blue
            new THREE.Color(0x93c5fd), // Celestial blue
            new THREE.Color(0xfef08a), // Stellar yellow
            new THREE.Color(0xfbcfe8), // Nebula violet
            new THREE.Color(0x67e8f9)  // Cosmic cyan
        ];

        for (let i = 0; i < starsCount; i++) {
            const r = 35 + Math.random() * 125;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 1.15,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.starsGroup.add(stars);

        // 3. Ethereal Galaxy Nebula Dust Clouds (350 larger particles)
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaCount = 350;
        const nebPositions = new Float32Array(nebulaCount * 3);
        const nebColors = new Float32Array(nebulaCount * 3);

        const nebPalette = [
            new THREE.Color(0x38bdf8),
            new THREE.Color(0x818cf8),
            new THREE.Color(0xc084fc),
            new THREE.Color(0x34d399)
        ];

        for (let i = 0; i < nebulaCount; i++) {
            const r = 30 + Math.random() * 70;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            nebPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            nebPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            nebPositions[i * 3 + 2] = r * Math.cos(phi);

            const c = nebPalette[Math.floor(Math.random() * nebPalette.length)];
            nebColors[i * 3] = c.r;
            nebColors[i * 3 + 1] = c.g;
            nebColors[i * 3 + 2] = c.b;
        }

        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebPositions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

        const nebulaMaterial = new THREE.PointsMaterial({
            size: 3.2,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
        this.starsGroup.add(nebula);
    },

    createSunAndAtmosphericSky() {
        this.sunGroup = new THREE.Group();
        this.scene.add(this.sunGroup);

        // 1. Radiant Golden Sun Corona & Lens Flare Sprite
        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 256;
        sunCanvas.height = 256;
        const sctx = sunCanvas.getContext('2d');

        // Outer warm golden glow
        const sunGlow = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        sunGlow.addColorStop(0.18, 'rgba(254, 240, 138, 0.95)');
        sunGlow.addColorStop(0.42, 'rgba(251, 191, 36, 0.60)');
        sunGlow.addColorStop(0.72, 'rgba(245, 158, 11, 0.20)');
        sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        sctx.fillStyle = sunGlow;
        sctx.fillRect(0, 0, 256, 256);

        // Sun flare rays
        sctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
        sctx.lineWidth = 2.5;
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            sctx.beginPath();
            sctx.moveTo(128 + Math.cos(angle) * 35, 128 + Math.sin(angle) * 35);
            sctx.lineTo(128 + Math.cos(angle) * 115, 128 + Math.sin(angle) * 115);
            sctx.stroke();
        }

        const sunTexture = new THREE.CanvasTexture(sunCanvas);
        const sunMaterial = new THREE.SpriteMaterial({
            map: sunTexture,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const sunSprite = new THREE.Sprite(sunMaterial);
        sunSprite.position.set(4.8, 3.4, -6.5);
        sunSprite.scale.set(4.2, 4.2, 1);
        this.sunGroup.add(sunSprite);

        // Soft outer sun flare halo
        const haloMaterial = new THREE.SpriteMaterial({
            map: sunTexture,
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sunHalo = new THREE.Sprite(haloMaterial);
        sunHalo.position.set(4.8, 3.4, -6.5);
        sunHalo.scale.set(8.5, 8.5, 1);
        this.sunGroup.add(sunHalo);

        // 2. Daytime Translucent Atmospheric Cloud Wisps & Solar Dust
        const cloudWispCanvas = document.createElement('canvas');
        cloudWispCanvas.width = 64;
        cloudWispCanvas.height = 64;
        const wctx = cloudWispCanvas.getContext('2d');
        const wGrad = wctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        wGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        wGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.60)');
        wGrad.addColorStop(0.75, 'rgba(186, 230, 253, 0.20)');
        wGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        wctx.fillStyle = wGrad;
        wctx.fillRect(0, 0, 64, 64);
        const cloudWispTexture = new THREE.CanvasTexture(cloudWispCanvas);

        const skyGeometry = new THREE.BufferGeometry();
        const skyCount = 380;
        const skyPositions = new Float32Array(skyCount * 3);
        const skyColors = new Float32Array(skyCount * 3);

        const skyPalette = [
            new THREE.Color(0xffffff), // Pure white cloud
            new THREE.Color(0xe0f2fe), // Sky wisp
            new THREE.Color(0xbae6fd), // Soft cyan wisp
            new THREE.Color(0xfef08a)  // Solar ray dust
        ];

        for (let i = 0; i < skyCount; i++) {
            const r = 25 + Math.random() * 85;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            skyPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            skyPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            skyPositions[i * 3 + 2] = r * Math.cos(phi);

            const c = skyPalette[Math.floor(Math.random() * skyPalette.length)];
            skyColors[i * 3] = c.r;
            skyColors[i * 3 + 1] = c.g;
            skyColors[i * 3 + 2] = c.b;
        }

        skyGeometry.setAttribute('position', new THREE.BufferAttribute(skyPositions, 3));
        skyGeometry.setAttribute('color', new THREE.BufferAttribute(skyColors, 3));

        const skyMaterial = new THREE.PointsMaterial({
            size: 2.8,
            map: cloudWispTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        const skyClouds = new THREE.Points(skyGeometry, skyMaterial);
        this.sunGroup.add(skyClouds);

        // Initially hidden in Dark Mode
        this.sunGroup.visible = false;
    },

    setTheme(isDark) {
        this.isDarkMode = isDark;

        if (this.starsGroup) {
            this.starsGroup.visible = isDark;
        }
        if (this.sunGroup) {
            this.sunGroup.visible = !isDark;
        }

        if (this.ambientLight) {
            this.ambientLight.color.setHex(isDark ? 0x0c1526 : 0xdbeafe);
            this.ambientLight.intensity = isDark ? 0.65 : 1.15;
        }
        if (this.sunLight) {
            this.sunLight.color.setHex(isDark ? 0xffffff : 0xfffaed);
            this.sunLight.intensity = isDark ? 1.45 : 1.70;
        }
        if (this.fillLight) {
            this.fillLight.color.setHex(isDark ? 0x1d3557 : 0x38bdf8);
            this.fillLight.intensity = isDark ? 0.35 : 0.50;
        }
    },

    buildPhotographicEarth() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "anonymous";

        // Baseline canvas texture ensuring zero delay
        const { dayTexture, cloudTexture } = this.generateDetailedEarthCanvas();

        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: dayTexture,
            roughness: 0.68,
            metalness: 0.05
        });

        this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earthGroup.add(this.earthMesh);

        // Realistic Semi-Transparent Cloud Layer (Normal Blending prevents glare)
        const cloudGeometry = new THREE.SphereGeometry(1.009, 64, 64);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.32,
            roughness: 0.9,
            metalness: 0.0,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        this.cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.earthGroup.add(this.cloudsMesh);

        // High-res NASA Satellite Photo Base64 Upgrade
        const daySrc = (window.EARTH_TEXTURE_DAY && window.EARTH_TEXTURE_DAY.length > 50) ? window.EARTH_TEXTURE_DAY : 'assets/earth_day.jpg';
        const cloudSrc = (window.EARTH_TEXTURE_CLOUDS && window.EARTH_TEXTURE_CLOUDS.length > 50) ? window.EARTH_TEXTURE_CLOUDS : 'assets/earth_clouds.png';

        textureLoader.load(daySrc, (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = 4;
            earthMaterial.map = tex;
            earthMaterial.needsUpdate = true;
        }, undefined, () => {});

        textureLoader.load(cloudSrc, (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            cloudMaterial.map = tex;
            cloudMaterial.needsUpdate = true;
        }, undefined, () => {});
    },

    generateDetailedEarthCanvas() {
        const width = 2048;
        const height = 1024;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Deep ocean realistic bathymetry gradient
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
        oceanGrad.addColorStop(0, '#040B1A');
        oceanGrad.addColorStop(0.18, '#0B2246');
        oceanGrad.addColorStop(0.5, '#0E2E5E');
        oceanGrad.addColorStop(0.82, '#0B2246');
        oceanGrad.addColorStop(1, '#040B1A');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, width, height);

        // Coastal shelves
        ctx.fillStyle = '#164E7E';
        ctx.filter = 'blur(10px)';
        ctx.beginPath();
        ctx.ellipse(width * 0.53, height * 0.52, width * 0.12, height * 0.26, 0.1, 0, Math.PI * 2);
        ctx.ellipse(width * 0.68, height * 0.38, width * 0.22, height * 0.18, 0, 0, Math.PI * 2);
        ctx.ellipse(width * 0.25, height * 0.36, width * 0.15, height * 0.18, -0.2, 0, Math.PI * 2);
        ctx.ellipse(width * 0.32, height * 0.66, width * 0.09, height * 0.20, 0.2, 0, Math.PI * 2);
        ctx.ellipse(width * 0.84, height * 0.70, width * 0.09, height * 0.10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';

        // Continents
        ctx.fillStyle = '#264A2F'; // Africa
        ctx.beginPath();
        ctx.ellipse(width * 0.54, height * 0.56, width * 0.08, height * 0.18, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#A07844'; // Sahara
        ctx.beginPath();
        ctx.ellipse(width * 0.52, height * 0.42, width * 0.09, height * 0.075, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2D5836'; // Europe
        ctx.beginPath();
        ctx.ellipse(width * 0.53, height * 0.31, width * 0.065, height * 0.08, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#244B2E'; // Asia
        ctx.beginPath();
        ctx.ellipse(width * 0.72, height * 0.34, width * 0.17, height * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#285332'; // India
        ctx.beginPath();
        ctx.moveTo(width * 0.68, height * 0.38);
        ctx.lineTo(width * 0.75, height * 0.44);
        ctx.lineTo(width * 0.71, height * 0.58);
        ctx.lineTo(width * 0.67, height * 0.47);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#A8804A'; // Middle East
        ctx.beginPath();
        ctx.ellipse(width * 0.63, height * 0.42, width * 0.045, height * 0.06, 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#254E2C'; // North America
        ctx.beginPath();
        ctx.ellipse(width * 0.24, height * 0.34, width * 0.12, height * 0.13, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#184422'; // South America
        ctx.beginPath();
        ctx.ellipse(width * 0.33, height * 0.65, width * 0.07, height * 0.17, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8C5E35'; // Australia
        ctx.beginPath();
        ctx.ellipse(width * 0.85, height * 0.70, width * 0.065, height * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E2E8F0'; // Polar caps
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.06, width * 0.45, height * 0.05, 0, 0, Math.PI * 2);
        ctx.ellipse(width * 0.5, height * 0.95, width * 0.48, height * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        const dayTexture = new THREE.CanvasTexture(canvas);
        dayTexture.encoding = THREE.sRGBEncoding;

        // Clouds Canvas
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.width = 1024;
        cloudCanvas.height = 512;
        const cctx = cloudCanvas.getContext('2d');
        cctx.fillStyle = 'rgba(0,0,0,0)';
        cctx.fillRect(0, 0, 1024, 512);
        cctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 45; i++) {
            const cx = Math.random() * 1024;
            const cy = 60 + Math.random() * 390;
            const rx = 25 + Math.random() * 60;
            const ry = 8 + Math.random() * 20;
            cctx.beginPath();
            cctx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
            cctx.fill();
        }
        const cloudTexture = new THREE.CanvasTexture(cloudCanvas);

        return { dayTexture, cloudTexture };
    },

    createRealisticAtmosphereMaterial() {
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        const fragmentShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vec3 viewDir = normalize(vViewPosition);
                float dotView = dot(vNormal, viewDir);
                float rim = 1.0 - max(0.0, dotView);
                float intensity = pow(rim, 3.2) * 0.55;
                vec3 atmosphereColor = vec3(0.25, 0.58, 0.95);
                gl_FragColor = vec4(atmosphereColor, intensity);
            }
        `;
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            blending: THREE.NormalBlending,
            side: THREE.FrontSide,
            transparent: true,
            depthWrite: false
        });
    },

    latLngToVector3(lat, lng, radius = 1.035) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    },

    createHotspotBubbles() {
        this.sprites = [];
        while (this.pinGroup.children.length > 0) {
            this.pinGroup.remove(this.pinGroup.children[0]);
        }

        this.hotspots.forEach(h => {
            const pos = this.latLngToVector3(h.lat, h.lng, 1.036);

            const bubbleCanvas = document.createElement('canvas');
            bubbleCanvas.width = 128;
            bubbleCanvas.height = 128;
            const bctx = bubbleCanvas.getContext('2d');

            if (h.type === 'unhealthy') {
                bctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
                bctx.beginPath();
                bctx.arc(64, 64, 48, 0, Math.PI * 2);
                bctx.fill();
                bctx.strokeStyle = '#FFFFFF';
                bctx.lineWidth = 4;
                bctx.stroke();
            } else if (h.type === 'sensitive') {
                bctx.fillStyle = 'rgba(234, 88, 12, 0.92)';
                bctx.beginPath();
                bctx.arc(64, 64, 48, 0, Math.PI * 2);
                bctx.fill();
                bctx.strokeStyle = '#FFFFFF';
                bctx.lineWidth = 4;
                bctx.stroke();
            } else {
                bctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                bctx.beginPath();
                bctx.arc(64, 64, 48, 0, Math.PI * 2);
                bctx.fill();
                bctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
                bctx.lineWidth = 3.5;
                bctx.stroke();
            }

            bctx.font = 'bold 36px -apple-system, sans-serif';
            bctx.fillStyle = '#FFFFFF';
            bctx.textAlign = 'center';
            bctx.textBaseline = 'middle';
            bctx.fillText(h.aqi.toString(), 64, 64);

            const spriteMap = new THREE.CanvasTexture(bubbleCanvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, depthTest: true, depthWrite: false });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(pos);
            sprite.scale.set(0.12, 0.12, 1);
            sprite.userData = { hotspot: h, originalScale: 0.12 };

            this.pinGroup.add(sprite);
            this.sprites.push(sprite);
        });

        // Re-attach hardware sensor pin if connected
        if (this.hardwareSensorData) {
            this.updateHardwareSensorPin(this.hardwareSensorData);
        }
    },

    // ==================== LIVE HARDWARE SENSOR 3D PINPOINTING ====================
    updateHardwareSensorPin(sensorData) {
        if (!sensorData || typeof sensorData.lat !== 'number' || typeof sensorData.lng !== 'number') return;
        this.hardwareSensorData = sensorData;

        if (!this.pinGroup) return;

        const pos = this.latLngToVector3(sensorData.lat, sensorData.lng, 1.042);

        // 1. Create / Update Pulsing Outer Aura Ring
        if (!this.hardwarePulseSprite) {
            const pCanvas = document.createElement('canvas');
            pCanvas.width = 128;
            pCanvas.height = 128;
            const pctx = pCanvas.getContext('2d');
            pctx.strokeStyle = '#10B981';
            pctx.lineWidth = 6;
            pctx.beginPath();
            pctx.arc(64, 64, 52, 0, Math.PI * 2);
            pctx.stroke();

            const pMap = new THREE.CanvasTexture(pCanvas);
            const pMat = new THREE.SpriteMaterial({ map: pMap, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthTest: true, depthWrite: false });
            this.hardwarePulseSprite = new THREE.Sprite(pMat);
            this.pinGroup.add(this.hardwarePulseSprite);
        }
        this.hardwarePulseSprite.position.copy(pos);

        // 2. Create / Update Cyber Glowing Sensor Beacon Sprite
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 256;
        sCanvas.height = 256;
        const sctx = sCanvas.getContext('2d');

        // Outer glow gradient
        const radGrad = sctx.createRadialGradient(128, 128, 60, 128, 128, 120);
        radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
        radGrad.addColorStop(0.65, 'rgba(6, 182, 212, 0.85)');
        radGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        sctx.fillStyle = radGrad;
        sctx.fillRect(0, 0, 256, 256);

        // Main Pin Disc
        sctx.fillStyle = '#0F172A';
        sctx.beginPath();
        sctx.arc(128, 128, 88, 0, Math.PI * 2);
        sctx.fill();
        sctx.strokeStyle = '#10B981';
        sctx.lineWidth = 8;
        sctx.stroke();

        // Header Pill
        sctx.fillStyle = '#10B981';
        sctx.beginPath();
        sctx.roundRect(58, 52, 140, 28, 12);
        sctx.fill();
        sctx.font = 'bold 15px -apple-system, sans-serif';
        sctx.fillStyle = '#FFFFFF';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText("🔌 LIVE SENSOR", 128, 66);

        // AQI Value
        sctx.font = '800 68px -apple-system, sans-serif';
        sctx.fillStyle = '#FFFFFF';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.fillText(String(sensorData.aqi || 78), 128, 130);

        // Footer Text
        sctx.font = '700 18px -apple-system, sans-serif';
        sctx.fillStyle = '#34D399';
        sctx.fillText("AQI • ESP32", 128, 182);

        const sMap = new THREE.CanvasTexture(sCanvas);
        if (!this.hardwareSensorSprite) {
            const sMat = new THREE.SpriteMaterial({ map: sMap, depthTest: true, depthWrite: false });
            this.hardwareSensorSprite = new THREE.Sprite(sMat);
            this.hardwareSensorSprite.scale.set(0.16, 0.16, 1);
            this.pinGroup.add(this.hardwareSensorSprite);
            this.sprites.push(this.hardwareSensorSprite);
        } else {
            this.hardwareSensorSprite.material.map.dispose();
            this.hardwareSensorSprite.material.map = sMap;
            this.hardwareSensorSprite.material.needsUpdate = true;
        }

        this.hardwareSensorSprite.position.copy(pos);
        this.hardwareSensorSprite.userData = {
            isSensor: true,
            hotspot: {
                id: "esp32_live",
                name: sensorData.name || "ESP32 Sensor Station",
                lat: sensorData.lat,
                lng: sensorData.lng,
                aqi: sensorData.aqi,
                status: `Live ESP32 USB Telemetry • PM2.5: ${sensorData.pm25 || '29.0'} µg/m³ • Temp: ${sensorData.temp || '26.4'}°C`,
                temp: Math.round(sensorData.temp || 26),
                hum: Math.round(sensorData.hum || 58),
                wind: "USB Serial",
                xCoord: sensorData.lat,
                yCoord: sensorData.lng
            }
        };

        // Auto-orient and fly Earth to point at the sensor on initial connection
        if (!this.isSensorFocused) {
            this.flyToLocation(sensorData.lat, sensorData.lng);
            this.isSensorFocused = true;
        }
    },

    removeHardwareSensorPin() {
        if (this.hardwareSensorSprite && this.pinGroup) {
            this.pinGroup.remove(this.hardwareSensorSprite);
            const idx = this.sprites.indexOf(this.hardwareSensorSprite);
            if (idx > -1) this.sprites.splice(idx, 1);
            if (this.hardwareSensorSprite.material.map) this.hardwareSensorSprite.material.map.dispose();
            this.hardwareSensorSprite.material.dispose();
            this.hardwareSensorSprite = null;
        }

        if (this.hardwarePulseSprite && this.pinGroup) {
            this.pinGroup.remove(this.hardwarePulseSprite);
            if (this.hardwarePulseSprite.material.map) this.hardwarePulseSprite.material.map.dispose();
            this.hardwarePulseSprite.material.dispose();
            this.hardwarePulseSprite = null;
        }

        this.hardwareSensorData = null;
        this.isSensorFocused = false;
    },

    flyToLocation(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        const targetLngRad = -((lng + 180) * (Math.PI / 180)) + Math.PI / 2;
        const targetLatRad = (lat) * (Math.PI / 180);

        if (isFinite(targetLngRad)) this.targetRotation.y = targetLngRad;
        if (isFinite(targetLatRad)) this.targetRotation.x = Math.max(-0.6, Math.min(0.6, targetLatRad * 0.5));
    },

    selectHotspot(h) {
        if (!h) return;

        this.flyToLocation(h.lat, h.lng);

        const isHw = (window.AURA_APP && window.AURA_APP.isHardwareConnected) || h.id === 'esp32_live' || h.id === 'arduino_live';
        const displayName = isHw ? (h.name.includes("ESP32") ? h.name : `${h.name} (ESP32 Live)`) : `${h.name} Air Quality`;

        const tipCity = document.getElementById("globe-tooltip-city");
        if (tipCity) tipCity.textContent = displayName;

        const tipBadge = document.getElementById("globe-tooltip-badge");
        if (tipBadge) {
            tipBadge.textContent = `${h.aqi} AQI`;
            tipBadge.style.background = h.aqi > 150 ? '#EF4444' : h.aqi > 100 ? '#EA580C' : '#F59E0B';
        }

        const tipDesc = document.getElementById("globe-tooltip-desc");
        if (tipDesc) tipDesc.textContent = h.status;

        const tipTemp = document.getElementById("globe-tip-temp");
        if (tipTemp) tipTemp.textContent = `${h.temp}°`;

        const tipHum = document.getElementById("globe-tip-hum");
        if (tipHum) tipHum.textContent = `${h.hum}%`;

        const tipWind = document.getElementById("globe-tip-wind");
        if (tipWind) tipWind.textContent = h.wind;

        const circleBadgeNum = document.getElementById("globe-circle-badge-num");
        if (circleBadgeNum) circleBadgeNum.textContent = h.aqi;

        const heroAqi = document.getElementById("hero-stat-aqi");
        if (heroAqi) heroAqi.textContent = h.aqi;

        const locBadge = document.getElementById("dash-location-badge");
        if (locBadge) locBadge.innerHTML = isHw ? `Local &rarr; <span class="flag-icon">🔌</span> ${displayName}` : `Local &rarr; <span class="flag-icon">📍</span> ${h.name}`;

        const coordEl = document.getElementById("hero-coordinates-text");
        if (coordEl) coordEl.innerHTML = `<div>X: &nbsp;${h.xCoord.toFixed(6)}</div><div>Y: ${h.yCoord.toFixed(6)}</div>`;

        const riskVal = document.getElementById("hero-risk-percent");
        if (riskVal) {
            const riskCalc = Math.min(95, Math.max(15, Math.round(h.aqi * 0.45)));
            riskVal.textContent = `${riskCalc}%`;
        }
    },

    setupInteractions() {
        if (!this.container) return;

        const getCoords = (e) => {
            if (!this.renderer || !this.renderer.domElement) return null;
            const rect = this.renderer.domElement.getBoundingClientRect();
            let clientX = e.clientX;
            let clientY = e.clientY;

            if (clientX === undefined && e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (clientX === undefined && e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }

            if (typeof clientX !== 'number' || typeof clientY !== 'number' || isNaN(clientX) || isNaN(clientY)) {
                return null;
            }

            const w = rect.width || 1;
            const h = rect.height || 1;

            return {
                x: ((clientX - rect.left) / w) * 2 - 1,
                y: -((clientY - rect.top) / h) * 2 + 1,
                rawX: clientX,
                rawY: clientY
            };
        };

        const onMouseDown = (e) => {
            const c = getCoords(e);
            if (!c) return;
            this.isDragging = true;
            this.hasDragged = false;
            this.dragStartPos = { x: c.rawX, y: c.rawY };
            this.previousMousePosition = { x: c.rawX, y: c.rawY };
        };

        const onMouseMove = (e) => {
            const c = getCoords(e);
            if (!c) return;

            if (isFinite(c.x) && isFinite(c.y)) {
                this.mouseVector.x = c.x;
                this.mouseVector.y = c.y;
            }

            if (this.isDragging) {
                if (!this.previousMousePosition || isNaN(this.previousMousePosition.x) || isNaN(this.previousMousePosition.y)) {
                    this.previousMousePosition = { x: c.rawX, y: c.rawY };
                    return;
                }

                const dist = Math.hypot(c.rawX - this.dragStartPos.x, c.rawY - this.dragStartPos.y);
                if (dist > 4) this.hasDragged = true;

                // Robust delta clamping guarantees no teleportation or NaN breakdown
                const rawDeltaX = c.rawX - this.previousMousePosition.x;
                const rawDeltaY = c.rawY - this.previousMousePosition.y;

                if (isFinite(rawDeltaX) && isFinite(rawDeltaY)) {
                    const deltaX = Math.max(-20, Math.min(20, rawDeltaX));
                    const deltaY = Math.max(-20, Math.min(20, rawDeltaY));

                    this.targetRotation.y += deltaX * 0.0035;
                    this.targetRotation.x = Math.max(-0.75, Math.min(0.75, this.targetRotation.x + deltaY * 0.0035));
                }

                this.previousMousePosition = { x: c.rawX, y: c.rawY };
            } else {
                this.checkHover();
            }
        };

        const onMouseUp = (e) => {
            if (!this.hasDragged) {
                this.checkClick();
            }
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };
        };

        this.container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        this.container.addEventListener('touchstart', onMouseDown, { passive: true });
        window.addEventListener('touchmove', onMouseMove, { passive: true });
        window.addEventListener('touchend', onMouseUp);

        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY < 0 ? 0.12 : -0.12);
        }, { passive: false });
    },

    checkHover() {
        if (!this.camera || !this.raycaster || this.sprites.length === 0) return;
        if (!isFinite(this.mouseVector.x) || !isFinite(this.mouseVector.y)) return;
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const intersects = this.raycaster.intersectObjects(this.sprites);

        if (intersects.length > 0) {
            const hitSprite = intersects[0].object;
            this.container.style.cursor = 'pointer';

            if (this.hoveredSprite !== hitSprite) {
                if (this.hoveredSprite) {
                    const baseScale = this.hoveredSprite.userData.originalScale || (this.hoveredSprite.userData.isSensor ? 0.16 : 0.12);
                    this.hoveredSprite.scale.set(baseScale, baseScale, 1);
                }
                this.hoveredSprite = hitSprite;
                const hoverScale = hitSprite.userData.isSensor ? 0.19 : 0.14;
                this.hoveredSprite.scale.set(hoverScale, hoverScale, 1);
            }
        } else {
            this.container.style.cursor = this.isDragging ? 'grabbing' : 'grab';
            if (this.hoveredSprite) {
                const baseScale = this.hoveredSprite.userData.originalScale || (this.hoveredSprite.userData.isSensor ? 0.16 : 0.12);
                this.hoveredSprite.scale.set(baseScale, baseScale, 1);
                this.hoveredSprite = null;
            }
        }
    },

    checkClick() {
        if (!this.camera || !this.raycaster || this.sprites.length === 0) return;
        if (!isFinite(this.mouseVector.x) || !isFinite(this.mouseVector.y)) return;
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const intersects = this.raycaster.intersectObjects(this.sprites);

        if (intersects.length > 0) {
            const hitSprite = intersects[0].object;
            if (hitSprite.userData && hitSprite.userData.hotspot) {
                this.selectHotspot(hitSprite.userData.hotspot);
            }
        }
    },

    zoom(delta) {
        if (!this.camera) return;
        this.camera.position.z = Math.max(2.1, Math.min(4.2, this.camera.position.z - delta));
    },

    zoomIn() { this.zoom(0.25); },
    zoomOut() { this.zoom(-0.25); },

    setMode(mode) {
        this.currentMode = mode;
        const globeWrapper = document.getElementById('globe-3d-wrapper');
        const map2dWrapper = document.getElementById('globe-2d-wrapper');
        const btn3d = document.getElementById('btn-mode-3d-globe');
        const btn2d = document.getElementById('btn-mode-2d-map');

        if (mode === '3d') {
            if (globeWrapper) {
                globeWrapper.style.opacity = '1';
                globeWrapper.style.visibility = 'visible';
                globeWrapper.style.pointerEvents = 'auto';
                globeWrapper.style.zIndex = '10';
            }
            if (map2dWrapper) {
                map2dWrapper.style.opacity = '0';
                map2dWrapper.style.visibility = 'hidden';
                map2dWrapper.style.pointerEvents = 'none';
                map2dWrapper.style.zIndex = '5';
            }
            if (btn3d) btn3d.classList.add('active');
            if (btn2d) btn2d.classList.remove('active');
            requestAnimationFrame(() => this.onWindowResize());
        } else {
            if (globeWrapper) {
                globeWrapper.style.opacity = '0';
                globeWrapper.style.visibility = 'hidden';
                globeWrapper.style.pointerEvents = 'none';
                globeWrapper.style.zIndex = '5';
            }
            if (map2dWrapper) {
                map2dWrapper.style.opacity = '1';
                map2dWrapper.style.visibility = 'visible';
                map2dWrapper.style.pointerEvents = 'auto';
                map2dWrapper.style.zIndex = '10';
                if (window.AURA_MAP) {
                    AURA_MAP.initMini2DMap();
                    if (AURA_MAP.miniMap) {
                        AURA_MAP.miniMap.invalidateSize(false);
                        if (window.AURA_APP && AURA_APP.activeLocation) {
                            const loc = AURA_APP.activeLocation;
                            AURA_MAP.updateDashboardLocation(loc.title, loc.lat, loc.lng, loc.aqi, loc.pm25, loc.temp, loc.hum, false);
                        }
                    }
                }
            }
            if (btn3d) btn3d.classList.remove('active');
            if (btn2d) btn2d.classList.add('active');
        }
    },

    onWindowResize() {
        if (!this.container) this.container = document.getElementById('globe-3d-canvas-container');
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth || (this.container.parentElement ? this.container.parentElement.clientWidth : 580);
        const height = this.container.clientHeight || (this.container.parentElement ? this.container.parentElement.clientHeight : 480);
        if (width === 0 || height === 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        const now = Date.now();

        // Cosmic Galaxy Stars Slow Parallax Drift (Dark Mode)
        if (this.starsGroup && this.starsGroup.visible) {
            this.starsGroup.rotation.y += 0.00006;
            this.starsGroup.rotation.x += 0.00002;
        }

        // Daytime Sky Wisps & Sun Corona Drift (Light Mode)
        if (this.sunGroup && this.sunGroup.visible) {
            this.sunGroup.rotation.y += 0.00008;
            this.sunGroup.rotation.x += 0.00003;
        }

        // Pulsating Hardware Sensor Beacon Animation
        if (this.hardwarePulseSprite) {
            const pulseScale = 0.16 + (Math.sin(now * 0.006) + 1) * 0.025;
            this.hardwarePulseSprite.scale.set(pulseScale, pulseScale, 1);
            this.hardwarePulseSprite.material.opacity = 0.35 + Math.sin(now * 0.006) * 0.35;
        }
        if (this.hardwareSensorSprite && !this.hoveredSprite) {
            const sPulse = 0.16 + Math.sin(now * 0.004) * 0.008;
            this.hardwareSensorSprite.scale.set(sPulse, sPulse, 1);
        }

        if (this.earthGroup) {
            // Absolute NaN & Infinity Safeguards
            if (isNaN(this.targetRotation.x) || !isFinite(this.targetRotation.x)) this.targetRotation.x = 0.25;
            if (isNaN(this.targetRotation.y) || !isFinite(this.targetRotation.y)) this.targetRotation.y = -1.35;
            if (isNaN(this.currentRotation.x) || !isFinite(this.currentRotation.x)) this.currentRotation.x = 0.25;
            if (isNaN(this.currentRotation.y) || !isFinite(this.currentRotation.y)) this.currentRotation.y = -1.35;

            // Smooth natural inertia damping
            this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.07;
            this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.07;

            if (!this.isDragging && !this.hardwareSensorData) {
                this.targetRotation.y += 0.00045;
            }

            this.earthGroup.rotation.x = this.currentRotation.x;
            this.earthGroup.rotation.y = this.currentRotation.y;

            if (this.cloudsMesh) {
                this.cloudsMesh.rotation.y += 0.00018;
            }
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    },

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }
};

window.AURA_GLOBE = AURA_GLOBE;

