import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from 'lucide-react'
import { Button, Input, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Senior')
  const [workMode, setWorkMode] = useState('Remote')
  const [location, setLocation] = useState('San Francisco, CA')
  const [skills, setSkills] = useState('Python, FastAPI, React, Docker')

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Inline Validation Handlers
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

  const validateSkills = (val: string): boolean => {
    if (!val.trim()) {
      setSkillsError('Please enter at least 1 technical skill for job matching.')
      return false
    }
    setSkillsError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isSkillsValid = validateSkills(skills)

    if (!isEmailValid || !isPasswordValid || !isSkillsValid) {
      toast.warning('Please fix the highlighted fields before submitting.', 'Validation Error')
      return
    }

    setLoading(true)
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      await register({
        email: email.trim(),
        password,
        experience_level: experienceLevel,
        work_mode: workMode,
        location: location.trim() || undefined,
        skills: skillsArray,
      })

      toast.success('Your candidate profile was created and verified!', 'Account Ready')
      navigate('/jobs', { replace: true })
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your information.'
      setFormError(msg)
      toast.error(msg, 'Registration Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100">
      {/* LEFT: Gradient Branding Panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border-r border-slate-800/80 overflow-hidden">
        {/* Ambient lighting effects */}
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

        {/* Value Prop & Matching Formula Showcase */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-4 max-w-lg">
            <Badge variant="default" size="md">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
              <span>Intelligent Compatibility Algorithm</span>
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Create your profile. Let the algorithm do the searching.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Define your skills, preferred work mode, and seniority. HireMind scores every single job listing in real time.
            </p>
          </div>

          {/* Scoring Formula Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-soft-lg backdrop-blur-sm max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matching Formula (0–100%)</span>
              <Badge variant="primary" size="sm">matcher.py</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <p className="text-lg font-bold text-indigo-400">60%</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Skill Coverage</p>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <p className="text-lg font-bold text-purple-400">20%</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Experience Fit</p>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <p className="text-lg font-bold text-emerald-400">20%</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Preferences</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 max-w-md text-sm text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Instant match scores across all 60+ seeded roles</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Personalized recommendations via <code className="text-xs text-indigo-300">GET /recommendations</code></span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Bookmark listings with one click to your private queue</span>
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="relative z-10 flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Bcrypt Password Security & OAuth2 JWT Access Tokens</span>
        </div>
      </div>

      {/* RIGHT: Register Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Brand Link */}
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
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create your candidate profile
            </h2>
            <p className="text-sm text-slate-400">
              Provide your technical stack and preferences for automated job scoring.
            </p>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium animate-in fade-in">
              <strong>Registration Error:</strong> {formError}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              placeholder="candidate@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={loading}
              autoComplete="email"
              required
            />

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
              placeholder="Min. 6 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              disabled={loading}
              autoComplete="new-password"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Seniority Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead / Staff Level</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Work Mode Preference
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            <Input
              label="Primary Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              leftIcon={<MapPin className="h-4 w-4" />}
              disabled={loading}
            />

            <Input
              label="Skills (Comma-separated)"
              value={skills}
              onChange={(e) => {
                setSkills(e.target.value)
                if (skillsError) validateSkills(e.target.value)
              }}
              onBlur={() => validateSkills(skills)}
              error={skillsError || undefined}
              placeholder="e.g. Python, FastAPI, React, TypeScript, Docker"
              helperText="These skills are parsed by matcher.py to compute your 60% skill coverage score"
              disabled={loading}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Register & View Matched Jobs
              </Button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-4 border-t border-slate-800/80">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Sign in to your account &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
