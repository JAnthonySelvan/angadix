import React from 'react';
import { Button } from '../ui/Button';
import { RefreshCw, ServerCrash, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-4 bg-grid-pattern bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full flex flex-col items-center">
            {/* 500 Visual Pill */}
            <div className="px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-sm font-extrabold tracking-widest mb-6 shadow-sm flex items-center gap-2">
              <ServerCrash size={16} />
              <span>APPLICATION ERROR</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Something Went Wrong
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
              An unexpected application error occurred. We have logged this issue and our team has been notified.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={this.handleReload}
                className="flex-1 rounded-2xl font-bold"
              >
                <RefreshCw size={18} className="mr-2" />
                <span>Reload Application</span>
              </Button>

              <a href="/" className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl font-bold"
                >
                  <Home size={18} className="mr-2" />
                  <span>Return Home</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
