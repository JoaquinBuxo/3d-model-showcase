// 3D Model Showcase JavaScript
class ThreeDModelViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.autoRotate = true;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.createDefaultModel();
        this.setupEventListeners();
        this.animate();
        this.hideLoading();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
    }

    setupRenderer() {
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x6188ea, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, -10, -5);
        this.scene.add(rimLight);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.autoRotate;
        this.controls.autoRotateSpeed = 2;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
    }

    createDefaultModel() {
        // Create a beautiful geometric model as default
        const geometry = new THREE.DodecahedronGeometry(1, 1);
        
        // Create material with gradient-like effect
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x6188ea,
            metalness: 0.7,
            roughness: 0.2,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.scene.add(this.model);

        // Add inner glow effect
        const glowGeometry = new THREE.DodecahedronGeometry(0.95, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x6188ea,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.model.add(glowMesh);

        // Add wireframe overlay
        const wireframeGeometry = new THREE.DodecahedronGeometry(1.01, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        this.scene.add(wireframeMesh);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Auto rotate toggle
        document.getElementById('auto-rotate-btn').addEventListener('click', () => {
            this.toggleAutoRotate();
        });

        // Reset camera
        document.getElementById('reset-camera-btn').addEventListener('click', () => {
            this.resetCamera();
        });
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
        
        const btn = document.getElementById('auto-rotate-btn');
        btn.classList.toggle('active', this.autoRotate);
        btn.textContent = this.autoRotate ? 'Auto Rotate' : 'Manual Control';
    }

    resetCamera() {
        this.camera.position.set(0, 0, 5);
        this.controls.reset();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading');
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }, 1000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Manual rotation when auto-rotate is off
        if (this.model && this.autoRotate) {
            this.model.rotation.y += 0.005;
            this.model.rotation.x += 0.002;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ThreeDModelViewer();
});
