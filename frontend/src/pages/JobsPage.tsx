import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  MapPin,
  Building,
  Search,
  ExternalLink,
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  Badge,
  SkeletonCard,
  EmptyState,
} from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

interface Job {
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

interface SavedJob {
  id: number
  job_id: number
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [workModeFilter, setWorkModeFilter] = useState<string>('All')
  const [levelFilter, setLevelFilter] = useState<string>('All')
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalJobs, setTotalJobs] = useState<number>(0)
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set())

  const { isAuthenticated, token } = useAuth()
  const toast = useToast()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch Saved Jobs for logged in user
  const fetchSavedJobs = async () => {
    if (!token) return

    try {
      const response = await fetch(`${apiUrl}/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const savedList: SavedJob[] = await response.json()
        setSavedJobIds(new Set(savedList.map((item) => item.job_id)))
      }
    } catch (err) {
      console.warn('Could not fetch saved jobs', err)
    }
  }

  // Fetch Jobs with pagination & query parameters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search.trim()) params.append('q', search.trim())
        if (locationFilter.trim()) params.append('location', locationFilter.trim())
        if (workModeFilter !== 'All') params.append('work_mode', workModeFilter)
        if (levelFilter !== 'All') params.append('experience_level', levelFilter)
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const response = await fetch(`${apiUrl}/jobs?${params.toString()}`, { headers })
        if (response.ok) {
          const data = await response.json()
          const items: Job[] = Array.isArray(data) ? data : data.items || data.jobs || []
          setJobs(items)
          if (data.total !== undefined) {
            setTotalJobs(data.total)
            setTotalPages(data.total_pages || Math.ceil(data.total / limit) || 1)
          } else {
            setTotalJobs(items.length)
            setTotalPages(1)
          }
        }
      } catch (err) {
        console.warn('Backend not reachable on :8000', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchJobs()
    }, 200)

    return () => clearTimeout(timer)
  }, [search, locationFilter, workModeFilter, levelFilter, page, limit, token, apiUrl])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs()
    } else {
      setSavedJobIds(new Set())
    }
  }, [isAuthenticated, token])

  // Handle Save / Unsave toggle
  const toggleSaveJob = async (jobId: number, jobTitle: string) => {
    if (!token) {
      toast.warning('Please sign in or register to bookmark jobs.', 'Authentication Required')
      return
    }

    const isCurrentlySaved = savedJobIds.has(jobId)
    const method = isCurrentlySaved ? 'DELETE' : 'POST'

    try {
      const response = await fetch(`${apiUrl}/jobs/${jobId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          if (isCurrentlySaved) {
            next.delete(jobId)
            toast.info(`Removed "${jobTitle}" from bookmarks`, 'Bookmark Removed')
          } else {
            next.add(jobId)
            toast.success(`Saved "${jobTitle}" to your profile!`, 'Job Bookmarked')
          }
          return next
        })
      } else {
        const errData = await response.json()
        toast.error(errData.detail || 'Could not update saved job.', 'Error')
      }
    } catch (err) {
      toast.error('Network error. Check backend connection.', 'Error')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="default" size="sm">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
              <span>{totalJobs} Live Roles</span>
            </Badge>
            {isAuthenticated ? (
              <Badge variant="success" size="sm" dot>
                AI Match Scoring Active
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Sign in to view personalized match scores
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Talent & Job Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and filter verified opportunities across Python, React, Data, DevOps, and ML/AI
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search 'q' */}
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by keywords, title, skills (e.g. Python, FastAPI, React)..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Location filter */}
          <div className="w-full md:w-52">
            <Input
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value)
                setPage(1)
              }}
              placeholder="Location..."
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <select
              value={workModeFilter}
              onChange={(e) => {
                setWorkModeFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none h-10"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none h-10"
            >
              <option value="All">All Seniorities</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs Listing */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs matched your query"
          description="Try broadening your keywords, removing location constraints, or resetting work mode filters."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearch('')
              setLocationFilter('')
              setWorkModeFilter('All')
              setLevelFilter('All')
              setPage(1)
            },
            icon: RefreshCw,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id)
            const hasMatch = job.match_score !== undefined && job.match_score !== null

            return (
              <Card
                key={job.id}
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

                    {hasMatch && (
                      <Badge
                        variant={
                          (job.match_score || 0) >= 80
                            ? 'success'
                            : (job.match_score || 0) >= 60
                            ? 'default'
                            : 'warning'
                        }
                        size="sm"
                      >
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

                  {/* Skills representation with highlighted matched tags */}
                  {job.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.skills.split(',').map((skill, idx) => {
                        const cleanSkill = skill.trim().toLowerCase()
                        const isSkillMatched = job.matched_skills?.includes(cleanSkill)
                        return (
                          <span
                            key={idx}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                              isSkillMatched
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60 shadow-sm'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                            }`}
                          >
                            {isSkillMatched && <CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-400" />}
                            {skill.trim()}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Reasons breakdown */}
                  {job.reasons && job.reasons.length > 0 && (
                    <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap gap-3">
                      {job.reasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mr-1" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0 self-start md:self-center">
                  <Button
                    variant={isSaved ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => toggleSaveJob(job.id, job.title)}
                    className={isSaved ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/15' : ''}
                  >
                    <Bookmark className={`h-4 w-4 mr-1.5 ${isSaved ? 'fill-indigo-400' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Showing Page <span className="font-bold text-white">{page}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span> ({totalJobs} total positions)
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
