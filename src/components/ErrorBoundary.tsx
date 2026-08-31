import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-ink-900 mb-3">Something went wrong</h1>
          <p className="text-sm text-stone-600 mb-6">
            The page failed to load. Refresh to try again. If this keeps happening, check that
            Supabase environment variables are set on your host and that the site was rebuilt
            after they were added.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-ink-900 text-warm-white text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }
}
