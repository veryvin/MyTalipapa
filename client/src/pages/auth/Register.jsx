import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Mail, Phone, Lock, Eye, EyeOff, Store, ShoppingBag } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    password: '',
    confirm_password: '',
    role: '',          // ← must be chosen before submit
    agreed: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  function selectRole(role) {
    setForm({ ...form, role })
    setError(null)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    if (!form.role) {
      setError('Please select whether you are a Renter or Contractor.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!form.agreed) {
      setError('Please agree to the Terms and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            contact_number: form.contact_number,
            role: form.role          // 'renter' | 'operator'
          }
        }
      })

      console.log('signUp result:', { data, error: signUpError })
      setDebugInfo({
        error: signUpError ? signUpError.message : null,
        user_id: data?.user?.id ?? null,
        user_email: data?.user?.email ?? null,
        session: data?.session ? 'present' : 'null',
        identities_count: data?.user?.identities?.length ?? 'n/a',
        raw: JSON.stringify({ data, error: signUpError }, null, 2)
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Email already registered — Supabase returns fake user with no identities
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Please log in instead.')
        setLoading(false)
        return
      }

      if (data?.user && !data?.session) {
        setSuccess('confirm')
      } else if (data?.session) {
        setSuccess('immediate')
      } else {
        setError('Unexpected response from server. See debug info below.')
      }

    } catch (err) {
      console.error('Caught exception:', err)
      setError('Network error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f2ec' }}>

      {/* Header */}
      <div
        className="h-32 sm:h-40 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#1a5c2a' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl">🏪</div>
          <span className="text-white text-2xl font-bold">MyTalipapa</span>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-6 pb-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-lg font-bold text-gray-800 mb-1">Create your account</h2>
            <p className="text-xs text-gray-500 mb-5">Fill in your details to get started</p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            {/* Debug panel — remove before production */}
            {debugInfo && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-900 space-y-1">
                <p className="font-bold">🛠 Debug Info</p>
                <p>Error: <span className="font-mono">{debugInfo.error ?? 'none'}</span></p>
                <p>User ID: <span className="font-mono">{debugInfo.user_id ?? 'null'}</span></p>
                <p>Session: <span className="font-mono">{debugInfo.session}</span></p>
                <p>Identities: <span className="font-mono">{debugInfo.identities_count}</span></p>
                <details className="mt-1">
                  <summary className="cursor-pointer font-semibold">Full response JSON</summary>
                  <pre className="mt-1 overflow-auto max-h-40 text-[10px]">{debugInfo.raw}</pre>
                </details>
              </div>
            )}

            {/* Success — confirm email */}
            {success === 'confirm' && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Check your email!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a confirmation link to <strong>{form.email}</strong>.
                  Click it to activate your account.
                </p>
                <a href="/login" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#1a5c2a' }}>
                  Back to Login
                </a>
              </div>
            )}

            {/* Success — immediate */}
            {success === 'immediate' && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Account created!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Welcome, <strong>{form.full_name}</strong>!
                </p>
                <a href="/dashboard" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#1a5c2a' }}>
                  Go to Dashboard
                </a>
              </div>
            )}

            {!success && (
              <form onSubmit={handleRegister} className="space-y-4">

                {/* ── ROLE PICKER ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Renter */}
                    <button
                      type="button"
                      onClick={() => selectRole('renter')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        form.role === 'renter'
                          ? 'border-green-700 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        form.role === 'renter' ? 'bg-green-700' : 'bg-gray-200'
                      }`}>
                        <ShoppingBag size={20} className={form.role === 'renter' ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${form.role === 'renter' ? 'text-green-800' : 'text-gray-700'}`}>
                          Renter
                        </p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          I want to rent a stall
                        </p>
                      </div>
                      {form.role === 'renter' && (
                        <span className="text-xs font-bold text-green-700">✓ Selected</span>
                      )}
                    </button>

                    {/* Contractor / Operator */}
                    <button
                      type="button"
                      onClick={() => selectRole('operator')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        form.role === 'operator'
                          ? 'border-green-700 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        form.role === 'operator' ? 'bg-green-700' : 'bg-gray-200'
                      }`}>
                        <Store size={20} className={form.role === 'operator' ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${form.role === 'operator' ? 'text-green-800' : 'text-gray-700'}`}>
                          Contractor
                        </p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          I manage stalls
                        </p>
                      </div>
                      {form.role === 'operator' && (
                        <span className="text-xs font-bold text-green-700">✓ Selected</span>
                      )}
                    </button>

                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <User size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text" name="full_name" value={form.full_name} onChange={handleChange}
                      placeholder="Juan Dela Cruz" required
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    {form.full_name && (
                      <button type="button" onClick={() => setForm({ ...form, full_name: '' })} className="text-gray-400">✕</button>
                    )}
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Contact Number</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Phone size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="tel" name="contact_number" value={form.contact_number} onChange={handleChange}
                      placeholder="0917 345 6789"
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    {form.contact_number && (
                      <button type="button" onClick={() => setForm({ ...form, contact_number: '' })} className="text-gray-400">✕</button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Mail size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="juan@mytalipapa.ph" required
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    {form.email && (
                      <button type="button" onClick={() => setForm({ ...form, email: '' })} className="text-gray-400">✕</button>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Lock size={16} className="text-gray-400 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} placeholder="••••••••" required
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm Password</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Lock size={16} className="text-gray-400 shrink-0" />
                    <input
                      type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password}
                      onChange={handleChange} placeholder="••••••••" required
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox" name="agreed" id="agreed"
                    checked={form.agreed} onChange={handleChange}
                    className="mt-0.5 accent-green-700"
                  />
                  <label htmlFor="agreed" className="text-xs text-gray-500">
                    I agree to the{' '}
                    <a href="#" style={{ color: '#1a5c2a' }} className="font-semibold">Terms and Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <><span>Register</span><span>→</span></>
                  )}
                </button>

              </form>
            )}

            {!success && (
              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{' '}
                <a href="/login" style={{ color: '#1a5c2a' }} className="font-semibold">Login</a>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2024 MyTalipapa Market Management. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}