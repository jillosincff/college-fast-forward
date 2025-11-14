import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 AppErrorBoundary caught error:', this.props.name || 'Unknown', '-', error?.message || error);
    console.error('Error details:', error);
    console.error('Component stack:', errorInfo?.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && window.errorReporter) {
      window.errorReporter.report(error, {
        source: 'AppErrorBoundary',
        component: this.props.name,
        componentStack: errorInfo?.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-slate-600 mb-6">
              {this.props.name ? `Error in ${this.props.name}` : 'An unexpected error occurred'}
            </p>

            <div className="flex gap-3">
              <Button 
                onClick={this.handleReset}
                className="flex-1"
              >
                Reload Page
              </Button>
              <Button 
                onClick={() => window.location.href = '/#Dashboard'}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;