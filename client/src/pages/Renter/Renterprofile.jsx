/**
 * RenterProfile.jsx
 * Profile page for MyTalipapa renter app.
 * Matches mobile + tablet screenshots.
 *
 * Props:
 *   onNavigate(tab) – from RenterLayout
 *   onLogout()      – from RenterLayout
 */
import { useState } from 'react'
import {
  Bell, User, ChevronRight, ExternalLink,
  LogOut, Shield, Bell as BellIcon,
  ShoppingBag, Calendar, CheckCircle, Edit,
} from 'lucide-react'

/* ── Static mock data ────────────────────────────────────────── */
const USER = {
  name:       'Ricardo "Ric" Santos',
  avatar:     'https://randomuser.me/api/portraits/men/32.jpg',
  verified:   true,
}

const RENTAL = {
  section:     'Dry Goods Section – Block A',
  stallNumber: '#A-142',
  monthlyRate: '₱4,500',
  nextDue:     'Oct 15, 2023',
  status:      'ACTIVE',
}

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

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      onLogout?.()
    }, 600)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-[#1a5c2a] font-extrabold text-sm tracking-tight md:invisible">
          <ShoppingBag size={15} />
          MyTalipapa
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition ml-auto">
          <Bell size={17} className="text-gray-500" />
        </button>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">

        {/* ── Hero: avatar + name + badge + edit ── */}
        <div className="flex flex-col items-center pt-8 pb-5 px-4">
          {/* Avatar with edit badge */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img
                src={USER.avatar}
                alt={USER.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Green edit dot */}
            <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-[#1a5c2a] rounded-full border-2 border-white flex items-center justify-center">
              <Edit size={10} color="white" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-lg font-extrabold text-gray-900 text-center leading-tight">
            {USER.name}
          </h1>

          {/* Verified badge */}
          {USER.verified && (
            <div className="flex items-center gap-1 mt-1.5 bg-[#1a5c2a] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <CheckCircle size={10} />
              Verified Renter
            </div>
          )}

          {/* Edit Profile button */}
          <button className="mt-4 bg-[#1a5c2a] hover:bg-[#154d23] active:scale-[0.98] text-white text-sm font-bold px-8 py-2.5 rounded-xl transition-all duration-200 shadow-sm">
            Edit Profile
          </button>
        </div>

        {/* ── Account Settings ── */}
        <SectionLabel>Account Settings</SectionLabel>

        <div className="bg-white border-y border-gray-100">
          <MenuRow icon={User}    label="Personal Information"  />
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
        <div className="mx-4 md:mx-6 mt-5 bg-[#e8621a] rounded-2xl p-4 relative overflow-hidden">
          {/* ACTIVE badge */}
          <span className="absolute top-3.5 right-3.5 bg-white/25 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">
            {RENTAL.status}
          </span>

          <p className="text-white font-extrabold text-sm mb-0.5">Active Rental Info</p>
          <p className="text-white/75 text-[11px] mb-4">{RENTAL.section}</p>

          {/* Stall + Rate fields */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/20 rounded-xl px-3 py-2.5">
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">Stall Number</p>
              <p className="text-white font-extrabold text-sm">{RENTAL.stallNumber}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2.5">
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-0.5">Monthly Rate</p>
              <p className="text-white font-extrabold text-sm">{RENTAL.monthlyRate}</p>
            </div>
          </div>

          {/* Next payment due */}
          <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
            <Calendar size={12} />
            Next payment due: <span className="font-extrabold">{RENTAL.nextDue}</span>
          </div>
        </div>

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
    </div>
  )
}