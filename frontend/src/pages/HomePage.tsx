import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Target,
  Bot,
  Layers,
  Building,
  MapPin,
  CheckCircle2,
  Check,
  ShieldCheck,
  Briefcase,
  Sliders,
} from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'
import { CircularProgress } from '../components/CircularProgress'
import { HealthCheck } from '../components/HealthCheck'
import { useAuth } from '../context/AuthContext'

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-24 py-8 sm:py-14 animate-fade-in">
      {/* ================= HERO SECTION ================= */}
      <section className="relative text-center max-w-5xl mx-auto px-4 sm:px-6">
        {/* Background ambient decorative glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-500/10 blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="default" size="md" className="shadow-soft px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-1.5 animate-pulse" />
            <span className="font-semibold">HireMind v2.0 &bull; Next-Gen Autonomous Talent Intelligence</span>
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
          Intelligent Hiring with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            AI Compatibility
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Match your skills against 60+ verified tech roles, calculate compatibility via pure-function scoring, and accelerate your career with our autonomous Groq AI advisor.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/jobs">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Live Roles
            </Button>
          </Link>

          <Link to={isAuthenticated ? '/dashboard' : '/onboarding'}>
            <Button size="lg" variant="outline" leftIcon={<Sparkles className="h-4 w-4 text-indigo-400" />}>
              {isAuthenticated ? 'Go to Dashboard' : 'Calibrate My Profile'}
            </Button>
          </Link>

          <Link to={isAuthenticated ? '/assistant' : '/login'}>
            <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white" leftIcon={<Bot className="h-4 w-4 text-indigo-400" />}>
              Ask AI Assistant
            </Button>
          </Link>
        </div>

        {/* Platform Stat Highlights */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-soft">
            <span className="block text-2xl sm:text-3xl font-extrabold text-white">60+</span>
            <span className="text-xs text-slate-400 mt-1 block">Active Engineering Roles</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-soft">
            <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-400">3-Factor</span>
            <span className="text-xs text-slate-400 mt-1 block">Deterministic Match Model</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-soft">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">&lt;100ms</span>
            <span className="text-xs text-slate-400 mt-1 block">FastAPI Pure Scoring</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-soft">
            <span className="block text-2xl sm:text-3xl font-extrabold text-purple-400">LLaMA 3.3</span>
            <span className="text-xs text-slate-400 mt-1 block">Groq Autonomous Tools</span>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-7 border border-indigo-500/30 shadow-glow text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 font-black text-white text-lg shadow-soft">
                  S
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">Senior Backend & Distributed Systems Lead</h3>
                    <Badge variant="success" size="sm">Remote</Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <Building className="h-3.5 w-3.5 text-indigo-400" />
                      <span>ScaleWave Technologies</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>San Francisco, CA</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <CircularProgress score={94} size={54} strokeWidth={5} />
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Matched Skills:</span>
                {['python', 'fastapi', 'postgresql', 'docker'].map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-400" />
                    {s}
                  </span>
                ))}
              </div>
              <Link to="/jobs">
                <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 FEATURE CARDS SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="primary" size="sm" className="mb-3">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Precision Career Navigation
          </h2>
          <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
            Experience the three Pillars of HireMind: mathematical matching, conversational AI reasoning, and intuitive pipeline management.
          </p>
        </div>

        {/* Responsive 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Pure-Function Compatibility Engine */}
          <Card hoverable className="p-7 space-y-6 flex flex-col justify-between border-indigo-500/20 shadow-soft">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-soft">
                <Target className="h-7 w-7" />
              </div>
              <Badge variant="primary" size="sm">
                Deterministic Model
              </Badge>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Pure-Function Compatibility Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Computes match scores mathematically using a weighted formula with zero hallucination:
              </p>

              {/* Formula Metric Chips */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Skill Coverage</span>
                  <span className="font-bold text-indigo-400">60% Weight</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Experience Tier Fit</span>
                  <span className="font-bold text-indigo-400">20% Weight</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Work Mode & Location</span>
                  <span className="font-bold text-indigo-400">20% Weight</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link to="/onboarding" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-between">
                <span>Calibrate your profile skills</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 2: Autonomous AI Career Advisor */}
          <Card hoverable className="p-7 space-y-6 flex flex-col justify-between border-purple-500/20 shadow-soft">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-soft">
                <Bot className="h-7 w-7" />
              </div>
              <Badge variant="default" size="sm">
                Groq LLaMA 3.3
              </Badge>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Autonomous AI Career Advisor
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Interactive career assistant with dual tool calling: autonomous job search and candidate skill gap evaluation.
              </p>

              {/* Chat snippet visual */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Dual Backend Tools:</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>&bull; <code className="text-indigo-300">search_jobs</code>: Catalog exploration</p>
                  <p>&bull; <code className="text-purple-300">get_skill_gaps</code>: Gap diagnosis</p>
                  <p className="text-[10px] text-slate-500 italic pt-1">User identity securely scoped via JWT token.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link to="/assistant" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center justify-between">
                <span>Chat with Career Advisor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 3: Interactive Application Pipeline */}
          <Card hoverable className="p-7 space-y-6 flex flex-col justify-between border-pink-500/20 shadow-soft">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shadow-soft">
                <Layers className="h-7 w-7" />
              </div>
              <Badge variant="neutral" size="sm">
                Pipeline Management
              </Badge>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Application Pipeline & Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Bookmark and track opportunities across all lifecycle phases with instant stage transitions and tab filters.
              </p>

              {/* Visual stage pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-center font-bold">
                <div className="p-2 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/80">
                  Saved
                </div>
                <div className="p-2 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-500/50">
                  Applied
                </div>
                <div className="p-2 rounded-lg bg-amber-950/70 text-amber-300 border border-amber-500/50">
                  Interview
                </div>
                <div className="p-2 rounded-lg bg-rose-950/70 text-rose-300 border border-rose-500/50">
                  Decisions
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <Link to="/saved" className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center justify-between">
                <span>View your saved pipeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* ================= CALL-TO-ACTION (CTA) SECTION ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-violet-950/70 border border-indigo-500/30 p-8 sm:p-12 overflow-hidden shadow-glow text-center">
          {/* Ambient background blur */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-2xl" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Catalog Active &bull; 60 Technical Positions
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Accelerate Your Technical Career?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Calibrate your profile in under 60 seconds to unlock personalized matches, skill gap breakdowns, and automated career guidance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to={isAuthenticated ? '/dashboard' : '/onboarding'}>
                <Button size="lg" variant="primary" rightIcon={<Sparkles className="h-4 w-4" />}>
                  {isAuthenticated ? 'Open Dashboard' : 'Calibrate Profile Now'}
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" leftIcon={<Briefcase className="h-4 w-4" />}>
                  Search Openings
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>100% Free & Open Source</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>JWT Scoped Privacy</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Sliders className="h-4 w-4 text-purple-400" />
                <span>Real-Time Scoring</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BACKEND TELEMETRY WIDGET ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            System Infrastructure Status
          </span>
        </div>
        <HealthCheck />
      </section>
    </div>
  )
}
