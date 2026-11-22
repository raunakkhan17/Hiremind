import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  MapPin,
  Building,
  Search,
  ExternalLink,
  Filter,
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch Saved Jobs for logged in user (if token exists)
  const fetchSavedJobs = async () => {
    const token = localStorage.getItem('hiremind_token')
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

        const response = await fetch(`${apiUrl}/jobs?${params.toString()}`)
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
  }, [search, locationFilter, workModeFilter, levelFilter, page, limit, apiUrl])

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  // Handle Save / Unsave toggle
  const toggleSaveJob = async (jobId: number) => {
    const token = localStorage.getItem('hiremind_token')
    if (!token) {
      alert('Please log in or register to save jobs to your profile.')
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
          } else {
            next.add(jobId)
          }
          return next
        })
      } else {
        const errData = await response.json()
        alert(errData.detail || 'Could not update saved job.')
      }
    } catch (err) {
      alert('Error updating saved job. Ensure backend is running.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <Sparkles className="h-3 w-3" />
            <span>SQLite Database &bull; {totalJobs} Available Roles</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Live Job Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search roles with parameters: <code className="text-indigo-300">q</code>,{' '}
            <code className="text-indigo-300">location</code>,{' '}
            <code className="text-indigo-300">work_mode</code>,{' '}
            <code className="text-indigo-300">experience_level</code>,{' '}
            <code className="text-indigo-300">page</code>, and{' '}
            <code className="text-indigo-300">limit</code>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg flex flex-col md:flex-row gap-3">
        {/* Keyword Search 'q' */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search query (q): title, company, skills, keywords..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Location filter */}
        <div className="relative w-full md:w-48">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value)
              setPage(1)
            }}
            placeholder="Location filter..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <select
            value={workModeFilter}
            onChange={(e) => {
              setWorkModeFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
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
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Loading jobs from SQLite backend...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <Briefcase className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="font-medium text-white">No jobs matched your query</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search query or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job.id)
            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{job.title}</h2>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20">
                      {job.work_mode}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                      {job.experience_level}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1 font-medium text-slate-300">
                      <Building className="h-3.5 w-3.5 text-slate-500" />
                      <span>{job.company}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                      {job.description}
                    </p>
                  )}

                  {job.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/50"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    title={isSaved ? 'Unsave job' : 'Save job for later'}
                    className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-colors ${
                      isSaved
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                        : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
                  </button>

                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-colors"
                    >
                      <span>Apply</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Showing Page <span className="font-semibold text-white">{page}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span> ({totalJobs} total jobs)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
