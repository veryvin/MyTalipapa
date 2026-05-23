import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  User,
  Mail,
  Phone,
  Store,
  CreditCard,
  Clock,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  Award
} from 'lucide-react'

export default function RenterDashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock stats & history for a premium vendor portal feel
  const activeStall = {
    stallNumber: '#045',
    section: 'Produce Section B',
    monthlyRate: '₱3,500',
    status: 'Active',
    leaseStart: 'Nov 01, 2025',
    leaseEnd: 'Nov 01, 2026'
  }

  const applications = [
    {
      id: 'app-1',
      stall: '#045',
      section: 'Produce Section B',
      date: 'Oct 25, 2025',
      status: 'Approved',
      fee: '₱3,500/mo'
    },
    {
      id: 'app-2',
      stall: '#012',
      section: 'Meat & Poultry Section A',
      date: 'Oct 24, 2025',
      status: 'Rejected',
      fee: '₱4,200/mo'
    }
  ]

  const payments = [
    { id: 'pay-1', period: 'May 2026', amount: '₱3,500', date: 'May 02, 2026', status: 'Paid', receipt: 'TXN-98210' },
    { id: 'pay-2', period: 'Apr 2026', amount: '₱3,500', date: 'Apr 03, 2026', status: 'Paid', receipt: 'TXN-97304' },
    { id: 'pay-3', period: 'Mar 2026', amount: '₱3,500', date: 'Mar 01, 2026', status: 'Paid', receipt: 'TXN-96200' }
  ]

  const alerts = [
    { id: 'alert-1', type: 'info', message: 'Market cleanup is scheduled for next Monday. Stall operations will start at 9:00 AM.', date: 'May 22, 2026' },
    { id: 'alert-2', type: 'warning', message: 'Please ensure compliance with standard waste disposal regulations in Produce Section B.', date: 'May 20, 2026' }
  ]

  useEffect(() => {
    // Authenticate and fetch user from localStorage
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')

    if (!token || !storedUser) {
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.role !== 'renter') {
        // Guard against other roles accessing Renter Dashboard
        navigate('/login')
        return
      }
      setCurrentUser(parsedUser)
    } catch (err) {
      console.error('Error parsing user data:', err)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f2ec' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-800"></div>
          <p className="text-sm font-medium text-gray-600">Loading your Vendor Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#f5f2ec' }}>
      
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: '#1a5c2a' }}>
              <span className="text-white">🏪</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 tracking-tight leading-none">MyTalipapa</span>
              <span className="text-[10px] text-green-700 font-semibold tracking-wider uppercase mt-0.5">Renter Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-gray-800">{currentUser?.full_name}</span>
              <span className="text-[10px] text-gray-400 font-medium">Stallholder</span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section Banner */}
        <section 
          className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm"
          style={{ 
            background: 'linear-gradient(135deg, #1a5c2a 0%, #2f7a40 100%)' 
          }}
        >
          <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-10 translate-y-10">
            <Store size={220} className="text-white" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-md">
              <Award size={12} /> Active Vendor Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Back, {currentUser?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-green-100 max-w-xl font-medium">
              Manage your stall profile, track your lease agreement applications, and monitor your monthly billing cycle securely.
            </p>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile & Active Stall Details (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stall Details Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-green-50 text-green-700">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Active Stall Lease</h3>
                    <p className="text-[11px] text-gray-400">Current tenancy information</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                  {activeStall.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Stall Number</p>
                  <p className="text-lg font-extrabold text-gray-800">{activeStall.stallNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Section</p>
                  <p className="text-xs font-extrabold text-gray-800 truncate" title={activeStall.section}>
                    {activeStall.section}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Monthly Rent</p>
                  <p className="text-lg font-extrabold text-green-800">{activeStall.monthlyRate}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Expiry Date</p>
                  <p className="text-xs font-extrabold text-red-600">{activeStall.leaseEnd}</p>
                </div>
              </div>

              {/* Lease Progress */}
              <div className="mt-6 pt-4 border-t border-gray-50">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="font-semibold">Lease Progress</span>
                  <span>Started {activeStall.leaseStart}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-700 h-full rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">My Stall Applications</h3>
                    <p className="text-[11px] text-gray-400">Applications submitted for market leases</p>
                  </div>
                </div>
                <button className="text-[11px] font-bold text-green-800 hover:text-green-950 flex items-center gap-0.5 cursor-pointer">
                  Apply for Stall <ChevronRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100 font-medium">
                      <th className="py-3 font-semibold uppercase tracking-wider">Stall & Section</th>
                      <th className="py-3 font-semibold uppercase tracking-wider">Submit Date</th>
                      <th className="py-3 font-semibold uppercase tracking-wider">Monthly Rate</th>
                      <th className="py-3 font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50/55 transition-all">
                        <td className="py-3.5">
                          <div className="font-bold text-gray-800">{app.stall}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{app.section}</div>
                        </td>
                        <td className="py-3.5 text-gray-500 font-medium">{app.date}</td>
                        <td className="py-3.5 font-bold text-gray-800">{app.fee}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'Approved' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {app.status === 'Approved' ? (
                              <CheckCircle size={10} />
                            ) : (
                              <XCircle size={10} />
                            )}
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-4 border-b border-gray-100 pb-3">Stallholder Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Full Name</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-500 rounded-xl shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Number</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.contact_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Billing & Communications (1 col on large screen) */}
          <div className="space-y-8">
            
            {/* Rent Billing Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold text-orange-600 tracking-wider uppercase bg-orange-50 px-2 py-0.5 rounded-md">
                    Rent Status
                  </span>
                  <div className="text-gray-400">
                    <CreditCard size={18} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Outstanding Balance</p>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-1 mb-3">₱0.00</h2>
                
                <div className="flex items-center gap-1 text-[11px] text-green-700 font-semibold mb-6">
                  <CheckCircle size={14} className="shrink-0" /> All dues cleared for this month!
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Next Rent Cycle:</span>
                    <span className="font-bold text-gray-800">June 01, 2026</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Cycle Amount:</span>
                    <span className="font-bold text-gray-800">₱3,500.00</span>
                  </div>
                </div>

                <button className="w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:opacity-90" style={{ backgroundColor: '#1a5c2a' }}>
                  <CreditCard size={14} /> Pay Rent Advance
                </button>
              </div>
            </div>

            {/* Notifications & Support alerts */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <span className="font-bold text-gray-800 text-sm">Market Management Alerts</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>

              <div className="space-y-4">
                {alerts.map(al => (
                  <div key={al.id} className="p-3.5 rounded-2xl bg-gray-50 text-[11px] space-y-1.5 border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex justify-between text-gray-400 font-bold uppercase tracking-wider">
                      <span className={al.type === 'warning' ? 'text-red-500' : 'text-blue-500'}>
                        {al.type}
                      </span>
                      <span>{al.date}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-medium">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                <Clock size={16} className="text-gray-500" />
                <span className="font-bold text-gray-800 text-sm">Payment History</span>
              </div>
              <div className="space-y-3">
                {payments.map(pay => (
                  <div key={pay.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl hover:bg-gray-50 transition-all">
                    <div>
                      <p className="font-bold text-gray-800">{pay.period} Rental</p>
                      <p className="text-[10px] text-gray-400 font-medium">{pay.date} • {pay.receipt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{pay.amount}</p>
                      <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">{pay.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-150 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 MyTalipapa Market Management. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-all">Support Desk</a>
            <a href="#" className="hover:text-gray-600 transition-all">Market Terms</a>
            <a href="#" className="hover:text-gray-600 transition-all">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
