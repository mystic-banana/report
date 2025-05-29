import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <details className="bg-dark-900 p-4 rounded-lg mb-4">
            <summary className="text-red-400 cursor-pointer mb-2">View error details</summary>
            <pre className="text-white overflow-auto p-2">
              {this.state.error?.toString()}
            </pre>
            <pre className="text-gray-400 overflow-auto p-2 mt-2">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <p className="text-white">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
