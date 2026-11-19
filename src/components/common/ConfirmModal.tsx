import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 size={22} className="text-status-error" />,
      bg: 'bg-status-error-subtle',
      border: 'border-status-error/30',
      confirmButton: 'bg-status-error hover:opacity-90 text-white focus-visible:outline-status-error',
    },
    warning: {
      icon: <AlertTriangle size={22} className="text-accent-ink dark:text-accent" />,
      bg: 'bg-accent-subtle',
      border: 'border-accent/40',
      confirmButton: 'bg-accent hover:opacity-90 text-accent-ink focus-visible:outline-accent',
    },
    info: {
      icon: <Info size={22} className="text-ink" />,
      bg: 'bg-paper-3',
      border: 'border-rule',
      confirmButton: 'bg-navy hover:opacity-90 text-navy-ink focus-visible:outline-navy',
    },
    success: {
      icon: <CheckCircle2 size={22} className="text-status-success" />,
      bg: 'bg-status-success-subtle',
      border: 'border-status-success/30',
      confirmButton: 'bg-status-success hover:opacity-90 text-white focus-visible:outline-status-success',
    },
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 motion-safe:transition-opacity duration-short"
      onClick={() => !isLoading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="bg-paper-2 rounded-card shadow-card w-full max-w-md overflow-hidden border border-rule relative motion-safe:transition-transform duration-short"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-control ${iconConfig.bg} border ${iconConfig.border} flex items-center justify-center shrink-0`}
            >
              {iconConfig.icon}
            </div>

            <div className="flex-1 space-y-1">
              <h3 id="confirm-modal-title" className="text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-rule">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-4 sm:px-5 rounded-control border border-rule bg-paper-2 hover:bg-paper-3 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink motion-safe:transition-colors duration-micro focus-visible:outline-focus disabled:opacity-50 whitespace-nowrap"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-10 px-5 rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-colors duration-micro disabled:opacity-50 flex items-center gap-2 whitespace-nowrap ${iconConfig.confirmButton}`}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
