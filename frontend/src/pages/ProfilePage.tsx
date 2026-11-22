import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Save,
  Target,
  Award,
  MapPin,
  Laptop,
  Home,
  Building,
  Plus,
  X,
  CheckCircle2,
  Bookmark,
  Briefcase,
  Layers,
} from 'lucide-react'
import { Card, Button, Input, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

const SUGGESTED_SKILLS = [
  'Python',
  'FastAPI',
  'Django',
  'PostgreSQL',
  'Redis',
  'Docker',
  'React',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'Kubernetes',
  'AWS',
  'Terraform',
  'PyTorch',
  'Kafka',
  'Snowflake',
  'dbt',
  'GraphQL',
]

const POPULAR_LOCATIONS = [
  'Remote',
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'London, UK',
]

const EXPERIENCE_OPTIONS = [
  { id: 'Entry', title: 'Entry Level', years: '0–2 yrs' },
  { id: 'Mid', title: 'Mid Level', years: '2–5 yrs' },
  { id: 'Senior', title: 'Senior Level', years: '5–8 yrs' },
  { id: 'Lead', title: 'Lead / Staff', years: '8+ yrs' },
]

const WORK_MODE_OPTIONS = [
  { id: 'Remote', title: '100% Remote', icon: Home },
  { id: 'Hybrid', title: 'Hybrid', icon: Laptop },
  { id: 'On-site', title: 'On-site', icon: Building },
]

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth()
  const toast = useToast()

  const [skills, setSkills] = useState<string[]>([])
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Senior')
  const [location, setLocation] = useState('Remote')
  const [workMode, setWorkMode] = useState('Remote')
  const [saving, setSaving] = useState(false)

  // Initialize from user profile
  useEffect(() => {
    if (user?.profile) {
      if (user.profile.skills && user.profile.skills.length > 0) {
        setSkills(user.profile.skills.map((s) => s.name))
      }
      if (user.profile.experience_level) {
        setExperienceLevel(user.profile.experience_level)
      }
      if (user.profile.location) {
        setLocation(user.profile.location)
      }
      if (user.profile.work_mode) {
        setWorkMode(user.profile.work_mode)
      }
    }
  }, [user])

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim()
    if (!trimmed) return
    const exists = skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    if (!exists) {
      setSkills((prev) => [...prev, trimmed])
    }
    setCustomSkillInput('')
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove))
  }

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(customSkillInput)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (skills.length === 0) {
      toast.warning('Please specify at least 1 technical skill.', 'Skills Required')
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        skills,
        experience_level: experienceLevel,
        location: location.trim() || 'Remote',
        work_mode: workMode,
      })
      await refreshUser()
      toast.success('Your developer profile and matching calibration have been saved!', 'Profile Updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'HM'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner / Account Overview */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-2xl font-black text-white shadow-soft">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {user?.email}
                </h1>
                <Badge variant="success" size="sm" dot>
                  Verified Candidate
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Account registered &bull; Calibration active across all 60 job listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/saved">
              <Button variant="outline" size="sm" leftIcon={<Bookmark className="h-4 w-4" />}>
                View Saved Jobs
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="secondary" size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
                Restart Wizard
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Content Grid: Matching Stats & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Matcher Configuration Overview */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Matching Engine Calibration</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              HireMind calculates candidate-to-job compatibility using your profile attributes:
            </p>

            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Skill Coverage</span>
                  <span className="text-indigo-400">60% Weight</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Case-insensitive match of your {skills.length} skills against job requirements.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Experience Seniority</span>
                  <span className="text-purple-400">20% Weight</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Calibrated to your current level: <strong>{experienceLevel}</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex justify-between text-xs font-semibold text-slate-200 mb-1">
                  <span>Work Mode & Location</span>
                  <span className="text-emerald-400">20% Weight</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Preferred arrangement: <strong>{workMode}</strong> ({location}).
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/jobs">
                <Button className="w-full" size="sm" rightIcon={<Briefcase className="h-4 w-4" />}>
                  Browse Matched Jobs
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="p-6 sm:p-8 space-y-6">
              {/* Section 1: Skills Tag Chips */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <label className="text-sm font-bold text-white tracking-tight">
                      Technical Skills ({skills.length})
                    </label>
                  </div>
                  {skills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSkills([])}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Active Tag Chips Box */}
                <div className="min-h-[64px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-wrap gap-2 items-center">
                  {skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      No skills added yet. Add custom skills or pick suggestions below.
                    </span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-semibold shadow-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-indigo-400 hover:text-white rounded-full p-0.5 hover:bg-indigo-500/30 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Input for custom skill */}
                <div className="flex gap-2">
                  <Input
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="Add custom skill (e.g. Next.js, Kubernetes, Rust)..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addSkill(customSkillInput)}
                    disabled={!customSkillInput.trim()}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add
                  </Button>
                </div>

                {/* Suggested Chips */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Popular Tech Suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.map((suggested) => {
                      const isSelected = skills.some(
                        (s) => s.toLowerCase() === suggested.toLowerCase()
                      )
                      return (
                        <button
                          key={suggested}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              removeSkill(suggested)
                            } else {
                              addSkill(suggested)
                            }
                          }}
                          className={`inline-flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                            isSelected
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Plus className="h-3 w-3 text-slate-500" />
                          )}
                          <span>{suggested}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Section 2: Seniority */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <label className="text-sm font-bold text-white tracking-tight">
                    Seniority Level
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {EXPERIENCE_OPTIONS.map((opt) => {
                    const isSelected = experienceLevel === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExperienceLevel(opt.id)}
                        className={`rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-soft ring-1 ring-indigo-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.years}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 3: Work Mode */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-emerald-400" />
                  <label className="text-sm font-bold text-white tracking-tight">
                    Work Mode Preference
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {WORK_MODE_OPTIONS.map((mode) => {
                    const Icon = mode.icon
                    const isSelected = workMode === mode.id
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setWorkMode(mode.id)}
                        className={`rounded-xl border p-3 flex flex-col items-center justify-center space-y-1.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-soft ring-1 ring-indigo-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold">{mode.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 4: Location */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <label className="text-sm font-bold text-white tracking-tight">
                    Primary Location
                  </label>
                </div>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">Presets:</span>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                        location === loc
                          ? 'bg-indigo-600 text-white border-transparent'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  size="md"
                  isLoading={saving}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
