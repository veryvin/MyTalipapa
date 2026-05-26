import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Compass, Info, HelpCircle, Navigation, RotateCw, Check, QrCode, X } from "lucide-react";
import mapImage from "../../images/map.png";

// --- Custom Stall Data aligned with map.png layout coordinates (800x450) ---
const STALLS_AR = [
  // Veggies Section (Green) - Bottom Right Blocks
  { id: "042", zone: "Zone C", x: 445, y: 295 },
  { id: "077", zone: "Zone B", x: 680, y: 330 },
  { id: "114", zone: "Zone D", x: 520, y: 270 },
  
  // Meat Section (Red/Brown) - Left & Top-Middle Blocks
  { id: "012", zone: "Zone A", x: 110, y: 140 },
  { id: "031", zone: "Zone B", x: 110, y: 360 },
  { id: "045", zone: "Zone B", x: 180, y: 270 },
  
  // Seafood Section (Blue) - Top Middle-Right Blocks
  { id: "112", zone: "Zone C", x: 215, y: 180 },
  { id: "089", zone: "Zone D", x: 590, y: 100 },
  { id: "057", zone: "Zone A", x: 470, y: 90 }
];

// --- Mock QR Code Calibration Anchors ---
const QR_ANCHORS = [
  { id: "entrance", label: "Main Entrance Poster", x: 400, y: 410, zone: "Entrance" },
  { id: "central_aisle", label: "Central Aisle Pathway Poster", x: 400, y: 225, zone: "Central Pathway" },
  { id: "meat_pillar", label: "Meat Section Pillar A", x: 140, y: 140, zone: "Meat Section" },
  { id: "seafood_column", label: "Seafood Section Column B", x: 290, y: 180, zone: "Seafood Section" },
  { id: "veggies_pillar", label: "Vegetables Section Pillar C", x: 520, y: 320, zone: "Veggies Section" }
];

export default function ArFinder({ onBack }) {
  const [selectedStallId, setSelectedStallId] = useState("042");
  const currentStall = STALLS_AR.find(s => s.id === selectedStallId) || STALLS_AR[0];

  // User simulated coordinates inside grid
  const [userX, setUserX] = useState(400); // Default start at entrance (400, 410)
  const [userY, setUserY] = useState(410);
  const [heading, setHeading] = useState(0); // Heading in degrees (0 = North/Up)

  // Camera & Sensor state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showRadar, setShowRadar] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasOrientation, setHasOrientation] = useState(false);

  // QR Scanning Simulation State
  const [showScanner, setShowScanner] = useState(false);
  const [activeScannerTab, setActiveScannerTab] = useState("simulate");
  const [toastMsg, setToastMsg] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  // --- Toast notification auto-dismiss ---
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // --- Start/Stop Camera Feed ---
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera failed to start:", err);
      setCameraError("Camera stream unavailable. Running in high-fidelity simulated AR view.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // --- Handle Device Compass/Orientation sensors ---
  useEffect(() => {
    startCamera();

    const handleOrientation = (e) => {
      let compassHeading = e.webkitCompassHeading;
      if (compassHeading === undefined) {
        compassHeading = 360 - e.alpha;
      }
      
      if (compassHeading !== undefined) {
        setHeading(Math.round(compassHeading));
        setHasOrientation(true);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      stopCamera();
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const requestCompassPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          setHasOrientation(true);
        } else {
          alert("Sensor permission denied. Please use manual rotation controls.");
        }
      } catch (err) {
        console.error("Sensor request error:", err);
      }
    } else {
      alert("Device orientation permissions not required or unsupported on this browser.");
    }
  };

  // --- Toggle Fullscreen ---
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // --- Aisle Navigation Pathing ---
  const X_CORRIDORS = [150, 305, 490, 640];

  const getPathPoints = () => {
    const points = [];
    points.push({ x: userX, y: userY }); // Start at user location
    
    const stallX = currentStall.x;
    const stallY = currentStall.y;
    
    // 1. Get the vertical aisle closest to the target stall
    const stallCorridorX = X_CORRIDORS.reduce((prev, curr) => 
      Math.abs(curr - stallX) < Math.abs(prev - stallX) ? curr : prev
    );
    
    // 2. Find the user vertical aisle that minimizes horizontal walking distance
    let bestUserCorridorX = X_CORRIDORS[0];
    let minDistance = Infinity;
    
    for (const cx of X_CORRIDORS) {
      const dist = Math.abs(cx - userX) + Math.abs(stallCorridorX - cx);
      if (dist < minDistance) {
        minDistance = dist;
        bestUserCorridorX = cx;
      }
    }
    
    // 3. Construct the path points
    if (bestUserCorridorX === stallCorridorX) {
      // Same corridor routing (no need to go to central aisle unless we are already there)
      if (userX !== bestUserCorridorX) {
        points.push({ x: bestUserCorridorX, y: userY });
      }
      if (userY !== stallY) {
        points.push({ x: bestUserCorridorX, y: stallY });
      }
    } else {
      // Different corridor routing (must transition via central pathway y=225)
      if (userX !== bestUserCorridorX) {
        points.push({ x: bestUserCorridorX, y: userY });
      }
      if (userY !== 225) {
        points.push({ x: bestUserCorridorX, y: 225 });
      }
      if (bestUserCorridorX !== stallCorridorX) {
        points.push({ x: stallCorridorX, y: 225 });
      }
      if (stallY !== 225) {
        points.push({ x: stallCorridorX, y: stallY });
      }
    }
    
    // Final step: walk to the stall coordinates
    if (points[points.length - 1].x !== stallX || points[points.length - 1].y !== stallY) {
      points.push({ x: stallX, y: stallY });
    }
    
    return points;
  };

  const pathPoints = getPathPoints();

  // --- Distance & Bearing calculations ---
  const calculateDistance = (x1, y1, x2, y2) => {
    const diffX = x2 - x1;
    const diffY = y2 - y1;
    return Math.round(Math.sqrt(diffX * diffX + diffY * diffY) * 0.06);
  };

  const getPathDistance = (points) => {
    let dist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      dist += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    return Math.round(dist * 0.06); // scale factor to meters
  };

  const totalDistance = getPathDistance(pathPoints);

  const getBearing = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y1 - y2;
    let angle = Math.atan2(dx, dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.round(angle);
  };

  const targetBearing = getBearing(userX, userY, currentStall.x, currentStall.y);

  // Next waypoint calculations for AR guidance steering
  const nextWaypoint = pathPoints[1] || currentStall;
  const nextBearing = getBearing(userX, userY, nextWaypoint.x, nextWaypoint.y);
  let relNextAngle = nextBearing - heading;
  if (relNextAngle > 180) relNextAngle -= 360;
  if (relNextAngle < -180) relNextAngle += 360;

  // --- AR perspective projection ---
  const getArItemProj = (x, y) => {
    const dist = calculateDistance(userX, userY, x, y);
    const bearing = getBearing(userX, userY, x, y);
    
    let relAngle = bearing - heading;
    if (relAngle > 180) relAngle -= 360;
    if (relAngle < -180) relAngle += 360;
    
    const fov = 50;
    const isVisible = Math.abs(relAngle) <= fov;
    
    const xPct = 50 + (relAngle / fov) * 50;
    const yPct = 65 - (dist / 40) * 30; // Closer is lower
    const scale = Math.max(0.4, 1 - dist / 50);
    
    return { isVisible, xPct, yPct, scale, dist, relAngle };
  };

  const targetProj = getArItemProj(currentStall.x, currentStall.y);

  const getPathDotsProj = () => {
    const dots = [];
    
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const stepCount = Math.max(3, Math.round(dist / 25));
      
      for (let j = 0; j <= stepCount; j++) {
        const t = j / stepCount;
        dots.push({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t
        });
      }
    }
    
    return dots.map(dot => ({
      ...dot,
      proj: getArItemProj(dot.x, dot.y)
    })).filter(dot => dot.proj.isVisible && dot.proj.dist > 1.5 && dot.proj.dist < 40);
  };

  const arPathDots = getPathDotsProj();

  // --- Simulated walking controls ---
  const handleStepForward = () => {
    const stepSize = 15;
    const bearingRad = (heading * Math.PI) / 180;
    
    let nextX = userX + Math.round(Math.sin(bearingRad) * stepSize);
    let nextY = userY - Math.round(Math.cos(bearingRad) * stepSize);
    
    nextX = Math.max(30, Math.min(770, nextX));
    nextY = Math.max(30, Math.min(420, nextY));
    
    setUserX(nextX);
    setUserY(nextY);
  };

  const handleRotateLeft = () => setHeading(h => (h - 15 + 360) % 360);
  const handleRotateRight = () => setHeading(h => (h + 15) % 360);

  const handleResetPosition = () => {
    setUserX(400); // Reset to bottom Entrance & Exit
    setUserY(410);
    setHeading(0); // Face North
    setToastMsg("Location reset to Main Entrance & Exit.");
  };

  // --- Simulate QR Code scanning anchor trigger ---
  const handleSimulateScan = (anchor) => {
    setUserX(anchor.x);
    setUserY(anchor.y);
    setToastMsg(`Location calibrated to: ${anchor.label}`);
    setShowScanner(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-slate-900 font-sans overflow-hidden flex flex-col ${
        isFullscreen ? "h-screen w-screen fixed inset-0 z-50" : ""
      }`}
    >
      {/* ── BACKGROUND CAMERA FEED ── */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {cameraActive && !cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-br from-slate-900 via-[#132c18] to-slate-950">
            <div className="relative w-20 h-20 bg-[#1a5c2a]/20 rounded-full flex items-center justify-center border border-[#1a5c2a]/30 animate-pulse">
              <Navigation className="w-10 h-10 text-[#1a5c2a]" />
            </div>
            <div className="space-y-1">
              <p className="text-white text-base font-bold">AR Navigation Feed Active</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Real-world camera stream mock is active. Turn device or use rotation HUD buttons to face target stall.
              </p>
            </div>
            {cameraError && (
              <p className="text-[10px] text-amber-500/80 font-medium px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                {cameraError}
              </p>
            )}
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-[#1a5c2a] hover:bg-[#154a22] text-white text-xs font-semibold rounded-xl transition-all active:scale-95"
            >
              Retry Camera Connection
            </button>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/40" />
      </div>

      {/* ── TOP HEADER CONTROLS ── */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-slate-800 hover:bg-white active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Target stall selector */}
        <div className="pointer-events-auto flex items-center bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow border border-slate-100 max-w-xs sm:max-w-md">
          <label className="text-[10px] font-bold text-[#1a5c2a] uppercase tracking-wider mr-2">FIND:</label>
          <select
            value={selectedStallId}
            onChange={(e) => setSelectedStallId(e.target.value)}
            className="text-xs font-extrabold text-slate-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer pr-1"
          >
            {STALLS_AR.map(stall => (
              <option key={stall.id} value={stall.id}>
                Stall #{stall.id} ({stall.zone})
              </option>
            ))}
          </select>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={() => setShowHelp(h => !h)}
            className={`pointer-events-auto w-10 h-10 rounded-full backdrop-blur-sm shadow flex items-center justify-center transition-all active:scale-90 ${
              showHelp ? "bg-[#1a5c2a] text-white" : "bg-white/90 text-slate-800 hover:bg-white"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── IMMERSIVE AR GRAPHICS VIEWPORT OVERLAYS ── */}
      <div className="flex-1 relative z-10 pointer-events-none">
        
        {/* Toast Calibrated Location Alert message */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur border border-slate-800 text-white rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2.5 text-xs font-bold pointer-events-auto animate-fadeIn z-30">
            <Check className="w-4 h-4 text-green-500" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className="absolute top-16 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur shadow-lg border border-slate-100 max-w-sm mx-auto pointer-events-auto animate-fadeIn space-y-3 z-20">
            <div className="flex items-center gap-2 border-b pb-2">
              <Info className="w-4.5 h-4.5 text-[#1a5c2a]" />
              <h4 className="font-bold text-slate-900 text-sm">AR Navigation Guide</h4>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Tap **Scan QR** at the bottom to calibrate your location instantly from any printed QR code pillar.</li>
              <li>A floating **blue navigation arrow** and **dotted ground path** will display inside the camera viewport.</li>
              <li>Rotate your phone until the arrow aligns with the center. Use the **radar mini map** below to verify paths.</li>
              <li>Simulate walking by clicking the **Navigation panel** (Step/Rotate) on the right side.</li>
            </ul>
          </div>
        )}

        {/* Floating Perspective Path Dots */}
        {arPathDots.map((dot, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-blue-500/80 border border-blue-200/50 shadow-sm transition-all"
            style={{
              left: `${dot.proj.xPct}%`,
              top: `${dot.proj.yPct}%`,
              transform: `translate(-50%, -50%) scale(${dot.proj.scale})`,
              width: "14px",
              height: "14px",
              opacity: dot.proj.opacity * 0.8,
            }}
          />
        ))}

        {/* Immersive floating AR direction annotation marker */}
        {targetProj.isVisible ? (
          <div
            className="absolute flex flex-col items-center justify-center text-center transition-all animate-bounce"
            style={{
              left: `${targetProj.xPct}%`,
              top: `${targetProj.yPct}%`,
              transform: `translate(-50%, -50%) scale(${targetProj.scale})`,
              opacity: targetProj.scale,
            }}
          >
            {/* Arrow badge */}
            <div className="w-14 h-14 rounded-full bg-blue-600/90 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <Navigation
                className="w-7 h-7 transform"
                style={{ rotate: `${targetBearing - heading}deg` }}
              />
            </div>
            {/* Tag Bubble */}
            <div className="mt-2 bg-slate-900/90 backdrop-blur border border-slate-800 text-white rounded-xl px-3 py-1.5 shadow-md flex flex-col items-center">
              <span className="text-xs font-extrabold whitespace-nowrap">
                Stall #{currentStall.id}
              </span>
              <span className="text-[10px] text-blue-400 font-semibold mt-0.5">
                {totalDistance}m away
              </span>
            </div>
          </div>
        ) : (
          /* Off-screen rotation direction helper hints */
          <div className="absolute inset-x-0 top-1/3 flex justify-between px-6">
            {relNextAngle < 0 ? (
              <div className="flex items-center gap-2 bg-slate-900/95 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow border border-slate-800 animate-pulse">
                <span>◀ Turn Left</span>
                <span className="text-[9px] text-slate-400">{Math.round(Math.abs(relNextAngle))}°</span>
              </div>
            ) : (
              <div className="ml-auto flex items-center gap-2 bg-slate-900/95 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow border border-slate-800 animate-pulse">
                <span className="text-[9px] text-slate-400">{Math.round(Math.abs(relNextAngle))}°</span>
                <span>Turn Right ▶</span>
              </div>
            )}
          </div>
        )}

        {/* ── SIMULATED QR CODE SCANNER FULL SCREEN DIALOG OVERLAY ── */}
        {showScanner && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 pointer-events-auto animate-fadeIn">
            {/* Scanner HUD target box */}
            <div className="relative w-52 h-52 border-2 border-dashed border-blue-400 rounded-3xl flex items-center justify-center overflow-hidden bg-slate-900/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br" />
              
              <QrCode className="w-16 h-16 text-blue-400/40 animate-pulse" />
              
              {/* Sweeping laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-scanLine" />
            </div>

            {/* Tab selector */}
            <div className="flex bg-slate-900 border border-slate-850 rounded-xl p-1 w-full max-w-xs mb-4 mt-6 pointer-events-auto">
              <button
                onClick={() => setActiveScannerTab("simulate")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeScannerTab === "simulate"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Scan Simulator
              </button>
              <button
                onClick={() => setActiveScannerTab("guide")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  activeScannerTab === "guide"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Real-World Guide
              </button>
            </div>

            {activeScannerTab === "simulate" ? (
              <>
                <div className="text-center space-y-1 max-w-xs animate-fadeIn">
                  <h4 className="font-extrabold text-white text-sm">QR Anchor Calibration</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tap one of the active locations below to simulate scanning a physical QR code poster.
                  </p>
                </div>

                {/* Simulated Anchors list */}
                <div className="mt-4 w-full max-w-xs space-y-2 overflow-y-auto max-h-[180px] pr-1 animate-fadeIn">
                  <div className="grid grid-cols-1 gap-2">
                    {QR_ANCHORS.map(anchor => (
                      <button
                        key={anchor.id}
                        onClick={() => handleSimulateScan(anchor)}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl text-white text-xs font-bold text-left transition-all active:scale-[0.98] flex items-center justify-between pointer-events-auto"
                      >
                        <span>{anchor.label}</span>
                        <span className="text-[9px] text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          {anchor.zone}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full max-w-xs space-y-3 overflow-y-auto max-h-[220px] pr-1 pointer-events-auto text-left animate-fadeIn">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <h5 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    How does QR Positioning work?
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Indoor environments lack reliable GPS signals. By scanning fixed QR codes, the system resets the user's starting (x,y) coordinates to the physical poster location.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Physical Code Setup Guide:</p>
                  <ol className="text-[10px] text-slate-350 space-y-1 list-decimal pl-4">
                    <li>Use any free online generator (e.g., qr-code-generator.com).</li>
                    <li>Generate plain-text QR codes containing the exact <span className="text-amber-400 font-bold">Scan Text String</span> below.</li>
                    <li>Print and place the posters at the corresponding location.</li>
                  </ol>
                </div>

                <div className="border-t border-slate-800 my-1" />

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Required Anchor Codes:</p>
                  <div className="space-y-1.5">
                    {QR_ANCHORS.map(anchor => (
                      <div key={anchor.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-white">{anchor.label}</span>
                          <span className="text-[9px] font-semibold text-slate-500">{anchor.zone}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] mt-0.5 bg-slate-950 p-1 px-1.5 rounded border border-slate-850">
                          <span className="text-slate-400">Scan Text:</span>
                          <code className="text-amber-400 font-mono font-bold">{anchor.id}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowScanner(false)}
              className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all pointer-events-auto"
            >
              <X className="w-4 h-4" />
              <span>Cancel Scan</span>
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT SIMULATION PANEL HUD ── */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {!hasOrientation && (
          <button
            onClick={requestCompassPermission}
            title="Request Compass Access"
            className="w-10 h-10 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-600 transition-all"
          >
            <Compass className="w-5 h-5 animate-spin" />
          </button>
        )}
        
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 flex flex-col gap-1.5 shadow-lg">
          <button
            onClick={handleStepForward}
            title="Simulate Step Forward"
            className="w-10 h-10 rounded-xl bg-[#1a5c2a] text-white flex items-center justify-center hover:bg-[#154a22] transition-colors active:scale-95"
          >
            <Navigation className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleRotateLeft}
            title="Turn Left 15°"
            className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-95"
          >
            <RotateCw className="w-4 h-4 transform -scale-x-100" />
          </button>
          
          <button
            onClick={handleRotateRight}
            title="Turn Right 15°"
            className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="border-t border-slate-800 my-0.5" />
          
          <button
            onClick={handleResetPosition}
            title="Reset Position"
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white hover:bg-slate-700 transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold">RESET</span>
          </button>
        </div>
      </div>

      {/* ── BOTTOM MAP HUD & LEASE CARD ── */}
      <footer className="relative z-20 p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none flex flex-col items-center gap-3">
        <button
          onClick={() => setShowRadar(r => !r)}
          className="pointer-events-auto text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-4 py-1.5 rounded-full shadow-md backdrop-blur transition-all active:scale-95"
        >
          {showRadar ? "Hide Radar Map" : "Show Radar Map"}
        </button>

        {/* 2D Mini Map HUD using custom map.png background */}
        {showRadar && (
          <div className="pointer-events-auto w-[320px] h-[180px] rounded-2xl bg-white p-1 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden animate-slideUp">
            <svg viewBox="0 0 800 450" className="w-full h-full bg-[#f4f4f5] rounded-xl">
              {/* Render custom map.png as SVG background */}
              <image href={mapImage} x="0" y="0" width="800" height="450" />

              {/* QR Code Anchor spots on the map */}
              {QR_ANCHORS.map(anchor => (
                <g key={anchor.id} transform={`translate(${anchor.x}, ${anchor.y})`}>
                  <circle
                    r="8"
                    fill="rgba(249, 115, 22, 0.9)"
                    stroke="#fff"
                    strokeWidth="1.2"
                    className="animate-pulse"
                  />
                  {/* Inside QR look */}
                  <rect x="-3" y="-3" width="6" height="6" fill="#fff" />
                  <rect x="-2" y="-2" width="4" height="4" fill="#0f172a" />
                  <rect x="-1" y="-1" width="2" height="2" fill="#fff" />
                </g>
              ))}

              {/* Blinking destination stall node coordinate points */}
              {STALLS_AR.map(stall => (
                <g key={stall.id} transform={`translate(${stall.x}, ${stall.y})`}>
                  <circle
                    r="9"
                    fill={stall.id === selectedStallId ? "#2563eb" : "rgba(226, 232, 240, 0.75)"}
                    stroke={stall.id === selectedStallId ? "#fff" : "#475569"}
                    strokeWidth="1.5"
                    className={stall.id === selectedStallId ? "animate-pulse" : ""}
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="900"
                    fill={stall.id === selectedStallId ? "#fff" : "#1e293b"}
                  >
                    {stall.id}
                  </text>
                </g>
              ))}

              {/* Dotted path navigator lines */}
              <polyline
                points={pathPoints.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* User Location pointer and compass directional cone */}
              <g transform={`translate(${userX}, ${userY})`}>
                <path
                  d="M0 0 L-35 -60 A70 70 0 0 1 35 -60 Z"
                  fill="rgba(37, 99, 235, 0.25)"
                  transform={`rotate(${heading})`}
                  style={{ transformOrigin: "0px 0px" }}
                />
                
                <g transform={`rotate(${heading})`}>
                  <circle r="12" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                  <path d="M0 -7 L6 5 L0 2 L-6 5 Z" fill="#fff" />
                </g>
              </g>
            </svg>
            
            <div className="absolute bottom-2 left-2 bg-slate-900/90 text-[8px] font-bold text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
              SIM POS: {userX}, {userY} | {heading}°
            </div>
          </div>
        )}

        {/* Target Stall HUD card focusing purely on navigation details */}
        <div className="pointer-events-auto w-full max-w-sm bg-white/95 backdrop-blur rounded-2xl p-4 border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Navigation className="w-5 h-5 transform rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#1a5c2a] uppercase tracking-wide">AR Navigator</span>
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm leading-tight mt-0.5">
                Finding Stall #{currentStall.id}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Located in {currentStall.zone}
              </p>
            </div>
          </div>
          
          <div className="text-right flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Est. Distance</span>
              <span className="text-sm font-extrabold text-slate-900">{totalDistance}m</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all shadow active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={handleResetPosition}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all border border-slate-700 active:scale-95"
              >
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation & Sweeping Laser Line helpers */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.25s ease-out forwards; }
        .animate-scanLine { position: absolute; animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
}
