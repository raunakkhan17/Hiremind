import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Briefcase,
  Layers,
  BookOpen,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Bookmark,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react'
import { Button, Badge } from './ui'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from './ui/Toast'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: 'Overview', path: '/', icon: Layers },
    { name: 'Open Positions', path: '/jobs', icon: Briefcase },
  ]

  const handleLogout = () => {
    logout()
    setUserDropdownOpen(false)
    toast.info('You have been logged out.', 'Signed Out')
  }

  // Get user avatar initials
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'HM'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-soft group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Hire<span className="text-indigo-400">Mind</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-indigo-300 font-semibold'
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
              className="flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Swagger Docs</span>
            </a>

            <a
              href="http://localhost:8000/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>API :8000</span>
            </a>
          </nav>

          {/* Actions & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Authenticated User Menu or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 pr-3 hover:border-slate-700 transition-colors focus:outline-none"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.email}</p>
                      {user.profile && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {user.profile.experience_level && (
                            <Badge variant="default" size="sm">
                              {user.profile.experience_level}
                            </Badge>
                          )}
                          {user.profile.work_mode && (
                            <Badge variant="outline" size="sm">
                              {user.profile.work_mode}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-indigo-400" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/onboarding"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>Calibration Wizard</span>
                      </Link>
                      <Link
                        to="/jobs"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Briefcase className="h-4 w-4 text-indigo-400" />
                        <span>Matched Jobs</span>
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-emerald-400" />
                        <span>Saved Jobs</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-flex">
                  <Button size="sm" variant="primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 rounded-xl px-4 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-900'
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
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
            >
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span>Swagger API Docs</span>
            </a>

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
                >
                  <UserIcon className="h-4 w-4 text-indigo-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
                >
                  <Bookmark className="h-4 w-4 text-emerald-400" />
                  <span>Saved Jobs</span>
                </Link>
              </div>
            )}

            {!isAuthenticated && (
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Register Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  )
}
