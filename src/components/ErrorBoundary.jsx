import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-container p-8">
          <div className="bg-surface rounded-2xl border border-outline p-8 max-w-md w-full text-center shadow-card">
            <span className="material-symbols-outlined text-5xl text-status-unpaid mb-4">error</span>
            <h2 className="text-lg font-bold text-on-surface mb-2">Something went wrong</h2>
            <p className="text-sm text-on-surface-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
