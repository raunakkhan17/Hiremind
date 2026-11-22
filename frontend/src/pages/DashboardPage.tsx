import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Bookmark,
  Target,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, Button, Badge, SkeletonCard, EmptyState } from '../components/ui'
import { JobCard, JobItem } from '../components/JobCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { api } from '../services/api'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()

  const [recommendedJobs, setRecommendedJobs] = useState<JobItem[]>([])
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set())
  const [totalSaved, setTotalSaved] = useState<number>(0)
  const [topMatchScore, setTopMatchScore] = useState<number>(0)
  const [topMatchTitle, setTopMatchTitle] = useState<string>('N/A')
  const [loading, setLoading] = useState<boolean>(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch saved jobs to get count and saved set
      const saved = await api.jobs.getSaved()
      const savedIds = new Set<number>(saved.map((item: any) => item.job_id))
      setSavedJobIds(savedIds)
      setTotalSaved(saved.length)

      // Fetch AI recommendations
      const recs = await api.jobs.getRecommendations({ limit: 6 })
      setRecommendedJobs(recs)

      if (recs && recs.length > 0) {
        const top = recs[0]
        setTopMatchScore(top.match_score || 0)
        setTopMatchTitle(`${top.title} @ ${top.company}`)
      }
    } catch (err: any) {
      console.warn('Could not load all dashboard metrics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleToggleSave = async (jobId: number, title: string) => {
    const isSaved = savedJobIds.has(jobId)
    try {
      if (isSaved) {
        await api.jobs.unsave(jobId)
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          next.delete(jobId)
          return next
        })
        setTotalSaved((prev) => Math.max(0, prev - 1))
        toast.info(`Removed "${title}" from bookmarks`, 'Bookmark Removed')
      } else {
        await api.jobs.save(jobId)
        setSavedJobIds((prev) => {
          const next = new Set(prev)
          next.add(jobId)
          return next
        })
        setTotalSaved((prev) => prev + 1)
        toast.success(`Saved "${title}" to your queue!`, 'Job Bookmarked')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update saved job', 'Error')
    }
  }

  const profile = user?.profile
  const candidateSkillsCount = profile?.skills?.length || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary" size="sm">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>AI Matching Active</span>
            </Badge>
            {profile?.experience_level && (
              <Badge variant="default" size="sm">
                {profile.experience_level}
              </Badge>
            )}
            {profile?.work_mode && (
              <Badge variant="outline" size="sm">
                {profile.work_mode}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-indigo-400">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Your candidate profile is calibrated across all 60 engineering roles. Review personalized recommendations and bookmarked opportunities below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Edit Calibration
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore All Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Saved Jobs */}
        <Card hoverable className="p-6">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Jobs</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Bookmark className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{totalSaved}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>In your personal queue</span>
            <Link to="/saved" className="text-indigo-400 hover:text-indigo-300 font-medium">
              View &rarr;
            </Link>
          </div>
        </Card>

        {/* Stat 2: Top Match */}
        <Card hoverable className="p-6">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Match Score</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-3xl font-black text-emerald-400">{topMatchScore}%</p>
            <span className="text-xs text-slate-400 font-medium">compatibility</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 truncate pt-2 border-t border-slate-800/60" title={topMatchTitle}>
            {topMatchTitle}
          </div>
        </Card>

        {/* Stat 3: Active Roles in Pipeline */}
        <Card hoverable className="p-6">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400 border border-violet-500/20">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">60</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Verified Tech Listings</span>
            <Link to="/search" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Search &rarr;
            </Link>
          </div>
        </Card>

        {/* Stat 4: Skills Calibrated */}
        <Card hoverable className="p-6">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills Active</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{candidateSkillsCount}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Powers 60% coverage</span>
            <Link to="/profile" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Manage &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. "Recommended for you" Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Recommended for you
              </h2>
              <Badge variant="success" size="sm">
                Ranked by AI
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top roles matching your skills ({candidateSkillsCount} chips), {profile?.experience_level || 'Senior'} level, and {profile?.work_mode || 'Remote'} preference
            </p>
          </div>

          <Link to="/search">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All 60 Positions
            </Button>
          </Link>
        </div>

        {/* Recommended Job Cards Grid */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recommendedJobs.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Complete your profile calibration"
            description="Add your skills, seniority level, and work mode to generate AI-ranked recommendations."
            action={{
              label: 'Run Calibration Wizard',
              onClick: () => {
                window.location.href = '/onboarding'
              },
              icon: Sparkles,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Action Footer Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Ready to adjust your career preferences?
            </h3>
            <p className="text-xs text-slate-400">
              Update your technical skills, desired work mode, or location in the profile editor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/onboarding">
              <Button variant="secondary" size="sm" leftIcon={<Sparkles className="h-4 w-4" />}>
                Calibration Wizard
              </Button>
            </Link>
            <Link to="/search">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explore Live Search
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
