import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'renter',
    agreed: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (!form.agreed) {
      setError('Please agree to the Terms and Privacy Policy.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          role: form.role
        }
      }
    })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f2ec' }}>

      {/* Green header image area */}
      <div
        className="h-32 sm:h-40 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#1a5c2a' }}
      >
        <div className="absolute inset-0 opacity-20"
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

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-6 pb-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-lg font-bold text-gray-800 mb-1">Create your renter account</h2>
            <p className="text-xs text-gray-500 mb-5">Fill in your details to get started</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            {success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Check your email!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a confirmation link to <strong>{form.email}</strong>
                </p>
                
                <a
                  href="/login"
                  className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  Back to Login
                </a>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <User size={16} className="text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Juan Dela Cruz"
                      required
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
                    <Phone size={16} className="text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0917 345 6789"
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    {form.phone && (
                      <button type="button" onClick={() => setForm({ ...form, phone: '' })} className="text-gray-400">✕</button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Mail size={16} className="text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@mytalipapa.ph"
                      required
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
                    <Lock size={16} className="text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
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
                    <Lock size={16} className="text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
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
                    type="checkbox"
                    name="agreed"
                    id="agreed"
                    checked={form.agreed}
                    onChange={handleChange}
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
                  {loading ? 'Creating account...' : <><span>Register</span><span>→</span></>}
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