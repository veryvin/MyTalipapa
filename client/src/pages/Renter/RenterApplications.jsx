/**
 * RenterApplications.jsx
 * My Applications page — list view + new inquiry form.
 *
 * Props:
 *   onNavigate(tab) – navigate to another tab in RenterLayout
 *   prefill         – optional { preferredStall } from StallDetails
 */
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Store, Send, Clock, ChevronDown,
  CheckCircle, XCircle, AlertCircle,
  MapPin, Calendar, Eye, Bell, User,
} from 'lucide-react'
import { getUser } from '../../utils/auth'
import NotificationBell from '../../components/NotificationBell'

/* ── Animations ──────────────────────────────────────────────── */
const appStyles = `
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
    0%   { opacity: 0; transform: scale(0.85); }
    60%  { transform: scale(1.04); }
    80%  { transform: scale(0.98); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.94) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .ra-topbar       { animation: fadeSlideDown 0.35s ease both; }
  .ra-heading      { animation: fadeSlideUp 0.38s ease both; }
  .ra-stat-card    { animation: cardPop 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .ra-app-card {
    animation: cardPop 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .ra-app-card:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  }
  .ra-empty        { animation: fadeSlideUp 0.4s ease both; }
  .ra-submit-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, background-color 0.2s ease;
  }
  .ra-submit-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .ra-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .ra-submit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .ra-view-btn { transition: transform 0.15s ease, background-color 0.15s ease; }
  .ra-view-btn:hover  { transform: scale(1.04); }
  .ra-view-btn:active { transform: scale(0.95); }

  /* Form view */
  .ra-brand          { animation: bounceIn 0.45s ease both; }
  .ra-prefill-notice { animation: fadeSlideUp 0.35s ease 0.08s both; }
  .ra-form-card      { animation: fadeSlideUp 0.4s ease both; }
  .ra-form-section   { animation: fadeSlideUp 0.38s ease both; }
  .ra-success        { animation: bounceIn 0.45s ease both; }
  .ra-whats-next     { animation: fadeSlideUp 0.4s ease both; }
  .ra-market-img {
    animation: cardPop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: transform 0.3s ease;
    overflow: hidden;
  }
  .ra-market-img:hover img { transform: scale(1.04); }
  .ra-market-img img       { transition: transform 0.35s ease; }
  .ra-cta-banner { animation: fadeSlideUp 0.4s ease both; }
  .ra-back-btn {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .ra-back-btn:hover { transform: translateX(-2px); opacity: 0.75; }

  /* Modal */
  .ra-overlay { animation: overlayIn 0.2s ease both; }
  .ra-modal   { animation: modalIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .ra-modal-close { transition: transform 0.15s ease, background-color 0.15s ease; }
  .ra-modal-close:hover  { transform: scale(1.1); }
  .ra-modal-close:active { transform: scale(0.92); }

  @media (prefers-reduced-motion: reduce) {
    .ra-topbar, .ra-heading, .ra-stat-card, .ra-app-card, .ra-empty,
    .ra-submit-btn, .ra-view-btn, .ra-brand, .ra-prefill-notice,
    .ra-form-card, .ra-form-section, .ra-success, .ra-whats-next,
    .ra-market-img, .ra-cta-banner, .ra-back-btn, .ra-overlay,
    .ra-modal, .ra-modal-close {
      animation: none !important;
      transition: none !important;
    }
  }
`

/* ── Static data ─────────────────────────────────────────────── */
const BUSINESS_TYPES = ['Fishes', 'Meat', 'Vegetables']

const MARKET_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80', alt: 'Market interior' },
  { src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', alt: 'Fresh produce' },
]

/* ── Status config ───────────────────────────────────────────── */
const STATUS_CFG = {
  Approved: { pill: 'bg-[#1a5c2a] text-white', Icon: CheckCircle, label: 'APPROVED' },
  Pending: { pill: 'bg-[#e8621a] text-white', Icon: AlertCircle, label: 'PENDING' },
  Rejected: { pill: 'bg-red-600 text-white', Icon: XCircle, label: 'REJECTED' },
}

/* ── Shared styles ───────────────────────────────────────────── */
const fieldLabel = 'block text-xs font-semibold text-gray-700 mb-1.5'
const inputCls =
  'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 ' +
  'text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200'
const selectCls =
  'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 ' +
  'text-sm text-gray-800 focus:outline-none focus:border-[#1a5c2a] focus:bg-white ' +
  'transition-all duration-200 appearance-none cursor-pointer'

/* ── ApplicationCard ─────────────────────────────────────────── */
function ApplicationCard({ app, onViewDetails, animDelay = '0s' }) {
  const { pill, Icon, label } = STATUS_CFG[app.status] || STATUS_CFG.Pending

  return (
    <div
      className="ra-app-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ animationDelay: animDelay }}
    >
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
        <button
          onClick={() => onViewDetails && onViewDetails(app)}
          className="ra-view-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
        >
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
    <header className="ra-topbar bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
      <div className="w-20">
        {showBack && (
          <button onClick={onBack} className="ra-back-btn flex items-center gap-1.5 text-[#1a5c2a] text-sm font-semibold">
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
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={15} className="text-gray-400" />
        </div>
      </div>
    </header>
  )
}

/* ── Main export ─────────────────────────────────────────────── */
export default function RenterApplications({ prefill }) {
  const [view, setView] = useState('list')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [stallsList, setStallsList] = useState([])

  const [form, setForm] = useState({
    fullName: getUser()?.full_name || getUser()?.name || '',
    contactNumber: getUser()?.contact_number || '',
    emailAddress: getUser()?.email || '',
    preferredStall: '',
    intendedBusinessUse: '',
    additionalMessage: '',
  })

  const fetchApplications = () => {
    const user = getUser()
    const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : ''

    fetch(`/api/renter/applications${emailParam}`)
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json() })
      .then(data => setApplications(data))
      .catch(() => {
        setApplications([
          { id: 'app-1', stall: '#042', zone: 'Zone A', status: 'Approved', submittedOn: 'Oct 24, 2023' },
          { id: 'app-2', stall: '#115', zone: 'Zone C', status: 'Pending', submittedOn: 'Nov 02, 2023' },
          { id: 'app-3', stall: '#009', zone: 'Zone B', status: 'Rejected', submittedOn: 'Sep 15, 2023' },
        ])
      })
  }

  const fetchStallsList = () => {
    fetch('/api/stalls')
      .then(res => { if (!res.ok) throw new Error('Failed to fetch stalls'); return res.json() })
      .then(data => {
        const sorted = data.sort((a, b) => {
          const numA = parseInt(a.stallNumber) || 0;
          const numB = parseInt(b.stallNumber) || 0;
          return numA - numB;
        });
        setStallsList(sorted);
      })
      .catch(err => console.error('Failed to fetch stalls list:', err));
  }

  useEffect(() => {
    fetchApplications();
    fetchStallsList();
  }, [])

  useEffect(() => {
    if (prefill?.preferredStall) {
      const cleanStall = prefill.preferredStall.replace(/Stall\s*#/gi, '').replace('#', '').trim();
      let businessUse = prefill.intendedBusinessUse || '';
      let targetStallId = prefill.stallId || '';

      if (stallsList.length > 0) {
        if (!targetStallId) {
          const found = stallsList.find(s => s.stallNumber === cleanStall && (!businessUse || s.section.toLowerCase().includes(businessUse.toLowerCase().replace('fishes', 'fish'))));
          if (found) {
            targetStallId = found._id;
          }
        } else {
          const found = stallsList.find(s => s._id === targetStallId);
          if (found) {
            const sec = (found.section || '').toLowerCase();
            if (sec.includes('fish') || sec.includes('sea')) businessUse = 'Fishes';
            else if (sec.includes('meat')) businessUse = 'Meat';
            else if (sec.includes('veg') || sec.includes('produce')) businessUse = 'Vegetables';
          }
        }
      }

      setForm(f => ({
        ...f,
        preferredStall: targetStallId || cleanStall,
        intendedBusinessUse: businessUse || f.intendedBusinessUse,
      }))
      setView('form')
    }
  }, [prefill, stallsList])

  const totalActive = applications.filter(a => a.status !== 'Rejected').length
  const totalPending = applications.filter(a => a.status === 'Pending').length

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const goToForm = () => { setView('form'); setSubmitted(false) }
  const goToList = () => { setView('list'); setSubmitted(false) }

  const handleSubmit = () => {
    if (loading || submitted) return
    if (!form.fullName || !form.contactNumber || !form.preferredStall) return
    setLoading(true)

    const payload = {
      fullName: form.fullName,
      contactNumber: form.contactNumber,
      email: form.emailAddress || getUser()?.email || '',
      preferredStall: form.preferredStall,
      intendedBusinessUse: form.intendedBusinessUse || 'Other',
      additionalMessage: form.additionalMessage || '',
    }

    fetch('/api/renter/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => { if (!res.ok) throw new Error('Submission failed'); return res.json() })
      .then(() => {
        setLoading(false)
        setSubmitted(true)
        fetchApplications()
        setTimeout(() => {
          setView('list')
          setForm({
            fullName: getUser()?.full_name || getUser()?.name || '',
            contactNumber: getUser()?.contact_number || '',
            emailAddress: getUser()?.email || '',
            preferredStall: '',
            intendedBusinessUse: '',
            additionalMessage: '',
          })
          setSubmitted(false)
        }, 2500)
      })
      .catch(err => {
        console.error('Submit application error:', err)
        setLoading(false)
        alert('Failed to submit application: ' + err.message)
      })
  }

  return (
    <>
      <style>{appStyles}</style>
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">

        <TopBar showBack={view === 'form'} onBack={goToList} />

        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">

          {/* ════════ LIST VIEW ════════ */}
          {view === 'list' && (
            <div className="max-w-2xl mx-auto px-4 md:px-6 pt-5 space-y-4">

              <div className="ra-heading">
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
                <p className="text-xs text-gray-400 mt-0.5">Manage and track your market stall requests.</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="ra-stat-card bg-[#1a5c2a] rounded-2xl p-4 flex items-center gap-3" style={{ animationDelay: '0.08s' }}>
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

                <div className="ra-stat-card bg-[#e8621a] rounded-2xl p-4 flex items-center gap-3" style={{ animationDelay: '0.14s' }}>
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
                {applications.length > 0 ? (
                  applications.map((app, idx) => (
                    <ApplicationCard
                      key={app.id || app._id}
                      app={app}
                      onViewDetails={setSelectedApp}
                      animDelay={`${0.2 + idx * 0.07}s`}
                    />
                  ))
                ) : (
                  <div className="ra-empty bg-white border border-gray-100 rounded-2xl py-8 px-4 text-center text-sm font-semibold text-gray-400 shadow-sm">
                    🏪 No rental inquiries submitted yet.
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-gray-300 font-semibold tracking-wider uppercase hidden md:block pt-1">
                Talipapa stall listings
              </p>

              <button
                onClick={goToForm}
                className="ra-submit-btn w-full flex items-center justify-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white font-bold text-sm rounded-2xl py-3.5 shadow-sm"
                style={{ animationDelay: `${0.2 + applications.length * 0.07}s`, animation: 'fadeSlideUp 0.4s ease both' }}
              >
                <Send size={15} />
                Submit New Inquiry
              </button>

            </div>
          )}

          {/* ════════ FORM VIEW ════════ */}
          {view === 'form' && (
            <div className="max-w-xl mx-auto px-4 md:px-6 pt-6 space-y-5">

              <div className="ra-brand flex flex-col items-center gap-2 pt-2 pb-1">
                <div className="w-16 h-16 bg-[#1a5c2a] rounded-2xl flex items-center justify-center shadow-md">
                  <Store size={28} color="white" />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-gray-900 text-base tracking-tight">MyTalipapa</p>
                  <p className="text-gray-400 text-xs mt-0.5">Complete your rental request</p>
                </div>
              </div>

              {prefill?.preferredStall && (
                <div className="ra-prefill-notice bg-[#edf5ed] border border-[#c3dfc3] rounded-xl px-4 py-3 flex items-center gap-2">
                  <Store size={14} className="text-[#1a5c2a] shrink-0" />
                  <p className="text-xs text-[#1a5c2a] font-semibold">
                    Inquiring for <span className="font-extrabold">{prefill.preferredStall}</span>
                  </p>
                </div>
              )}

              <div className="ra-form-card bg-white rounded-2xl shadow-sm p-5 space-y-4" style={{ animationDelay: '0.1s' }}>

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
                    <div className="relative">
                      <select
                        className={selectCls}
                        value={form.preferredStall}
                        onChange={(e) => {
                          const selectedStallId = e.target.value;
                          const foundStall = stallsList.find(s => s._id === selectedStallId);
                          let businessUse = '';
                          if (foundStall) {
                            const sec = (foundStall.section || '').toLowerCase();
                            if (sec.includes('fish') || sec.includes('sea')) businessUse = 'Fishes';
                            else if (sec.includes('meat')) businessUse = 'Meat';
                            else if (sec.includes('veg') || sec.includes('produce')) businessUse = 'Vegetables';
                          }
                          setForm(f => ({
                            ...f,
                            preferredStall: selectedStallId,
                            intendedBusinessUse: businessUse
                          }));
                        }}
                      >
                        <option value="" disabled>Select preferred stall…</option>
                        {stallsList.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.location || `Stall #${s.stallNumber}`} {s.status !== 'available' ? `(${s.status})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabel}>Intended Business Use</label>
                    <div className="relative">
                      <select
                        className={`${selectCls} disabled:opacity-75 disabled:cursor-not-allowed`}
                        disabled
                        value={form.intendedBusinessUse}
                        onChange={setField('intendedBusinessUse')}
                      >
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

              <button
                onClick={handleSubmit}
                disabled={loading || submitted || !form.fullName || !form.contactNumber || !form.preferredStall}
                className="ra-submit-btn w-full flex items-center justify-center gap-2 bg-[#e8621a] hover:bg-[#d45a16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl py-3.5 shadow-sm"
                style={{ animation: 'fadeSlideUp 0.4s ease 0.18s both' }}
              >
                {loading
                  ? <span className="animate-pulse">Submitting…</span>
                  : submitted
                    ? <span className="flex items-center gap-1.5"><CheckCircle size={15} /> Submitted Successfully</span>
                    : <><Send size={15} /> Submit Inquiry</>
                }
              </button>

              {submitted && (
                <div className="ra-success bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
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

              <div className="ra-whats-next bg-[#fff8f4] border border-[#fde8d8] rounded-2xl p-4 flex gap-3" style={{ animationDelay: '0.24s' }}>
                <div className="w-8 h-8 bg-[#e8621a] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={15} color="white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">What's Next?</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Our market management team will review your application. Expect a response
                    within <span className="font-bold text-gray-800">24–48 hours</span> via email or phone.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                {MARKET_IMAGES.map((img, i) => (
                  <div
                    key={i}
                    className="ra-market-img rounded-2xl aspect-video bg-gray-200"
                    style={{ animationDelay: `${0.28 + i * 0.08}s` }}
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="ra-cta-banner bg-[#1a5c2a] rounded-2xl p-5 text-center mb-2" style={{ animationDelay: '0.36s' }}>
                <p className="text-white text-sm font-bold leading-snug">
                  Join our growing community of<br />over 500+ local vendors.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* ── Detail Modal ── */}
        {selectedApp && (
          <div
            className="ra-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            <div
              className="ra-modal bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0f7f0] flex items-center justify-center text-[#1a5c2a] font-extrabold text-sm shrink-0">
                    {selectedApp.fullName
                      ? selectedApp.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'AP'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Application Details</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Stall {selectedApp.stall} · {selectedApp.zone || selectedApp.section || 'Market'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="ra-modal-close w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Status — full width */}
                <div
                  className="flex items-center justify-between bg-[#f9fafb] rounded-xl px-4 py-3"
                  style={{ animation: 'fadeSlideUp 0.3s ease both' }}
                >
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Application Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedApp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      selectedApp.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-700'
                    }`}>
                    {selectedApp.status === 'Approved' && <CheckCircle size={10} />}
                    {selectedApp.status === 'Rejected' && <XCircle size={10} />}
                    {selectedApp.status === 'Pending' && <AlertCircle size={10} />}
                    {selectedApp.status}
                  </span>
                </div>

                {/* Stall Information */}
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Stall Information</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Stall Number', value: selectedApp.stall },
                      { label: 'Zone / Floor', value: selectedApp.zone || selectedApp.section || 'N/A' },
                      { label: 'Section', value: selectedApp.section || selectedApp.category || 'N/A' },
                      { label: 'Size', value: selectedApp.size ? `${selectedApp.size} sqm` : 'N/A' },
                      { label: 'Monthly Rate', value: selectedApp.monthlyRate ? `₱${Number(selectedApp.monthlyRate).toLocaleString()}` : 'N/A' },
                      { label: 'Contractor Manager', value: selectedApp.contractorName || 'N/A' },
                      { label: 'Contractor Contact', value: selectedApp.contractorContact || 'N/A' },
                    ].map(({ label, value }, i) => (
                      <div
                        key={label}
                        className="bg-[#f9fafb] rounded-xl p-3 flex flex-col gap-0.5"
                        style={{ animation: 'fadeSlideUp 0.3s ease both', animationDelay: `${0.04 + i * 0.05}s` }}
                      >
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Applicant Information */}
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Applicant Information</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Full Name', value: selectedApp.fullName || 'N/A' },
                      { label: 'Contact', value: selectedApp.contactNumber || 'N/A' },
                      { label: 'Business Type', value: selectedApp.intendedBusinessUse || 'N/A' },
                      { label: 'Submitted On', value: selectedApp.submittedOn || selectedApp.date || 'N/A' },
                    ].map(({ label, value }, i) => (
                      <div
                        key={label}
                        className="bg-[#f9fafb] rounded-xl p-3 flex flex-col gap-0.5"
                        style={{ animation: 'fadeSlideUp 0.3s ease both', animationDelay: `${0.28 + i * 0.05}s` }}
                      >
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Message */}
                {selectedApp.additionalMessage && (
                  <div
                    className="bg-[#f9fafb] rounded-xl p-3 flex flex-col gap-1.5"
                    style={{ animation: 'fadeSlideUp 0.3s ease 0.48s both' }}
                  >
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Additional Message</span>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.additionalMessage}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
                  <div
                    className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col gap-1.5"
                    style={{ animation: 'bounceIn 0.35s ease 0.52s both' }}
                  >
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Rejection Reason</span>
                    <p className="text-xs text-red-700 leading-relaxed">{selectedApp.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="ra-submit-btn w-full py-2.5 bg-[#1a5c2a] hover:bg-[#154d23] active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}