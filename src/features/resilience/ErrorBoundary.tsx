import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, copied: false });
    window.location.reload();
  };

  private handleCopy = () => {
    navigator.clipboard.writeText('ERR-05C30C');
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#131313] select-none">
          <div className="rounded-lg border border-[#282828] bg-[#161616] p-8 flex flex-col items-center justify-center text-center max-w-md w-full shadow-2xl">
            {/* Warning Icon in Crimson Box */}
            <div className="w-10 h-10 rounded-lg bg-[#2c1515] border border-[#4d1f1f] flex items-center justify-center text-red-500 mb-3 shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-medium text-white tracking-tight">Something went wrong</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[280px] leading-relaxed">
              This view failed to load. Your decisions are saved, and other tabs aren't affected.
            </p>

            {/* Try Again Button */}
            <button
              onClick={this.handleRetry}
              className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium shadow transition-colors"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>

            {/* Reference Code with Copy Icon */}
            <div className="mt-5 flex items-center space-x-1.5 text-[11px] text-gray-500">
              <span>Reference</span>
              <code className="text-gray-400 font-mono bg-[#1f1f1f] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
                ERR-05C30C
              </code>
              <button
                onClick={this.handleCopy}
                className="hover:text-gray-300 transition-colors p-1"
                title="Copy reference code"
                type="button"
              >
                {this.state.copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
