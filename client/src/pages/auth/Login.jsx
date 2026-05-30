import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('renter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store JWT token
      localStorage.setItem('authToken', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))


      // Redirect based on role
      if (result.user && result.user.role === 'renter') {
        window.location.href = '/renter/dashboard'
      } else if (result.user && result.user.role === 'admin') {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/contractor/dashboard'
      }

    } catch (err) {
      setError('Network error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative" style={{ backgroundColor: '#f5f2ec' }}>
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 flex items-center gap-1 text-sm font-semibold bg-[#1a5c2a] rounded-md shadow p-2 text-white hover:bg-[#163721] transition-colors">← Back</button>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#1a5c2a' }}>
            <span className="text-white text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a5c2a' }}>MyTalipapa</h1>
          <p className="text-xs tracking-widest text-gray-500 mt-1 uppercase">
            {role === 'renter' ? 'Vendor Portal' : role === 'admin' ? 'Admin Portal' : 'Contractor Portal'}
          </p>
          {/* Back button moved to top left */}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm p-6">

          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button
              onClick={() => setRole('renter')}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: role === 'renter' ? '#1a5c2a' : 'white',
                color: role === 'renter' ? 'white' : '#6b7280'
              }}
            >
              Renter
            </button>
            <button
              onClick={() => setRole('contractor')}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: role === 'contractor' ? '#1a5c2a' : 'white',
                color: role === 'contractor' ? 'white' : '#6b7280'
              }}
            >
              Contractor
            </button>
            <button
              onClick={() => setRole('admin')}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: role === 'admin' ? '#1a5c2a' : 'white',
                color: role === 'admin' ? 'white' : '#6b7280'
              }}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <Mail size={16} className="text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === 'renter' ? 'vendor@mytalipapa.com' : role === 'admin' ? 'admin@mytalipapa.com' : 'name@contractor.com'}
                  required
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                {email && (
                  <button type="button" onClick={() => setEmail('')} className="text-gray-400 hover:text-gray-600">✕</button>
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-xs font-medium" style={{ color: '#f97316' }}>Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1a5c2a' }}
            >
              {loading ? 'Signing in...' : (
                <>
                  {role === 'renter' ? 'Login' : 'Login to Dashboard'}
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#1a5c2a' }} className="font-semibold">Register</a>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 mt-6">
          <a href="#" className="text-xs text-gray-400">Help Center</a>
          <a href="#" className="text-xs text-gray-400">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}