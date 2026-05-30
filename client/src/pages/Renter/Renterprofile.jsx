/**
 * RenterProfile.jsx
 * Profile page for MyTalipapa renter app.
 * Matches mobile + tablet screenshots.
 *
 * Props:
 *   onNavigate(tab) – from RenterLayout
 *   onLogout()      – from RenterLayout
 */
import { useState, useEffect, useRef } from 'react'
import {
  Bell, User, ChevronRight, ExternalLink,
  LogOut, Shield, Bell as BellIcon,
  ShoppingBag, Calendar, CheckCircle, Edit,
} from 'lucide-react'
import { getUser, saveUser, getToken } from '../../utils/auth'
import NotificationBell from '../../components/NotificationBell'

/* ── Animations ──────────────────────────────────────────────── */
const profileStyles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardPop {
    0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
    60%  { transform: translateY(-2px) scale(1.005); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bounceIn {
    0%   { opacity: 0; transform: scale(0.82); }
    60%  { transform: scale(1.06); }
    80%  { transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.94) translateY(14px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Top bar */
  .rp-topbar {
    animation: fadeSlideDown 0.35s ease both;
  }

  /* Hero section */
  .rp-avatar {
    animation: bounceIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .rp-avatar:hover {
    transform: scale(1.04);
  }
  .rp-name {
    animation: fadeSlideUp 0.38s ease 0.1s both;
  }
  .rp-email {
    animation: fadeSlideUp 0.38s ease 0.15s both;
  }
  .rp-badge {
    animation: bounceIn 0.4s ease 0.2s both;
  }
  .rp-edit-btn {
    animation: fadeSlideUp 0.38s ease 0.25s both;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, background-color 0.2s ease;
  }
  .rp-edit-btn:hover {
    transform: translateY(-1px);
  }
  .rp-edit-btn:active {
    transform: scale(0.97);
  }
  .rp-edit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  /* Section labels */
  .rp-section-label {
    animation: fadeSlideUp 0.35s ease both;
  }

  /* Menu group card */
  .rp-menu-group {
    animation: cardPop 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Individual menu rows */
  .rp-menu-row {
    transition: background-color 0.15s ease, transform 0.15s ease;
  }
  .rp-menu-row:hover {
    transform: translateX(2px);
  }
  .rp-menu-row:active {
    transform: scale(0.99);
  }

  /* Active rental card */
  .rp-rental-card {
    animation: cardPop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .rp-rental-field {
    animation: fadeSlideUp 0.35s ease both;
  }

  /* No lease card */
  .rp-no-lease {
    animation: cardPop 0.45s ease both;
  }
  .rp-no-lease-icon {
    animation: bounceIn 0.5s ease 0.1s both;
  }

  /* Modals */
  .rp-overlay {
    animation: overlayIn 0.2s ease both;
  }
  .rp-modal {
    animation: modalIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .rp-modal-close {
    transition: transform 0.15s ease, background-color 0.15s ease;
  }
  .rp-modal-close:hover {
    transform: scale(1.1);
  }
  .rp-modal-close:active {
    transform: scale(0.92);
  }
  .rp-modal-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, background-color 0.2s ease;
  }
  .rp-modal-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  .rp-modal-btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .rp-modal-btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .rp-topbar, .rp-avatar, .rp-name, .rp-email, .rp-badge, .rp-edit-btn,
    .rp-section-label, .rp-menu-group, .rp-menu-row, .rp-rental-card,
    .rp-rental-field, .rp-no-lease, .rp-no-lease-icon, .rp-overlay,
    .rp-modal, .rp-modal-close, .rp-modal-btn {
      animation: none !important;
      transition: none !important;
    }
  }
`

/* ── Section header label ────────────────────────────────────── */
function SectionLabel({ children, style }) {
  return (
    <p
      className="rp-section-label text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 md:px-6 pt-5 pb-2"
      style={style}
    >
      {children}
    </p>
  )
}

/* ── Menu row ────────────────────────────────────────────────── */
function MenuRow({ icon: Icon, label, external, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rp-menu-row w-full flex items-center justify-between px-4 md:px-6 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f0f7f0] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#1a5c2a]" />
        </div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      {external
        ? <ExternalLink size={15} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        : <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
      }
    </button>
  )
}

/* ── Divider between rows ────────────────────────────────────── */
function RowDivider() {
  return <div className="mx-4 md:mx-6 border-t border-gray-100" />
}

/* ── Main component ──────────────────────────────────────────── */
export default function RenterProfile({ onLogout }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeRental, setActiveRental] = useState(null)
  const [loadingRental, setLoadingRental] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState(getUser() || {})
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ fullName: '', contactNumber: '' })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fileInputRef = useRef(null)

  const updateProfile = async (data) => {
    setUpdating(true)
    try {
      const token = getToken()
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update profile')
      const result = await res.json()
      saveUser(result.user)
      setUser(result.user)
    } catch (err) {
      console.error(err)
      alert('Error updating profile: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarClick = () => fileInputRef.current.click()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updateProfile({ profilePicture: reader.result })
    reader.readAsDataURL(file)
  }

  const openEditModal = () => {
    setEditForm({ fullName: user.full_name || '', contactNumber: user.contact_number || '' })
    setShowEditModal(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({ full_name: editForm.fullName, contact_number: editForm.contactNumber })
    setShowEditModal(false)
  }

  const handleSecuritySettings = () => setShowPasswordModal(true)

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitPasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    try {
      const token = getToken()
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      })
      if (!res.ok) throw new Error('Password change failed')
      alert('Password changed successfully')
      setShowPasswordModal(false)
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    }
  }

  const currentUser = user

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken()
        if (!token) return
        const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          saveUser(data)
          setUser(data)
        }
      } catch (err) {
        console.error('Error fetching renter profile:', err)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!user || !user.email) { setLoadingRental(false); return }
    fetch(`/api/renter/active-lease?email=${encodeURIComponent(user.email)}`)
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json() })
      .then(data => {
        if (data) {
          setActiveRental({
            stallNumber: data.stallNumber,
            section: `${data.section} Section`,
            monthlyRate: data.monthlyRate,
            nextDue: data.nextDue,
            status: data.status.toUpperCase()
          })
        } else {
          setActiveRental(null)
        }
        setLoadingRental(false)
      })
      .catch(err => { console.error('Error fetching profile lease details:', err); setLoadingRental(false) })
  }, [user?.email])

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => onLogout?.(), 600)
  }

  const getInitials = (name) => {
    if (!name) return 'R'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <>
      <style>{profileStyles}</style>
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">

        {/* ── Top bar ── */}
        <header className="rp-topbar bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[#1a5c2a] font-extrabold text-sm tracking-tight md:invisible">
            <ShoppingBag size={15} />
            MyTalipapa
          </div>
          <div className="ml-auto flex items-center">
            <NotificationBell />
          </div>
        </header>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">

          {/* ── Hero: avatar + name + badge + edit ── */}
          <div className="flex flex-col items-center pt-8 pb-5 px-4">

            {/* Avatar */}
            <div
              className="rp-avatar relative mb-3 cursor-pointer group"
              onClick={handleAvatarClick}
              title="Click to upload profile picture"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-gray-500 font-extrabold text-xl group-hover:opacity-90 transition-opacity">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.full_name || currentUser.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(currentUser.full_name || currentUser.name)}</span>
                )}
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-[#1a5c2a] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <Edit size={10} color="white" />
              </div>
            </div>

            {/* Name */}
            <h1 className="rp-name text-lg font-extrabold text-gray-900 text-center leading-tight">
              {currentUser.full_name || currentUser.name || 'Renter Account'}
            </h1>

            {/* Email */}
            <p className="rp-email text-xs text-gray-400 text-center mt-1">
              {currentUser.email || 'renter@mytalipapa.com'}
            </p>

            {/* Contact number */}
            {currentUser.contact_number && (
              <p className="rp-email text-[11px] text-gray-400 text-center mt-0.5" style={{ animationDelay: '0.18s' }}>
                {currentUser.contact_number}
              </p>
            )}

            {/* Verified badge */}
            <div className="rp-badge flex items-center gap-1 mt-3 bg-[#1a5c2a] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <CheckCircle size={10} />
              Verified Renter
            </div>

            {/* Edit Profile button */}
            <button
              onClick={openEditModal}
              className="rp-edit-btn mt-4 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-bold px-8 py-2.5 rounded-xl shadow-sm"
            >
              Edit Profile
            </button>
          </div>

          {/* ── Account Settings ── */}
          <SectionLabel style={{ animationDelay: '0.28s' }}>Account Settings</SectionLabel>

          <div className="rp-menu-group bg-white border-y border-gray-100" style={{ animationDelay: '0.32s' }}>
            <MenuRow icon={User} label="Personal Information" onClick={openEditModal} />
            <RowDivider />
            <RowDivider />
            <MenuRow icon={Shield} label="Security" onClick={handleSecuritySettings} />
          </div>

          {/* ── Help & Support ── */}
          <SectionLabel style={{ animationDelay: '0.38s' }}>Help &amp; Support</SectionLabel>

          <div className="rp-menu-group bg-white border-y border-gray-100" style={{ animationDelay: '0.42s' }}>
            <RowDivider />
            <MenuRow icon={User} label="Contact Admin" />
          </div>

          {/* ── Active Rental Info card ── */}
          {activeRental ? (
            <div className="rp-rental-card mx-4 md:mx-6 mt-5 bg-[#e8621a] rounded-2xl p-4 relative overflow-hidden shadow-sm" style={{ animationDelay: '0.48s' }}>
              <span className="absolute top-3.5 right-3.5 bg-white/25 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                {activeRental.status}
              </span>

              <p className="text-white font-extrabold text-sm mb-0.5">Active Rental Info</p>
              <p className="text-white/75 text-[11px] mb-4">{activeRental.section}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: 'Stall Number', value: activeRental.stallNumber },
                  { label: 'Monthly Rate', value: activeRental.monthlyRate },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="rp-rental-field bg-white/20 rounded-xl px-3 py-2.5"
                    style={{ animationDelay: `${0.54 + i * 0.07}s` }}
                  >
                    <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-white font-extrabold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div
                className="rp-rental-field flex items-center gap-1.5 text-white/90 text-[11px] font-semibold"
                style={{ animationDelay: '0.68s' }}
              >
                <Calendar size={12} />
                Next payment due: <span className="font-extrabold">{activeRental.nextDue}</span>
              </div>
            </div>
          ) : !loadingRental && (
            <div className="rp-no-lease mx-4 md:mx-6 mt-5 bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm" style={{ animationDelay: '0.48s' }}>
              <div className="rp-no-lease-icon w-12 h-12 bg-[#edf5ed] rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={20} className="text-[#1a5c2a]" />
              </div>
              <p className="font-bold text-gray-800 text-sm">No Active Lease</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Once your stall rental inquiry is approved by the contractor, your active rental lease info will appear here.
              </p>
            </div>
          )}

        </div>

        {/* ── Edit Profile Modal ── */}
        {showEditModal && (
          <div
            className="rp-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="rp-modal bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-900">Personal Information</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rp-modal-close w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                <div style={{ animation: 'fadeSlideUp 0.32s ease 0.05s both' }}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                    className="w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div style={{ animation: 'fadeSlideUp 0.32s ease 0.1s both' }}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Number</label>
                  <input
                    type="text"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm(f => ({ ...f, contactNumber: e.target.value }))}
                    required
                    className="w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200"
                    placeholder="+63 912 345 6789"
                  />
                </div>
                <div style={{ animation: 'fadeSlideUp 0.32s ease 0.15s both' }}>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200/50 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="pt-2 flex gap-3" style={{ animation: 'fadeSlideUp 0.32s ease 0.2s both' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rp-modal-btn flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rp-modal-btn rp-modal-btn-primary flex-1 py-3 rounded-xl bg-[#1a5c2a] hover:bg-[#154d23] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {updating ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Change Password Modal ── */}
        {showPasswordModal && (
          <div
            className="rp-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <div
              className="rp-modal bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="rp-modal-close w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={submitPasswordChange} className="p-6 space-y-4">
                {[
                  { label: 'Current Password', name: 'currentPassword' },
                  { label: 'New Password',     name: 'newPassword' },
                  { label: 'Confirm New Password', name: 'confirmPassword' },
                ].map(({ label, name }, i) => (
                  <div key={name} style={{ animation: `fadeSlideUp 0.32s ease ${0.05 + i * 0.07}s both` }}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="password"
                      name={name}
                      value={passwordForm[name]}
                      onChange={handlePasswordInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] transition-all duration-200"
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-4" style={{ animation: 'fadeSlideUp 0.32s ease 0.26s both' }}>
                  <button
                    type="submit"
                    className="rp-modal-btn rp-modal-btn-primary px-4 py-2 bg-[#1a5c2a] text-white rounded-lg hover:bg-[#154d23]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  )
}