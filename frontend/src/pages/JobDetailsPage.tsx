import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  MapPin,
  Bookmark,
  ExternalLink,
  Share2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  Calendar,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { Card, Button, Badge, Skeleton } from '../components/ui'
import { CircularProgress } from '../components/CircularProgress'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

export interface JobDetails {
  id: number
  title: string
  company: string
  description?: string
  location: string
  work_mode: string
  experience_level: string
  skills?: string
  apply_url?: string
  created_at?: string
  match_score?: number | null
  matched_skills?: string[] | null
  missing_skills?: string[] | null
  reasons?: string[] | null
}

const getCompanyAvatarGradient = (name: string): string => {
  const gradients = [
    'from-indigo-600 to-violet-500',
    'from-blue-600 to-cyan-500',
    'from-emerald-600 to-teal-500',
    'from-purple-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-rose-600 to-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()

  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [savingAction, setSavingAction] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  const jobId = Number(id)

  useEffect(() => {
    if (!id || isNaN(jobId)) {
      setError('Invalid Job ID specified')
      setLoading(false)
      return
    }

    const loadJobAndSavedState = async () => {
      setLoading(true)
      setError(null)
      try {
        const jobData = await api.jobs.getById(jobId)
        setJob(jobData)

        // Check if job is currently saved by user
        if (isAuthenticated) {
          try {
            const savedList = await api.jobs.getSaved()
            const found = savedList.some((s: any) => s.job_id === jobId)
            setIsSaved(found)
          } catch {
            // Ignore failure on saved check
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    loadJobAndSavedState()
  }, [jobId, isAuthenticated])

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save opportunities to your queue', 'Authentication Required')
      navigate('/login')
      return
    }

    setSavingAction(true)
    try {
      if (isSaved) {
        await api.jobs.unsave(jobId)
        setIsSaved(false)
        toast.info('Role removed from your saved queue', 'Bookmark Removed')
      } else {
        await api.jobs.save(jobId)
        setIsSaved(true)
        toast.success('Role bookmarked in your saved queue', 'Saved')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update saved status', 'Error')
    } finally {
      setSavingAction(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    toast.success('Job link copied to clipboard', 'Share Link')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const workModeBadgeVariant = (mode?: string) => {
    const m = mode?.toLowerCase()
    if (m === 'remote') return 'success'
    if (m === 'hybrid') return 'default'
    return 'neutral'
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-40 w-full pt-4" />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-20 w-full" />
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Opportunity Not Found</h1>
        <p className="text-sm text-slate-400">
          {error || 'The job posting you are looking for does not exist or has expired.'}
        </p>
        <Link to="/jobs">
          <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to All Jobs
          </Button>
        </Link>
      </div>
    )
  }

  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'H'
  const avatarGradient = getCompanyAvatarGradient(job.company || 'Company')

  // Parse all required skills from comma string
  const allRequiredSkills = job.skills
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const matchedSkills = job.matched_skills || []
  const missingSkills = job.missing_skills || []
  const reasons = job.reasons || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Navigation Breadcrumbs & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <Link
          to="/jobs"
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Opportunities</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            className="text-slate-300 hover:text-white"
          >
            {copiedLink ? 'Copied!' : 'Share'}
          </Button>

          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleToggleSave}
            isLoading={savingAction}
            leftIcon={<Bookmark className={`h-4 w-4 ${isSaved ? 'fill-indigo-400 text-indigo-400' : ''}`} />}
            className={isSaved ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' : ''}
          >
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= MAIN COLUMN (2 Cols) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Header Card */}
          <Card className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Company Logo Avatar */}
              <div
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${avatarGradient} text-2xl font-black text-white shadow-soft`}
              >
                {companyInitial}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={workModeBadgeVariant(job.work_mode)} size="sm">
                    {job.work_mode}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {job.experience_level} Level
                  </Badge>
                  {job.created_at && (
                    <span className="flex items-center text-xs text-slate-500 space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-400">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-200">
                    <Building className="h-4 w-4 text-indigo-400" />
                    <span>{job.company}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{job.location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 bg-slate-900/40 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-5">
              <div className="text-xs text-slate-400">
                Direct external application link verified via HireMind Talent Graph
              </div>

              {job.apply_url ? (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto shadow-md"
                    rightIcon={<ExternalLink className="h-4 w-4" />}
                  >
                    Apply Now
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" size="lg" disabled>
                  Application Closed
                </Button>
              )}
            </div>
          </Card>

          {/* Job Description Card */}
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              <span>Role Overview & Responsibilities</span>
            </h2>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              {job.description ? (
                job.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 italic">No specific description provided for this listing.</p>
              )}
            </div>
          </Card>

          {/* Skills Required Card */}
          <Card className="p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Required Technologies & Core Competencies</span>
            </h2>
            <p className="text-xs text-slate-400">
              The hiring team has specified the following key technical requirements for this role:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {allRequiredSkills.map((skill, idx) => {
                const clean = skill.toLowerCase()
                const isMatched = matchedSkills.includes(clean)
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                      isMatched
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {isMatched && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />}
                    {skill}
                  </span>
                )
              })}
            </div>
          </Card>

          {/* Bottom Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/20">
            <div>
              <h3 className="text-base font-bold text-white">Ready to take the next step?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit your profile directly to {job.company}'s career portal.
              </p>
            </div>
            {job.apply_url && (
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" rightIcon={<ExternalLink className="h-4 w-4" />}>
                  Continue to Application
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* ================= SIDE COLUMN (1 Col: Match Breakdown) ================= */}
        <div className="space-y-6">
          {/* Match Fit Analysis Card */}
          <Card className="p-6 space-y-6 border-indigo-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Match Breakdown</h3>
              </div>
              <Badge variant="primary" size="sm">
                AI Matcher v2.0
              </Badge>
            </div>

            {isAuthenticated && user?.profile ? (
              <div className="space-y-6">
                {/* Circular Score Ring */}
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <CircularProgress score={job.match_score} size={92} strokeWidth={6.5} />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      {job.match_score !== null && job.match_score !== undefined
                        ? `${job.match_score}% Fit Alignment`
                        : 'Calibrating fit...'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluated against your profile preferences & skills
                    </p>
                  </div>
                </div>

                {/* Score Formula Weight Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Skills</span>
                    <span className="text-xs font-bold text-indigo-300">60%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                    <span className="text-xs font-bold text-indigo-300">20%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Work Mode</span>
                    <span className="text-xs font-bold text-indigo-300">20%</span>
                  </div>
                </div>

                {/* Matched Skills - Green Chips */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Matched Skills ({matchedSkills.length})</span>
                    </h4>
                  </div>
                  {matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 px-2.5 py-1 text-xs font-semibold shadow-sm"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-400" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No direct skill matches registered yet.</p>
                  )}
                </div>

                {/* Missing Skills - Red / Amber Chips */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <span>Skills to Acquire ({missingSkills.length})</span>
                    </h4>
                  </div>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-lg bg-rose-950/60 text-rose-300 border border-rose-500/40 px-2.5 py-1 text-xs font-semibold shadow-sm"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      100% skill coverage! No missing competencies.
                    </p>
                  )}
                </div>

                {/* Match Reasons List */}
                {reasons.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Scoring Rationale
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated / Uncalibrated Fallback */
              <div className="space-y-4 py-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
                  <UserCheck className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Unlock Fit Breakdown</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sign in and configure your candidate profile to view your personalized match score,
                    skill coverage, and tailored hiring recommendations.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/login" className="block">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign In to See Match
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Position Quick Facts */}
          <Card className="p-6 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
              Role Snapshot
            </h3>
            <div className="divide-y divide-slate-800">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Arrangement</span>
                <span className="font-semibold text-slate-200">{job.work_mode}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Experience Tier</span>
                <span className="font-semibold text-slate-200">{job.experience_level}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Primary Location</span>
                <span className="font-semibold text-slate-200">{job.location}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Application Pipeline</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Actively Recruiting
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/search" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between text-xs pt-1">
                <span>View similar positions</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
