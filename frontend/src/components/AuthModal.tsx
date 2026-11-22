import React, { useState } from 'react'
import { Modal, Input, Button } from './ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ui/Toast'
import { Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Senior')
  const [workMode, setWorkMode] = useState('Remote')
  const [location, setLocation] = useState('San Francisco, CA')
  const [skills, setSkills] = useState('Python, FastAPI, React, TypeScript')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login, register } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success(`Welcome back, ${email}!`, 'Signed In')
      } else {
        const skillsArray = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        await register({
          email,
          password,
          experience_level: experienceLevel,
          work_mode: workMode,
          location,
          skills: skillsArray,
        })
        toast.success('Your profile and skills have been created!', 'Account Created')
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
      toast.error(err.message || 'Authentication error', 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to HireMind' : 'Create HireMind Account'}
      description={
        mode === 'login'
          ? 'Access personalized job match scoring, recommendations, and saved roles.'
          : 'Set up your developer profile to enable AI candidate-job matching.'
      }
      size="md"
    >
      <div className="space-y-5">
        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Profile
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@company.com"
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
          />

          {mode === 'register' && (
            <div className="space-y-4 pt-1 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Seniority
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead / Staff</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
              />

              <Input
                label="Skills (Comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, FastAPI, React, Docker"
                helperText="Used by HireMind matcher to score job recommendations"
              />
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              leftIcon={mode === 'register' ? <Sparkles className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
            >
              {mode === 'login' ? 'Sign In' : 'Complete Registration & Start Matching'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
