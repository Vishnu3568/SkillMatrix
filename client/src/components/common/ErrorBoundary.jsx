import { Component } from 'react';
import ErrorState from './ErrorState';

/**
 * Global ErrorBoundary class component to catch rendering errors and prevent complete application crash.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
          <ErrorState
            title="Application Crash"
            message={this.state.error?.message || 'An unexpected error disrupted the application runtime.'}
            retryAction={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
