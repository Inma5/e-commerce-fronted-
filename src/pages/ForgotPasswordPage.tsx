import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { authService } from '../services/auth.service';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Paso actual: 1 = Enviar código, 2 = Validar código y cambiar contraseña, 3 = Éxito
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Formulario
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Ver/Ocultar contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
      });

      setSuccessInfo(res.message || 'Código enviado exitosamente a tu correo.');
      setStep(2);
    } catch (err: any) {
      console.error('Error al solicitar código:', err);
      const msg = err.response?.data?.message || 'No fue posible enviar el código. Verifica tu correo e intenta nuevamente.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsResending(true);
    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
      });
      setSuccessInfo(`Nuevo código enviado: ${res.message || 'Revisa tu bandeja de entrada.'}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al reenviar el código.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('El código de verificación debe contener exactamente 6 dígitos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email: email.trim(),
        code: cleanCode,
        newPassword,
      });

      setStep(3);
    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      const msg = err.response?.data?.message || 'Error al restablecer la contraseña. El código puede ser incorrecto o haber expirado.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 py-12 bg-paper text-ink">
      <div className="w-full max-w-md bg-paper-2 border border-rule rounded-card p-6 sm:p-8 shadow-card space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-control bg-navy border border-rule-2 flex items-center justify-center text-accent mx-auto shadow-sm">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            Recuperar contraseña
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {step === 1 && 'Ingresa tu correo institucional para recibir un código de recuperación de 6 dígitos.'}
            {step === 2 && 'Ingresa el código que te enviamos por correo y tu nueva contraseña.'}
            {step === 3 && 'Tu contraseña ha sido actualizada satisfactoriamente.'}
          </p>
        </div>

        {/* Indicador de pasos */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold motion-safe:transition-colors duration-micro ${
              step === 1 ? 'bg-navy text-navy-ink' : 'bg-paper-3 text-ink'
            }`}>
              <span className="w-4 h-4 rounded-pill bg-paper-2/30 flex items-center justify-center text-xs tabular-nums">1</span>
              <span>Solicitar</span>
            </div>
            <div className="w-6 h-0.5 bg-rule" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold motion-safe:transition-colors duration-micro ${
              step === 2 ? 'bg-navy text-navy-ink' : 'bg-paper-3 text-ink-muted'
            }`}>
              <span className="w-4 h-4 rounded-pill bg-paper-2/30 flex items-center justify-center text-xs tabular-nums">2</span>
              <span>Restablecer</span>
            </div>
          </div>
        )}

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="leading-tight block">{error}</span>
              {error.toLowerCase().includes('no se encontró') && (
                <Link
                  to="/register"
                  className="font-semibold underline text-status-error hover:opacity-90 inline-block pt-0.5 focus-visible:outline-focus"
                >
                  Crear una cuenta nueva
                </Link>
              )}
            </div>
          </div>
        )}

        {successInfo && step === 2 && (
          <div className="p-3 bg-status-success-subtle border border-status-success/30 rounded-control text-xs text-status-success flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span className="leading-tight">{successInfo}</span>
          </div>
        )}

        {/* PASO 1 */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-focus whitespace-nowrap"
            >
              <span>{isLoading ? 'Enviando código...' : 'Enviar código de recuperación'}</span>
              <ArrowRight size={16} className="text-accent shrink-0" />
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              >
                <ArrowLeft size={14} />
                <span>Volver a iniciar sesión</span>
              </Link>
            </div>
          </form>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-paper-3 border border-rule rounded-control text-xs text-ink space-y-1">
              <div className="font-semibold text-ink flex items-center justify-between">
                <span>Destinatario: {email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setSuccessInfo(null);
                  }}
                  className="text-xs text-ink underline hover:text-accent focus-visible:outline-focus"
                >
                  Cambiar correo
                </button>
              </div>
              <p className="text-xs text-ink-muted">
                Introduce el código de 6 dígitos que llegó a tu correo.
              </p>
            </div>

            {/* Código */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
                <span>Código de verificación (6 dígitos)</span>
                <span className="text-xs text-accent-ink dark:text-accent font-medium">15 min de validez</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-11 text-center text-xl font-bold tracking-[6px] font-mono bg-paper-2 border border-rule focus:border-navy rounded-control text-ink focus-visible:outline-focus tabular-nums"
                  required
                />
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Nueva contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-11 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 rounded-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                  title={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-11 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 rounded-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || newPassword.length < 6}
              className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-focus whitespace-nowrap"
            >
              <span>{isLoading ? 'Actualizando...' : 'Restablecer contraseña'}</span>
              <CheckCircle2 size={16} className="text-accent shrink-0" />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-ink-muted">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="inline-flex items-center gap-1 hover:text-ink font-medium disabled:opacity-50 focus-visible:outline-focus"
              >
                <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
                <span>{isResending ? 'Reenviando...' : 'Reenviar código'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-ink font-medium focus-visible:outline-focus"
              >
                Volver al paso 1
              </button>
            </div>
          </form>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-pill bg-status-success-subtle border border-status-success/30 flex items-center justify-center text-status-success mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-ink">
                ¡Contraseña actualizada!
              </h3>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Tu clave ha sido restablecida correctamente. Ya puedes ingresar con tu nueva contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 focus-visible:outline-focus whitespace-nowrap"
            >
              <span>Iniciar sesión ahora</span>
              <ArrowRight size={16} className="text-accent shrink-0" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
