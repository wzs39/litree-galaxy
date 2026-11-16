import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/hud.css'
import { App } from './App'

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('LitTree Galaxy render boundary caught error:', error, info)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-boundary-screen" role="alert" data-testid="error-boundary-fallback">
          <div className="error-boundary-card">
            <h2>星云视图遇到异常</h2>
            <p>{this.state.error.message || '未知渲染错误'}</p>
            <div>
              <button
                type="button"
                className="hud-btn hud-btn-primary"
                onClick={() => {
                  this.setState({ error: null })
                  window.location.reload()
                }}
              >
                重新加载应用
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
}
