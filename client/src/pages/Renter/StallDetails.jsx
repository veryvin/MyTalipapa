import { useState } from "react";

// --- Icons ---
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const HomeIcon = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const NavigateIcon = () => <Icon d="M3 12h18M12 3l9 9-9 9" />;
const StallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7" /><rect x="3" y="9" width="18" height="13" rx="1" /><path d="M9 22V12h6v10" />
  </svg>
);
const ApplicationIcon = () => <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />;
const ProfileIcon = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const RecordsIcon = () => <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />;
const ChevronRightIcon = () => <Icon d="M9 18l6-6-6-6" size={16} />;
const ArrowLeftIcon = () => <Icon d="M19 12H5M12 5l-7 7 7 7" size={20} />;
const ShareIcon = () => <Icon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13" size={18} />;
const ZoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const SizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);
const WaterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/>
  </svg>
);
const PowerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const WasteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const TourIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
  </svg>
);
const InquiryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const navItems = [
  { label: "Home", icon: <HomeIcon />, path: "home" },
  { label: "Navigate", icon: <NavigateIcon />, path: "navigate" },
  { label: "Stalls", icon: <StallIcon />, path: "stalls" },
  { label: "Applications", icon: <ApplicationIcon />, path: "applications" },
  { label: "Records", icon: <RecordsIcon />, path: "records" },
  { label: "Profile", icon: <ProfileIcon />, path: "profile" },
];

// --- Floor plan grid ---
const floorGrid = [
  ["038", "039", "040", "041"],
  ["043", "042", "044", "045"],
  ["046", "047", "048", "049"],
];

const stallData = {
  id: "042",
  section: "Meat Section",
  zone: "Zone C",
  size: 15,
  monthlyRate: 6000,
  status: "available",
  img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop",
  description:
    "This premium stall is situated in the heart of the Meat Section, offering high foot traffic from early morning shoppers. Its prime corner location ensures maximum visibility from both the main entrance and the central walkway.",
  amenities: [
    { label: "Water Supply", icon: <WaterIcon />, color: "text-[#2d6a2d] bg-[#edf5ed] border-[#c3dfc3]" },
    { label: "220V Outlets", icon: <PowerIcon />, color: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Waste Management", icon: <WasteIcon />, color: "text-sky-700 bg-sky-50 border-sky-200" },
  ],
};

// --- Sidebar (reused from parent) ---
const Sidebar = ({ active, setActive, collapsed, setCollapsed }) => (
  <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"} shrink-0`}>
    <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 ${collapsed ? "justify-center" : ""}`}>
      <div className="w-8 h-8 bg-[#2d6a2d] rounded-lg flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
      </div>
      {!collapsed && <span className="font-bold text-gray-900 text-base tracking-tight">MyTalipapa</span>}
    </div>
    <nav className="flex-1 py-4 px-2 space-y-0.5">
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => setActive(item.path)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
            active === item.path ? "bg-[#edf5ed] text-[#2d6a2d]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          } ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? item.label : ""}
        >
          <span className={active === item.path ? "text-[#2d6a2d]" : "text-gray-400 group-hover:text-gray-600"}>{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && active === item.path && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2d6a2d]" />}
        </button>
      ))}
    </nav>
    <div className="p-3 border-t border-gray-100">
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 text-xs font-medium transition-all ${collapsed ? "justify-center" : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed ? <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/> : <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>}
        </svg>
        {!collapsed && "Collapse"}
      </button>
    </div>
  </aside>
);

// --- Mobile Bottom Bar ---
const BottomBar = ({ active, setActive }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50">
    {navItems.map(item => (
      <button
        key={item.path}
        onClick={() => setActive(item.path)}
        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${active === item.path ? "text-[#2d6a2d]" : "text-gray-400"}`}
      >
        <span>{item.icon}</span>
        <span className="text-[10px] font-medium">{item.label}</span>
        {active === item.path && <span className="w-1 h-1 rounded-full bg-[#2d6a2d]" />}
      </button>
    ))}
  </nav>
);

// --- Stall Detail Page ---
export default function StallDetail() {
  const [activeNav, setActiveNav] = useState("stalls");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const stall = stallData;

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Desktop Top Header */}
        <header className="hidden md:flex bg-white border-b border-gray-100 px-6 py-4 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Market</span>
            <ChevronRightIcon />
            <span>Stalls</span>
            <ChevronRightIcon />
            <span className="text-gray-700 font-medium">Stall #{stall.id}</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ShareIcon />
          </button>
        </header>

        {/* Mobile Header — overlaid on image */}
        <div className="md:hidden relative">
          {/* Hero Image */}
          <div className="relative h-52 w-full overflow-hidden">
            <img
              src={stall.img}
              alt={stall.section}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
              <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow text-gray-700">
                <ArrowLeftIcon />
              </button>
              <span className="font-semibold text-white text-sm drop-shadow">Stall #{stall.id}</span>
              <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow text-gray-700">
                <ShareIcon />
              </button>
            </div>
            {/* Available badge */}
            <div className="absolute top-4 right-4 mt-10">
              <span className="bg-[#2d6a2d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Available
              </span>
            </div>
          </div>

          {/* Mobile card content */}
          <div className="bg-white rounded-t-3xl -mt-4 relative px-4 pt-4 pb-4 shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Stall #{stall.id}</h1>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                  <span>{stall.section}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Monthly Rate</p>
                <p className="text-xl font-bold text-gray-900">₱{stall.monthlyRate.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Hero */}
        <div className="hidden md:block px-6 pt-5">
          <div className="relative rounded-2xl overflow-hidden h-56 w-full shadow-sm">
            <img
              src={stall.img}
              alt={stall.section}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-3 right-3">
              <span className="bg-[#2d6a2d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Desktop — title & rate card */}
        <div className="hidden md:block px-6 pt-4">
          <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stall #{stall.id}</h1>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                <span>{stall.section}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Monthly Rate</p>
              <p className="text-2xl font-bold text-gray-900">₱{stall.monthlyRate.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Shared body content */}
        <div className="px-4 md:px-6 pt-3 pb-4 space-y-3">

          {/* Description */}
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {stall.description.split("high foot traffic").map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<strong className="text-gray-900 font-semibold">high foot traffic</strong></span>
                  : <span key={i}>{part}</span>
              )}
            </p>
          </div>

          {/* Zone + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 bg-[#edf5ed] rounded-lg flex items-center justify-center text-[#2d6a2d] shrink-0">
                <ZoneIcon />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Zone</p>
                <p className="text-sm font-bold text-gray-900">{stall.zone}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 shrink-0">
                <SizeIcon />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Size</p>
                <p className="text-sm font-bold text-gray-900">{stall.size} sqm</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2.5">Stall Amenities</p>
            <div className="flex flex-wrap gap-2">
              {stall.amenities.map(a => (
                <span
                  key={a.label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${a.color}`}
                >
                  {a.icon}
                  {a.label}
                </span>
              ))}
            </div>
          </div>

          {/* Floor Plan */}
          <div className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-3">Floor Plan Location</p>
            <div className="space-y-1.5">
              {floorGrid.map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-1.5">
                  {row.map(cell => (
                    <div
                      key={cell}
                      className={`h-10 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        cell === stall.id
                          ? "bg-[#e87722] text-white shadow-sm scale-105"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-gray-400">Section: Meat (Zone C)</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#e87722]" />
                <span className="text-[10px] text-gray-500">Your Selection</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            <button className="w-full py-3 rounded-xl border-2 border-[#2d6a2d] text-[#2d6a2d] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#edf5ed] transition-colors">
              <TourIcon />
              View in 360° Tour
            </button>
            <button className="w-full py-3 rounded-xl bg-[#e87722] hover:bg-[#d06618] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
              <InquiryIcon />
              Send Rental Inquiry
            </button>
          </div>
        </div>
      </main>

      <BottomBar active={activeNav} setActive={setActiveNav} />
    </div>
  );
}