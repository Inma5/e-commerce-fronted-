import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 motion-safe:transition-opacity duration-short"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
        className={`bg-paper-2 rounded-card shadow-card w-full ${maxWidthClasses} overflow-hidden border border-rule relative motion-safe:transition-transform duration-short`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent line */}
        <div className="h-0.5 w-full bg-accent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule bg-paper-2">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-control bg-paper-3 text-ink flex items-center justify-center border border-rule shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 id="modal-dialog-title" className="text-base font-semibold text-ink leading-snug">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-paper-3 border border-transparent hover:border-rule motion-safe:transition-colors duration-micro focus-visible:outline-focus"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
