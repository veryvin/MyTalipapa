import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Compass, Info, HelpCircle, Navigation, RotateCw, Check, QrCode, X, Camera, CameraOff, Map, ChevronDown, ChevronUp } from "lucide-react";
import mapImage from "../../images/map.png";

const getStallZone = (num, category) => {
  const stallId = String(num);
  if (category === 'meat') {
    if (['1', '2', '3', '4', '5', '12', '13'].includes(stallId) || stallId.startsWith('empty')) return 'Zone A';
    if (['51', '52', '53', '54', '55', '56'].includes(stallId)) return 'Zone C';
    if (['1(u2)', '2(u2)', '3(u2)', '4(u2)', '8(u2)', '9(u2)', '10(u2)'].includes(stallId)) return 'Zone F';
    return 'Zone E';
  } else if (category === 'fish') {
    const numInt = parseInt(stallId.replace(/[^0-9]/g, '')) || 0;
    if (numInt >= 11 && numInt <= 20) return 'Zone A';
    if (numInt >= 21 && numInt <= 40) return 'Zone B';
    if ((numInt >= 41 && numInt <= 50) || (numInt >= 57 && numInt <= 60)) return 'Zone C';
    return 'Zone D';
  } else if (category === 'veggies') {
    const numInt = parseInt(stallId.replace(/[^0-9]/g, '')) || 0;
    if (numInt >= 5 && numInt <= 24) return 'Zone F';
    if (numInt >= 25 && numInt <= 48) return 'Zone G';
    return 'Zone H';
  }
  return 'Zone A';
};

const buildAllStalls = () => {
  const meatIds = [
    '1', '1(u)', '1(u2)', '2', '2(u)', '2(u2)', '3', '3(u)', '3(u2)', '4', '4(u)', '4(u2)',
    '5', 'empty', 'empty2', 'empty3',
    '5(u)', '6', '7', '8', '9', '10', '8(u)', '9(u)', '10(u)', '11', '12', '12(u)', '13', '13(u)', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
    '51', '52', '53', '54', '55', '56'
  ];
  const fishIds = [
    '11', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
    '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72',
    'nostallnum1', 'nostallnum2', 'nostallnum3', 'nostallnum4', 'nostallnum5'
  ];
  const veggieIds = [
    '5', '6', '7', '11', '12', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
    '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
    '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72'
  ];

  const list = [];
  const columnMap = {
    'meat-Zone A': [50, 110], 'meat-Zone C': [410],
    'fish-Zone A': [110], 'fish-Zone B': [170, 230],
    'fish-Zone C': [290, 410], 'fish-Zone D': [530, 590, 700, 760],
    'meat-Zone E': [50, 110], 'meat-Zone F': [170],
    'veggies-Zone F': [170, 230], 'veggies-Zone G': [290, 410],
    'veggies-Zone H': [530, 590]
  };
  const zoneYBounds = {
    'meat-Zone A': [60, 210], 'meat-Zone C': [60, 210],
    'fish-Zone A': [60, 210], 'fish-Zone B': [60, 210],
    'fish-Zone C': [60, 210], 'fish-Zone D': [60, 210],
    'meat-Zone E': [240, 400], 'meat-Zone F': [240, 400],
    'veggies-Zone F': [240, 400], 'veggies-Zone G': [240, 400],
    'veggies-Zone H': [240, 400]
  };

  const processCategory = (category, ids) => {
    const colCounters = {};
    ids.forEach((id) => {
      const zone = getStallZone(id, category);
      const key = `${category}-${zone}`;
      const columns = columnMap[key] || [100];
      if (colCounters[key] === undefined) colCounters[key] = 0;
      const colIdx = colCounters[key] % columns.length;
      const x = columns[colIdx];
      colCounters[key]++;
      let displayName = `Stall #${id}`;
      if (id.startsWith('nostallnum')) displayName = `Unnumbered Stall #${id.replace('nostallnum', '')}`;
      else if (id.startsWith('empty')) displayName = `Empty Stall #${id.replace('empty', '') || '1'}`;
      list.push({
        id: `${category}-${id}`,
        label: `${displayName} (${category.charAt(0).toUpperCase() + category.slice(1)})`,
        section: category === 'meat' ? 'Meat Section' : category === 'fish' ? 'Fish Section' : 'Vegetables Section',
        zone, x, y: 0, rawId: id, category
      });
    });
  };

  processCategory('meat', meatIds);
  processCategory('fish', fishIds);
  processCategory('veggies', veggieIds);

  const columnsList = [...new Set(list.map(s => s.x))];
  columnsList.forEach((colX) => {
    const zonesInCol = [...new Set(list.filter(s => s.x === colX).map(s => s.zone))];
    zonesInCol.forEach((zone) => {
      const stallsInColZone = list.filter(s => s.x === colX && s.zone === zone);
      const count = stallsInColZone.length;
      if (count > 0) {
        const category = stallsInColZone[0].category;
        const bounds = zoneYBounds[`${category}-${zone}`] || [60, 400];
        stallsInColZone.forEach((stall, idx) => {
          stall.y = count > 1 ? Math.round(bounds[0] + (idx * (bounds[1] - bounds[0])) / (count - 1)) : bounds[0];
        });
      }
    });
  });
  return list;
};

const STALLS_AR = buildAllStalls();

const QR_ANCHORS = [
  { id: "entrance", label: "Main Entrance Poster", x: 400, y: 410, zone: "Entrance" },
  { id: "central_aisle", label: "Central Aisle Poster", x: 400, y: 225, zone: "Central Pathway" },
  { id: "meat_pillar", label: "Meat Section Pillar A", x: 140, y: 140, zone: "Meat Section" },
  { id: "seafood_column", label: "Seafood Column B", x: 290, y: 180, zone: "Seafood Section" },
  { id: "veggies_pillar", label: "Veggies Pillar C", x: 520, y: 320, zone: "Veggies Section" }
];

export default function ArFinder({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStallId, setSelectedStallId] = useState("meat-1");
  const currentStall = STALLS_AR.find(s => s.id === selectedStallId) || STALLS_AR[0];

  const [userX, setUserX] = useState(400);
  const [userY, setUserY] = useState(410);
  const [heading, setHeading] = useState(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [mapCollapsed, setMapCollapsed] = useState(true); // default collapsed on mobile
  const [showHelp, setShowHelp] = useState(false);
  const [hasOrientation, setHasOrientation] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [activeScannerTab, setActiveScannerTab] = useState("simulate");
  const [toastMsg, setToastMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const startCamera = async () => {
    if (!cameraEnabled) return;
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = fallback;
        if (videoRef.current) videoRef.current.srcObject = fallback;
        setCameraActive(true);
      } catch {
        setCameraError("Camera unavailable. Running in simulated AR view.");
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  };

  useEffect(() => {
    if (cameraEnabled) startCamera(); else stopCamera();
    const handleOrientation = (e) => {
      let h = e.webkitCompassHeading ?? (360 - e.alpha);
      if (h !== undefined) { setHeading(Math.round(h)); setHasOrientation(true); }
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => { stopCamera(); window.removeEventListener("deviceorientation", handleOrientation); };
  }, [cameraEnabled]);

  const handleMapClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vw = 800, vh = 450;
    const rr = rect.width / rect.height;
    const vr = vw / vh;
    let scale, ox = 0, oy = 0;
    if (rr > vr) { scale = rect.width / vw; oy = (rect.height - vh * scale) / 2; }
    else { scale = rect.height / vh; ox = (rect.width - vw * scale) / 2; }
    const cx = (e.clientX - rect.left - ox) / scale;
    const cy = (e.clientY - rect.top - oy) / scale;
    if (cx >= 0 && cx <= vw && cy >= 0 && cy <= vh) { setUserX(Math.round(cx)); setUserY(Math.round(cy)); }
  };

  const X_CORRIDORS = [80, 200, 380, 560, 730];

  const getPathPoints = () => {
    const pts = [{ x: userX, y: userY }];
    const sx = currentStall.x, sy = currentStall.y;
    const stallCX = X_CORRIDORS.reduce((p, c) => Math.abs(c - sx) < Math.abs(p - sx) ? c : p);
    let bestCX = X_CORRIDORS[0], minD = Infinity;
    for (const cx of X_CORRIDORS) {
      const d = Math.abs(cx - userX) + Math.abs(stallCX - cx);
      if (d < minD) { minD = d; bestCX = cx; }
    }
    if (bestCX === stallCX) {
      if (userX !== bestCX) pts.push({ x: bestCX, y: userY });
      if (userY !== sy) pts.push({ x: bestCX, y: sy });
    } else {
      if (userX !== bestCX) pts.push({ x: bestCX, y: userY });
      if (userY !== 225) pts.push({ x: bestCX, y: 225 });
      if (bestCX !== stallCX) pts.push({ x: stallCX, y: 225 });
      if (sy !== 225) pts.push({ x: stallCX, y: sy });
    }
    const last = pts[pts.length - 1];
    if (last.x !== sx || last.y !== sy) pts.push({ x: sx, y: sy });
    return pts;
  };

  const pathPoints = getPathPoints();

  const calcDist = (x1, y1, x2, y2) => Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 0.06);
  const getPathDist = (pts) => {
    let d = 0;
    for (let i = 0; i < pts.length - 1; i++)
      d += Math.sqrt((pts[i + 1].x - pts[i].x) ** 2 + (pts[i + 1].y - pts[i].y) ** 2);
    return Math.round(d * 0.06);
  };
  const totalDistance = getPathDist(pathPoints);

  const getBearing = (x1, y1, x2, y2) => {
    let a = Math.atan2(x2 - x1, y1 - y2) * (180 / Math.PI);
    return Math.round((a + 360) % 360);
  };

  const targetBearing = getBearing(userX, userY, currentStall.x, currentStall.y);
  const nextWP = pathPoints[1] || currentStall;
  const nextBearing = getBearing(userX, userY, nextWP.x, nextWP.y);
  let relNextAngle = nextBearing - heading;
  if (relNextAngle > 180) relNextAngle -= 360;
  if (relNextAngle < -180) relNextAngle += 360;

  const getArProj = (x, y) => {
    const dist = calcDist(userX, userY, x, y);
    const bearing = getBearing(userX, userY, x, y);
    let rel = bearing - heading;
    if (rel > 180) rel -= 360;
    if (rel < -180) rel += 360;
    const fov = 50;
    return { isVisible: Math.abs(rel) <= fov, xPct: 50 + (rel / fov) * 50, yPct: 65 - (dist / 40) * 30, scale: Math.max(0.4, 1 - dist / 50), dist, relAngle: rel };
  };

  const targetProj = getArProj(currentStall.x, currentStall.y);

  const arPathDots = (() => {
    const dots = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i], p2 = pathPoints[i + 1];
      const d = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const steps = Math.max(3, Math.round(d / 25));
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        dots.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
      }
    }
    return dots.map(d => ({ ...d, proj: getArProj(d.x, d.y) }))
      .filter(d => d.proj.isVisible && d.proj.dist > 1.5 && d.proj.dist < 40);
  })();

  const handleStepForward = () => {
    const rad = (heading * Math.PI) / 180;
    setUserX(x => Math.max(30, Math.min(770, x + Math.round(Math.sin(rad) * 15))));
    setUserY(y => Math.max(30, Math.min(420, y - Math.round(Math.cos(rad) * 15))));
  };
  const handleRotateLeft = () => setHeading(h => (h - 15 + 360) % 360);
  const handleRotateRight = () => setHeading(h => (h + 15) % 360);
  const handleResetPosition = () => { setUserX(400); setUserY(410); setHeading(0); setToastMsg("Location reset to Main Entrance."); };
  const handleSimulateScan = (anchor) => {
    setUserX(anchor.x); setUserY(anchor.y);
    setToastMsg(`Calibrated to: ${anchor.label}`);
    setShowScanner(false);
  };

  const requestCompassPermission = async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      try {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r === "granted") setHasOrientation(true);
        else alert("Sensor permission denied.");
      } catch (err) { console.error(err); }
    }
  };

  // Map panel height for mobile: collapsed = 44px header only, expanded = 220px
  const MAP_EXPANDED_H = 220;
  const MAP_HEADER_H = 44;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0a0f0a",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }

        /* ── KEYFRAMES ── */
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scan {
          0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.6; }
        }
        .animate-fadeIn    { animation: fadeIn 0.2s ease forwards; }
        .animate-scanLine  { position: absolute; animation: scan 3s linear infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }

        /* ── LAYOUT: DESKTOP side-by-side, MOBILE stacked ── */
        .ar-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* AR viewport takes all available space */
        .ar-viewport {
          position: relative;
          flex: 1;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          background: #111;
        }

        /* ── MAP PANEL ── */
        /* Desktop: right sidebar */
        .ar-map-panel {
          width: 42%;
          min-width: 320px;
          max-width: 520px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-left: 1px solid #e2e8f0;
          overflow: hidden;
          transition: width 0.25s ease;
        }
        .ar-map-panel.collapsed-desktop {
          width: 40px;
          min-width: 40px;
        }

        /* Mobile: bottom sheet that sits BELOW the AR viewport */
        @media (max-width: 640px) {
          .ar-body {
            flex-direction: column;
          }
          .ar-map-panel {
            width: 100% !important;
            min-width: unset;
            max-width: unset;
            border-left: none;
            border-top: 2px solid #e2e8f0;
            flex-shrink: 0;
            /* height controlled inline via JS */
            transition: height 0.25s ease;
          }
          .ar-map-panel.collapsed-desktop {
            width: 100% !important;
          }
        }

        .ar-map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          height: ${MAP_HEADER_H}px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
          cursor: pointer;
          user-select: none;
        }
        .ar-map-header-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #64748b;
          white-space: nowrap;
        }

        .ar-map-body {
          flex: 1;
          position: relative;
          background: #f4f4f5;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }

        /* ── HEADER CONTROLS ── */
        .hud-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #fff;
          transition: background 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .hud-btn:hover { background: rgba(255,255,255,0.22); }
        .hud-btn:active { transform: scale(0.92); }
        .hud-btn.active { background: #1a5c2a; border-color: #1a5c2a; }

        .ctrl-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(226,232,240,0.6);
          background: rgba(255,255,255,0.92);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #334155;
          transition: background 0.15s, transform 0.1s;
        }
        .ctrl-btn:hover { background: #fff; }
        .ctrl-btn:active { transform: scale(0.92); }
        .ctrl-btn.primary { background: #1a5c2a; color: #fff; border-color: #1a5c2a; }
        .ctrl-btn.primary:hover { background: #154a22; }

        /* ── STALL SELECTS ── */
        .stall-select {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          padding: 5px 10px;
          gap: 5px;
          backdrop-filter: blur(8px);
        }
        .stall-select select {
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          max-width: 120px;
        }
        .stall-select select option { color: #1e293b; background: #fff; }
        .stall-select label {
          font-size: 9px;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        /* Mobile: stall selects wrap below header in a sub-bar */
        .header-selects-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 6px 10px;
          background: rgba(10,15,10,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .header-selects-bar::-webkit-scrollbar { display: none; }

        /* ── TOAST ── */
        .toast {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.97);
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
          z-index: 30;
          animation: fadeSlideIn 0.2s ease;
          max-width: calc(100% - 24px);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── INFO CARD ── */
        .ar-info-card {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 56px; /* leave room for HUD */
          background: rgba(255,255,255,0.97);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          z-index: 20;
          box-shadow: 0 4px 20px rgba(0,0,0,0.14);
          animation: slideUp 0.2s ease;
        }
        @media (max-width: 640px) {
          .ar-info-card {
            right: 54px;
            left: 8px;
            bottom: 8px;
            padding: 8px 10px;
          }
        }

        /* ── SIM BADGE ── */
        .sim-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          background: #1a5c2a;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10;
        }

        /* ── SCANNER OVERLAY ── */
        .scanner-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(10px);
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: fadeIn 0.15s ease;
        }
      `}</style>

      {/* ── TOP HEADER BAR ── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px",
        background: "rgba(10,15,10,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0, zIndex: 40,
        minHeight: 50,
      }}>
        <button onClick={onBack} className="hud-btn" style={{ flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </button>

        {/* On desktop: selects in header. On mobile: in sub-bar below */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, minWidth: 0 }}>
            <div className="stall-select">
              <label>SECTION:</label>
              <select value={selectedCategory} onChange={e => {
                const cat = e.target.value;
                setSelectedCategory(cat);
                const filtered = cat === "all" ? STALLS_AR : STALLS_AR.filter(s => s.category === cat);
                if (filtered.length > 0) setSelectedStallId(filtered[0].id);
              }}>
                <option value="all">All Sections</option>
                <option value="meat">🥩 Meat</option>
                <option value="fish">🐟 Fishes</option>
                <option value="veggies">🥬 Vegetables</option>
              </select>
            </div>
            <div className="stall-select">
              <label>STALL:</label>
              <select value={selectedStallId} onChange={e => setSelectedStallId(e.target.value)}
                style={{ maxWidth: 180 }}>
                {(selectedCategory === "all" ? STALLS_AR : STALLS_AR.filter(s => s.category === selectedCategory)).map(s => (
                  <option key={s.id} value={s.id}>{s.label} - {s.zone}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isMobile && <div style={{ flex: 1 }} />}

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setCameraEnabled(c => !c)} className={`hud-btn${cameraEnabled ? " active" : ""}`} title={cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}>
            {cameraEnabled ? <Camera size={15} /> : <CameraOff size={15} />}
          </button>
          <button onClick={() => setShowHelp(h => !h)} className={`hud-btn${showHelp ? " active" : ""}`}>
            <HelpCircle size={15} />
          </button>
        </div>
      </header>

      {/* Mobile-only: selects in a scrollable sub-bar */}
      {isMobile && (
        <div className="header-selects-bar">
          <div className="stall-select" style={{ flexShrink: 0 }}>
            <label>SEC:</label>
            <select value={selectedCategory} onChange={e => {
              const cat = e.target.value;
              setSelectedCategory(cat);
              const filtered = cat === "all" ? STALLS_AR : STALLS_AR.filter(s => s.category === cat);
              if (filtered.length > 0) setSelectedStallId(filtered[0].id);
            }}>
              <option value="all">All</option>
              <option value="meat">🥩 Meat</option>
              <option value="fish">🐟 Fish</option>
              <option value="veggies">🥬 Veg</option>
            </select>
          </div>
          <div className="stall-select" style={{ flex: 1, minWidth: 0 }}>
            <label>STALL:</label>
            <select value={selectedStallId} onChange={e => setSelectedStallId(e.target.value)}
              style={{ maxWidth: "100%", minWidth: 0 }}>
              {(selectedCategory === "all" ? STALLS_AR : STALLS_AR.filter(s => s.category === selectedCategory)).map(s => (
                <option key={s.id} value={s.id}>{s.label} - {s.zone}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── MAIN BODY ── */}
      <div className="ar-body">

        {/* ── AR VIEWPORT ── */}
        <div className="ar-viewport">

          {/* Camera / Simulated BG */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            {cameraActive && !cameraError && cameraEnabled ? (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "linear-gradient(135deg, #f0faf2 0%, #e8f5e9 100%)", textAlign: "center", padding: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(26,92,42,0.1)", border: "1px solid rgba(26,92,42,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CameraOff size={22} color="#1a5c2a" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                    {!cameraEnabled ? "Camera Feed Turned Off" : "AR Navigation Feed Active"}
                  </p>
                  <p style={{ fontSize: 10, color: "#64748b", maxWidth: 220, margin: 0 }}>
                    {!cameraEnabled ? "Camera disabled. Use simulated perspective." : "Real-world camera stream mock. Rotate device or use HUD controls."}
                  </p>
                </div>
                {cameraError && cameraEnabled && (
                  <p style={{ fontSize: 9, color: "#92400e", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 999, padding: "4px 12px", margin: 0 }}>{cameraError}</p>
                )}
                <button onClick={cameraEnabled ? startCamera : () => setCameraEnabled(true)}
                  style={{ padding: "7px 16px", background: "#1a5c2a", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", borderRadius: 10, cursor: "pointer" }}>
                  {cameraEnabled ? "Retry Camera" : "Enable Camera"}
                </button>
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 100%)", pointerEvents: "none" }} />
          </div>

          {/* ── AR OVERLAYS ── */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>

            {/* Toast */}
            {toastMsg && (
              <div className="toast" style={{ pointerEvents: "auto" }}>
                <Check size={13} color="#22c55e" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* Help Panel */}
            {showHelp && (
              <div className="animate-fadeIn" style={{
                position: "absolute", top: 10, left: 10, right: 54,
                background: "rgba(255,255,255,0.98)", border: "1px solid #e2e8f0",
                borderRadius: 14, padding: "12px 14px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)", pointerEvents: "auto", zIndex: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 8 }}>
                  <Info size={13} color="#1a5c2a" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>AR Navigation Guide</span>
                  <button onClick={() => setShowHelp(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}><X size={14} /></button>
                </div>
                <ul style={{ fontSize: 11, color: "#475569", paddingLeft: 16, margin: 0, lineHeight: 1.7 }}>
                  <li>Tap <strong>Scan QR</strong> to calibrate your location using QR codes on pillars.</li>
                  <li>Follow floating orange dots and direction indicator in the camera view.</li>
                  <li>Use the right-side HUD to simulate walking or rotating.</li>
                  <li>Tap anywhere on the floor map to set your position manually.</li>
                </ul>
              </div>
            )}

            {/* AR Path Dots */}
            {arPathDots.map((dot, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${dot.proj.xPct}%`, top: `${dot.proj.yPct}%`,
                transform: `translate(-50%,-50%) scale(${dot.proj.scale})`,
                width: 11, height: 11, borderRadius: "50%",
                background: "rgba(232,98,26,0.88)",
                border: "1.5px solid rgba(255,255,255,0.5)",
                boxShadow: "0 0 6px rgba(232,98,26,0.5)",
              }} />
            ))}

            {/* AR Target Marker / Off-screen indicator */}
            {targetProj.isVisible ? (
              <div style={{
                position: "absolute",
                left: `${targetProj.xPct}%`, top: `${targetProj.yPct}%`,
                transform: `translate(-50%,-50%) scale(${targetProj.scale})`,
                display: "flex", flexDirection: "column", alignItems: "center",
                animation: "pulse 1.5s ease-in-out infinite"
              }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(232,98,26,0.95)", border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 16px rgba(232,98,26,0.5)" }}>
                  <Navigation size={20} color="#fff" style={{ transform: `rotate(${targetBearing - heading}deg)` }} />
                </div>
                <div style={{ marginTop: 6, background: "rgba(255,255,255,0.97)", border: "1px solid #e2e8f0", borderRadius: 10, padding: "4px 10px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: 160 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentStall.label}</div>
                  <div style={{ fontSize: 9, color: "#e8621a", fontWeight: 700 }}>{totalDistance}m away</div>
                </div>
              </div>
            ) : (
              <div style={{ position: "absolute", inset: "0 52px", top: "38%", display: "flex", justifyContent: relNextAngle < 0 ? "flex-start" : "flex-end" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.97)", border: "1px solid #e2e8f0", borderRadius: 999, padding: "6px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", animation: "pulse 1s ease-in-out infinite" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1e293b" }}>{relNextAngle < 0 ? "◀ Turn Left" : "Turn Right ▶"}</span>
                  <span style={{ fontSize: 9, color: "#e8621a", fontWeight: 700 }}>{Math.round(Math.abs(relNextAngle))}°</span>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT HUD CONTROLS ── */}
          <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 5 }}>
            {!hasOrientation && (
              <button onClick={requestCompassPermission} className="ctrl-btn" style={{ background: "#e8621a", color: "#fff", borderColor: "#e8621a", marginBottom: 4 }} title="Request Compass">
                <Compass size={15} />
              </button>
            )}
            <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.8)", borderRadius: 12, padding: 5, display: "flex", flexDirection: "column", gap: 4, backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <button onClick={handleStepForward} className="ctrl-btn primary" title="Step Forward"><Navigation size={14} /></button>
              <button onClick={handleRotateLeft} className="ctrl-btn" title="Rotate Left"><RotateCw size={13} style={{ transform: "scaleX(-1)" }} /></button>
              <button onClick={handleRotateRight} className="ctrl-btn" title="Rotate Right"><RotateCw size={13} /></button>
              <div style={{ height: 1, background: "rgba(226,232,240,0.8)", margin: "1px 0" }} />
              <button onClick={handleResetPosition} className="ctrl-btn" title="Reset Position" style={{ fontSize: 7, fontWeight: 800, color: "#64748b" }}>RST</button>
            </div>
          </div>

          {/* ── BOTTOM INFO CARD ── */}
          {showCard && (
            <div className="ar-info-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(232,98,26,0.1)", border: "1px solid rgba(232,98,26,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Navigation size={15} color="#e8621a" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#1a5c2a", textTransform: "uppercase", letterSpacing: "0.06em" }}>Target</span>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e8621a", display: "inline-block" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentStall.label}</div>
                  <div style={{ fontSize: 9, color: "#64748b" }}>{currentStall.zone} · <span style={{ color: "#e8621a", fontWeight: 700 }}>{totalDistance}m</span></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
                <button onClick={() => setShowScanner(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "#1a5c2a", color: "#fff", fontSize: 10, fontWeight: 700, border: "none", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <QrCode size={12} /><span>Scan QR</span>
                </button>
                <button onClick={() => setShowCard(false)} style={{ width: 28, height: 28, borderRadius: 7, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0 }}>
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {!showCard && (
            <button onClick={() => setShowCard(true)} style={{ position: "absolute", bottom: 10, left: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.95)", border: "1px solid #e2e8f0", borderRadius: 999, padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#1e293b", cursor: "pointer", zIndex: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Info size={11} color="#e8621a" /><span>Show Info</span>
            </button>
          )}
        </div>

        {/* ── MAP PANEL ── */}
        <div
          className={`ar-map-panel${!isMobile && mapCollapsed ? " collapsed-desktop" : ""}`}
          style={isMobile ? { height: mapCollapsed ? MAP_HEADER_H : MAP_EXPANDED_H } : {}}
        >
          {/* Map header */}
          <div className="ar-map-header" onClick={() => setMapCollapsed(c => !c)}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Map size={13} color="#e8621a" style={{ flexShrink: 0 }} />
              {(!isMobile || true) && (
                <span className="ar-map-header-label">
                  {isMobile
                    ? mapCollapsed ? "Show Floor Map" : "Hide Floor Map"
                    : "Floor Map"}
                </span>
              )}
            </div>
            <div style={{ color: "#94a3b8", flexShrink: 0 }}>
              {mapCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
          </div>

          {/* Map body — hidden when collapsed */}
          {(!mapCollapsed || (!isMobile && !mapCollapsed)) && (
            <div className="ar-map-body">
              <svg
                viewBox="0 0 800 450"
                preserveAspectRatio="xMidYMid meet"
                onClick={handleMapClick}
                style={{ width: "100%", height: "100%", cursor: "crosshair", userSelect: "none" }}
              >
                <image xlinkHref={mapImage} href={mapImage} x="0" y="0" width="800" height="450" />

                {QR_ANCHORS.map(a => (
                  <g key={a.id} transform={`translate(${a.x},${a.y})`}>
                    <circle r="8" fill="rgba(232,98,26,0.9)" stroke="#fff" strokeWidth="1.5" />
                    <rect x="-3" y="-3" width="6" height="6" fill="#fff" />
                    <rect x="-2" y="-2" width="4" height="4" fill="#0f172a" />
                    <rect x="-1" y="-1" width="2" height="2" fill="#fff" />
                  </g>
                ))}

                {STALLS_AR.filter(s => selectedCategory === "all" || s.category === selectedCategory).map(s => (
                  <g key={s.id} transform={`translate(${s.x},${s.y})`}>
                    <circle r="9" fill={s.id === selectedStallId ? "#e8621a" : "rgba(226,232,240,0.9)"} stroke={s.id === selectedStallId ? "#fff" : "#475569"} strokeWidth="1.5" />
                    <text y="2.5" textAnchor="middle" fontSize="6" fontWeight="900" fill={s.id === selectedStallId ? "#fff" : "#1e293b"}>{s.id.split('-')[1] || s.id}</text>
                  </g>
                ))}

                <polyline
                  points={pathPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke="#e8621a" strokeWidth="3.5"
                  strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round"
                />

                <g transform={`translate(${userX},${userY})`}>
                  <path d="M0 0 L-35 -60 A70 70 0 0 1 35 -60 Z" fill="rgba(26,92,42,0.22)" transform={`rotate(${heading})`} style={{ transformOrigin: "0px 0px" }} />
                  <g transform={`rotate(${heading})`}>
                    <circle r="12" fill="#1a5c2a" stroke="#fff" strokeWidth="2" />
                    <path d="M0 -7 L6 5 L0 2 L-6 5 Z" fill="#fff" />
                  </g>
                </g>
              </svg>

              <div className="sim-badge">
                <Compass size={10} className="animate-spin-slow" />
                <span>{userX}, {userY} | {heading}°</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── QR SCANNER OVERLAY ── */}
      {showScanner && (
        <div className="scanner-overlay">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 360, gap: 14 }}>
            {/* Scanner frame */}
            <div style={{ position: "relative", width: 140, height: 140, border: "2px dashed #e8621a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8fafc", flexShrink: 0 }}>
              {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], i) => (
                <div key={i} style={{ position: "absolute", [v]: 6, [h]: 6, width: 18, height: 18, borderTop: v === "top" ? "4px solid #1a5c2a" : "none", borderBottom: v === "bottom" ? "4px solid #1a5c2a" : "none", borderLeft: h === "left" ? "4px solid #1a5c2a" : "none", borderRight: h === "right" ? "4px solid #1a5c2a" : "none", borderRadius: h === "left" && v === "top" ? "5px 0 0 0" : h === "right" && v === "top" ? "0 5px 0 0" : h === "left" && v === "bottom" ? "0 0 0 5px" : "0 0 5px 0" }} />
              ))}
              <QrCode size={48} color="rgba(26,92,42,0.3)" />
              <div className="animate-scanLine" style={{ left: 0, right: 0, height: 2, background: "#e8621a", boxShadow: "0 0 8px rgba(232,98,26,0.9)" }} />
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: 4, width: "100%" }}>
              {["simulate", "guide"].map(tab => (
                <button key={tab} onClick={() => setActiveScannerTab(tab)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, fontSize: 12, fontWeight: 800, border: "none", cursor: "pointer", background: activeScannerTab === tab ? "#1a5c2a" : "transparent", color: activeScannerTab === tab ? "#fff" : "#64748b", transition: "background 0.15s" }}>
                  {tab === "simulate" ? "Scan Simulator" : "Real-World Guide"}
                </button>
              ))}
            </div>

            {activeScannerTab === "simulate" ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>QR Anchor Calibration</p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Tap a location to simulate scanning its QR poster.</p>
                </div>
                {QR_ANCHORS.map(a => (
                  <button key={a.id} onClick={() => handleSimulateScan(a)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
                    <span>{a.label}</span>
                    <span style={{ fontSize: 10, color: "#e8621a", background: "rgba(232,98,26,0.08)", border: "1px solid rgba(232,98,26,0.2)", borderRadius: 6, padding: "2px 8px" }}>{a.zone}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, fontSize: 11, color: "#475569" }}>
                <div style={{ background: "#edf5ed", border: "1px solid rgba(26,92,42,0.2)", borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#1a5c2a", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}><Info size={13} />How QR Positioning Works</p>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>Indoor environments lack GPS. Scanning fixed QR codes resets your (x,y) coordinates to the poster's known location.</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#e8621a", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Physical Code Setup</p>
                  <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
                    <li>Use any free QR generator (e.g., qr-code-generator.com).</li>
                    <li>Generate plain-text QR codes with the Scan Text below.</li>
                    <li>Print and place at the corresponding location.</li>
                  </ol>
                </div>
                {QR_ANCHORS.map(a => (
                  <div key={a.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{a.label}</span>
                      <span style={{ fontSize: 9, color: "#64748b" }}>{a.zone}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#f1f5f9", borderRadius: 6, padding: "4px 8px" }}>
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>Scan Text:</span>
                      <code style={{ fontSize: 10, color: "#e8621a", fontWeight: 700 }}>{a.id}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowScanner(false)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer", marginTop: 4 }}>
              <X size={14} /><span>Cancel Scan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}