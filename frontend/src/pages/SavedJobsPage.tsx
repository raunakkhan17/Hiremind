import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Building,
  MapPin,
  ExternalLink,
  Trash2,
  Briefcase,
  Sparkles,
  ChevronDown,
  Clock,
} from 'lucide-react'
import {
  Card,
  Button,
  Badge,
  SkeletonCard,
  EmptyState,
} from '../components/ui'
import { CircularProgress } from '../components/CircularProgress'
import { api } from '../services/api'
import { useToast } from '../components/ui/Toast'

export type JobStatus = 'Saved' | 'Applied' | 'Interview' | 'Rejected'

interface SavedJobItem {
  id: number
  user_id: number
  job_id: number
  status?: JobStatus
  created_at?: string
  job?: {
    id: number
    title: string
    company: string
    description?: string
    location: string
    work_mode: string
    experience_level: string
    skills?: string
    apply_url?: string
    match_score?: number
    matched_skills?: string[]
    missing_skills?: string[]
    reasons?: string[]
  }
}

const STATUS_OPTIONS: JobStatus[] = ['Saved', 'Applied', 'Interview', 'Rejected']

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

const getStatusBadgeStyle = (status: JobStatus = 'Saved') => {
  switch (status) {
    case 'Applied':
      return 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50'
    case 'Interview':
      return 'bg-amber-950/70 text-amber-300 border-amber-500/50'
    case 'Rejected':
      return 'bg-rose-950/70 text-rose-300 border-rose-500/50'
    case 'Saved':
    default:
      return 'bg-slate-800/80 text-slate-300 border-slate-700/80'
  }
}

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('All')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const toast = useToast()

  const fetchSaved = async () => {
    setLoading(true)
    try {
      const data = await api.jobs.getSaved()
      // Normalize statuses if missing
      const normalized = data.map((item: any) => ({
        ...item,
        status: (item.status as JobStatus) || 'Saved',
      }))
      setSavedJobs(normalized)
    } catch (err: any) {
      toast.error(err.message || 'Could not fetch saved jobs', 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  const handleUnsave = async (jobId: number, jobTitle?: string) => {
    try {
      await api.jobs.unsave(jobId)
      setSavedJobs((prev) => prev.filter((item) => item.job_id !== jobId))
      toast.info(`Removed "${jobTitle || 'Job'}" from bookmarks`, 'Bookmark Removed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove saved job', 'Error')
    }
  }

  const handleStatusChange = async (jobId: number, newStatus: JobStatus, jobTitle?: string) => {
    setUpdatingId(jobId)
    try {
      await api.jobs.updateSavedStatus(jobId, newStatus)
      setSavedJobs((prev) =>
        prev.map((item) => (item.job_id === jobId ? { ...item, status: newStatus } : item))
      )
      toast.success(
        `"${jobTitle || 'Role'}" marked as ${newStatus}`,
        'Status Updated'
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status', 'Update Error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered jobs according to active status tab
  const filteredJobs = savedJobs.filter((item) => {
    if (activeTab === 'All') return true
    return item.status === activeTab
  })

  // Calculate tab counts
  const counts = {
    All: savedJobs.length,
    Saved: savedJobs.filter((j) => j.status === 'Saved' || !j.status).length,
    Applied: savedJobs.filter((j) => j.status === 'Applied').length,
    Interview: savedJobs.filter((j) => j.status === 'Interview').length,
    Rejected: savedJobs.filter((j) => j.status === 'Rejected').length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">
              <Bookmark className="h-3 w-3 mr-1" />
              <span>Personal Pipeline</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Saved & Tracked Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize your applications through each stage: Saved, Applied, Interview, and Decisions
          </p>
        </div>

        <Link to="/jobs">
          <Button variant="outline" size="sm" leftIcon={<Briefcase className="h-4 w-4" />}>
            Browse More Roles
          </Button>
        </Link>
      </div>

      {/* Status Pipeline Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {(['All', 'Saved', 'Applied', 'Interview', 'Rejected'] as const).map((tab) => {
          const count = counts[tab]
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-soft ring-2 ring-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-indigo-800/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities yet"
          description="Browse the live catalog and save positions you want to track or apply to later."
          action={{
            label: 'Explore Live Opportunities',
            onClick: () => {
              window.location.href = '/jobs'
            },
            icon: Sparkles,
          }}
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={`No jobs currently marked as "${activeTab}"`}
          description={`You don't have any opportunities in the "${activeTab}" pipeline stage right now.`}
          action={{
            label: 'View All Saved Jobs',
            onClick: () => setActiveTab('All'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((item) => {
            const job = item.job
            if (!job) return null

            const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'H'
            const avatarGradient = getCompanyAvatarGradient(job.company || 'Company')
            const currentStatus = item.status || 'Saved'

            return (
              <Card
                key={item.id}
                hoverable
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200"
              >
                {/* Left: Avatar + Title info */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  {/* Company Logo Avatar */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${avatarGradient} text-lg font-black text-white shadow-soft`}
                    title={job.company}
                  >
                    {companyInitial}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-indigo-300 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <Badge variant="default" size="sm">
                        {job.work_mode}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {job.experience_level}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center space-x-1.5 font-semibold text-slate-200">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{job.company}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{job.location}</span>
                      </span>
                      {item.created_at && (
                        <span className="text-slate-500">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-0.5">
                        {job.description}
                      </p>
                    )}

                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700/60"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Circular Match Ring + Status Dropdown + Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Match Ring */}
                  {job.match_score !== undefined && job.match_score !== null && (
                    <div className="flex items-center space-x-2">
                      <CircularProgress score={job.match_score} size={48} />
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div className="relative inline-block text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Stage:
                      </span>
                      <div className="relative">
                        <select
                          value={currentStatus}
                          disabled={updatingId === item.job_id}
                          onChange={(e) =>
                            handleStatusChange(
                              item.job_id,
                              e.target.value as JobStatus,
                              job.title
                            )
                          }
                          className={`appearance-none cursor-pointer rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold border transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50 ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-slate-900 text-slate-100 font-semibold"
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Actions (Details, Remove, Apply) */}
                  <div className="flex items-center space-x-2">
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                        Details
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnsave(job.id, job.title)}
                      className="text-rose-400 border-rose-500/30 hover:bg-rose-950/40 hover:text-rose-300"
                      title="Remove from saved jobs"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>

                    {job.apply_url && (
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                          Apply
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
