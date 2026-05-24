import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../utils/auth';
import marketImage from '../../images/market_live_view.png'


const STATS = [
  {
    id: 'total-stalls',
    label: 'TOTAL STALLS',
    value: 120,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="17" />
        <line x1="9" y1="14.5" x2="15" y2="14.5" />
      </svg>
    ),
    accent: 'var(--color-brand-green)',
  },
  {
    id: 'available',
    label: 'AVAILABLE',
    value: 15,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    accent: '#16a34a',
  },
  {
    id: 'occupied',
    label: 'OCCUPIED',
    value: 105,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    accent: '#2563eb',
  },
  {
    id: 'pending',
    label: 'PENDING',
    value: 8,
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    accent: '#dc2626',
  },
]

const APPLICATIONS = [
  {
    id: 'app-1',
    name: 'Jose Rizal',
    stall: '#045',
    date: 'Oct 25, 2023',
    type: 'PRODUCE VENDOR',
    typeColor: '#16a34a',
    status: 'pending',
  },
  {
    id: 'app-2',
    name: 'Andres Bonifacio',
    stall: '#012',
    date: 'Oct 24, 2023',
    type: 'MEAT & POULTRY',
    typeColor: '#dc2626',
    status: 'pending',
  },
  {
    id: 'app-3',
    name: 'Melchora Aquino',
    stall: '#088',
    date: 'Oct 24, 2023',
    type: 'DRY GOODS',
    typeColor: '#d97706',
    status: 'pending',
  },
]

const NAV_ITEMS = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    path: '/contractor/dashboard',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'nav-stalls',
    label: 'Stalls',
    path: '/contractor/stalls',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: 'nav-apps',
    label: 'Apps',
    path: '/contractor/applications',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'nav-records',
    label: 'Records',
    path: '/contractor/records',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    id: 'nav-profile',
    label: 'Profile',
    path: '/contractor/profile',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

// Circular progress SVG component
function OccupancyRing({ percent }) {
  const r = 70
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="occupancy-ring">
      {/* Track */}
      <circle cx="90" cy="90" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      {/* Progress */}
      <circle
        cx="90" cy="90" r={r}
        fill="none"
        stroke="var(--color-brand-green)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 90 90)"
        className="occupancy-progress"
      />
      {/* Center text */}
      <text x="90" y="85" textAnchor="middle" className="ring-percent">{percent}%</text>
      <text x="90" y="103" textAnchor="middle" className="ring-label">Capacity</text>
    </svg>
  )
}

export default function ContractorDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('nav-dashboard')
  const [applications, setApplications] = useState(APPLICATIONS)
  const [actionMap, setActionMap] = useState({})
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  // New hook to get current user's display name
  const { userName, loading } = useCurrentUser()

  const occupancy = Math.round((105 / 120) * 100)

  const handleNav = (item) => {
    setActiveNav(item.id)
    navigate(item.path)
  }

  const handleAction = (id, action) => {
    setActionMap(prev => ({ ...prev, [id]: action }))
    setTimeout(() => {
      setApplications(prev => prev.filter(a => a.id !== id))
      setActionMap(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }, 600)
  }

  const handleLogout = () => {
    // Add your logout logic here (clear auth tokens, etc.)
    navigate('/login')
  }

  const LogoutIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )

  return (
    <div className="dashboard-root">
      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="logout-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <LogoutIcon />
            </div>
            <h3 className="logout-modal-title">Log Out?</h3>
            <p className="logout-modal-msg">You'll be signed out of your contractor session.</p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn" id="confirm-logout" onClick={handleLogout}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-logo">
          <span className="logo-icon">🏪</span>
          <span className="logo-text">MyTalipapa</span>
        </div>
        <div className="header-right">
          <div className="header-welcome">
            <span className="welcome-name">{loading ? 'Loading…' : userName ? `${userName}` : 'Welcome, Guest'}</span>
            <span className="welcome-role">Market Supervisor</span>
          </div>
          <button className="notif-btn" id="notif-button" aria-label="Notifications">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot" />
          </button>
          {/* Logout button in header (visible on mobile/tablet) */}
          <button
            className="header-logout-btn"
            id="header-logout"
            aria-label="Log out"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="dashboard-body">

        {/* Sidebar (visible on desktop ≥1024px) */}
        <nav className="sidebar-nav" aria-label="Sidebar Navigation">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`sidebar-${item.id}`}
              className={`sidebar-nav-item ${activeNav === item.id ? 'nav-active' : ''}`}
              onClick={() => handleNav(item)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          {/* Logout at the bottom of the sidebar */}
          <div className="sidebar-logout-spacer" />
          <button
            className="sidebar-nav-item sidebar-logout-item"
            id="sidebar-logout"
            onClick={() => setShowLogoutModal(true)}
          >
            <span className="nav-icon">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="nav-label">Log Out</span>
          </button>
        </nav>

        {/* Main scrollable content */}
        <main className="dashboard-main">
          {/* Stats Row */}
          <section className="stats-grid" aria-label="Market Statistics">
            {STATS.map(stat => (
              <div key={stat.id} id={stat.id} className="stat-card" style={{ '--accent': stat.accent }}>
                <div className="stat-top">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-icon" style={{ color: stat.accent }}>{stat.icon}</span>
                </div>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </section>

          {/* Revenue + Occupancy + Live View */}
          <section className="middle-grid" aria-label="Revenue and Occupancy">
            {/* Revenue Card */}
            <div className="revenue-card" id="revenue-card">
              <p className="revenue-label">TOTAL MONTHLY REVENUE</p>
              <h2 className="revenue-amount">₱425,000</h2>
              <div className="revenue-watermark">
                <svg width="120" height="100" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.15)" strokeWidth={1.2}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="revenue-footer">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>12% increase from last month</span>
              </div>
            </div>

            {/* Occupancy Card */}
            <div className="occupancy-card" id="occupancy-card">
              <h3 className="occupancy-title">Market Occupancy</h3>
              <OccupancyRing percent={occupancy} />
              <p className="occupancy-msg">
                The market is currently <span className="near-full">near full capacity</span>.
              </p>
            </div>

            {/* Live View Card */}
            <div className="liveview-card" id="liveview-card">
              <img
                src={marketImage}
                alt="Main Produce Section B live view"
                className="liveview-img"
              />
              <div className="liveview-overlay">
                <span className="live-badge">
                  <span className="live-dot" /> LIVE VIEW
                </span>
                <span className="liveview-label">Main Produce Section B</span>
              </div>
            </div>
          </section>

          {/* Recent Applications */}
          <section className="applications-section" aria-label="Recent Applications">
            <div className="applications-header">
              <h3 className="applications-title">Recent Applications</h3>
              <button className="view-all-btn" id="view-all-applications">View All</button>
            </div>
            <div className="applications-list">
              {applications.length === 0 ? (
                <div className="no-applications">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>All applications reviewed!</p>
                </div>
              ) : (
                applications.map(app => (
                  <div
                    key={app.id}
                    id={app.id}
                    className={`application-row ${actionMap[app.id] ? `action-${actionMap[app.id]}` : ''}`}
                  >
                    <div className="app-avatar">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth={1.8}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="app-info">
                      <span className="app-name">{app.name}</span>
                      <span className="app-meta">Stall {app.stall} • {app.date}</span>
                      <span className="app-type" style={{ color: app.typeColor }}>{app.type}</span>
                    </div>
                    <div className="app-actions">
                      <button
                        id={`reject-${app.id}`}
                        className="btn-reject"
                        onClick={() => handleAction(app.id, 'rejected')}
                        disabled={!!actionMap[app.id]}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject
                      </button>
                      <button
                        id={`approve-${app.id}`}
                        className="btn-approve"
                        onClick={() => handleAction(app.id, 'approved')}
                        disabled={!!actionMap[app.id]}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ── Bottom Navigation (mobile/tablet only, hidden on desktop) ── */}
      <nav className="bottom-nav" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={item.id}
            className={`nav-item ${activeNav === item.id ? 'nav-active' : ''}`}
            onClick={() => handleNav(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}