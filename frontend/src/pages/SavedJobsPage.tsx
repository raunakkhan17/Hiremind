import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Building,
  MapPin,
  ExternalLink,
  Trash2,
  Briefcase,
  Target,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  Button,
  Badge,
  SkeletonCard,
  EmptyState,
} from '../components/ui'
import { api } from '../services/api'
import { useToast } from '../components/ui/Toast'

interface SavedJobItem {
  id: number
  user_id: number
  job_id: number
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

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const toast = useToast()

  const fetchSaved = async () => {
    setLoading(true)
    try {
      const data = await api.jobs.getSaved()
      setSavedJobs(data)
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">
              <Bookmark className="h-3 w-3 mr-1" />
              <span>Personal Hiring Queue</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Saved Opportunities
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage roles you have shortlisted for application and review
          </p>
        </div>

        <Link to="/jobs">
          <Button variant="outline" size="sm" leftIcon={<Briefcase className="h-4 w-4" />}>
            Browse More Roles
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Browse the live catalog and click the bookmark icon on any position to track it here."
          action={{
            label: 'Explore Live Jobs',
            onClick: () => {
              window.location.href = '/jobs'
            },
            icon: Sparkles,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {savedJobs.map((item) => {
            const job = item.job
            if (!job) return null

            return (
              <Card
                key={item.id}
                hoverable
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">{job.title}</h2>
                    <Badge variant="default" size="sm">
                      {job.work_mode}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {job.experience_level}
                    </Badge>
                    {job.match_score !== undefined && (
                      <Badge variant="success" size="sm">
                        <Target className="h-3 w-3 mr-1" />
                        <span>{job.match_score}% Match</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5 font-semibold text-slate-200">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-1">
                      {job.description}
                    </p>
                  )}

                  {job.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 border border-slate-700/60"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0 self-start md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsave(job.id, job.title)}
                    className="text-rose-400 border-rose-500/30 hover:bg-rose-950/40 hover:text-rose-300"
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
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
