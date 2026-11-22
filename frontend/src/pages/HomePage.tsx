import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Cpu, ShieldCheck, Terminal, Check, Target } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '../components/ui'
import { HealthCheck } from '../components/HealthCheck'

export const HomePage: React.FC = () => {
  const features = [
    {
      title: 'FastAPI & SQLite Engine',
      description: 'High-performance asynchronous backend with SQLAlchemy SQLite ORM, connection pooling, and automated duplicate-free seeding.',
      icon: Cpu,
      badge: 'Backend Core',
    },
    {
      title: 'AI Matching Engine (matcher.py)',
      description: 'Pure function computing 60% skill coverage + 20% experience fit + 20% preference fit with case-insensitive normalization.',
      icon: Target,
      badge: 'Intelligence',
    },
    {
      title: 'Secure JWT Authentication',
      description: 'Bcrypt password hashing, Bearer JWT authorization, and user-scoped saved job bookmarks across all endpoints.',
      icon: ShieldCheck,
      badge: 'Security',
    },
    {
      title: 'Design System & SaaS UI',
      description: 'Sleek dark mode palette, Inter typography, soft shadows, rounded-xl cards, and responsive mobile navigation drawer.',
      icon: Sparkles,
      badge: 'Frontend',
    },
  ]

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <Badge variant="default" size="md" className="mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-1.5" />
          <span>HireMind Talent Intelligence Platform</span>
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Intelligent Hiring with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            AI Compatibility
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Full-stack talent platform featuring FastAPI, SQLAlchemy SQLite, automated job seeding, candidate-job matching, and a modern React & Tailwind design system.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/jobs">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Live Jobs
            </Button>
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" leftIcon={<Terminal className="h-4 w-4 text-indigo-400" />}>
              OpenAPI Swagger
            </Button>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production Architecture Highlights
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            Engineered with a cohesive design system and scalable backend abstractions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <Card key={idx} hoverable className="p-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Quick Verification Checklist */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <Card className="p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Design System & Architecture Specification</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Indigo SaaS primary color with Slate neutral palette</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Inter typography & rounded-xl card architecture</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Reusable Button, Input, Card, Badge, Skeleton, Modal, Toast</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>EmptyState component & responsive mobile navigation</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Navbar with user profile menu & theme toggle</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>Dark mode toggle with localStorage persistence</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
