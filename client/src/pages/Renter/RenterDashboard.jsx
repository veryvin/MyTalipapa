import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  LogOut,
  Home,
  Map,
  Store,
  FileText,
  User,
  ChevronRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  Menu,
  Phone,
  Mail
} from 'lucide-react'

export default function RenterDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')

  const [currentUser] = useState(() => {
    try {
      const token = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')
      if (!token || !storedUser) return null
      const parsed = JSON.parse(storedUser)
      return parsed.role === 'renter' ? parsed : null
    } catch {
      return null
    }
  })

  const activeStall = {
    stallNumber: '#045',
    section: 'Produce Section B',
    monthlyRate: '₱3,500',
    status: 'Active',
    leaseStart: 'Nov 01, 2025',
    leaseEnd: 'Nov 01, 2026'
  }

  const applications = [
    { id: 'app-1', stall: '#045', section: 'Produce Section B', date: 'Oct 25, 2025', status: 'Approved', fee: '₱3,500/mo' },
    { id: 'app-2', stall: '#012', section: 'Meat & Poultry Section A', date: 'Oct 24, 2025', status: 'Rejected', fee: '₱4,200/mo' }
  ]

  const alerts = [
    { id: 'alert-1', type: 'info', message: 'Market cleanup is scheduled for next Monday. Stall operations will start at 9:00 AM.', date: 'May 22, 2026' },
    { id: 'alert-2', type: 'warning', message: 'Please ensure compliance with standard waste disposal regulations in Produce Section B.', date: 'May 20, 2026' }
  ]

  const appStats = {
    pending: applications.filter(a => a.status === 'Pending').length || 3,
    approved: applications.filter(a => a.status === 'Approved').length || 12,
    rejected: applications.filter(a => a.status === 'Rejected').length || 1
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!currentUser) return null

  const firstName = currentUser?.full_name?.split(' ')[0] || 'Juan'

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">

      {/* ── TOP NAVBAR ── */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Hamburger (mobile) + Brand */}
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-500 hover:text-gray-800 cursor-pointer">
              <Menu size={20} />
            </button>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">MyTalipapa</span>
          </div>

          {/* Right: greeting (desktop) + bell */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-800">Hello, {firstName}!</span>
              <span className="text-[10px] text-gray-400">Stall Owner</span>
            </div>
            <button className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-600">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN SCROLL AREA ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5 pb-24 md:pb-8">

        {/* Mobile greeting */}
        <div className="sm:hidden">
          <p className="text-base font-bold text-gray-900">Hello, {firstName}!</p>
          <p className="text-xs text-gray-400">Welcome back to your market dashboard.</p>
        </div>

        {/* Desktop greeting */}
        <div className="hidden sm:block">
          <p className="text-lg font-bold text-gray-900">Hello, {firstName}!</p>
          <p className="text-xs text-gray-400">Welcome back to your market dashboard.</p>
        </div>

        {/* ── ACTION BUTTONS: 360 Tour + Find Stall AR ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* View 360° Market Tour */}
          <button
            onClick={() => navigate('/renter/market-tour')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-6 px-4 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#1a5c2a' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {/* 360 icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                <path d="M3.6 9h16.8M3.6 15h16.8" />
                <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
              </svg>
            </div>
            <span className="text-center leading-tight">View 360° Market Tour</span>
          </button>

          {/* Find Stall via AR */}
          <button
            onClick={() => navigate('/renter/ar-finder')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-6 px-4 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#e07b00' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {/* AR / camera icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8V6a2 2 0 0 1 2-2h2" /><path d="M2 16v2a2 2 0 0 0 2 2h2" />
                <path d="M22 8V6a2 2 0 0 0-2-2h-2" /><path d="M22 16v2a2 2 0 0 1-2 2h-2" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-center leading-tight">Find Stall via AR</span>
          </button>
        </div>

        {/* ── APPLICATIONS OVERVIEW ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3">Applications Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            {/* Pending */}
            <div className="bg-white rounded-2xl py-4 px-3 flex flex-col items-center shadow-sm border border-gray-100">
              <span className="text-2xl font-extrabold text-gray-800">{appStats.pending}</span>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Pending</span>
            </div>
            {/* Approved */}
            <div className="bg-white rounded-2xl py-4 px-3 flex flex-col items-center shadow-sm border border-gray-100">
              <span className="text-2xl font-extrabold text-gray-800">{appStats.approved}</span>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Approved</span>
            </div>
            {/* Rejected */}
            <div className="bg-white rounded-2xl py-4 px-3 flex flex-col items-center shadow-sm border border-gray-100">
              <span className="text-2xl font-extrabold text-red-500">{appStats.rejected}</span>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">Rejected</span>
            </div>
          </div>
        </div>

        {/* ── MARKET NEWS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Market News</h2>
            <button className="text-xs font-bold text-green-700 hover:text-green-900 cursor-pointer">View All</button>
          </div>

          {/* News Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Market image */}
            <div className="relative w-full" style={{ paddingBottom: '42%' }}>
              <img
                src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80"
                alt="Market interior"
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.background = 'linear-gradient(135deg,#1a5c2a,#2f7a40)'
                }}
              />
              {/* Arrow button */}
              <button
                className="absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 transition-all shadow-md"
                style={{ backgroundColor: '#1a5c2a' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* News content */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-white" style={{ backgroundColor: '#e07b00' }}>
                  Announcement
                </span>
                <span className="text-[10px] font-bold text-gray-400">New</span>
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-1">New Stalls in Zone B</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Leasing starts next Monday. Reserve your spot early to get premium corner locations near the main entrance.
              </p>
            </div>
          </div>
        </div>

        {/* ── ACTIVE STALL LEASE ── (extra info below the fold) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-green-50 text-green-700">
                <Store size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Active Stall Lease</h3>
                <p className="text-[10px] text-gray-400">Current tenancy information</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">
              {activeStall.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Stall No.</p>
              <p className="text-base font-extrabold text-gray-800">{activeStall.stallNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Section</p>
              <p className="text-xs font-extrabold text-gray-800 truncate">{activeStall.section}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Monthly Rent</p>
              <p className="text-base font-extrabold text-green-800">{activeStall.monthlyRate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Expiry</p>
              <p className="text-xs font-extrabold text-red-500">{activeStall.leaseEnd}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span className="font-semibold">Lease Progress</span>
              <span>Started {activeStall.leaseStart}</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '58%', backgroundColor: '#1a5c2a' }}></div>
            </div>
          </div>
        </div>

        {/* ── APPLICATIONS TABLE ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-orange-50 text-orange-500">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">My Stall Applications</h3>
                <p className="text-[10px] text-gray-400">Applications submitted for market leases</p>
              </div>
            </div>
            <button className="text-[11px] font-bold text-green-700 hover:text-green-900 flex items-center gap-0.5 cursor-pointer">
              Apply <ChevronRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[420px] text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="py-2 px-1 font-semibold uppercase tracking-wide text-[10px]">Stall & Section</th>
                  <th className="py-2 px-1 font-semibold uppercase tracking-wide text-[10px]">Date</th>
                  <th className="py-2 px-1 font-semibold uppercase tracking-wide text-[10px]">Rate</th>
                  <th className="py-2 px-1 font-semibold uppercase tracking-wide text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-all">
                    <td className="py-3 px-1">
                      <div className="font-bold text-gray-800">{app.stall}</div>
                      <div className="text-[10px] text-gray-400">{app.section}</div>
                    </td>
                    <td className="py-3 px-1 text-gray-500">{app.date}</td>
                    <td className="py-3 px-1 font-bold text-gray-800">{app.fee}</td>
                    <td className="py-3 px-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.status === 'Approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {app.status === 'Approved' ? <CheckCircle size={9} /> : <XCircle size={9} />}
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

                {/* ── MARKET ALERTS ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-800">Market Management Alerts</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            {alerts.map(al => (
              <div key={al.id} className="p-3 rounded-xl bg-gray-50 text-[11px] space-y-1.5 border border-gray-100">
                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-wider">
                  <span className={al.type === 'warning' ? 'text-red-500' : 'text-blue-500'}>{al.type}</span>
                  <span>{al.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{al.message}</p>
              </div>
            ))}
          </div>
        </div>

                {/* ── PROFILE DETAILS ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Stallholder Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0"><User size={15} /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Full Name</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0"><Mail size={15} /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Email</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0"><Phone size={15} /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Contact</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.contact_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'navigate', icon: Map, label: 'Navigate' },
            { id: 'stalls', icon: Store, label: 'Stalls' },
            { id: 'applications', icon: FileText, label: 'Applications' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-orange-500' : ''}`}>
                  <tab.icon
                    size={18}
                    className={isActive ? 'text-white' : 'text-gray-400'}
                  />
                </div>
                <span className={`text-[9px] font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── DESKTOP FOOTER ── */}
      <footer className="hidden md:block bg-white border-t border-gray-200 py-5 mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© 2026 MyTalipapa Market Management. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-600 transition-all">Support Desk</a>
            <a href="#" className="hover:text-gray-600 transition-all">Market Terms</a>
            <a href="#" className="hover:text-gray-600 transition-all">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  )
}