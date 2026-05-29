import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  Store,
  FileText,
  User,
  ChevronRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Camera,
  Clock
} from 'lucide-react'
import NotificationBell from '../../components/NotificationBell'

export default function RenterDashboard({ onNavigate, onOpenStall }) {
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState(() => {
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

  const [applications, setApplications] = useState([])
  const [activeStall, setActiveStall] = useState(null)
  const [loading, setLoading] = useState(true)

  const alerts = [
    { id: 'alert-1', type: 'info', message: 'Market cleanup is scheduled for next Monday. Stall operations will start at 9:00 AM.', date: 'May 22, 2026' },
    { id: 'alert-2', type: 'warning', message: 'Please ensure compliance with standard waste disposal regulations in Produce Section B.', date: 'May 20, 2026' },
  ]

  const appStats = {
    pending: applications.filter(a => a.status === 'Pending').length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    const emailParam = `?email=${encodeURIComponent(currentUser.email)}`
    const token = localStorage.getItem('authToken')

    setLoading(true)

    const fetchApps = fetch(`/api/renter/applications${emailParam}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch applications')
      return res.json()
    })

    const fetchLease = fetch(`/api/renter/active-lease${emailParam}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch active lease')
      return res.json()
    })

    const fetchProfile = token
      ? fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .catch(err => {
          console.error('Failed to fetch user profile:', err)
          return null
        })
      : Promise.resolve(null)

    Promise.all([fetchApps, fetchLease, fetchProfile])
      .then(([appsData, leaseData, profileData]) => {
        setApplications(appsData)
        setActiveStall(leaseData)
        if (profileData) {
          setCurrentUser(profileData)
          localStorage.setItem('user', JSON.stringify(profileData))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err)
        setLoading(false)
      })
  }, [currentUser?.email, navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f5f5f0] h-full">
        <div className="w-10 h-10 border-4 border-[#1a5c2a] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-semibold mt-3 animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  const firstName = currentUser?.full_name?.split(' ')[0] || 'Juan'

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">

      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1a5c2a] rounded-lg flex items-center justify-center">
              <Store size={13} color="white" />
            </div>
            <span className="font-extrabold text-gray-900 text-sm">MyTalipapa</span>
          </div>
          {/* Desktop breadcrumb */}
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
            <span>Renter</span>
            <ChevronRight size={14} />
            <span className="text-gray-700 font-semibold">Home</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-800">Hello, {firstName}!</span>
            <span className="text-[10px] text-gray-400">Stall Owner</span>
          </div>
          <NotificationBell />

        </div>
      </header>

      {/* ── SCROLLABLE CONTENT ── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-6 px-4 md:px-6 py-5 space-y-5">

        {/* Greeting */}
        <div>
          <p className="text-base font-bold text-gray-900">Hello, {firstName}!</p>
          <p className="text-xs text-gray-400">Welcome back to your market dashboard.</p>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/renter/market-tour')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-6 px-4 text-white font-bold text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: '#1a5c2a' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <span className="text-center leading-tight">View 360° Market Tour</span>
          </button>

          <button
            onClick={() => navigate('/renter/ar-finder')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-6 px-4 text-white font-bold text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: '#e07b00' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Camera size={20} />
            </div>
            <span className="text-center leading-tight">Find Stall via AR</span>
          </button>
        </div>

        {/* ── APPLICATIONS OVERVIEW ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3">Applications Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending', value: appStats.pending, color: 'text-gray-800' },
              { label: 'Approved', value: appStats.approved, color: 'text-gray-800' },
              { label: 'Rejected', value: appStats.rejected, color: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl py-4 px-3 flex flex-col items-center shadow-sm border border-gray-100">
                <span className={`text-2xl font-extrabold ${s.color}`}>{s.value}</span>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MARKET NEWS ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Market News</h2>
            <button className="text-xs font-bold text-[#1a5c2a] hover:text-[#14451f]">View All</button>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
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
              <button
                className="absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md hover:opacity-90 transition-all"
                style={{ backgroundColor: '#1a5c2a' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
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

        {/* ── ACTIVE STALL LEASE ── */}
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
            {activeStall && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                {activeStall.status}
              </span>
            )}
          </div>
          {activeStall ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Stall No.', value: activeStall.stallNumber, cls: 'text-base font-extrabold text-gray-800' },
                  { label: 'Section', value: activeStall.section, cls: 'text-xs font-extrabold text-gray-800 truncate' },
                  { label: 'Monthly Rent', value: activeStall.monthlyRate, cls: 'text-base font-extrabold text-green-800' },
                  { label: 'Expiry', value: activeStall.leaseEnd, cls: 'text-xs font-extrabold text-red-500' },
                ].map(cell => (
                  <div key={cell.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{cell.label}</p>
                    <p className={cell.cls}>{cell.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span className="font-semibold">Lease Progress</span>
                  <span>Started {activeStall.leaseStart}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#1a5c2a]" style={{ width: '100%' }} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-xs text-gray-400 font-semibold">
              🏪 You do not have an active stall lease yet.
            </div>
          )}
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
            {onNavigate && (
              <button
                onClick={() => onNavigate('applications')}
                className="text-[11px] font-bold text-[#1a5c2a] hover:text-[#14451f] flex items-center gap-0.5"
              >
                Apply <ChevronRight size={13} />
              </button>
            )}
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
                {applications.length > 0 ? (
                  applications.map(app => (
                    <tr key={app.id || app._id} className="hover:bg-gray-50 transition-all">
                      <td className="py-3 px-1">
                        <div className="font-bold text-gray-800">{app.stall}</div>
                        <div className="text-[10px] text-gray-400">{app.section || app.zone}</div>
                      </td>
                      <td className="py-3 px-1 text-gray-500">{app.date || app.submittedOn}</td>
                      <td className="py-3 px-1 font-bold text-gray-800">{app.fee}</td>
                      <td className="py-3 px-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${app.status === 'Approved' ? 'bg-green-50 text-green-700' :
                          app.status === 'Rejected' ? 'bg-red-50 text-red-500' :
                            'bg-orange-50 text-orange-700'
                          }`}>
                          {app.status === 'Approved' ? <CheckCircle size={9} /> :
                            app.status === 'Rejected' ? <XCircle size={9} /> :
                              <Clock size={9} />}
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-gray-400 font-semibold">
                      🏪 No applications submitted yet.
                    </td>
                  </tr>
                )}
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
            {[
              { icon: User, label: 'Full Name', value: currentUser?.full_name },
              { icon: Mail, label: 'Email', value: currentUser?.email },
              { icon: Phone, label: 'Contact', value: currentUser?.contact_number || 'N/A' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0">
                  <row.icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{row.label}</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop footer */}
        <footer className="hidden md:block border-t border-gray-200 pt-5 mt-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <p>© 2026 MyTalipapa Market Management. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-gray-600 transition-all">Support Desk</a>
              <a href="#" className="hover:text-gray-600 transition-all">Market Terms</a>
              <a href="#" className="hover:text-gray-600 transition-all">Privacy Policy</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}