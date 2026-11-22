import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Target,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { Button, Input, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Origin to redirect after successful login
  const from = (location.state as any)?.from?.pathname || '/jobs'

  // Inline Validation
  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Work email is required.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.')
      return false
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      toast.warning('Please resolve highlighted form errors.', 'Validation Error')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success(`Welcome back, ${email.trim()}!`, 'Authenticated')
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please try again.'
      setFormError(msg)
      toast.error(msg, 'Authentication Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100">
      {/* LEFT: Gradient Branding Panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border-r border-slate-800/80 overflow-hidden">
        {/* Decorative glowing ambient orb */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Hire<span className="text-indigo-400">Mind</span>
              </span>
              <span className="ml-2 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                SaaS Talent Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Value Prop & Live Preview Card */}
        <div className="relative z-10 space-y-8 my-auto py-10">
          <div className="space-y-4 max-w-lg">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Precision talent matching for high-impact developers.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Sign in to unlock algorithmically ranked tech jobs matched against your skills, experience seniority, and preferred work mode.
            </p>
          </div>

          {/* Interactive Feature List */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-start space-x-3 text-sm text-slate-300">
              <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-400 border border-indigo-500/20 mt-0.5">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-white">AI Scoring Engine:</strong> 60% skill coverage + 20% experience fit + 20% preference fit.
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm text-slate-300">
              <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-400 border border-indigo-500/20 mt-0.5">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-white">60+ Seeded Roles:</strong> Full coverage of Python, React, Data, DevOps, and ML/AI engineering.
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm text-slate-300">
              <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-400 border border-indigo-500/20 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-white">User-Scoped Bookmarks:</strong> Save jobs and manage your personal hiring queue.
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-soft-lg backdrop-blur-sm max-w-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Match Preview</span>
              <Badge variant="success" size="sm" dot>95% Match</Badge>
            </div>
            <p className="text-sm font-bold text-white">Senior Python Backend Engineer &bull; CloudScale AI</p>
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-emerald-300">
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> python</span>
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> fastapi</span>
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> postgresql</span>
              <span className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> docker</span>
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="relative z-10 flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Secured with JWT Bearer Authentication & Bcrypt Hashing</span>
        </div>
      </div>

      {/* RIGHT: Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Link (Visible on small screens) */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-800">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">Hire<span className="text-indigo-400">Mind</span></span>
            </Link>
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-200">
              Back to Home &rarr;
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400">
              Enter your credentials to access your candidate profile and matched roles.
            </p>
          </div>

          {/* Inline Form Error Banner */}
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium animate-in fade-in">
              <strong>Login Error:</strong> {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) validateEmail(e.target.value)
              }}
              onBlur={() => validateEmail(email)}
              error={emailError || undefined}
              placeholder="candidate@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={loading}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={() => validatePassword(password)}
                error={passwordError || undefined}
                placeholder="Enter your account password"
                leftIcon={<Lock className="h-4 w-4" />}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to HireMind
            </Button>
          </form>

          {/* Sign Up Switch Link */}
          <div className="text-center pt-4 border-t border-slate-800/80">
            <p className="text-sm text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Create your developer profile &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
