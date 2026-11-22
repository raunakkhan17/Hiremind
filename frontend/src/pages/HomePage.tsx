import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users, Cpu, ShieldCheck, Terminal, Check } from 'lucide-react'
import { HealthCheck } from '../components/HealthCheck'

export const HomePage: React.FC = () => {
  const features = [
    {
      title: 'FastAPI + SQLAlchemy Core',
      description: 'High-performance asynchronous backend with SQLite support out of the box and clean dependency injection.',
      icon: Cpu,
    },
    {
      title: 'Modern Frontend Stack',
      description: 'Vite-powered React + TypeScript frontend styled with Tailwind CSS, React Router, and Lucide icons.',
      icon: Sparkles,
    },
    {
      title: 'Production-Ready Architecture',
      description: 'CORS configured, environment variable management (.env.example), and automated database table setup.',
      icon: ShieldCheck,
    },
    {
      title: 'Talent & Hiring Pipelines',
      description: 'Designed to scale into resume parsing, AI screening questions, and candidate evaluation workflows.',
      icon: Users,
    },
  ]

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Full-Stack Starter Kit Ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent Hiring with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">HireMind</span>
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Full-stack boilerplate with FastAPI, SQLite via SQLAlchemy, React, TypeScript, Vite, Tailwind CSS, and React Router.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105"
          >
            <span>Explore Jobs Demo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
          >
            <Terminal className="h-4 w-4 text-indigo-400" />
            <span>Interactive OpenAPI Docs</span>
          </a>
        </div>
      </section>

      {/* Backend Health Check Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <HealthCheck />
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Project Stack Highlights</h2>
          <p className="mt-2 text-slate-400 text-sm">Key architectural components included in HireMind</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick Verification Checklist */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="text-md font-semibold text-white mb-3 flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Included Specifications</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>FastAPI backend with CORS & Lifespan</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>SQLAlchemy SQLite database session dependency</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>GET /health route with DB connection check</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>backend/requirements.txt & backend/.env.example</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>React 18 + TypeScript + Vite</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Tailwind CSS + React Router + lucide-react</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
