// Error boundaries require class components; class components don't support Fast Refresh.
/* eslint-disable react-refresh/only-export-components */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

function DefaultFallback({ error, onReset }: { error?: Error; onReset: () => void }) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="bg-destructive/10 rounded-full p-4">
        <svg
          className="text-destructive h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-foreground text-xl font-semibold">Something went wrong</h2>
        {error && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{error.message}</p>}
      </div>
      <button
        onClick={onReset}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: send to your error monitoring service (e.g. Sentry)
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  reset = () => this.setState({ hasError: false, error: undefined })

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? <DefaultFallback error={this.state.error} onReset={this.reset} />
      )
    }
    return this.props.children
  }
}
