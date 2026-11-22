import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-rose-400 mb-6 shadow-xl">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <p className="mt-2 text-lg text-slate-400">Page not found</p>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        The route you are looking for does not exist in the HireMind application.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Return Home</span>
      </Link>
    </div>
  )
}
