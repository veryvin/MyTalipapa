/**
 * RenterApplications.jsx
 * My Applications page — list view + new inquiry form.
 *
 * Props:
 *   onNavigate(tab) – navigate to another tab in RenterLayout
 *   prefill         – optional { preferredStall } from StallDetails
 */
import { useState } from 'react'
import {
  ArrowLeft, Store, Send, Clock, ChevronDown,
  CheckCircle, XCircle, AlertCircle,
  MapPin, Calendar, Eye, Bell, User,
} from 'lucide-react'

/* ── Static data ─────────────────────────────────────────────── */
const MY_APPLICATIONS = [
  { id: 'app-1', stall: '#042', zone: 'Zone A', status: 'Approved',  submittedOn: 'Oct 24, 2023' },
  { id: 'app-2', stall: '#115', zone: 'Zone C', status: 'Pending',   submittedOn: 'Nov 02, 2023' },
  { id: 'app-3', stall: '#009', zone: 'Zone B', status: 'Rejected',  submittedOn: 'Sep 15, 2023' },
]

const BUSINESS_TYPES = [
  'Food & Beverages', 'Fresh Produce', 'Dry Goods & Grocery',
  'Clothing & Apparel', 'Electronics & Gadgets',
  'Health & Beauty', 'Handicrafts & Souvenirs', 'Other',
]

const MARKET_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80', alt: 'Market interior' },
  { src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',   alt: 'Fresh produce'   },
]

/* ── Status config ───────────────────────────────────────────── */
const STATUS_CFG = {
  Approved: { pill: 'bg-[#1a5c2a] text-white', Icon: CheckCircle, label: 'APPROVED' },
  Pending:  { pill: 'bg-[#e8621a] text-white',  Icon: AlertCircle, label: 'PENDING'  },
  Rejected: { pill: 'bg-red-600 text-white',    Icon: XCircle,     label: 'REJECTED' },
}

/* ── Shared field label ──────────────────────────────────────── */
const fieldLabel = 'block text-xs font-semibold text-gray-700 mb-1.5'

/* ── Shared input classes ────────────────────────────────────── */
const inputCls =
  'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 ' +
  'text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200'

const selectCls =
  'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 ' +
  'text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white ' +
  'transition-all duration-200 appearance-none cursor-pointer'

/* ── ApplicationCard ─────────────────────────────────────────── */
function ApplicationCard({ app }) {
  const { pill, Icon, label } = STATUS_CFG[app.status] || STATUS_CFG.Pending

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Stall {app.stall}</p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <MapPin size={11} />
            <span>{app.zone}</span>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full ${pill}`}>
          <Icon size={9} />
          {label}
        </span>
      </div>

      <div className="mx-4 border-t border-gray-100" />

      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Submitted On</p>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
            <Calendar size={11} className="text-gray-400" />
            {app.submittedOn}
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all">
          <Eye size={12} />
          View Details
        </button>
      </div>
    </div>
  )
}

/* ── TopBar ──────────────────────────────────────────────────── */
function TopBar({ showBack, onBack }) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
      <div className="w-20">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#1a5c2a] text-sm font-semibold hover:opacity-75 transition-opacity"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[#1a5c2a] font-extrabold text-sm tracking-tight md:hidden">
        <Store size={15} />
        MyTalipapa
      </div>

      <div className="flex items-center gap-2 w-20 justify-end">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition">
          <Bell size={17} className="text-gray-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={15} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}

/* ── Main export ─────────────────────────────────────────────── */
export default function RenterApplications({ prefill }) {
  const [view,      setView]      = useState('list')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const [form, setForm] = useState({
    fullName:            '',
    contactNumber:       '',
    emailAddress:        '',
    preferredStall:      prefill?.preferredStall ?? '',
    intendedBusinessUse: '',
    additionalMessage:   '',
  })

  const totalActive  = MY_APPLICATIONS.filter(a => a.status !== 'Rejected').length
  const totalPending = MY_APPLICATIONS.filter(a => a.status === 'Pending').length

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const goToForm = () => { setView('form'); setSubmitted(false) }
  const goToList = () => { setView('list'); setSubmitted(false) }

  const handleSubmit = () => {
    if (!form.fullName || !form.contactNumber || !form.preferredStall) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 900)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">

      <TopBar showBack={view === 'form'} onBack={goToList} />

      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">

        {/* ════════ LIST VIEW ════════ */}
        {view === 'list' && (
          <div className="max-w-2xl mx-auto px-4 md:px-6 pt-5 space-y-4">

            <div>
              <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage and track your market stall requests.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a5c2a] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Total Active</p>
                  <p className="text-[28px] font-extrabold text-white leading-none mt-0.5">
                    {String(totalActive).padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="bg-[#e8621a] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Pending</p>
                  <p className="text-[28px] font-extrabold text-white leading-none mt-0.5">
                    {String(totalPending).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Application list */}
            <div className="space-y-3">
              {MY_APPLICATIONS.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>

            <p className="text-center text-[10px] text-gray-300 font-semibold tracking-wider uppercase hidden md:block pt-1">
              Talipapa stall listings
            </p>

            <button
              onClick={goToForm}
              className="w-full flex items-center justify-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] active:scale-[0.98] text-white font-bold text-sm rounded-2xl py-3.5 transition-all duration-200 shadow-sm"
            >
              <Send size={15} />
              Submit New Inquiry
            </button>

          </div>
        )}

        {/* ════════ FORM VIEW ════════ */}
        {view === 'form' && (
          <div className="max-w-xl mx-auto px-4 md:px-6 pt-6 space-y-5">

            {/* Brand */}
            <div className="flex flex-col items-center gap-2 pt-2 pb-1">
              <div className="w-16 h-16 bg-[#1a5c2a] rounded-2xl flex items-center justify-center shadow-md">
                <Store size={28} color="white" />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-gray-900 text-base tracking-tight">MyTalipapa</p>
                <p className="text-gray-400 text-xs mt-0.5">Complete your rental request</p>
              </div>
            </div>

            {/* Prefill notice */}
            {prefill?.preferredStall && (
              <div className="bg-[#edf5ed] border border-[#c3dfc3] rounded-xl px-4 py-3 flex items-center gap-2">
                <Store size={14} className="text-[#1a5c2a] shrink-0" />
                <p className="text-xs text-[#1a5c2a] font-semibold">
                  Inquiring for <span className="font-extrabold">{prefill.preferredStall}</span>
                </p>
              </div>
            )}

            {/* Form fields */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

              <div>
                <label className={fieldLabel}>Full Name</label>
                <input className={inputCls} placeholder="e.g. Juan Dela Cruz"
                  value={form.fullName} onChange={setField('fullName')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Contact Number</label>
                  <input className={inputCls} placeholder="+63 912 345 6789" type="tel"
                    value={form.contactNumber} onChange={setField('contactNumber')} />
                </div>
                <div>
                  <label className={fieldLabel}>Email Address</label>
                  <input className={inputCls} placeholder="juan@example.com" type="email"
                    value={form.emailAddress} onChange={setField('emailAddress')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Preferred Stall</label>
                  <input className={inputCls} placeholder="e.g. #042 – Zone A"
                    value={form.preferredStall} onChange={setField('preferredStall')} />
                </div>
                <div>
                  <label className={fieldLabel}>Intended Business Use</label>
                  <div className="relative">
                    <select className={selectCls}
                      value={form.intendedBusinessUse} onChange={setField('intendedBusinessUse')}>
                      <option value="" disabled>Select business type…</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Additional Message</label>
                <textarea className={`${inputCls} resize-none h-28`}
                  placeholder="Tell us more about your business plans…"
                  value={form.additionalMessage} onChange={setField('additionalMessage')} />
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !form.fullName || !form.contactNumber || !form.preferredStall}
              className="w-full flex items-center justify-center gap-2 bg-[#e8621a] hover:bg-[#d45a16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl py-3.5 transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              {loading
                ? <span className="animate-pulse">Submitting…</span>
                : <><Send size={15} /> Submit Inquiry</>
              }
            </button>

            {/* Success */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle size={15} color="white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 mb-1">Inquiry Submitted!</p>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Your inquiry has been received. Our team will get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-[#fff8f4] border border-[#fde8d8] rounded-2xl p-4 flex gap-3">
              <div className="w-8 h-8 bg-[#e8621a] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={15} color="white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">What's Next?</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Our market management team will review your application. Expect a response
                  within <span className="font-bold text-gray-800">24–48 hours</span> via
                  email or phone.
                </p>
              </div>
            </div>

            {/* Market images */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              {MARKET_IMAGES.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden aspect-video bg-gray-200">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-[#1a5c2a] rounded-2xl p-5 text-center mb-2">
              <p className="text-white text-sm font-bold leading-snug">
                Join our growing community of<br />over 500+ local vendors.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}