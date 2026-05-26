import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../utils/auth';
import adminPhoto from '../../images/ContractorSample.jpg'  // swap with your actual image path


const NAV_ITEMS = [
  {
    id: 'nav-dashboard', label: 'Dashboard', path: '/contractor/dashboard',
    icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'nav-stalls', label: 'Stalls', path: '/contractor/stalls',
    icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  },
  {
    id: 'nav-apps', label: 'Applications', path: '/contractor/applications',
    icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    id: 'nav-records', label: 'Records', path: '/contractor/records',
    icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  },
  {
    id: 'nav-profile', label: 'Profile', path: '/contractor/profile',
    icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

const SETTINGS_ITEMS = [
  {
    id: 'personal-info', label: 'Personal Information', path: '/contractor/profile/personal',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    id: 'security', label: 'Security', path: '/contractor/profile/security',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    id: 'notifications', label: 'Notification Settings', path: '/contractor/profile/notifications',
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
]

const LogoutIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function ContractorProfile() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('nav-profile')
  const [showLogout, setShowLogout] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { userName, loading } = useCurrentUser();

  const handleNav = (item) => { setActiveNav(item.id); navigate(item.path) }
  const handleLogout = () => navigate('/login')

  return (
    <div className="profile-root">

      {/* ── Logout Modal ── */}
      {showLogout && (
        <div className="logout-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon"><LogoutIcon /></div>
            <h3 className="logout-modal-title">Log Out?</h3>
            <p className="logout-modal-msg">You'll be signed out of your admin session.</p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="logout-confirm-btn" id="confirm-logout" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="contractor-header">
        <div className="header-logo">
          <span className="logo-icon">🏪</span>
          <span className="logo-text">MyTalipapa</span>
        </div>
        <div className="header-right">
          <button className="notif-btn" aria-label="Notifications">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notif-dot" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="profile-body">

        {/* Sidebar */}
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
        </nav>

        {/* Main */}
        <main className="profile-main">

          {/* Hero */}
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              {!imgError
                ? <img src={adminPhoto} alt="Admin Maria Clara" className="profile-avatar" onError={() => setImgError(true)} />
                : <div className="profile-avatar-fallback">MC</div>
              }
              <button className="profile-edit-btn" aria-label="Edit photo">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <div className="profile-hero-text">
                <h1 className="profile-name">{loading ? 'Loading…' : userName ? `${userName}` : 'Welcome, Guest'}</h1>
              <span className="profile-badge">Contractor / Administrator</span>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat-card">
              <span className="profile-stat-label">Total Managed</span>
              <span className="profile-stat-value green">120</span>
              <span className="profile-stat-sub">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                +4 this month
              </span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-label">Active Renters</span>
              <span className="profile-stat-value orange">105</span>
              <span className="profile-stat-sub">Occupancy: 87.5%</span>
            </div>
          </div>

          {/* Settings */}
          <div className="profile-settings">
            <h2 className="profile-settings-title">Account Settings</h2>
            <div className="profile-settings-card">
              {SETTINGS_ITEMS.map(item => (
                <button key={item.id} id={item.id} className="profile-settings-item" onClick={() => navigate(item.path)}>
                  <span className="settings-icon">{item.icon}</span>
                  <span className="settings-label">{item.label}</span>
                  <span className="settings-chevron">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="profile-logout-wrap">
            <button className="profile-logout-btn" id="profile-logout" onClick={() => setShowLogout(true)}>
              <LogoutIcon />
              Logout
            </button>
          </div>

          <p className="profile-version">Version 2.4.0 (2024)</p>
        </main>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="contractor-bottom-nav" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`ct-nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item)}
          >
            <span className="ct-nav-icon">{item.icon}</span>
            <span className="ct-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}