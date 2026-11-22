import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Plus,
  MapPin,
  Laptop,
  Building,
  Home,
  Target,
  Award,
} from 'lucide-react'
import { Button, Card, Badge, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

const SUGGESTED_SKILLS = [
  // Backend & Core
  'Python',
  'FastAPI',
  'Django',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Node.js',
  'Go',
  // Frontend
  'React',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'GraphQL',
  // Cloud & DevOps
  'Kubernetes',
  'AWS',
  'Terraform',
  'CI/CD',
  'Linux',
  // Data & AI
  'PyTorch',
  'Kafka',
  'Snowflake',
  'dbt',
  'Apache Spark',
  'LangChain',
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
  {
    id: 'Entry',
    title: 'Entry Level',
    years: '0–2 years',
    description: 'Early career developer eager to learn and ship features with strong guidance.',
  },
  {
    id: 'Mid',
    title: 'Mid Level',
    years: '2–5 years',
    description: 'Independent contributor with proven production experience shipping reliable code.',
  },
  {
    id: 'Senior',
    title: 'Senior Level',
    years: '5–8 years',
    description: 'Domain expert leading architectural decisions, code quality, and peer mentorship.',
  },
  {
    id: 'Lead',
    title: 'Lead / Staff',
    years: '8+ years',
    description: 'Technical authority shaping organization-wide strategy, systems, and hiring.',
  },
]

const WORK_MODE_OPTIONS = [
  {
    id: 'Remote',
    title: '100% Remote',
    icon: Home,
    description: 'Freedom to work from anywhere with flexible asynchronous communication.',
  },
  {
    id: 'Hybrid',
    title: 'Hybrid',
    icon: Laptop,
    description: 'Flexible split between remote days and regular in-office collaboration.',
  },
  {
    id: 'On-site',
    title: 'On-site',
    icon: Building,
    description: 'Dedicated presence at company headquarters or local regional engineering hub.',
  },
]

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'FastAPI',
    'React',
    'TypeScript',
  ])
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Senior')
  const [location, setLocation] = useState('Remote')
  const [workMode, setWorkMode] = useState('Remote')
  const [saving, setSaving] = useState(false)

  const { updateProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Tag chip handlers
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

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (skills.length === 0) {
        toast.warning('Please select at least 1 technical skill to proceed.', 'Skills Required')
        return
      }
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await updateProfile({
        skills,
        experience_level: experienceLevel,
        location: location.trim() || 'Remote',
        work_mode: workMode,
      })
      toast.success('Your developer profile has been calibrated with HireMind!', 'Onboarding Complete')
      navigate('/jobs', { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Could not save profile settings.', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const stepTitles = [
    'Technical Stack & Skills',
    'Seniority & Location',
    'Work Mode Preference',
  ]

  const progressPercentage = Math.round((currentStep / 3) * 100)

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Wizard Header & Progress Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <Badge variant="default" size="sm">
            <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
            <span>Candidate Calibration Wizard</span>
          </Badge>
          <span>Step {currentStep} of 3 ({progressPercentage}%)</span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stepTitles[currentStep - 1]}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentStep === 1 && 'Add tag chips for the technologies you work with. Used for 60% skill coverage scoring.'}
            {currentStep === 2 && 'Set your current experience level and primary geographic location.'}
            {currentStep === 3 && 'Specify your preferred work arrangement to filter matching roles.'}
          </p>
        </div>
      </div>

      {/* STEP 1: Skills Tag Chips */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Skills ({skills.length} Selected)
              </label>
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

            {/* Selected Tag Chips Container */}
            <div className="min-h-[64px] rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-wrap gap-2 items-center">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  No skills selected yet. Click suggestions below or type your own.
                </span>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-semibold shadow-sm animate-in zoom-in-90 duration-150"
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

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <Input
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={handleCustomSkillKeyDown}
                placeholder="Type a skill and press Enter (e.g. Rust, PyTorch, GraphQL)..."
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={() => addSkill(customSkillInput)}
                disabled={!customSkillInput.trim()}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Quick Suggestions Palette */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Suggested Technologies (Click to toggle)
            </span>
            <div className="flex flex-wrap gap-2">
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
                    className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
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
        </Card>
      )}

      {/* STEP 2: Experience Level & Location */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Seniority Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Seniority Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experienceLevel === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setExperienceLevel(opt.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-soft ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Award className={`h-4 w-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                      </div>
                      <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                        {opt.years}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Location Input & Presets */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Primary Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              leftIcon={<MapPin className="h-4 w-4" />}
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Popular:</span>
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
        </Card>
      )}

      {/* STEP 3: Work Mode Preference */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Preferred Work Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WORK_MODE_OPTIONS.map((mode) => {
                const Icon = mode.icon
                const isSelected = workMode === mode.id
                return (
                  <div
                    key={mode.id}
                    onClick={() => setWorkMode(mode.id)}
                    className={`cursor-pointer rounded-xl border p-5 transition-all text-center flex flex-col items-center space-y-2 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-soft ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{mode.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{mode.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Impact Banner */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 flex items-start space-x-3">
            <Target className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-300 leading-relaxed">
              <strong className="text-white block mb-0.5">Scoring Impact</strong>
              Work mode and geographic proximity contribute <strong>20%</strong> to your compatibility score in the candidate matcher. Remote positions automatically match all locations.
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || saving}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Previous Step
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          isLoading={saving}
          rightIcon={currentStep < 3 ? <ArrowRight className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        >
          {currentStep < 3 ? 'Continue' : 'Complete Calibration & View Matches'}
        </Button>
      </div>
    </div>
  )
}
