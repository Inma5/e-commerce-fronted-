import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Por favor ingresa una dirección de correo electrónico válida.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      setIsLoading(false);
      return;
    }

    try {
      const loggedUser = await login({ email: emailTrimmed.toLowerCase(), password });
      if (loggedUser.role === 'VENDEDOR') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Credenciales incorrectas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-paper text-ink">
      <div className="w-full max-w-[440px] bg-paper-2 rounded-card border border-rule p-8 shadow-card space-y-6">
        {/* Brand and title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-control bg-paper border border-rule flex items-center justify-center mx-auto shadow-sm overflow-hidden">
            <img src="/icon.png" alt="CampusMarket" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            Iniciar sesión
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Ingresa con tu correo institucional y contraseña.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@universidad.edu"
                className="w-full h-10 pl-10 pr-4 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-ink">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-ink hover:text-accent hover:underline motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-11 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 rounded-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-focus whitespace-nowrap"
          >
            <span>{isLoading ? 'Comprobando credenciales...' : 'Iniciar sesión'}</span>
            <ArrowRight size={16} className="text-accent shrink-0" />
          </button>
        </form>

        <div className="pt-4 border-t border-rule text-center space-y-2">
          <p className="text-xs text-ink-muted">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-ink hover:text-accent underline decoration-accent underline-offset-2 focus-visible:outline-focus">
              Crear cuenta aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
