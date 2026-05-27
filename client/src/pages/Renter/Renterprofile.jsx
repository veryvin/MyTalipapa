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

/* ── Section header label ────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 md:px-6 pt-5 pb-2">
      {children}
    </p>
  )
}

/* ── Menu row ────────────────────────────────────────────────── */
function MenuRow({ icon: Icon, label, external, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 md:px-6 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors group"
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
  const [editForm, setEditForm] = useState({
    fullName: '',
    contactNumber: ''
  })

  const fileInputRef = useRef(null)

  const updateProfile = async (data) => {
    setUpdating(true)
    try {
      const token = getToken()
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const handleAvatarClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      updateProfile({ profilePicture: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const openEditModal = () => {
    setEditForm({
      fullName: user.full_name || '',
      contactNumber: user.contact_number || ''
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({
      full_name: editForm.fullName,
      contact_number: editForm.contactNumber
    })
    setShowEditModal(false)
  }

  const currentUser = user;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken()
        if (!token) return
        const res = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
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
    if (!user || !user.email) {
      setLoadingRental(false);
      return;
    }

    fetch(`/api/renter/active-lease?email=${encodeURIComponent(user.email)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch active lease');
        return res.json();
      })
      .then(data => {
        if (data) {
          setActiveRental({
            stallNumber: data.stallNumber,
            section: `${data.section} Section`,
            monthlyRate: data.monthlyRate,
            nextDue: data.nextDue,
            status: data.status.toUpperCase()
          });
        } else {
          setActiveRental(null);
        }
        setLoadingRental(false);
      })
      .catch(err => {
        console.error('Error fetching profile lease details:', err);
        setLoadingRental(false);
      });
  }, [user?.email]);

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      onLogout?.()
    }, 600)
  }

  // Generate fallback name initials for avatar
  const getInitials = (name) => {
    if (!name) return 'R';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
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
          {/* Avatar with edit badge */}
          <div className="relative mb-3 cursor-pointer group animate-all" onClick={handleAvatarClick} title="Click to upload profile picture">
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
            {/* Green edit dot */}
            <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-[#1a5c2a] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <Edit size={10} color="white" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-lg font-extrabold text-gray-900 text-center leading-tight">
            {currentUser.full_name || currentUser.name || 'Renter Account'}
          </h1>

          {/* Email Address */}
          <p className="text-xs text-gray-400 text-center mt-1">
            {currentUser.email || 'renter@mytalipapa.com'}
          </p>

          {/* Contact number */}
          {currentUser.contact_number && (
            <p className="text-[11px] text-gray-400 text-center mt-0.5">
              {currentUser.contact_number}
            </p>
          )}

          {/* Verified badge */}
          <div className="flex items-center gap-1 mt-3 bg-[#1a5c2a] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <CheckCircle size={10} />
            Verified Renter
          </div>

          {/* Edit Profile button */}
          <button 
            onClick={openEditModal}
            className="mt-4 bg-[#1a5c2a] hover:bg-[#154d23] active:scale-[0.98] text-white text-sm font-bold px-8 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            Edit Profile
          </button>
        </div>

        {/* ── Account Settings ── */}
        <SectionLabel>Account Settings</SectionLabel>

        <div className="bg-white border-y border-gray-100">
          <MenuRow icon={User}    label="Personal Information" onClick={openEditModal} />
          <RowDivider />
          <MenuRow icon={BellIcon} label="Notification Settings" />
          <RowDivider />
          <MenuRow icon={Shield}  label="Security"              />
        </div>

        {/* ── Help & Support ── */}
        <SectionLabel>Help &amp; Support</SectionLabel>

        <div className="bg-white border-y border-gray-100">
          <MenuRow icon={ShoppingBag} label="Market Help Center" external />
          <RowDivider />
          <MenuRow icon={User}        label="Contact Admin"      />
        </div>

        {/* ── Active Rental Info card ── */}
        {activeRental ? (
          <div className="mx-4 md:mx-6 mt-5 bg-[#e8621a] rounded-2xl p-4 relative overflow-hidden shadow-sm">
            {/* ACTIVE badge */}
            <span className="absolute top-3.5 right-3.5 bg-white/25 text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              {activeRental.status}
            </span>

            <p className="text-white font-extrabold text-sm mb-0.5">Active Rental Info</p>
            <p className="text-white/75 text-[11px] mb-4">{activeRental.section}</p>

            {/* Stall + Rate fields */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/20 rounded-xl px-3 py-2.5">
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">Stall Number</p>
                <p className="text-white font-extrabold text-sm">{activeRental.stallNumber}</p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-2.5">
                <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">Monthly Rate</p>
                <p className="text-white font-extrabold text-sm">{activeRental.monthlyRate}</p>
              </div>
            </div>

            {/* Next payment due */}
            <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
              <Calendar size={12} />
              Next payment due: <span className="font-extrabold">{activeRental.nextDue}</span>
            </div>
          </div>
        ) : !loadingRental && (
          <div className="mx-4 md:mx-6 mt-5 bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#edf5ed] rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={20} className="text-[#1a5c2a]" />
            </div>
            <p className="font-bold text-gray-800 text-sm">No Active Lease</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Once your stall rental inquiry is approved by the contractor, your active rental lease info will appear here.
            </p>
          </div>
        )}

        {/* ── Logout button ── */}
        <div className="mx-4 md:mx-6 mt-4 mb-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 border border-[#e8621a] text-[#e8621a] hover:bg-orange-50 active:scale-[0.98] disabled:opacity-60 font-bold text-sm rounded-2xl py-3.5 transition-all duration-200"
          >
            <LogOut size={15} />
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>

      </div>

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900">Personal Information</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
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
              <div>
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
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={currentUser.email}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200/50 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl bg-[#1a5c2a] hover:bg-[#154d23] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {updating ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}