import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  X,
  MapPin,
  Zap,
  Maximize2,
  RotateCcw,
  Compass as CompassIcon,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  HelpCircle,
  Send,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Store,
  Eye,
  EyeOff
} from 'lucide-react'

// Helper to programmatically generate details for all 142 stalls in the folder
const generateStalls = (category, numbers) => {
  const meatNames = [
    "Aling Nena's Pork & Beef", "Juan's Choice Cuts", "Fresh Poultry Center", 
    "Bulacan Specialty Longganisa", "Master Choice Pork", "Native Chicken Supply", 
    "Mang Tomas Meat Shop", "Prime Cuts Retailer", "Batangas Beef Stand", 
    "Hog & Cattle Fresh Meat", "Aling Belen's Pork Shop", "Choice Chicken Outlet"
  ];
  const fishNames = [
    "Dagupan Fresh Bangus", "Seafood Express", "Aling Marta's Fresh Catch", 
    "Deep Sea Fishery", "Shellfish & Squid Station", "Bataan Crab & Prawns", 
    "Dried Fish & Anchovies", "Shrimp & Lobsters Corner", "Squid & Octopus Hub",
    "Manila Bay Fresh Seafood", "Aling Cora's Tilapia Stand"
  ];
  const veggieNames = [
    "Baguio Veggies Fresh", "Organic Greens & Salads", "Onion, Garlic & Spices Center", 
    "Lola Elena's Pinakbet Veggies", "Highland Fresh Produce", "Garlic, Ginger & Chili Shop", 
    "Sweet Potato & Root Crops", "Benguet Cabbage Corner", "Fresh Tomato & Cucumber",
    "Native Corn & Squash", "Hydroponics Greens & Herbs", "Aling Rosa's Pumpkin Stand"
  ];

  const productsData = {
    meat: [
      ['Pork Belly (Liempo): ₱340/kg', 'Pork Chop: ₱310/kg', 'Ground Pork: ₱290/kg', 'Pork Ribs: ₱320/kg'],
      ['Beef Sirloin: ₱420/kg', 'Beef Shank (Bulalo): ₱380/kg', 'Ground Beef: ₱350/kg', 'Beef Brisket: ₱390/kg'],
      ['Whole Chicken: ₱180/kg', 'Chicken Breast: ₱210/kg', 'Chicken Wings: ₱190/kg', 'Chicken Drumsticks: ₱200/kg'],
      ['Garlic Longganisa: ₱150/pack', 'Sweet Longganisa: ₱150/pack', 'Tocino: ₱160/pack', 'Beef Tapa: ₱180/pack'],
      ['Pork Tenderloin: ₱350/kg', 'Pork Pata: ₱260/kg', 'Beef Caldereta Cuts: ₱370/kg']
    ],
    fish: [
      ['Dagupan Bangus: ₱180/kg', 'Boneless Bangus: ₱210/kg', 'Daing na Bangus: ₱190/kg'],
      ['Tiger Prawns: ₱580/kg', 'White Shrimp: ₱380/kg', 'Mud Crabs (Alimango): ₱650/kg'],
      ['Live Tilapia: ₱140/kg', 'Catfish (Hito): ₱160/kg', 'Galunggong: ₱180/kg'],
      ['Yellowfin Tuna: ₱380/kg', 'Salmon Steaks: ₱550/kg', 'Red Snapper (Maya-Maya): ₱320/kg'],
      ['Fresh Squid: ₱280/kg', 'Mussels (Tahong): ₱90/kg', 'Clams (Halaan): ₱120/kg']
    ],
    veggies: [
      ['Cabbage (Repolyo): ₱70/kg', 'Carrots: ₱80/kg', 'Potato (Patatas): ₱90/kg', 'Broccoli: ₱150/kg'],
      ['Lettuce: ₱120/kg', 'Cherry Tomatoes: ₱140/kg', 'Kale: ₱180/kg', 'Spinach: ₱100/kg'],
      ['Red Onion: ₱120/kg', 'White Onion: ₱150/kg', 'Garlic: ₱130/kg', 'Ginger: ₱110/kg'],
      ['Eggplant: ₱60/kg', 'Ampalaya (Bittergourd): ₱80/kg', 'Squash (Kalabasa): ₱40/kg', 'Okra: ₱50/kg'],
      ['Cauliflower: ₱120/kg', 'Sayote: ₱40/kg', 'Bell Peppers: ₱160/kg', 'Celery: ₱100/kg']
    ]
  };

  const namePool = category === 'meat' ? meatNames : (category === 'fish' ? fishNames : veggieNames);
  const productsPool = productsData[category];

  return numbers.map((num, index) => {
    const name = namePool[index % namePool.length];
    const products = productsPool[index % productsPool.length];
    
    // Water Access distance
    const isNearWater = num % 3 === 0;
    const waterAccess = isNearWater ? 'Near CR (Easy Access)' : 'Far from CR (Fetching Required)';
    
    // Rental Price (depends on water access, around 12k - 18k, average 15k)
    const priceVal = 12000 + (isNearWater ? 1000 : 0) + (num % 3) * 1000;
    const price = `₱${priceVal.toLocaleString()}`;
    
    const status = num % 3 === 0 ? 'Occupied' : 'Available';
    const electricitySetup = num % 2 === 0 ? 'Sub-metered' : 'Shared Meter';
    const utilities = `Electricity (Paid by Renter - ${electricitySetup}) · Water (Free)`;
    const zone = `Zone ${String.fromCharCode(65 + (num % 4))}`; // Zone A, B, C, D

    return {
      id: String(num),
      name: `Stall #${num} - ${name}`,
      price,
      status,
      utilities,
      electricitySetup,
      waterAccess,
      zone,
      products
    };
  });
};

const SECTIONS = {
  meat: {
    id: 'meat',
    name: 'Meat Section',
    icon: '🥩',
    bgTheme: 'from-red-500/20 to-transparent',
    accentColor: '#ef4444',
    stalls: generateStalls('meat', [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      51, 52, 53, 54, 55, 56
    ])
  },
  fish: {
    id: 'fish',
    name: 'Fish Section',
    icon: '🐟',
    bgTheme: 'from-blue-500/20 to-transparent',
    accentColor: '#3b82f6',
    stalls: generateStalls('fish', [
      20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
      57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75
    ])
  },
  veggies: {
    id: 'veggies',
    name: 'Veggies Section',
    icon: '🥬',
    bgTheme: 'from-green-500/20 to-transparent',
    accentColor: '#10b981',
    stalls: generateStalls('veggies', [
      40,
      76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87,
      91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
      101, 102, 103, 104,
      107, 108, 109, 110, 111, 112,
      114, 115, 116, 117, 118, 119, 120,
      121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
      131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
      141, 142, 143, 144, 145, 146, 147, 148, 149
    ])
  }
}

export default function MarketTour360() {
  const navigate = useNavigate()

  // Tab State
  const [activeSectionKey, setActiveSectionKey] = useState('meat')
  const activeSection = SECTIONS[activeSectionKey]

  // Stall Selection State
  const [stallIndex, setStallIndex] = useState(0)
  const currentStall = activeSection.stalls[stallIndex] || activeSection.stalls[0]

  // Interactive UI State
  const [selectedStall, setSelectedStall] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [uiVisible, setUiVisible] = useState(true)

  // Floating Tooltip State
  const [hoveredHotspot, setHoveredHotspot] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Three.js Refs
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const materialRef = useRef(null)
  const frameRef = useRef(null)
  const isDragging = useRef(false)
  const [cursor, setCursor] = useState('grab')
  const lastPos = useRef({ x: 0, y: 0 })
  const spherical = useRef({ phi: Math.PI / 2, theta: 0 })
  const hotspotMeshes = useRef([])
  const [compassAngle, setCompassAngle] = useState(0)

  // Sync details sheet when stall changes
  useEffect(() => {
    setSelectedStall(currentStall)
  }, [currentStall])

  // Track active references to prevent stale closures in events
  const stateRef = useRef({ activeSectionKey, stallIndex, currentStall })
  useEffect(() => {
    stateRef.current = { activeSectionKey, stallIndex, currentStall }
  }, [activeSectionKey, stallIndex, currentStall])

  // Reset indices when switching sections
  const selectSection = (key) => {
    if (transitioning) return
    setActiveSectionKey(key)
    setStallIndex(0)
    triggerSceneTransition(`/export360/stall${SECTIONS[key].stalls[0].id}.jpg`)
  }

  const handleNextStall = () => {
    if (transitioning) return
    const stalls = SECTIONS[stateRef.current.activeSectionKey].stalls
    const nextIdx = (stateRef.current.stallIndex + 1) % stalls.length
    setStallIndex(nextIdx)
    triggerSceneTransition(`/export360/stall${stalls[nextIdx].id}.jpg`)
  }

  const handlePrevStall = () => {
    if (transitioning) return
    const stalls = SECTIONS[stateRef.current.activeSectionKey].stalls
    const prevIdx = (stateRef.current.stallIndex - 1 + stalls.length) % stalls.length
    setStallIndex(prevIdx)
    triggerSceneTransition(`/export360/stall${stalls[prevIdx].id}.jpg`)
  }

  // Pre-load texture helper with percentage progress simulation
  const triggerSceneTransition = (texturePath) => {
    setTransitioning(true)
    setLoaded(false)
    setLoadingProgress(10)

    // Simulate progress while loading
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 80) {
          clearInterval(interval)
          return 80
        }
        return prev + 15
      })
    }, 100)

    setTimeout(() => {
      if (!window.THREE || !materialRef.current || !sceneRef.current) {
        clearInterval(interval)
        setLoaded(true)
        setTransitioning(false)
        return
      }

      const THREE = window.THREE
      new THREE.TextureLoader().load(
        texturePath,
        (tex) => {
          clearInterval(interval)
          setLoadingProgress(100)
          setTimeout(() => {
            materialRef.current.map = tex
            materialRef.current.needsUpdate = true

            // Recreate Hotspots in 3D Space
            recreateHotspots(sceneRef.current, stateRef.current.currentStall, THREE)

            // Reset camera viewing angle slightly to default
            spherical.current.phi = Math.PI / 2
            spherical.current.theta = 0

            setLoaded(true)
            setTransitioning(false)
          }, 150)
        },
        null,
        (err) => {
          console.error('Failed to load panorama', err)
          clearInterval(interval)
          setLoaded(true)
          setTransitioning(false)
        }
      )
    }, 300)
  }

  // Helper to create beautiful glowing canvas textures for hotspots
  const createHotspotTexture = (THREE, type, label) => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    // Clean drawing surface
    ctx.clearRect(0, 0, 128, 128)

    // Define colors based on type
    const color = type === 'info' ? '#e07b00' : '#1a5c2a'
    const glowColor = type === 'info' ? 'rgba(224, 123, 0, ' : 'rgba(26, 92, 42, '

    // Radial outer glow
    const grad = ctx.createRadialGradient(64, 64, 15, 64, 64, 55)
    grad.addColorStop(0, glowColor + '1)')
    grad.addColorStop(0.5, glowColor + '0.4)')
    grad.addColorStop(1, glowColor + '0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(64, 64, 55, 0, Math.PI * 2)
    ctx.fill()

    // Inner core solid circle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(64, 64, 28, 0, Math.PI * 2)
    ctx.fill()

    // Border circle
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(64, 64, 28, 0, Math.PI * 2)
    ctx.stroke()

    // Center icon/symbol
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (type === 'info') {
      ctx.font = 'bold italic 36px Georgia, serif'
      ctx.fillText('i', 64, 61)
    } else {
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText(label === 'next' ? '➔' : '◀', 64, 62)
    }

    return new THREE.CanvasTexture(canvas)
  }

  // Re-populate the 3D scene with relevant Hotspots
  const recreateHotspots = (scene, stall, THREE) => {
    // Clear old sprites
    hotspotMeshes.current.forEach((mesh) => scene.remove(mesh))
    hotspotMeshes.current = []

    const spotsData = []

    // 1. Navigation Hotspot: Next Stall
    spotsData.push({
      type: 'next',
      label: 'Go to Next Stall',
      phi: 1.7,
      theta: 1.1,
      tex: createHotspotTexture(THREE, 'nav', 'next')
    })

    // 2. Navigation Hotspot: Previous Stall
    spotsData.push({
      type: 'prev',
      label: 'Go to Previous Stall',
      phi: 1.7,
      theta: -1.1,
      tex: createHotspotTexture(THREE, 'nav', 'prev')
    })

    // No Info Hotspot needed for 360-only viewer

    // Add them as Sprites in 3D Space
    hotspotMeshes.current = spotsData.map((data) => {
      const mat = new THREE.SpriteMaterial({ map: data.tex, depthTest: false })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(30, 30, 1)
      sprite.userData = { type: data.type, label: data.label }

      // Spherical to Cartesian Coordinates conversion
      const r = 350
      const x = r * Math.sin(data.phi) * Math.cos(data.theta)
      const y = r * Math.cos(data.phi)
      const z = r * Math.sin(data.phi) * Math.sin(data.theta)
      sprite.position.set(x, y, z)

      scene.add(sprite)
      return sprite
    })
  }

  // Main Three.js Init
  useEffect(() => {
    let THREE
    let cancelled = false

    async function init() {
      if (!window.THREE) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
          s.onload = resolve
          s.onerror = reject
          document.head.appendChild(s)
        })
      }
      if (cancelled) return
      THREE = window.THREE

      const W = mountRef.current.clientWidth
      const H = mountRef.current.clientHeight

      // Scene
      const scene = new THREE.Scene()
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000)
      camera.position.set(0, 0, 0.001)
      cameraRef.current = camera

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      mountRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // 360 Skybox Sphere Geometry
      const geometry = new THREE.SphereGeometry(500, 64, 40)
      geometry.scale(-1, 1, 1)

      // Initial Texture Loading
      setLoadingProgress(25)
      const texture = new THREE.TextureLoader().load(
        `/export360/stall${stateRef.current.currentStall.id}.jpg`,
        () => {
          setLoadingProgress(100)
          setTimeout(() => {
            if (!cancelled) setLoaded(true)
          }, 200)
        }
      )
      const material = new THREE.MeshBasicMaterial({ map: texture })
      materialRef.current = material

      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      // Draw initial hotspots
      recreateHotspots(scene, stateRef.current.currentStall, THREE)

      // Raycaster for interactions
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(hotspotMeshes.current)

        if (hits.length > 0) {
          const uData = hits[0].object.userData
          if (uData.type === 'next') {
            handleNextStall()
          } else if (uData.type === 'prev') {
            handlePrevStall()
          }
        }
      }

      renderer.domElement.addEventListener('click', onPointerDown)
      renderer.domElement.addEventListener('touchend', onPointerDown)

      // Track hovering to show tooltips & change cursors
      function onPointerMove(e) {
        const rect = renderer.domElement.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        // Track screen mouse positions for tooltips
        setMousePos({ x: clientX, y: clientY })

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(hotspotMeshes.current)

        if (hits.length > 0) {
          const hovered = hits[0].object.userData
          setHoveredHotspot(hovered)
          if (!isDragging.current) setCursor('pointer')
        } else {
          setHoveredHotspot(null)
          if (!isDragging.current) setCursor('grab')
        }
      }

      window.addEventListener('mousemove', onPointerMove)

      // Camera Look-At Logic
      function updateCamera() {
        const { phi, theta } = spherical.current
        const x = Math.sin(phi) * Math.cos(theta)
        const y = Math.cos(phi)
        const z = Math.sin(phi) * Math.sin(theta)
        camera.lookAt(x, y, z)

        // Sync compass rotation
        const deg = Math.round((theta * 180) / Math.PI) % 360
        setCompassAngle(-deg)
      }
      updateCamera()

      // Animation Loop
      function animate() {
        frameRef.current = requestAnimationFrame(animate)

        // Slowly rotate camera if Auto-Rotate is active
        if (autoRotate && !isDragging.current) {
          spherical.current.theta += 0.0018
          updateCamera()
        }

        renderer.render(scene, camera)
      }
      animate()

      // Resize Handler
      function onResize() {
        if (!mountRef.current) return
        const W2 = mountRef.current.clientWidth
        const H2 = mountRef.current.clientHeight
        camera.aspect = W2 / H2
        camera.updateProjectionMatrix()
        renderer.setSize(W2, H2)
      }
      window.addEventListener('resize', onResize)

      // Drag Handlers
      function onMouseDown(e) {
        isDragging.current = true
        setCursor('grabbing')
        lastPos.current = { x: e.clientX, y: e.clientY }
      }

      function onMouseMove(e) {
        if (!isDragging.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }

        spherical.current.theta -= dx * 0.003
        spherical.current.phi = Math.max(0.4, Math.min(Math.PI - 0.4, spherical.current.phi + dy * 0.003))
        updateCamera()
      }

      function onMouseUp() {
        isDragging.current = false
        setCursor('grab')
      }

      // Touch handlers
      function onTouchStart(e) {
        if (e.touches.length === 1) {
          isDragging.current = true
          setCursor('grabbing')
          lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
      }

      function onTouchMove(e) {
        if (!isDragging.current || e.touches.length !== 1) return
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }

        spherical.current.theta -= dx * 0.004
        spherical.current.phi = Math.max(0.4, Math.min(Math.PI - 0.4, spherical.current.phi + dy * 0.004))
        updateCamera()
      }

      function onTouchEnd() {
        isDragging.current = false
        setCursor('grab')
      }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true })
      renderer.domElement.addEventListener('touchend', onTouchEnd)

      // Cleanup
      renderer.domElement._cleanup = () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousemove', onPointerMove)
        renderer.domElement.removeEventListener('click', onPointerDown)
        renderer.domElement.removeEventListener('touchend', onPointerDown)
      }
    }

    init().catch(console.error)

    return () => {
      cancelled = true
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (rendererRef.current) {
        if (rendererRef.current.domElement._cleanup) rendererRef.current.domElement._cleanup()
        rendererRef.current.domElement.remove()
        rendererRef.current.dispose()
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = ''
      }
    }
  }, [autoRotate]) // Re-run when auto-rotate state changes

  // Zoom In Handler
  const zoomIn = () => {
    if (!cameraRef.current) return
    cameraRef.current.fov = Math.max(30, cameraRef.current.fov - 8)
    cameraRef.current.updateProjectionMatrix()
  }

  // Zoom Out Handler
  const zoomOut = () => {
    if (!cameraRef.current) return
    cameraRef.current.fov = Math.min(100, cameraRef.current.fov + 8)
    cameraRef.current.updateProjectionMatrix()
  }

  // Reset Camera angle
  const resetCamera = () => {
    spherical.current.phi = Math.PI / 2
    spherical.current.theta = 0
    if (cameraRef.current) {
      cameraRef.current.fov = 70
      cameraRef.current.updateProjectionMatrix()
    }
  }

  // No inquiry handling needed

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      {/* 360 ThreeJS Viewer Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ cursor }} />

      {/* Floating SHOW CONTROLS Toggle Button (Visible ONLY when UI is hidden) */}
      {!uiVisible && (
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={() => setUiVisible(true)}
            className="px-4 py-2.5 rounded-xl bg-[#e07b00] hover:bg-[#b86500] text-white shadow-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer animate-bounce"
            style={{ animationDuration: '3s' }}
            title="Show UI Overlay Controls"
          >
            <Eye size={15} />
            <span>Show Controls</span>
          </button>
        </div>
      )}

      {/* Screen Fade Transition Overlay (prevents jarring cuts) */}
      <div
        className={`absolute inset-0 bg-black z-10 transition-opacity duration-300 pointer-events-none ${
          transitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Preloading HUD Progress Bar Overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
          <div className="relative flex items-center justify-center mb-5">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#1a5c2a]" />
            <span className="absolute text-xs font-bold text-[#1a5c2a]">{loadingProgress}%</span>
          </div>
          <p className="text-[#1a5c2a] text-sm font-semibold tracking-wider uppercase animate-pulse">
            Preloading 360° Panorama
          </p>
          <div className="w-48 bg-gray-800 h-1 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[#1a5c2a] h-full transition-all duration-150"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Hover Tooltip for Hotspots */}
      {hoveredHotspot && loaded && uiVisible && (
        <div
          className="absolute z-40 bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl pointer-events-none shadow-xl border border-black/10 -translate-x-1/2 -translate-y-12 backdrop-blur-sm transition-all"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          ➔ {hoveredHotspot.label}
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none transition-all duration-300 ${uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'}`}>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => { window.location.href = '/renter/dashboard' }}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all text-slate-800 border border-black/10 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-lg border border-black/10 text-slate-800">
            <MapPin size={16} className="text-[#1a5c2a] shrink-0" />
            <div>
              <span className="text-xs font-black tracking-wide block uppercase text-[#1a5c2a]">MyTalipapa Public Market</span>
              <span className="text-[10px] text-slate-500 font-semibold leading-none">Virtual 360° Stall Walkthrough</span>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setUiVisible(false)}
            className="px-4.5 py-2.5 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 border border-black/10 text-xs font-black flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
            title="Hide all overlay buttons and panels"
          >
            <EyeOff size={15} />
            <span>Hide Controls</span>
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all text-slate-800 border border-black/10 cursor-pointer"
            title="Help Guide"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* FLOATING SECTION TAB SELECTOR (Top Center) */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-300 ${uiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full flex gap-1 shadow-2xl border border-black/10">
          {Object.values(SECTIONS).map((sect) => {
            const isActive = sect.id === activeSectionKey
            return (
              <button
                key={sect.id}
                onClick={() => selectSection(sect.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-[#1a5c2a] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                <span>{sect.icon}</span>
                <span>{sect.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FLOATING SIDE HUD CONTROLS (Right Side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Compass Overlay Dial */}
        <div className={`w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-black/10 shadow-2xl relative overflow-hidden transition-all duration-300 ${uiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
          <div
            className="w-10 h-10 flex items-center justify-center transition-transform duration-100"
            style={{ transform: `rotate(${compassAngle}deg)` }}
          >
            <CompassIcon size={24} className="text-[#1a5c2a]" />
          </div>
          <div className="absolute top-0.5 text-[8px] font-black text-[#1a5c2a]">N</div>
        </div>

        {/* Action Button Pad */}
        <div className={`bg-white/90 backdrop-blur-md p-2 rounded-3xl flex flex-col gap-2.5 border border-black/10 shadow-2xl transition-all duration-300 ${uiVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              autoRotate ? 'bg-[#1a5c2a] text-white animate-pulse' : 'bg-black/5 text-slate-800 hover:bg-black/10'
            }`}
            title="Toggle Auto-Rotate"
          >
            {autoRotate ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={zoomIn}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetCamera}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => console.error(err))
              } else {
                document.exitFullscreen()
              }
            }}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="Fullscreen Toggle"
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </div>

      {/* BOTTOM CENTER STALL QUICK SWITCHER CONTROLS */}
      <div className={`absolute bottom-[240px] left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
        <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-4 shadow-2xl border border-black/10 text-slate-800">
          <button
            onClick={handlePrevStall}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Previous Stall"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center min-w-[120px]">
            <p className="text-[10px] text-[#e07b00] font-extrabold uppercase tracking-widest leading-none mb-0.5">
              {activeSection.name}
            </p>
            <p className="text-xs font-bold text-slate-800 leading-none">
              Stall {stallIndex + 1} of {activeSection.stalls.length}
            </p>
          </div>
          <button
            onClick={handleNextStall}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-slate-800 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            title="Next Stall"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* STALL DETAILS DRAWER (Bottom Panel) */}
      {selectedStall && uiVisible && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 bg-gradient-to-t from-white/90 via-white/50 to-transparent pt-10">
          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-black/10 shadow-2xl flex flex-col md:flex-row gap-5 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className={`absolute -right-32 -bottom-32 w-64 h-64 rounded-full bg-gradient-to-br ${activeSection.bgTheme} blur-3xl opacity-40 pointer-events-none`} />

            {/* Main Info */}
            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/10 text-slate-800">
                  {selectedStall.zone}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 truncate leading-tight">
                {selectedStall.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5">
                <span>Category: {activeSection.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">Utilities: {selectedStall.utilities}</span>
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2 bg-black/5 rounded-2xl p-3 border border-black/5 hover:bg-black/10 transition-all">
                  <Zap size={15} className="text-[#1a5c2a] shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Electricity</p>
                    <p className="text-xs font-bold text-slate-800">{selectedStall.electricitySetup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/5 rounded-2xl p-3 border border-black/5 hover:bg-black/10 transition-all">
                  <MapPin size={15} className="text-[#1a5c2a] shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Water Access</p>
                    <p className="text-xs font-bold text-slate-800">{selectedStall.waterAccess}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details Block */}
            <div className="md:w-52 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-black/10 pt-4 md:pt-0 md:pl-5 z-10">
              <div>
                <p className="text-2xl font-black text-[#e07b00] leading-none">
                  {selectedStall.price}
                </p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">per month (negotiable)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP GUIDE OVERLAY MODAL */}
      {helpOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-black/10 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-slate-900 mb-1.5 flex items-center gap-2">
              <span>🧭</span> 360° Virtual Tour Guide
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Explore the public market spaces virtually from your device. Inspect stalls and compare rates instantly.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-black/5 p-3 rounded-2xl border border-black/5">
                <span className="text-xl">☝️</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Look Around</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Drag with mouse or swipe with touch in any direction to turn the camera view.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-black/5 p-3 rounded-2xl border border-black/5">
                <span className="text-xl">🔍</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Zoom In / Out</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Use scroll wheel or float buttons (+ / -) to change viewing field-of-view.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-black/5 p-3 rounded-2xl border border-black/5">
                <span className="text-xl">🟢</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dynamic Hotspots</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Tap hotspots to walk to adjacent stalls virtually.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="w-full mt-6 py-3 rounded-xl bg-[#1a5c2a] hover:bg-[#14451f] text-white font-black text-xs transition-all cursor-pointer"
            >
              Got It, Let's Tour!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}