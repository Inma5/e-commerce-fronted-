import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center bg-paper">
          <div className="max-w-md bg-paper-2 p-8 rounded-card border border-status-error/20 shadow-card space-y-4">
            <div className="w-14 h-14 bg-status-error-subtle text-status-error rounded-control flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-ink">Algo no salió como esperábamos</h2>
            <p className="text-xs text-muted leading-relaxed">
              {this.state.error?.message || 'Ocurrió un error inesperado al renderizar la vista.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-navy hover:bg-navy/90 text-navy-ink rounded-control text-xs sm:text-sm font-semibold motion-safe:transition-colors inline-flex items-center gap-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:opacity-90 whitespace-nowrap"
            >
              <RefreshCw size={15} className="shrink-0" /> Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
