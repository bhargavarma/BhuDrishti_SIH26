import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../pages/WorkflowPages.css'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('BhuDrishti UI error', error, info) }
  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="workflow-page centered"><section className="workflow-card error-boundary"><h1>Something went wrong</h1><p>This page could not be displayed. Return home and try again.</p><Link to="/">Back to Home</Link></section></main>
  }
}
