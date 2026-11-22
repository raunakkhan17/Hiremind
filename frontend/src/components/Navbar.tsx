import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Briefcase, Activity, BookOpen, Layers } from 'lucide-react'

export const Navbar: React.FC = () => {
  const location = useLocation()

  const navLinks = [
    { name: 'Overview', path: '/', icon: Layers },
    { name: 'Open Positions', path: '/jobs', icon: Briefcase },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Hire<span className="text-indigo-400">Mind</span></span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
              v1.0
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-3">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            )
          })}

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">API Docs</span>
          </a>

          <a
            href="http://localhost:8000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>FastAPI :8000</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
