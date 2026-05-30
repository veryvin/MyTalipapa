import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: identify, 2: enter otp, 3: reset pass, 4: success
  const [accountName, setAccountName] = useState('')
  const [userId, setUserId] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Timer: 5 minutes = 300 seconds
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Format time remaining (mm:ss)
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Step 1: Identify Account & Trigger OTP
  async function handleIdentify(e) {
    e.preventDefault()
    if (!accountName.trim()) {
      setError('Please enter your account name or email address.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Identify User
      const idResponse = await fetch('http://localhost:5000/api/identify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName }),
      })

      const idResult = await idResponse.json()

      if (!idResponse.ok) {
        setError(idResult.error || 'Account not found.')
        setLoading(false)
        return
      }

      const verifiedUserId = idResult.userId
      setUserId(verifiedUserId)
      setMaskedEmail(idResult.maskedEmail)

      // 2. Automatically trigger sending OTP to their email address
      const sendOtpResponse = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: verifiedUserId, method: 'email' }),
      })

      const sendOtpResult = await sendOtpResponse.json()

      if (!sendOtpResponse.ok) {
        setError(sendOtpResult.error || 'Failed to send verification code to your email.')
        setLoading(false)
        return
      }

      setTimer(300) // 5 minutes countdown
      setStep(2) // Move directly to OTP entry step
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method: 'email' }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to resend verification code.')
        setLoading(false)
        return
      }

      setTimer(300) // reset countdown
      setOtp('')
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Invalid or expired verification code.')
        setLoading(false)
        return
      }

      setStep(3)
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  async function handleResetPassword(e) {
    e.preventDefault()

    // Complexity rules check
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasDigitOrSpecial = /[\d\W]/.test(password)
    if (!hasLetter || !hasDigitOrSpecial) {
      setError('Password must contain at least one letter and one number or special character.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to reset password.')
        setLoading(false)
        return
      }

      setStep(4)
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Password Complexity Inline States
  const isLenValid = password.length >= 6
  const isComplexityValid = /[a-zA-Z]/.test(password) && /[\d\W]/.test(password)
  const isMatchValid = password && password === confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#f5f2ec' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 cursor-pointer" onClick={() => navigate('/login')} style={{ backgroundColor: '#1a5c2a' }}>
            <span className="text-white text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a5c2a' }}>MyTalipapa</h1>
          <p className="text-xs tracking-widest text-gray-500 mt-1 uppercase">
            Account Recovery
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm p-6 relative overflow-hidden">

          {/* Back button (Only for steps 1, 2, 3) */}
          {step < 4 && (
            <button
              onClick={() => {
                if (step === 1) navigate('/login')
                if (step === 2) setStep(1)
                if (step === 3) setStep(2)
              }}
              className="absolute top-6 left-6 text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          <div className="pt-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex gap-1.5 items-start">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: Identify Account ── */}
            {step === 1 && (
              <form onSubmit={handleIdentify} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Find Your Account</h2>
                  <p className="text-xs text-gray-500 mb-4">Enter your username, registered name, or email address</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Account Name or Email
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Mail size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Username, email or contact number"
                      required
                      disabled={loading}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  {loading ? 'Finding Account...' : 'Continue →'}
                </button>
              </form>
            )}

            {/* ── STEP 2: Enter OTP ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Enter Security Code</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    We sent a 6-digit verification code to <strong className="text-gray-700">{maskedEmail}</strong>. Enter it below to proceed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 text-center">
                    Verification Code
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setOtp(val)
                      }}
                      placeholder="000000"
                      disabled={loading}
                      className="text-center font-mono text-3xl tracking-[0.6em] pl-4 py-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-700 w-full font-bold max-w-[200px]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  {loading ? 'Verifying...' : 'Verify Code →'}
                </button>

                {/* Expiry & Resend Countdown */}
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-400">
                    {timer > 0 ? (
                      <span>Code expires in <span className="font-semibold text-orange-500 font-mono">{formatTime(timer)}</span></span>
                    ) : (
                      <span>
                        Code expired.{' '}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          Resend OTP
                        </button>
                      </span>
                    )}
                  </p>
                </div>
              </form>
            )}

            {/* ── STEP 3: Reset Password ── */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Set New Password</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Create a strong password containing letters and numbers/symbols.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">New Password</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-250 bg-gray-50">
                    <Lock size={16} className="text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
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
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-250 bg-gray-50">
                    <Lock size={16} className="text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Inline Validations */}
                <div className="space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={isLenValid ? 'text-green-600' : 'text-gray-400'}>{isLenValid ? '✓' : '•'}</span>
                    <span className={isLenValid ? 'text-green-800' : 'text-gray-500'}>At least 6 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={isComplexityValid ? 'text-green-600' : 'text-gray-400'}>{isComplexityValid ? '✓' : '•'}</span>
                    <span className={isComplexityValid ? 'text-green-800' : 'text-gray-500'}>Contains letter + number/symbol</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={isMatchValid ? 'text-green-600' : 'text-gray-400'}>{isMatchValid ? '✓' : '•'}</span>
                    <span className={isMatchValid ? 'text-green-800' : 'text-gray-500'}>Passwords match</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLenValid || !isComplexityValid || !isMatchValid}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password →'}
                </button>
              </form>
            )}

            {/* ── STEP 4: Success Screen ── */}
            {step === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center text-green-700">
                  <CheckCircle size={64} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">Password Reset Successful!</h3>
                  <p className="text-xs text-gray-500 px-2 leading-relaxed">
                    Your password has been changed. You can now use your new credentials to sign in.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1a5c2a' }}
                >
                  Back to Login
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 MyTalipapa Market Management. All rights reserved.
        </p>
      </div>
    </div>
  )
}
