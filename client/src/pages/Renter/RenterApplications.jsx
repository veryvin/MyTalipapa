/**
 * RenterApplications.jsx
 * Rental Inquiry form page — plugs into RenterLayout via the 'applications' tab.
 * Props:
 *   onNavigate(tab)   – navigate to another tab (e.g. 'stalls')
 *   stalls            – optional array of stall objects for the dropdown
 */
import { useState } from 'react'
import { ArrowLeft, Store, Send, Clock, ChevronDown } from 'lucide-react'

const BUSINESS_TYPES = [
  'Food & Beverages',
  'Fresh Produce',
  'Dry Goods & Grocery',
  'Clothing & Apparel',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Handicrafts & Souvenirs',
  'Other',
]

const STALL_LOCATIONS = [
  'Section A – Row 1',
  'Section A – Row 2',
  'Section B – Row 1',
  'Section B – Row 2',
  'Section C – Corner Unit',
  'Section D – Food Court',
]

const MARKET_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80',
    alt: 'Market interior',
  },
  {
    src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    alt: 'Fresh produce',
  },
]

export default function RenterApplications({ onNavigate, stalls }) {
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    emailAddress: '',
    preferredStall: '',
    intendedBusinessUse: '',
    additionalMessage: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const stallOptions =
    stalls?.map((s) => s.name || s.stallNumber || s.id) ?? STALL_LOCATIONS

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.fullName || !form.contactNumber || !form.preferredStall) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 900)
  }

  /* ── shared input classes ──────────────────────────────────── */
  const inputCls =
    'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200'
  const selectCls =
    'w-full bg-[#f5f5f0] border border-transparent rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:border-[#1a5c2a] focus:bg-white transition-all duration-200 appearance-none cursor-pointer'

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f0]">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-1.5 text-[#1a5c2a] text-sm font-semibold hover:opacity-75 transition-opacity"
        >
          <ArrowLeft size={16} />
          <span>Rental Inquiry</span>
        </button>
        <div className="flex items-center gap-1.5 text-[#1a5c2a] font-extrabold text-sm tracking-tight">
          <Store size={15} />
          MyTalipapa
        </div>
      </header>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-xl mx-auto px-4 md:px-6 pt-6 space-y-5">

          {/* Brand block */}
          <div className="flex flex-col items-center gap-2 pt-2 pb-1">
            <div className="w-16 h-16 bg-[#1a5c2a] rounded-2xl flex items-center justify-center shadow-md">
              <Store size={28} color="white" />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-gray-900 text-base tracking-tight">MyTalipapa</p>
              <p className="text-gray-400 text-xs mt-0.5">Complete your rental request</p>
            </div>
          </div>

          {/* ── Form card ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                className={inputCls}
                placeholder="e.g. Juan Dela Cruz"
                value={form.fullName}
                onChange={set('fullName')}
              />
            </div>

            {/* Contact + Email (side-by-side on md+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input
                  className={inputCls}
                  placeholder="+63 912 345 6789"
                  value={form.contactNumber}
                  onChange={set('contactNumber')}
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  className={inputCls}
                  placeholder="juan@example.com"
                  value={form.emailAddress}
                  onChange={set('emailAddress')}
                  type="email"
                />
              </div>
            </div>

            {/* Preferred Stall + Business Use (side-by-side on md+) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Stall</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={form.preferredStall}
                    onChange={set('preferredStall')}
                  >
                    <option value="" disabled>Select a location...</option>
                    {stallOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Intended Business Use</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={form.intendedBusinessUse}
                    onChange={set('intendedBusinessUse')}
                  >
                    <option value="" disabled>Select business type...</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Message</label>
              <textarea
                className={`${inputCls} resize-none h-28`}
                placeholder="Tell us more about your business plans..."
                value={form.additionalMessage}
                onChange={set('additionalMessage')}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !form.fullName || !form.contactNumber || !form.preferredStall}
            className="w-full flex items-center justify-center gap-2 bg-[#e8621a] hover:bg-[#d45a16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl py-3.5 transition-all duration-200 shadow-sm active:scale-[0.98]"
          >
            {loading ? (
              <span className="animate-pulse">Submitting…</span>
            ) : (
              <>
                <Send size={15} />
                Submit Inquiry
              </>
            )}
          </button>

          {/* What's Next banner — appears after submit or always (matches screenshots) */}
          {submitted && (
            <div className="bg-[#fff8f4] border border-[#fde8d8] rounded-2xl p-4 flex gap-3">
              <div className="w-8 h-8 bg-[#e8621a] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={15} color="white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">What's Next?</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Thank you for your interest! Our market management team will review your application.
                  You can expect a response via email or phone within{' '}
                  <span className="font-bold text-gray-800">24–48 hours</span> regarding availability
                  and next steps.
                </p>
              </div>
            </div>
          )}

          {/* Market photo pair */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            {MARKET_IMAGES.map((img, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden aspect-video bg-gray-200"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Community CTA */}
          <div className="bg-[#1a5c2a] rounded-2xl p-5 text-center mb-2">
            <p className="text-white text-sm font-bold leading-snug">
              Join our growing community of<br />over 500+ local vendors.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}