import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== 'dropdown') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, variant]);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Claro',
      icon: <Sun size={15} className="text-accent" />,
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: <Moon size={15} className="text-ink-muted" />,
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: <Monitor size={15} className="text-ink-muted" />,
    },
  ];

  if (variant === 'segmented') {
    return (
      <div className={`p-1 bg-paper-3 rounded-control border border-rule flex items-center gap-1 ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex-1 py-1 px-2.5 rounded-sm text-xs font-medium flex items-center justify-center gap-1.5 motion-safe:transition-colors duration-micro focus-visible:outline-focus ${
                isActive
                  ? 'bg-paper-2 text-ink shadow-sm border border-rule'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-2/60'
              }`}
              title={`Modo ${opt.label}`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const currentIcon = () => {
    if (theme === 'system') {
      return <Monitor size={17} className="text-inherit" />;
    }
    if (theme === 'dark') {
      return <Moon size={17} className="text-accent" />;
    }
    return <Sun size={17} className="text-accent" />;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-control text-ink-muted hover:text-ink hover:bg-paper-3 border border-transparent hover:border-rule motion-safe:transition-colors duration-micro flex items-center justify-center focus-visible:outline-focus"
        title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro'}`}
        aria-label="Cambiar tema visual"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-card border border-rule bg-paper-2 shadow-card py-1 z-50">
          <div className="px-3 py-1 text-xs text-ink-muted border-b border-rule mb-1 font-normal">
            Tema visual
          </div>
          {options.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium motion-safe:transition-colors duration-micro text-left focus-visible:outline-focus ${
                  isActive
                    ? 'bg-paper-3 text-accent-ink dark:text-accent font-semibold'
                    : 'text-ink hover:bg-paper-3'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isActive && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
