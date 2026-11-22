import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Briefcase, Sparkles, LayoutDashboard } from 'lucide-react'
import { Button } from '../components/ui'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 animate-fade-in">
      {/* 404 Visual Glow Badge */}
      <div className="relative mb-6">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-indigo-500/20 blur-2xl -z-10" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-indigo-500/40 text-indigo-400 shadow-glow mx-auto">
          <span className="text-2xl font-black tracking-tight">404</span>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Opportunity Not Found
      </h1>

      <p className="mt-3 text-base text-slate-300 max-w-md mx-auto leading-relaxed">
        The route or role listing you are looking for does not exist, has expired, or has moved to a new destination.
      </p>

      {/* Primary Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Return Home
          </Button>
        </Link>
        <Link to="/jobs">
          <Button variant="outline" size="md" leftIcon={<Briefcase className="h-4 w-4 text-indigo-400" />}>
            Browse Active Jobs
          </Button>
        </Link>
      </div>

      {/* Quick Navigation Links */}
      <div className="mt-12 pt-8 border-t border-slate-800/80 max-w-sm w-full space-y-2 text-xs text-slate-400">
        <p className="font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Popular Destinations
        </p>
        <div className="grid grid-cols-2 gap-2 text-left">
          <Link
            to="/assistant"
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
            <span className="truncate">AI Career Advisor</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">Candidate Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
