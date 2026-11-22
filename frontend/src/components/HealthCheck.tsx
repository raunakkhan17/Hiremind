import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, RefreshCw, Database, Server, Clock } from 'lucide-react'

interface HealthResponse {
  status: string
  timestamp: string
  services: {
    api: string
    database: {
      type: string
      status: string
      error?: string
    }
  }
}

export const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/health`, {
        headers: {
          'Accept': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`)
      }
      const data: HealthResponse = await response.json()
      setHealth(data)
      setLastChecked(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to connect to FastAPI backend')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">Backend Health Status</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              GET /health
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time verification of FastAPI service & SQLite SQLAlchemy connection
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-sm shadow-indigo-600/30"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Pinging...' : 'Check Health'}</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <Server className="h-4 w-4 text-indigo-400" />
              <span>FastAPI Backend</span>
            </span>
            {health?.status === 'healthy' ? (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {health?.status === 'healthy' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">
                  Online
                </span>
              </>
            ) : error ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">Offline / Unreachable</span>
              </>
            ) : (
              <span className="text-sm text-slate-500">Connecting...</span>
            )}
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <Database className="h-4 w-4 text-violet-400" />
              <span>SQLite (SQLAlchemy)</span>
            </span>
            {health?.services.database.status === 'healthy' && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {health?.services.database.status === 'healthy' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300 uppercase tracking-wide">
                  Connected
                </span>
              </>
            ) : error ? (
              <>
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span className="text-sm font-semibold text-rose-300">Unavailable</span>
              </>
            ) : (
              <span className="text-sm text-slate-500">Checking...</span>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Last Response</span>
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300 truncate">
            {lastChecked ? lastChecked.toLocaleTimeString() : 'No check yet'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
          <strong>Backend Connection Note:</strong> {error}. Ensure backend is running with{' '}
          <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-200">uvicorn app.main:app --reload</code> on port 8000.
        </div>
      )}

      {health && (
        <div className="mt-4 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-400 overflow-x-auto border border-slate-800/80">
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
