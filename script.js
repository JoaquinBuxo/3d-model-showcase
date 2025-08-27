// Simple 3D Fashion Viewer - Auto Rotate Only
class ThreeDModelViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.rotationSpeed = 0.005;
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.loadGLBModel();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Transparent background to match the website design
        this.scene.background = null;
        
        // Add subtle fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    }

    setupCamera() {
        const canvas = document.getElementById('three-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.camera = new THREE.PerspectiveCamera(
            50,
            rect.width / rect.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 3);
    }

    setupRenderer() {
        const canvas = document.getElementById('three-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.setClearColor(0x000000, 0);
    }

    setupLights() {
        // Much brighter ambient light for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        // Main directional light - brighter and warmer
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Front fill light - much brighter
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
        fillLight.position.set(0, 5, 10);
        this.scene.add(fillLight);

        // Side rim lights for better definition
        const rimLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight1.position.set(-10, 5, 0);
        this.scene.add(rimLight1);
        
        const rimLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight2.position.set(10, 5, 0);
        this.scene.add(rimLight2);
        
        // Bottom up light to eliminate dark areas
        const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
        bottomLight.position.set(0, -5, 0);
        this.scene.add(bottomLight);
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

    loadGLBModel() {
        const loader = new THREE.GLTFLoader();
        const loadingElement = document.getElementById('loading');
        
        loader.load(
            './vestido1.glb',
            (gltf) => {
                console.log('Model loaded successfully:', gltf);
                
                this.model = gltf.scene;
                
                // Scale and position the model - much bigger!
                this.model.scale.setScalar(4);
                this.model.position.set(0, -2, 0);
                
                // Enable shadows for all meshes
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Enhance material properties
                        if (child.material) {
                            child.material.envMapIntensity = 0.8;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                // Set up animations if any
                if (gltf.animations && gltf.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.model);
                    gltf.animations.forEach((clip) => {
                        this.mixer.clipAction(clip).play();
                    });
                }
                
                this.scene.add(this.model);
                this.hideLoading();
                
                // Adjust camera to fit the model
                this.fitCameraToModel();
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100);
                console.log(`Loading progress: ${percent.toFixed(1)}%`);
            },
            (error) => {
                console.error('Error loading GLB model:', error);
                console.log('Falling back to default model...');
                this.createDefaultModel();
                this.hideLoading();
            }
        );
    }
    
    createDefaultModel() {
        // Fallback model if GLB fails to load
        const geometry = new THREE.ConeGeometry(1, 2, 8);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x1f51ff,
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 0.8,
            clearcoatRoughness: 0.2,
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);
    }
    
    fitCameraToModel() {
        if (!this.model) return;
        
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.2; // Less padding for bigger appearance
        
        this.camera.position.set(center.x, center.y, center.z + cameraZ);
        this.camera.lookAt(center);
    }

    setupEventListeners() {
        // Window resize only
        window.addEventListener('resize', () => this.onWindowResize());
    }


    onWindowResize() {
        const canvas = document.getElementById('three-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
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
        
        // Simple auto-rotation
        if (this.model) {
            this.model.rotation.y += this.rotationSpeed;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Countdown functionality
class CountdownTimer {
    constructor() {
        // Set the countdown to a fixed future date (September 5, 2025)
        // This way the countdown is consistent for everyone and actually counts down
        const targetDate = new Date('2025-09-05T00:00:00');
        this.countDownDate = targetDate.getTime();
        this.startCountdown();
    }
    
    startCountdown() {
        // Update the countdown every 1 second
        this.timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = this.countDownDate - now;
            
            // Time calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Display the countdown
            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
            
            // If the countdown is finished
            if (distance < 0) {
                clearInterval(this.timer);
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                
                // You could show a message here when countdown finishes
                console.log('¡El regalo ha llegado!');
            }
        }, 1000);
    }
}

// Spectacular Confetti Explosion Animation
function createConfettiExplosion() {
    // Check if confetti library is loaded
    if (typeof confetti === 'undefined') {
        console.warn('Canvas-confetti library not loaded');
        return;
    }

    // Multiple explosion bursts for maximum impact!
    const duration = 6000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 1000,
        colors: ['#ff6b9d', '#ffd700', '#ff4757', '#00d2d3', '#3742fa', '#2ed573', '#ff9ff3', '#f9ca24']
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // First explosion - Center burst
    confetti({
        ...defaults,
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.5 }
    });

    // Second explosion - Left side
    setTimeout(() => {
        confetti({
            ...defaults,
            particleCount: 100,
            spread: 80,
            origin: { x: 0.3, y: 0.4 }
        });
    }, 300);

    // Third explosion - Right side  
    setTimeout(() => {
        confetti({
            ...defaults,
            particleCount: 100,
            spread: 80,
            origin: { x: 0.7, y: 0.4 }
        });
    }, 600);

    // Continuous random bursts
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Random position bursts
        confetti({
            ...defaults,
            particleCount,
            origin: { 
                x: randomInRange(0.2, 0.8), 
                y: randomInRange(0.3, 0.7) 
            }
        });
    }, 400);

    // Final big explosion
    setTimeout(() => {
        confetti({
            ...defaults,
            particleCount: 200,
            spread: 160,
            startVelocity: 45,
            origin: { x: 0.5, y: 0.6 }
        });
    }, 2000);
}

// Trigger confetti explosion on page load
function startPageAnimation() {
    // Small delay to let the page settle
    setTimeout(() => {
        createConfettiExplosion();
    }, 1000);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ThreeDModelViewer();
    new CountdownTimer();
    startPageAnimation();
});
