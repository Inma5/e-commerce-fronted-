import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  OFFICIAL_CAMPUS,
  formatColombianPhone,
  displayColombianPhone,
  isValidColombianPhone,
} from '../utils/format';
import {
  Lock,
  Mail,
  User,
  MapPin,
  ArrowRight,
  AlertCircle,
  Store,
  ShoppingBag,
  Upload,
  Camera,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('CLIENTE');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [campus] = useState(OFFICIAL_CAMPUS);
  const [avatar, setAvatar] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAvatar(canvas.toDataURL('image/jpeg', 0.85));
          setError(null);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Por favor ingresa tu nombre y apellido (mínimo 2 caracteres).');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa una dirección de correo electrónico válida.');
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('El número de teléfono celular es obligatorio para estudiantes en campus.');
      setIsLoading(false);
      return;
    }

    if (!isValidColombianPhone(phone)) {
      setError('El teléfono debe ser un número celular colombiano válido de 10 dígitos que inicie por 3.');
      setIsLoading(false);
      return;
    }

    if (whatsapp.trim() && !isValidColombianPhone(whatsapp)) {
      setError('El número de WhatsApp debe ser un celular colombiano válido de 10 dígitos que inicie por 3.');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: displayColombianPhone(phone),
        whatsapp: whatsapp.trim() ? displayColombianPhone(whatsapp) : displayColombianPhone(phone),
        campus: OFFICIAL_CAMPUS,
        avatar: avatar || undefined,
      });
      if (role === 'VENDEDOR') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-paper text-ink">
      <div className="w-full max-w-[500px] bg-paper-2 rounded-card border border-rule p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-control bg-paper border border-rule flex items-center justify-center mx-auto shadow-sm overflow-hidden">
            <img src="/icon.png" alt="CampusMarket" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            Crear cuenta 
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            Regístrate en CampusMarket Cereté con tu correo y datos de contacto.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-ink">
                Tipo de cuenta universitaria
              </label>
              <span className="text-xs text-ink-muted">
                Selecciona tu rol
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CLIENTE')}
                className={`p-3 rounded-control border text-left motion-safe:transition-colors duration-micro focus-visible:outline-focus ${
                  role === 'CLIENTE'
                    ? 'border-navy bg-paper-3 text-ink font-semibold'
                    : 'border-rule bg-paper-2 text-ink-muted hover:bg-paper-3'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <ShoppingBag size={14} className={role === 'CLIENTE' ? 'text-accent' : 'text-ink-muted'} />
                  <span>Estudiante comprador</span>
                </div>
                <span className="text-xs text-ink-muted mt-1 block font-normal">
                  Reservar libros y materiales.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VENDEDOR')}
                className={`p-3 rounded-control border text-left motion-safe:transition-colors duration-micro focus-visible:outline-focus ${
                  role === 'VENDEDOR'
                    ? 'border-navy bg-paper-3 text-ink font-semibold'
                    : 'border-rule bg-paper-2 text-ink-muted hover:bg-paper-3'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Store size={14} className={role === 'VENDEDOR' ? 'text-accent' : 'text-ink-muted'} />
                  <span>Estudiante vendedor</span>
                </div>
                <span className="text-xs text-ink-muted mt-1 block font-normal">
                  Publicar artículos y ventas.
                </span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Nombre y apellidos
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Daniel Castillo"
                className="w-full h-10 pl-10 pr-4 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                required
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
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
              <label className="block text-xs font-medium text-ink mb-1">
                Contraseña (mín. 6)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-11 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                  required
                  minLength={6}
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
          </div>

          {/* Campus */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Sede oficial universitaria
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
              <input
                type="text"
                value={campus}
                readOnly
                className="w-full h-10 pl-10 pr-4 bg-paper-3 border border-rule rounded-control text-xs sm:text-sm font-semibold text-ink cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Celular (Colombia) *
              </label>
              <div className="flex h-10 rounded-control border border-rule bg-paper-2 overflow-hidden focus-within:ring-2 focus-within:ring-navy transition-colors">
                <div className="flex items-center gap-1 px-2.5 bg-paper-3 border-r border-rule text-ink font-semibold text-xs select-none shrink-0 tabular-nums">
                  <span>+57</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(formatColombianPhone(e.target.value))}
                  placeholder="300 123 4567"
                  maxLength={12}
                  className="w-full h-full px-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:outline-none bg-transparent tabular-nums"
                  required
                />
              </div>
              <span className="text-xs text-ink-muted mt-1 block">
                10 dígitos iniciando en 3
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                WhatsApp de contacto
              </label>
              <div className="flex h-10 rounded-control border border-rule bg-paper-2 overflow-hidden focus-within:ring-2 focus-within:ring-navy transition-colors">
                <div className="flex items-center gap-1 px-2.5 bg-paper-3 border-r border-rule text-ink font-semibold text-xs select-none shrink-0 tabular-nums">
                  <span>+57</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatColombianPhone(e.target.value))}
                  placeholder="300 123 4567"
                  maxLength={12}
                  className="w-full h-full px-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:outline-none bg-transparent tabular-nums"
                />
              </div>
              <span className="text-xs text-ink-muted mt-1 block">
                Opcional si es el mismo celular
              </span>
            </div>
          </div>

          {/* Profile photo */}
          <div className="p-3 bg-paper-3 rounded-control border border-rule flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Vista previa"
                  className="w-11 h-11 rounded-control object-cover border border-rule"
                />
              ) : (
                <div className="w-11 h-11 rounded-control bg-paper-2 text-ink-muted flex items-center justify-center border border-rule">
                  <Camera size={18} />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-ink">Foto de perfil (opcional)</p>
                <p className="text-xs text-ink-muted">Elige una imagen desde tu dispositivo</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-3.5 bg-paper-2 hover:bg-paper-3 border border-rule text-ink rounded-control text-xs font-semibold flex items-center gap-1.5 motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
              >
                <Upload size={13} className="shrink-0" />
                <span>{avatar ? 'Cambiar' : 'Examinar'}</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="h-9 px-2.5 text-status-error hover:bg-status-error-subtle rounded-control text-xs motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                  title="Eliminar foto"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 px-5 mt-2 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-focus whitespace-nowrap"
          >
            <span>{isLoading ? 'Registrando cuenta...' : 'Crear cuenta estudiantil'}</span>
            <ArrowRight size={16} className="text-accent shrink-0" />
          </button>
        </form>

        <div className="pt-4 border-t border-rule text-center text-xs text-ink-muted">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-ink hover:text-accent underline decoration-accent underline-offset-2 focus-visible:outline-focus">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
