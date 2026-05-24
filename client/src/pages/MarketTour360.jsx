import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, MapPin, Zap, Maximize2 } from 'lucide-react'

// Stall hotspots: { id, label, phi (vertical angle 0-PI), theta (horizontal angle 0-2PI), info }
const HOTSPOTS = [
  {
    id: 's1',
    label: 'Stall #1',
    phi: 1.65,
    theta: 3.2,
    info: { name: 'Stall #1 - Sari-Sari Store', zone: 'Zone A', status: 'Available', size: '8 sqm', utility: 'Sub-metered', price: '₱2,800' }
  },
  {
    id: 's2',
    label: 'Stall #2',
    phi: 1.6,
    theta: 2.5,
    info: { name: 'Stall #2 - Meat Section', zone: 'Zone A', status: 'Occupied', size: '12 sqm', utility: 'Sub-metered', price: '₱3,500' }
  },
  {
    id: 's3',
    label: 'Stall #3',
    phi: 1.7,
    theta: 4.1,
    info: { name: 'Stall #3 - Dry Goods', zone: 'Zone B', status: 'Available', size: '10 sqm', utility: 'Sub-metered', price: '₱3,000' }
  }
]

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function MarketTour360() {
  const navigate = useNavigate()
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const frameRef = useRef(null)
  const isDragging = useRef(false)
  const [cursor, setCursor] = useState('grab')
  const lastPos = useRef({ x: 0, y: 0 })
  const spherical = useRef({ phi: Math.PI / 2, theta: 0 })
  const hotspotMeshes = useRef([])
  const [selectedStall, setSelectedStall] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [hint, setHint] = useState(true)

  useEffect(() => {
    let THREE
    let cancelled = false

    async function init() {
      // Dynamically import Three.js from CDN via script tag approach
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
      const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
      camera.position.set(0, 0, 0.001)
      cameraRef.current = camera

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(W, H)
      mountRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // 360 sphere — invert geometry so texture shows inside
      const geometry = new THREE.SphereGeometry(500, 64, 32)
      geometry.scale(-1, 1, 1)

      const texture = new THREE.TextureLoader().load(
        '/stall1.jpg',
        () => { if (!cancelled) setLoaded(true) }
      )
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      // Hotspot sprites
      hotspotMeshes.current = HOTSPOTS.map(spot => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 80
        const ctx = canvas.getContext('2d')

        // Pill background
        ctx.fillStyle = '#1a5c2a'
        roundRect(ctx, 0, 0, 256, 80, 16)
        ctx.fill()

        // Dot
        ctx.fillStyle = '#ff5c00'
        ctx.beginPath()
        ctx.arc(230, 20, 10, 0, Math.PI * 2)
        ctx.fill()

        // Text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(spot.label, 16, 52)

        const tex = new THREE.CanvasTexture(canvas)
        const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(40, 12, 1)
        sprite.userData = { spotId: spot.id }

        // Convert spherical to cartesian
        const r = 480
        const x = r * Math.sin(spot.phi) * Math.cos(spot.theta)
        const y = r * Math.cos(spot.phi)
        const z = r * Math.sin(spot.phi) * Math.sin(spot.theta)
        sprite.position.set(x, y, z)

        scene.add(sprite)
        return sprite
      })

      // Raycaster for clicks
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      function onClick(e) {
        const rect = renderer.domElement.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(hotspotMeshes.current)
        if (hits.length > 0) {
          const id = hits[0].object.userData.spotId
          const spot = HOTSPOTS.find(s => s.id === id)
          setSelectedStall(spot?.info || null)
        } else {
          setSelectedStall(null)
        }
      }

      renderer.domElement.addEventListener('click', onClick)
      renderer.domElement.addEventListener('touchend', onClick)

      // Update camera look direction from spherical coords
      function updateCamera() {
        const { phi, theta } = spherical.current
        const x = Math.sin(phi) * Math.cos(theta)
        const y = Math.cos(phi)
        const z = Math.sin(phi) * Math.sin(theta)
        camera.lookAt(x, y, z)
      }
      updateCamera()

      // Animate
      function animate() {
        frameRef.current = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()

      // Resize
      function onResize() {
        if (!mountRef.current) return
        const W2 = mountRef.current.clientWidth
        const H2 = mountRef.current.clientHeight
        camera.aspect = W2 / H2
        camera.updateProjectionMatrix()
        renderer.setSize(W2, H2)
      }
      window.addEventListener('resize', onResize)

      // Drag handlers — mouse
      function onMouseDown(e) {
        isDragging.current = true
        setCursor('grabbing')
        lastPos.current = { x: e.clientX, y: e.clientY }
        setHint(false)
      }
      function onMouseMove(e) {
        if (!isDragging.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }
        spherical.current.theta -= dx * 0.005
        spherical.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, spherical.current.phi + dy * 0.005))
        updateCamera()
      }
      function onMouseUp() { isDragging.current = false; setCursor('grab') }

      // Touch handlers
      function onTouchStart(e) {
        if (e.touches.length === 1) {
          isDragging.current = true
          setCursor('grabbing')
          lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
          setHint(false)
        }
      }
      function onTouchMove(e) {
        if (!isDragging.current || e.touches.length !== 1) return
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        spherical.current.theta -= dx * 0.005
        spherical.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, spherical.current.phi + dy * 0.005))
        updateCamera()
      }
      function onTouchEnd() { isDragging.current = false; setCursor('grab') }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true })
      renderer.domElement.addEventListener('touchend', onTouchEnd)

      // Cleanup stored for unmount
      renderer.domElement._cleanup = () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
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
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">

      {/* Three.js mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ cursor }} />

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4" />
          <p className="text-white text-sm font-semibold">Loading 360° Market Tour...</p>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-all cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-800" />
        </button>
        <div className="flex-1 bg-white/90 rounded-full px-4 py-2 flex items-center gap-2 shadow-md">
          <MapPin size={14} className="text-green-700 shrink-0" />
          <span className="text-xs font-bold text-gray-700 truncate">MyTalipapa Public Market · 360° Tour</span>
        </div>
        <div className="bg-white/90 rounded-full px-3 py-2 flex items-center gap-1 shadow-md cursor-pointer">
          <span className="text-xs font-bold text-gray-700">Zone A</span>
          <span className="text-gray-400 text-xs">▾</span>
        </div>
      </div>

      {/* Drag hint */}
      {hint && loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/50 rounded-2xl px-5 py-3 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <span className="text-xl">☝️</span> Drag to look around
            </div>
            <p className="text-white/70 text-[11px]">Tap the green stall labels to view details</p>
          </div>
        </div>
      )}

      {/* Stall info card (bottom sheet) */}
      {selectedStall && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6">
          <div className="bg-white rounded-3xl p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">{selectedStall.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-gray-100 text-gray-600">{selectedStall.zone}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    selectedStall.status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {selectedStall.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-gray-900">{selectedStall.price}</p>
                <p className="text-[10px] text-gray-400">per month</p>
              </div>
              <button onClick={() => setSelectedStall(null)} className="ml-2 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Maximize2 size={14} className="text-green-700 shrink-0" />
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase">Size</p>
                  <p className="text-xs font-bold text-gray-800">{selectedStall.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Zap size={14} className="text-green-700 shrink-0" />
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase">Utility</p>
                  <p className="text-xs font-bold text-gray-800">{selectedStall.utility}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <button
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 mb-2 cursor-pointer hover:opacity-90 transition-all"
              style={{ backgroundColor: '#e07b00' }}
            >
              ➤ Send Inquiry
            </button>
            <button
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all border-2 text-gray-800"
              style={{ borderColor: '#1a5c2a' }}
            >
              View Full Details
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 md:hidden"
        style={{ display: selectedStall ? 'none' : '' }}>
        <div className="grid grid-cols-5 h-16">
          {[
            { label: 'Home', icon: '🏠' },
            { label: 'Navigate', icon: '🧭', active: true },
            { label: 'Stalls', icon: '🏪' },
            { label: 'Applications', icon: '📋' },
            { label: 'Profile', icon: '👤' },
          ].map(tab => (
            <button key={tab.label} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer">
              <div className={`p-1.5 rounded-xl ${tab.active ? 'bg-orange-500' : ''}`}>
                <span className="text-base">{tab.icon}</span>
              </div>
              <span className={`text-[9px] font-bold ${tab.active ? 'text-gray-800' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}