import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Building, Bookmark, ExternalLink, CheckCircle2 } from 'lucide-react'
import { Card, Badge, Button } from './ui'
import { CircularProgress } from './CircularProgress'

export interface JobItem {
  id: number
  title: string
  company: string
  description?: string
  location: string
  work_mode: string
  experience_level: string
  skills?: string
  apply_url?: string
  match_score?: number | null
  matched_skills?: string[] | null
  missing_skills?: string[] | null
  reasons?: string[] | null
}

export interface JobCardProps {
  job: JobItem
  isSaved?: boolean
  onToggleSave?: (jobId: number, title: string) => void
  showFullDescription?: boolean
}

// Generate consistent background gradient based on company name
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

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  showFullDescription = false,
}) => {
  const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'H'
  const avatarGradient = getCompanyAvatarGradient(job.company || 'Company')

  const workModeBadgeVariant = (mode: string) => {
    const m = mode?.toLowerCase()
    if (m === 'remote') return 'success'
    if (m === 'hybrid') return 'default'
    return 'neutral'
  }

  return (
    <Card hoverable className="p-5 sm:p-6 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left: Avatar + Title info */}
        <div className="flex items-start space-x-4 flex-1">
          {/* Company Initial Avatar */}
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${avatarGradient} text-lg font-black text-white shadow-soft`}
            title={job.company}
          >
            {companyInitial}
          </div>

          {/* Core Info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-indigo-300 transition-colors">
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </h3>
              <Badge variant={workModeBadgeVariant(job.work_mode)} size="sm">
                {job.work_mode}
              </Badge>
              <Badge variant="outline" size="sm">
                {job.experience_level}
              </Badge>
            </div>

            {/* Company & Location Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 font-semibold text-slate-200">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{job.company}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{job.location}</span>
              </span>
            </div>

            {/* Description */}
            {job.description && (
              <p
                className={`text-xs text-slate-300 leading-relaxed pt-1 ${
                  showFullDescription ? '' : 'line-clamp-2'
                }`}
              >
                {job.description}
              </p>
            )}

            {/* Skills Pills */}
            {job.skills && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {job.skills.split(',').map((skill, idx) => {
                  const clean = skill.trim().toLowerCase()
                  const isMatched = job.matched_skills?.includes(clean)
                  return (
                    <span
                      key={idx}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                        isMatched
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60 shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      {isMatched && <CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-400" />}
                      {skill.trim()}
                    </span>
                  )
                })}
              </div>
            )}

            {/* Reasons Snippet */}
            {job.reasons && job.reasons.length > 0 && (
              <div className="pt-1.5 text-[11px] text-slate-400 flex flex-wrap gap-2.5">
                {job.reasons.slice(0, 2).map((reason, i) => (
                  <span key={i} className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-1" />
                    <span>{reason}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Circular Match-Score Ring + Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 flex-shrink-0">
          {/* Circular Match-Score Ring */}
          <CircularProgress score={job.match_score} size={54} />

          {/* Action buttons (Details, Bookmark & Apply) */}
          <div className="flex items-center space-x-2">
            <Link to={`/jobs/${job.id}`}>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Details
              </Button>
            </Link>

            {onToggleSave && (
              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onToggleSave(job.id, job.title)}
                title={isSaved ? 'Remove from saved' : 'Save for later'}
                aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title} for later`}
                className={isSaved ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/15' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
              </Button>
            )}

            {job.apply_url && (
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Apply
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
