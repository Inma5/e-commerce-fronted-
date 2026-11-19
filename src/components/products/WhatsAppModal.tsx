import React, { useState } from 'react';
import { Product } from '../../types';
import { productsService } from '../../services/products.service';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { MessageCircle, MapPin, User, FileText, Send, AlertCircle } from 'lucide-react';
import { formatCOP, OFFICIAL_CAMPUS } from '../../utils/format';

interface WhatsAppModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState(product.meetingPoint || OFFICIAL_CAMPUS);
  const [clientName, setClientName] = useState(user?.name || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await productsService.getWhatsAppCheckout(product.id, {
        quantity,
        meetingPoint: meetingPoint || undefined,
        clientName: clientName || undefined,
        notes: notes || undefined,
      });

      window.open(result.whatsappUrl, '_blank');
      onClose();
    } catch (err: any) {
      setError(
        err.message ||
          'No se pudo generar el enlace. Asegúrate de que el vendedor tenga un número de WhatsApp registrado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprar directo por WhatsApp" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 bg-paper-3 rounded-control border border-rule">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'}
            alt={product.title}
            className="w-14 h-14 rounded-control object-cover border border-rule"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-ink text-sm line-clamp-1">{product.title}</h4>
            <p className="text-xs text-ink-muted">
              Vendido por: <span className="font-medium text-ink">{product.seller?.name || 'Estudiante'}</span>
            </p>
            <p className="text-sm font-bold text-ink mt-0.5 tabular-nums">
              {formatCOP(product.price)} c/u
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control flex items-start gap-2 text-status-error text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Cantidad (Stock: {product.stock})
            </label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus tabular-nums"
              required
            />
          </div>

          {/* Total calculation */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Total estimado (COP)</label>
            <div className="h-10 px-3 flex items-center bg-paper-3 border border-rule rounded-control text-xs sm:text-sm font-bold text-ink tabular-nums">
              {formatCOP(product.price * quantity)}
            </div>
          </div>
        </div>

        {/* Client Name */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
            <User size={13} className="text-ink-muted" />
            <span>Tu nombre para el vendedor</span>
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Daniel - Estudiante Cereté"
            className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus"
            required
          />
        </div>

        {/* Meeting point */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
            <MapPin size={13} className="text-accent" />
            <span>Punto de entrega en campus (Centro Tutorial Cereté)</span>
          </label>
          <input
            type="text"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            placeholder="Centro Tutorial Cereté - Cafetería, Portería o Biblioteca"
            className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus"
          />
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
            <FileText size={13} className="text-ink-muted" />
            <span>Horario preferido o nota adicional (opcional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Disponible de 2:00 a 4:00 pm después de clases."
            className="w-full p-2.5 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink hover:bg-paper-3 rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
          >
            <MessageCircle size={16} className="shrink-0" />
            <span>{isLoading ? 'Generando...' : 'Abrir WhatsApp'}</span>
            <Send size={13} className="shrink-0" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
