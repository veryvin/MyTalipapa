/**
 * RenterLayout.jsx
 * Shell that owns activeTab + sidebarCollapsed state and renders
 * whichever page the nav points to.
 */
import { useState, useCallback } from 'react'
import { Home, Map, Store, FileText, User, LogOut } from 'lucide-react'

import RenterDashboard    from './RenterDashboard'
import RenterStalls       from './RenterStalls'
import StallDetails       from './StallDetails'
import RenterApplications from './RenterApplications'
import Renterprofile      from './Renterprofile'

const LogoutIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         Icon: Home     },
  { id: 'navigate',     label: 'Navigate',     Icon: Map      },
  { id: 'stalls',       label: 'Stalls',       Icon: Store    },
  { id: 'applications', label: 'Applications', Icon: FileText },
  { id: 'profile',      label: 'Profile',      Icon: User     },
]

/* ── Sidebar (desktop) ───────────────────────────────────────── */
function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {
  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-[#1a5c2a] rounded-lg flex items-center justify-center shrink-0">
          <Store size={15} color="white" />
        </div>
        {!collapsed && <span className="font-extrabold text-gray-900 text-base tracking-tight">MyTalipapa</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            title={collapsed ? label : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              active === id
                ? 'bg-[#edf5ed] text-[#1a5c2a]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className={active === id ? 'text-[#1a5c2a]' : 'text-gray-400 group-hover:text-gray-600'} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && active === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a5c2a]" />}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        {onLogout && (
          <button
            onClick={onLogout}
            title={collapsed ? 'Logout' : ''}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={15} />
            {!collapsed && 'Logout'}
          </button>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 text-xs font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed
              ? <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
              : <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />}
          </svg>
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}


/* ── Mobile bottom tab bar ───────────────────────────────────── */
function BottomBar({ active, setActive }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#1a5c2a]' : ''}`}>
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
              </div>
              <span className={`text-[9px] font-bold ${isActive ? 'text-[#1a5c2a]' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ── Placeholder ─────────────────────────────────────────────── */
function PlaceholderPage({ label }) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">
      {label} — coming soon
    </div>
  )
}

/* ── Layout shell ────────────────────────────────────────────── */
export default function RenterLayout() {
  const [activeTab,        setActiveTab]        = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStall,    setSelectedStall]    = useState(null)
  const [prefillStall,     setPrefillStall]     = useState(null)
  const [showLogout,       setShowLogout]       = useState(false)

  /* useCallback keeps navigate stable — never undefined on re-renders */
  const navigate = useCallback((tab) => {
    setActiveTab(tab)
    if (tab !== 'stalls') setSelectedStall(null)
    if (tab !== 'applications') setPrefillStall(null)
  }, [])

  const openStallDetail = useCallback((stall) => {
    setSelectedStall(stall)
    setActiveTab('stalls')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <RenterDashboard onNavigate={navigate} onOpenStall={openStallDetail} />

      case 'stalls':
        const getBusinessUseFromSection = (section) => {
          const sec = (section || "").toLowerCase();
          if (sec.includes("fish") || sec.includes("sea")) return "Fishes";
          if (sec.includes("meat")) return "Meat";
          if (sec.includes("veg") || sec.includes("produce") || sec.includes("fruit")) return "Vegetables";
          return "";
        };

        return selectedStall
          ? (
            <StallDetails 
              stall={selectedStall} 
              onBack={() => setSelectedStall(null)} 
              onNavigate={navigate} 
              onInquiry={(stall) => {
                setPrefillStall({ 
                  preferredStall: `Stall #${stall.stallNumber || stall.id}`,
                  intendedBusinessUse: getBusinessUseFromSection(stall.section || stall.category)
                })
                setActiveTab('applications')
              }}
            />
          )
          : <RenterStalls onNavigate={navigate} onOpenStall={openStallDetail} />

      case 'applications':
        return <RenterApplications onNavigate={navigate} prefill={prefillStall} />

      case 'navigate':
        return <PlaceholderPage label="Navigate" />

      case 'profile':
        return <Renterprofile onNavigate={navigate} onLogout={() => setShowLogout(true)} />

      default:
        return <PlaceholderPage label={activeTab} />
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f5f0] font-sans overflow-hidden">
      <Sidebar
        active={activeTab}
        setActive={navigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={() => setShowLogout(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {renderPage()}
      </div>

      <BottomBar active={activeTab} setActive={navigate} />

      {/* ── Logout Modal ── */}
      {showLogout && (
        <div className="logout-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon"><LogoutIcon /></div>
            <h3 className="logout-modal-title">Log Out?</h3>
            <p className="logout-modal-msg">You'll be signed out of your renter session.</p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="logout-confirm-btn" id="confirm-logout" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}