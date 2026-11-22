import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SavedJobsPage } from './pages/SavedJobsPage'
import { JobDetailsPage } from './pages/JobDetailsPage'
import { AssistantPage } from './pages/AssistantPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './components/ProtectedRoute'

const AppContent: React.FC = () => {
  const location = useLocation()
  // Hide global navbar and footer on split auth pages for maximum immersion
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/jobs" element={<SearchPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAuthPage && (
        <footer className="border-t border-slate-850/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>HireMind &copy; {new Date().getFullYear()} &mdash; Modern Talent & Intelligent Hiring Architecture</p>
            <div className="flex items-center space-x-4">
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">API Docs</a>
              <a href="http://localhost:8000/health" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Health Check</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
