import * as THREE from "https://cdn.skypack.dev/three@0.132.2"
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js"

class DwarfViewer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) return

    this.options = {
      modelPath: options.modelPath || "/models/dwarf.glb",
      autoRotate: options.autoRotate !== false,
      scale: options.scale || 1,
      cameraDistance: options.cameraDistance || 5,
      ...options,
    }

    this.autoRotateSpeed = 0.01

    this.init()
    this.loadModel()
    this.addOrbitControls()
    this.animate()
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0x0e121a) // Match the page background

    // Camera setup
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    this.camera.position.set(0, 2, this.options.cameraDistance)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0) // Fully transparent
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x6366f1, 2.5)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x6366f1, 0.5, 100)
    pointLight.position.set(-5, 5, 5)
    this.scene.add(pointLight)

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize())
  }

  addOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.canvas)

    // Configure OrbitControls
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.01
    this.controls.enableZoom = true
    this.controls.enableRotate = true
    this.controls.enablePan = false

    // Set zoom limits
    this.controls.minDistance = 2
    this.controls.maxDistance = 10

    // Set rotation limits
    this.controls.maxPolarAngle = Math.PI
    this.controls.minPolarAngle = 0

    // Auto-rotate settings
    this.controls.autoRotate = this.options.autoRotate
    this.controls.autoRotateSpeed = 2.0

    // Set initial camera position
    this.camera.position.set(0, 2, this.options.cameraDistance)
    this.controls.target.set(0, 0, 0)
    this.controls.update()

    // Set cursor style
    this.canvas.style.cursor = "grab"
  }

  loadModel() {
    const loader = new GLTFLoader()

    loader.load(
      this.options.modelPath,
      (gltf) => {
        this.model = gltf.scene

        // Scale and position the model
        this.model.scale.setScalar(this.options.scale)
        this.model.position.y = -1

        // Enable shadows
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        this.scene.add(this.model)

        // Center the camera on the model
        const box = new THREE.Box3().setFromObject(this.model)
        const center = box.getCenter(new THREE.Vector3())
        this.camera.lookAt(center)
      },
      (progress) => {
        console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
      },
      (error) => {
        console.error("Error loading dwarf model:", error)
        // Fallback: create a simple cube as placeholder
        this.createFallbackModel()
      },
    )
  }

  createFallbackModel() {
    const geometry = new THREE.BoxGeometry(1, 1.5, 0.8)
    const material = new THREE.MeshPhongMaterial({ color: 0x6366f1 })
    this.model = new THREE.Mesh(geometry, material)
    this.model.position.y = -0.5
    this.model.castShadow = true
    this.model.receiveShadow = true
    this.scene.add(this.model)
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    if (this.controls) {
      this.controls.update()
    }

    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
  }
}

// Initialize dwarf viewers when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const heroCanvas = document.getElementById("frame")
  if (heroCanvas) {
    new DwarfViewer("frame", {
      modelPath: "/models/dwarf.glb",
      scale: 2.4,
      cameraDistance: 3,
      autoRotate: true,
    })
  }

  const cardCanvas = document.querySelector(".rounded-circle-icon canvas#frame")
  if (cardCanvas) {
    cardCanvas.id = "card-frame" // Give unique ID
    new DwarfViewer("card-frame", {
      modelPath: "/models/dwarf.glb",
      scale: 1.5,
      cameraDistance: 3,
      autoRotate: true,
    })
  }
})
