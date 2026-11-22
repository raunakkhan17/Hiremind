import React, { useState, useEffect } from 'react'
import {
  Search,
  X,
  MapPin,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Briefcase,
  Check,
} from 'lucide-react'
import {
  Card,
  Input,
  Button,
  Badge,
  SkeletonCard,
  EmptyState,
} from '../components/ui'
import { JobCard, JobItem } from '../components/JobCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { api } from '../services/api'

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']
const EXPERIENCE_LEVELS = ['All', 'Entry', 'Mid', 'Senior', 'Lead']
const POPULAR_LOCATIONS = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA']

export const SearchPage: React.FC = () => {
  const { isAuthenticated, token } = useAuth()
  const toast = useToast()

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [workMode, setWorkMode] = useState('All')
  const [experienceLevel, setExperienceLevel] = useState('All')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Mobile sidebar drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Data state
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set())

  // Debounce search query input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 250)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch saved jobs for the user
  const fetchSavedJobs = async () => {
    if (!token) return
    try {
      const data = await api.jobs.getSaved()
      const ids = new Set<number>(data.map((item: any) => item.job_id))
      setSavedJobIds(ids)
    } catch (err) {
      console.warn('Could not load user saved jobs', err)
    }
  }

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const data = await api.jobs.list({
          q: debouncedQuery,
          location: location.trim() || undefined,
          work_mode: workMode !== 'All' ? workMode : undefined,
          experience_level: experienceLevel !== 'All' ? experienceLevel : undefined,
          page,
          limit,
        })

        const items: JobItem[] = Array.isArray(data) ? data : data.items || data.jobs || []
        setJobs(items)

        if (data.total !== undefined) {
          setTotalJobs(data.total)
          setTotalPages(data.total_pages || Math.ceil(data.total / limit) || 1)
        } else {
          setTotalJobs(items.length)
          setTotalPages(1)
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch job listings', 'Network Error')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [debouncedQuery, workMode, experienceLevel, location, page, limit, token])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs()
    } else {
      setSavedJobIds(new Set())
    }
  }, [isAuthenticated, token])

  // Save / Unsave bookmark handler
  const handleToggleSave = async (jobId: number, title: string) => {
    if (!token) {
      toast.warning('Sign in or create an account to save jobs.', 'Sign In Required')
      return
    }

    const isSaved = savedJobIds.has(jobId)
    try {
      if (isSaved) {
        await api.jobs.unsave(jobId)
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          next.delete(jobId)
          return next
        })
        toast.info(`Removed "${title}" from bookmarks`, 'Bookmark Removed')
      } else {
        await api.jobs.save(jobId)
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          next.add(jobId)
          return next
        })
        toast.success(`Saved "${title}" to your queue!`, 'Job Bookmarked')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update saved job', 'Error')
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setWorkMode('All')
    setExperienceLevel('All')
    setLocation('')
    setPage(1)
  }

  const activeFiltersCount =
    (debouncedQuery ? 1 : 0) +
    (workMode !== 'All' ? 1 : 0) +
    (experienceLevel !== 'All' ? 1 : 0) +
    (location ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" size="sm">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
              <span>Job Pipeline & Search</span>
            </Badge>
            {isAuthenticated && (
              <Badge variant="success" size="sm" dot>
                Live Match Scoring Active
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Open Positions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search 60 verified engineering positions across Python, React, Data, DevOps, and Machine Learning
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
      </div>

      {/* 2. Primary Search Bar Card */}
      <Card className="p-3 sm:p-4">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            aria-label="Search open roles by title, company, skills, or description"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles by keyword, title, company, or skills (e.g. Python, FastAPI, React, Docker)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-12 pr-10 text-sm sm:text-base text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      {/* 3. Main Split View: Filter Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-6 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Filter Listings</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Filter 1: Work Mode */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Work Mode
              </label>
              <div className="space-y-1">
                {WORK_MODES.map((mode) => {
                  const isSelected = workMode === mode
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        setWorkMode(mode)
                        setPage(1)
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <span>{mode}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filter 2: Experience Level */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Seniority Level
              </label>
              <div className="space-y-1">
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = experienceLevel === level
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setExperienceLevel(level)
                        setPage(1)
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <span>{level}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filter 3: Location */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setPage(1)
                }}
                placeholder="Filter by city..."
                leftIcon={<MapPin className="h-3.5 w-3.5" />}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc === location ? '' : loc)
                      setPage(1)
                    }}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-medium border transition-colors ${
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
        </aside>

        {/* MOBILE FILTER DRAWER */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Work Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setWorkMode(mode)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium border ${
                        workMode === mode
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Seniority</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium border ${
                        experienceLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, San Francisco"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={() => setMobileFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS COLUMN */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips & Results Count Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200">
                {loading ? 'Searching...' : `${totalJobs} positions found`}
              </span>
              {workMode !== 'All' && (
                <Badge variant="default" size="sm">
                  {workMode}
                  <button onClick={() => setWorkMode('All')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {experienceLevel !== 'All' && (
                <Badge variant="outline" size="sm">
                  {experienceLevel}
                  <button onClick={() => setExperienceLevel('All')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {location && (
                <Badge variant="neutral" size="sm">
                  {location}
                  <button onClick={() => setLocation('')} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span>Show per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Listings Feed / Skeletons / Empty State */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No positions found matching your criteria"
              description="Try adjusting your keyword query, relaxing seniority requirements, or clearing location constraints."
              action={{
                label: 'Reset All Filters',
                onClick: resetFilters,
                icon: RefreshCw,
              }}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                Page <span className="font-bold text-white">{page}</span> of{' '}
                <span className="font-bold text-white">{totalPages}</span> ({totalJobs} total listings)
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page <= 1 || loading}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page >= totalPages || loading}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
