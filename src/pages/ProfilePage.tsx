import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users.service';
import { RoleBadge } from '../components/common/Badge';
import {
  OFFICIAL_CAMPUS,
  formatColombianPhone,
  displayColombianPhone,
  isValidColombianPhone,
} from '../utils/format';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(formatColombianPhone(user?.phone || ''));
  const [whatsapp, setWhatsapp] = useState(formatColombianPhone(user?.whatsapp || ''));
  const [campus] = useState(OFFICIAL_CAMPUS);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <UserIcon size={40} className="text-navy mx-auto" />
        <h3 className="text-lg font-bold text-ink">Inicia sesión</h3>
        <p className="text-xs text-ink-muted">Debes iniciar sesión para editar tu perfil universitario.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo seleccionado debe ser una imagen válida (.jpg, .png, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
          setErrorMsg(null);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Por favor ingresa tu nombre completo (mínimo 2 caracteres).');
      setIsLoading(false);
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('El número de teléfono celular es obligatorio.');
      setIsLoading(false);
      return;
    }

    if (!isValidColombianPhone(phone)) {
      setErrorMsg('El teléfono celular debe ser un número colombiano válido de 10 dígitos que inicie por 3.');
      setIsLoading(false);
      return;
    }

    if (whatsapp.trim() && !isValidColombianPhone(whatsapp)) {
      setErrorMsg('El número de WhatsApp debe ser un número celular colombiano válido de 10 dígitos que inicie por 3.');
      setIsLoading(false);
      return;
    }

    try {
      const updated = await usersService.updateProfile({
        name: name.trim(),
        phone: displayColombianPhone(phone),
        whatsapp: whatsapp.trim() ? displayColombianPhone(whatsapp) : displayColombianPhone(phone),
        campus: OFFICIAL_CAMPUS,
        avatar: avatar || undefined,
      });

      updateUser(updated);
      setSuccessMsg('¡Perfil universitario actualizado con éxito!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-ink">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">
          Mi perfil universitario
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Esta información permite que tus compañeros te contacten para coordinar pedidos y entregas en el campus.
        </p>
      </div>

      <div className="bg-paper-2 rounded-card border border-rule p-6 sm:p-8 shadow-card space-y-6">
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-control object-cover border border-rule shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-control bg-paper-3 text-accent font-semibold text-2xl flex items-center justify-center border border-rule">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-ink">{user.name}</h2>
              <p className="text-xs text-ink-muted flex items-center gap-1.5">
                <Mail size={12} /> <span>{user.email}</span>
              </p>
              <div className="pt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Photo buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
              className="h-9 px-3.5 bg-paper-3 hover:bg-paper-3/80 border border-rule text-ink rounded-control text-xs font-medium flex items-center justify-center gap-2 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
            >
              <Upload size={14} className="text-accent shrink-0" />
              <span>Escoger foto de perfil</span>
            </button>

            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar('')}
                className="h-9 px-3 bg-paper-2 hover:bg-status-error-subtle border border-rule text-status-error rounded-control text-xs font-medium flex items-center justify-center gap-1.5 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                title="Eliminar foto actual"
              >
                <Trash2 size={13} />
                <span>Quitar</span>
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-status-success-subtle border border-status-success/30 rounded-control text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <UserIcon size={12} className="text-ink-muted" />
                <span>Nombre completo</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-accent" />
                <span>Sede universitaria oficial</span>
              </label>
              <input
                type="text"
                value={campus}
                readOnly
                className="w-full h-10 px-3 bg-paper-3 border border-rule rounded-control text-xs sm:text-sm font-semibold text-ink cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <Phone size={12} className="text-accent" />
                <span>Teléfono celular (Colombia) *</span>
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
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <Phone size={12} className="text-status-success" />
                <span>WhatsApp para coordinación</span>
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
                Si se deja vacío, se utilizará el teléfono celular registrado
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-accent" />
              <span>Sede oficial</span>
            </label>
            <input
              type="text"
              value={campus}
              readOnly
              className="w-full h-10 px-3 bg-paper-3 border border-rule rounded-control text-xs sm:text-sm font-semibold text-ink cursor-not-allowed select-none"
            />
            <span className="text-xs text-ink-muted mt-0.5 block">
              Sede única del Centro Tutorial Cereté
            </span>
          </div>

          <div className="pt-4 border-t border-rule flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-2 disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
            >
              <Save size={15} className="shrink-0" />
              <span>{isLoading ? 'Guardando cambios...' : 'Guardar información'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
