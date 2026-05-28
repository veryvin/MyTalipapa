import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Store, ShoppingBag, Edit, Search, Check, ArrowRight } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    contact_number: '',
    password: '',
    confirm_password: '',
    role: '',          // 'renter' | 'contractor'
    agreed: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)

  // Step 2 & 3 state
  const [stalls, setStalls] = useState([])
  const [loadingStalls, setLoadingStalls] = useState(false)
  const [selectedStalls, setSelectedStalls] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZone, setSelectedZone] = useState('All')

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  function handlePhoneChange(e) {
    let val = e.target.value.replace(/\D/g, '')
    // Strip leading 63 or 09 automatically for a seamless user experience
    if (val.startsWith('63')) {
      val = val.substring(2)
    } else if (val.startsWith('09')) {
      val = val.substring(1)
    }
    if (val.length <= 10) {
      setForm(prev => ({ ...prev, contact_number: val }))
    }
  }

  const isMinLength = form.password.length >= 8
  const hasUppercase = /[A-Z]/.test(form.password)
  const hasDigit = /[0-9]/.test(form.password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(form.password)
  const isPasswordValid = isMinLength && hasUppercase && hasDigit && hasSpecial

  const passwordsMatch = form.confirm_password.length > 0 && form.confirm_password === form.password

  const isPhoneValid = form.contact_number.length === 10 && form.contact_number.startsWith('9')

  const isEmailValid = form.email.trim().includes('@')

  const isFormValid = 
    form.full_name.trim().length > 0 &&
    (form.role !== 'contractor' || form.business_name.trim().length > 0) &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch &&
    isPhoneValid &&
    form.agreed &&
    form.role

  function selectRole(role) {
    setForm({ ...form, role })
    setError(null)
  }

  // Fetch stalls from server
  async function fetchStalls() {
    setLoadingStalls(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/contractor/stalls?unmanaged=true')
      if (!response.ok) throw new Error('Failed to fetch stalls')
      const data = await response.json()
      setStalls(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load stalls. Please try again.')
    } finally {
      setLoadingStalls(false)
    }
  }

  // Calculate total monthly commitment
  const totalMonthlyRate = useMemo(() => {
    return selectedStalls.reduce((sum, stallNum) => {
      const stall = stalls.find(s => s.stallNumber === stallNum)
      return sum + (stall?.monthlyRate || 0)
    }, 0)
  }, [selectedStalls, stalls])

  // Extract unique zones from stalls
  const zones = useMemo(() => {
    const sections = stalls.map(s => s.section).filter(Boolean)
    return ['All', ...new Set(sections)]
  }, [stalls])

  // Filter stalls based on search and zone selection
  const filteredStalls = useMemo(() => {
    return stalls.filter(stall => {
      const matchesSearch = 
        stall.stallNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stall.section.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesZone = 
        selectedZone === 'All' || 
        stall.section.toLowerCase() === selectedZone.toLowerCase()
        
      return matchesSearch && matchesZone
    })
  }, [stalls, searchQuery, selectedZone])

  // Handle Step 1 Submit / Renter Register
  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    if (!form.role) {
      setError('Please select whether you are a Renter or Contractor.')
      return
    }
    if (form.role === 'contractor' && !form.business_name) {
      setError('Please enter your business name.')
      return
    }
    if (!isPasswordValid) {
      setError('Password does not meet the requirements.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    if (!isPhoneValid) {
      setError('Please enter a valid PH mobile number.')
      return
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.')
      return
    }
    if (!form.agreed) {
      setError('Please agree to the Terms and Privacy Policy.')
      return
    }

    // If contractor, fetch stalls and transition to Step 2
    if (form.role === 'contractor') {
      await fetchStalls()
      setStep(2)
      return
    }

    // Renter flows directly to immediate user creation
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: form.full_name,
          contact_number: `+63${form.contact_number}`,
          role: form.role,
          email: form.email,
          password: form.password,
          agreed: form.agreed,
        }),
      })

      const result = await response.json()

      console.log('register API result:', result)
      setDebugInfo({
        error: result.error ?? null,
        user_id: result.user?.id ?? null,
        user_email: result.user?.email ?? null,
        session: result.session ? 'present' : 'null',
        identities_count: result.user?.identities?.length ?? 'n/a',
        raw: JSON.stringify(result, null, 2),
      })

      if (!response.ok) {
        setError(result.error || 'Registration failed')
        setLoading(false)
        return
      }

      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      setSuccess('immediate')
    } catch (err) {
      console.error('Caught exception:', err)
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 3 Submit
  async function handleSubmitContractorApplication() {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/contractor/register-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.full_name,
          businessName: form.business_name,
          email: form.email,
          password: form.password,
          contactNumber: `+63${form.contact_number}`,
          selectedStalls: selectedStalls,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Application submission failed')
        setLoading(false)
        return
      }

      setSuccess('contractor_pending')
    } catch (err) {
      console.error('Caught exception:', err)
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
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
        <div className={`w-full ${step === 2 || step === 3 ? 'max-w-md' : 'max-w-sm'}`}>
          <div className="bg-white rounded-3xl shadow-sm p-6 relative">

            {/* Error */}
            {error && step === 1 && (
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

            {/* Success — immediate */}
            {success === 'immediate' && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Account created!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Welcome, <strong>{form.full_name}</strong>!
                </p>
                <button
                  onClick={() =>
                    navigate(
                      form.role === 'contractor'
                        ? '/contractor/dashboard'
                        : '/renter/dashboard'
                    )
                  }
                  className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold w-full"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Success — contractor pending */}
            {success === 'contractor_pending' && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">⏳</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Application Submitted!</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Your registration is being reviewed by the Admin. You will be notified via SMS/email once approved.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold w-full transition-all hover:bg-green-800"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* Form Steps */}
            {!success && (
              <>
                {/* ── STEP 1: Personal Info ── */}
                {step === 1 && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Create your account</h2>
                    <p className="text-xs text-gray-500 mb-2">Fill in your details to get started</p>

                    {/* ROLE PICKER */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Register as:</label>
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

                        {/* Contractor */}
                        <button
                          type="button"
                          onClick={() => selectRole('contractor')}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            form.role === 'contractor'
                              ? 'border-green-700 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            form.role === 'contractor' ? 'bg-green-700' : 'bg-gray-200'
                          }`}>
                            <Store size={20} className={form.role === 'contractor' ? 'text-white' : 'text-gray-500'} />
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-semibold ${form.role === 'contractor' ? 'text-green-800' : 'text-gray-700'}`}>
                              Contractor
                            </p>
                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                              I manage stalls
                            </p>
                          </div>
                          {form.role === 'contractor' && (
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

                    {/* Business Name (Only for Contractors) */}
                    {form.role === 'contractor' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Business Name</label>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                          <Store size={16} className="text-gray-400 shrink-0" />
                          <input
                            type="text" name="business_name" value={form.business_name} onChange={handleChange}
                            placeholder="Juan's Organic Produce" required
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                          />
                          {form.business_name && (
                            <button type="button" onClick={() => setForm({ ...form, business_name: '' })} className="text-gray-400">✕</button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Contact Number</label>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        form.contact_number.length === 0
                          ? 'border-gray-200 bg-gray-50 focus-within:border-green-700'
                          : isPhoneValid
                          ? 'border-green-600 bg-green-50/20'
                          : 'border-red-500 bg-red-50/20'
                      }`}>
                        <Phone size={16} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 text-sm font-semibold select-none shrink-0">+63</span>
                        <input
                          type="tel" name="contact_number" value={form.contact_number} onChange={handlePhoneChange}
                          placeholder="9171234567" required
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        {isPhoneValid && (
                          <Check size={16} className="text-green-600 shrink-0" strokeWidth={3} />
                        )}
                        {form.contact_number && (
                          <button type="button" onClick={() => setForm({ ...form, contact_number: '' })} className="text-gray-400">✕</button>
                        )}
                      </div>
                      {form.contact_number.length > 0 && !isPhoneValid && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1">Enter a valid PH mobile number</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        form.email.length === 0
                          ? 'border-gray-200 bg-gray-50 focus-within:border-green-700'
                          : isEmailValid
                          ? 'border-green-600 bg-green-50/20'
                          : 'border-red-500 bg-red-50/20'
                      }`}>
                        <Mail size={16} className="text-gray-400 shrink-0" />
                        <input
                          type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="juan@mytalipapa.ph" required
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        {isEmailValid && (
                          <Check size={16} className="text-green-600 shrink-0" strokeWidth={3} />
                        )}
                        {form.email && (
                          <button type="button" onClick={() => setForm({ ...form, email: '' })} className="text-gray-400">✕</button>
                        )}
                      </div>
                      {form.email.length > 0 && !isEmailValid && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1">Enter a valid email address containing @</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        form.password.length === 0
                          ? 'border-gray-200 bg-gray-50 focus-within:border-green-700'
                          : isPasswordValid
                          ? 'border-green-600 bg-green-50/20'
                          : 'border-gray-200 bg-gray-50 focus-within:border-green-700'
                      }`}>
                        <Lock size={16} className="text-gray-400 shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                          onChange={handleChange} placeholder="••••••••" required
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        {isPasswordValid && (
                          <Check size={16} className="text-green-600 shrink-0" strokeWidth={3} />
                        )}
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {/* Password Strength Live Checklist */}
                      <div className="mt-2 space-y-1 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                        <p className="font-semibold text-gray-500 mb-1">Password Strength Checklist:</p>
                        <div className="flex items-center gap-1.5">
                          <span className={isMinLength ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {isMinLength ? "✓" : "✗"}
                          </span>
                          <span className={isMinLength ? "text-green-700 font-medium" : "text-gray-500"}>
                            Minimum 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={hasUppercase ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {hasUppercase ? "✓" : "✗"}
                          </span>
                          <span className={hasUppercase ? "text-green-700 font-medium" : "text-gray-500"}>
                            At least 1 uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={hasDigit ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {hasDigit ? "✓" : "✗"}
                          </span>
                          <span className={hasDigit ? "text-green-700 font-medium" : "text-gray-500"}>
                            At least 1 number
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={hasSpecial ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {hasSpecial ? "✓" : "✗"}
                          </span>
                          <span className={hasSpecial ? "text-green-700 font-medium" : "text-gray-500"}>
                            At least 1 special character (e.g. !@#$%^&*)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm Password</label>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        form.confirm_password.length === 0
                          ? 'border-gray-200 bg-gray-50 focus-within:border-green-700'
                          : passwordsMatch
                          ? 'border-green-600 bg-green-50/20'
                          : 'border-red-500 bg-red-50/20'
                      }`}>
                        <Lock size={16} className="text-gray-400 shrink-0" />
                        <input
                          type={showConfirm ? 'text' : 'password'} name="confirm_password" value={form.confirm_password}
                          onChange={handleChange} placeholder="••••••••" required
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        {passwordsMatch && (
                          <Check size={16} className="text-green-600 shrink-0" strokeWidth={3} />
                        )}
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {form.confirm_password.length > 0 && !passwordsMatch && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1">Passwords do not match</p>
                      )}
                      {form.confirm_password.length > 0 && passwordsMatch && (
                        <p className="text-green-600 text-[11px] font-semibold mt-1">✓ Passwords match</p>
                      )}
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
                      disabled={loading || !isFormValid}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                      style={{ backgroundColor: '#1a5c2a' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>{form.role === 'contractor' ? 'Next: Pick Stalls' : 'Register'}</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── STEP 2: Pick Your Stalls ── */}
                {step === 2 && (
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-semibold"
                    >
                      ← Back
                    </button>
                    <div className="pt-6">
                      {/* Step Indicator */}
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">Step 2 of 3 — Pick Stalls</span>
                        <span>66% Complete</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                        <div className="bg-green-700 h-full rounded-full transition-all duration-300" style={{ width: '66.6%' }}></div>
                      </div>

                      <h2 className="text-xl font-extrabold text-gray-800 mb-1">Choose Your Stalls</h2>
                      <p className="text-xs text-gray-500 mb-5">
                        Select the stalls you want to manage from the available list. Each card represents a physical space.
                      </p>

                      {/* Search & Filters */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                          <Search size={16} className="text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search stall number or zone..."
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                          />
                        </div>

                        {/* Zone Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {zones.map(zone => (
                            <button
                              key={zone}
                              type="button"
                              onClick={() => setSelectedZone(zone)}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                                selectedZone === zone
                                  ? 'bg-green-700 border-green-700 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {zone}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grid */}
                      {loadingStalls ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                          <span className="text-xs text-gray-500">Loading stalls...</span>
                        </div>
                      ) : filteredStalls.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                          No stalls found matching your criteria.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 mb-20 scrollbar-thin">
                          {filteredStalls.map(stall => {
                            const isSelected = selectedStalls.includes(stall.stallNumber);
                            const isAvailable = stall.status === 'available';

                            return (
                              <button
                                key={stall._id}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedStalls(selectedStalls.filter(s => s !== stall.stallNumber))
                                  } else {
                                    setSelectedStalls([...selectedStalls, stall.stallNumber])
                                  }
                                }}
                                className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all relative ${
                                  isSelected
                                    ? 'border-green-700 bg-green-50/50'
                                    : isAvailable
                                    ? 'border-gray-200 bg-white hover:border-gray-300'
                                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                }`}
                              >
                                {/* Stall Number & Status */}
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-extrabold text-sm text-gray-800">#{stall.stallNumber}</span>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                    isAvailable
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}>
                                    {stall.status.toUpperCase()}
                                  </span>
                                </div>

                                <div className="text-[10px] text-gray-400 font-semibold mb-3 uppercase tracking-wider">
                                  {stall.section}
                                </div>

                                <div className="flex justify-between items-end mt-auto w-full text-[11px]">
                                  <div className="flex flex-col">
                                    <span className="text-gray-400">Size</span>
                                    <span className="font-semibold text-gray-700">{stall.size} {stall.sizeUnit || 'sqm'}</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                    <span className="text-gray-400">Rate</span>
                                    <span className="font-bold text-green-700">₱{stall.monthlyRate?.toLocaleString()}/mo</span>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-green-700 text-white rounded-full p-0.5">
                                    <Check size={10} strokeWidth={3} />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Sticky Bottom Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 rounded-b-3xl flex items-center justify-between z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {selectedStalls.length} stall{selectedStalls.length !== 1 ? 's' : ''} selected
                          </span>
                          <span className="text-lg font-extrabold text-gray-800">₱{totalMonthlyRate.toLocaleString()}</span>
                        </div>
                        <button
                          type="button"
                          disabled={selectedStalls.length === 0}
                          onClick={() => setStep(3)}
                          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl disabled:opacity-60 flex items-center gap-1 transition-all"
                        >
                          Next: Review <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Review & Submit ── */}
                {step === 3 && (
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setStep(2)} 
                      className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-semibold"
                    >
                      ← Back
                    </button>
                    <div className="pt-6">
                      {/* Step Indicator */}
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">Step 3 of 3</span>
                        <span>100% Complete</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                        <div className="bg-green-700 h-full rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                      </div>

                      <h2 className="text-xl font-extrabold text-gray-800 mb-1">Review & Submit</h2>
                      <p className="text-xs text-gray-500 mb-5">
                        Please review your contractor details and selected stalls before submitting.
                      </p>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">{error}</div>
                      )}

                      {/* Info Summary */}
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 mb-5 relative">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="absolute top-4 right-4 p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-green-700 rounded-lg hover:border-green-700 transition-all"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <div className="flex items-center gap-3 mb-3 text-left">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-extrabold text-sm">
                            {form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-gray-800">{form.full_name}</h3>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{form.business_name}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-3">
                          <div className="flex justify-between"><span>Phone:</span><span className="font-semibold">+63 {form.contact_number}</span></div>
                          <div className="flex justify-between"><span>Email:</span><span className="font-semibold">{form.email}</span></div>
                        </div>
                      </div>

                      {/* Selected Stalls */}
                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Selected Stalls</span>
                          <span className="text-[9px] bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-full">{selectedStalls.length} ITEMS</span>
                        </div>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                          {selectedStalls.map(stallNum => {
                            const stall = stalls.find(s => s.stallNumber === stallNum)
                            if (!stall) return null
                            return (
                              <div key={stall._id} className="flex items-center justify-between p-3 bg-white border border-gray-150 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 bg-green-50 text-green-800 border border-green-100 rounded-lg flex items-center justify-center font-extrabold text-xs">
                                    #{stall.stallNumber}
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="font-bold text-xs text-gray-800">{stall.section}</span>
                                    <span className="text-[9px] text-gray-400">{stall.size} sqm</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-xs text-green-700">₱{stall.monthlyRate?.toLocaleString()}</span>
                                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Monthly</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Total Monthly Commitment */}
                      <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Monthly Commitment</span>
                        <span className="text-lg font-extrabold text-orange-600">₱{totalMonthlyRate.toLocaleString()}</span>
                      </div>

                      {/* Alert Notice */}
                      <div className="p-3 bg-blue-50 border border-blue-150 rounded-2xl flex items-start gap-2.5 mb-6 text-left">
                        <span className="text-base mt-0.5">📋</span>
                        <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                          Your registration will be reviewed by the Admin. You will be notified via SMS/email once approved.
                        </p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmitContractorApplication}
                        className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-extrabold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {loading ? 'Submitting...' : 'Submit for Review →'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!success && step === 1 && (
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
      
      {/* Scrollbar hide CSS */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  )
}