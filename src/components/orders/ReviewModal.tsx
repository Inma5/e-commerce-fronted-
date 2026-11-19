import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ordersService } from '../../services/orders.service';
import { Star, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  productId?: string;
  productTitle?: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  productId,
  productTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ordersService.createReview({
        sellerId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar la calificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Calificar a ${sellerName}`}
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-status-success-subtle text-status-success rounded-control flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h4 className="text-base font-semibold text-ink">¡Gracias por tu opinión!</h4>
          <p className="text-xs text-ink-muted">
            Tu reseña ayuda a toda la comunidad estudiantil a comprar con confianza.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {productTitle && (
            <div className="p-3 bg-paper-3 border border-rule rounded-control text-xs text-ink-muted">
              Sobre el producto: <span className="font-medium text-ink">{productTitle}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control flex items-center gap-2 text-status-error text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-medium text-ink mb-2">
              ¿Cómo calificarías la puntualidad y entrega?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus-visible:outline-focus rounded-sm motion-safe:transition-colors duration-micro"
                  aria-label={`Calificar con ${star} estrellas`}
                >
                  <Star
                    size={26}
                    className={`${
                      star <= rating
                        ? 'text-accent fill-accent'
                        : 'text-rule hover:text-accent/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-ink mt-1.5">
              {rating === 5 && '¡Excelente servicio!'}
              {rating === 4 && 'Muy bueno'}
              {rating === 3 && 'Aceptable'}
              {rating === 2 && 'Pudo ser mejor'}
              {rating === 1 && 'Mala experiencia'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Comentario para el perfil del estudiante (opcional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Puntual en la cafetería, el libro estaba exactamente como se describió."
              className="w-full p-2.5 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink hover:bg-paper-3 rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm flex items-center gap-2 motion-safe:transition-opacity duration-micro disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
            >
              <Send size={14} className="shrink-0" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Calificación'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
