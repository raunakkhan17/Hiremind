import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react'
import { Button } from './ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HireMind ErrorBoundary caught an unhandled error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false })
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center animate-fade-in" role="alert">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 mb-6 shadow-xl">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Something went unexpectedly wrong
          </h1>

          <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            HireMind encountered an issue rendering this view. Your session credentials and saved roles remain safe.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Reload Page
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={this.handleGoHome}
              leftIcon={<Home className="h-4 w-4" />}
            >
              Return Home
            </Button>
          </div>

          {/* Diagnostic Details */}
          {this.state.error && (
            <div className="mt-8 max-w-xl w-full text-left">
              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-400 font-semibold mx-auto focus:outline-none"
              >
                <span>Diagnostic details</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
