import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service';
import { formatCOP, OFFICIAL_CAMPUS, toWhatsAppClean } from '../utils/format';
import {
  ShoppingBag,
  Trash2,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  MessageCircle,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    currentSellerName,
  } = useCart();

  const { isAuthenticated, isSeller, user } = useAuth();
  const navigate = useNavigate();

  const [meetingPoint, setMeetingPoint] = useState(
    items.length > 0 && items[0].product.meetingPoint ? items[0].product.meetingPoint : OFFICIAL_CAMPUS
  );
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCreatedNumber, setOrderCreatedNumber] = useState<number | null>(null);
  const [sellerContactPhone, setSellerContactPhone] = useState<string>('');
  const [confirmedOrderWhatsAppUrl, setConfirmedOrderWhatsAppUrl] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      const firstItem = items[0];
      const directPhone = firstItem.product?.seller?.whatsapp || firstItem.product?.seller?.phone;
      if (directPhone) {
        setSellerContactPhone(directPhone);
      } else if (firstItem.product?.sellerId) {
        usersService
          .getSellerProfile(firstItem.product.sellerId)
          .then((profile) => {
            const p = profile.whatsapp || profile.phone;
            if (p) setSellerContactPhone(p);
          })
          .catch(() => {});
      }
    }
  }, [items]);

  const handleLoginAndReserve = async (e: React.MouseEvent) => {
    e.preventDefault();

    let phoneToUse = sellerContactPhone;
    if (!phoneToUse && items.length > 0) {
      phoneToUse = items[0].product?.seller?.whatsapp || items[0].product?.seller?.phone || '';
      if (!phoneToUse && items[0].product?.sellerId) {
        try {
          const profile = await usersService.getSellerProfile(items[0].product.sellerId);
          phoneToUse = profile.whatsapp || profile.phone || '';
        } catch (err) {
          console.warn('No se pudo obtener el perfil del vendedor para WhatsApp:', err);
        }
      }
    }

    const sellerName = currentSellerName || items[0]?.product?.seller?.name || 'Compañero';
    const productLines = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.product.title} - ${formatCOP(it.product.price)} c/u (Subtotal: ${formatCOP(it.product.price * it.quantity)})`
      )
      .join('\n');

    const messageLines = [
      `¡Hola ${sellerName}!`,
      ``,
      `Te escribo desde CampusMarket (Centro Tutorial Cereté). Tengo los siguientes productos en mi carrito y formalizaré la reserva:`,
      ``,
      `Detalles de los productos:`,
      productLines,
      ``,
      `Total a pagar al recibir: ${formatCOP(totalAmount)}`,
      `Punto de recogida: ${meetingPoint.trim() || OFFICIAL_CAMPUS}`,
      notes.trim() ? `Notas / Horario: ${notes.trim()}` : null,
      ``,
      `¿Tienes disponibilidad para la entrega en el campus?`,
    ];

    const message = messageLines.filter(Boolean).join('\n');
    const cleanPhone = phoneToUse ? toWhatsAppClean(phoneToUse) : '';

    if (cleanPhone) {
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    navigate('/login');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        meetingPoint: meetingPoint.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const order = await ordersService.createOrder(payload);
      setOrderCreatedNumber(order.orderNumber);

      let phoneToUse = sellerContactPhone;
      if (!phoneToUse && items[0]?.product?.sellerId) {
        try {
          const profile = await usersService.getSellerProfile(items[0].product.sellerId);
          phoneToUse = profile.whatsapp || profile.phone || '';
        } catch {}
      }

      const cleanPhone = phoneToUse ? toWhatsAppClean(phoneToUse) : '';
      if (cleanPhone) {
        const sellerName = currentSellerName || items[0]?.product?.seller?.name || 'Compañero';
        const productLines = items
          .map(
            (it) =>
              `• ${it.quantity}x ${it.product.title} (${formatCOP(it.product.price * it.quantity)})`
          )
          .join('\n');

        const orderMsg = [
          `¡Hola ${sellerName}!`,
          ``,
          `Acabo de confirmar el Pedido #${order.orderNumber} en CampusMarket (Centro Tutorial Cereté):`,
          ``,
          `Productos:`,
          productLines,
          ``,
          `Total a pagar al recibir: ${formatCOP(totalAmount)}`,
          `Punto de recogida: ${meetingPoint.trim() || OFFICIAL_CAMPUS}`,
          notes.trim() ? `Nota: ${notes.trim()}` : null,
          user?.name ? `Comprador: ${user.name}` : null,
          ``,
          `¿En qué horario podemos encontrarnos en el campus para la entrega?`,
        ]
          .filter(Boolean)
          .join('\n');

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMsg)}`;
        setConfirmedOrderWhatsAppUrl(waUrl);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      clearCart();
    } catch (err: any) {
      setError(
        err.message ||
          'No se pudo procesar la orden. Asegúrate de tener rol CLIENTE (los vendedores no pueden comprar sus propios productos).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <div className="w-12 h-12 bg-paper-3 text-ink rounded-control flex items-center justify-center mx-auto border border-rule">
          <ShoppingBag size={24} />
        </div>
        <h3 className="text-lg font-semibold text-ink">Carrito no disponible para vendedores</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Las cuentas con rol de vendedor no pueden realizar pedidos ni utilizar el carrito de compras. Para comprar productos en el campus, utiliza una cuenta de estudiante comprador.
        </p>
        <div className="pt-2">
          <Link
            to="/seller"
            className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
          >
            Ir al panel de vendedor
          </Link>
        </div>
      </div>
    );
  }

  if (orderCreatedNumber !== null) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule shadow-card text-center space-y-5 text-ink">
        <div className="w-14 h-14 bg-status-success-subtle text-status-success rounded-pill flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">¡Pedido #{orderCreatedNumber} Creado!</h2>
          <p className="text-xs text-ink-muted mt-2 leading-relaxed">
            Se ha descontado el stock y notificado la reserva a tu compañero vendedor. Podrás ver el estado en tu panel de compras.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
          {confirmedOrderWhatsAppUrl && (
            <a
              href={confirmedOrderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-navy hover:opacity-90 text-navy-ink rounded-control text-xs font-semibold shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
            >
              <MessageCircle size={15} />
              <span>Notificar al vendedor por WhatsApp</span>
            </a>
          )}
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-paper-2 hover:bg-paper-3 border border-rule text-ink rounded-control text-xs sm:text-sm font-medium shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
          >
            Ver mis pedidos
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 bg-paper-2 hover:bg-paper-3 border border-rule text-ink rounded-control text-xs sm:text-sm font-medium shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
          >
            Seguir explorando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <div className="w-12 h-12 bg-paper-3 text-ink-muted rounded-control flex items-center justify-center mx-auto border border-rule">
          <ShoppingBag size={24} />
        </div>
        <h3 className="text-base font-semibold text-ink">Tu carrito está vacío</h3>
        <p className="text-xs text-ink-muted">
          Explora los productos de tus compañeros universitarios y reserva tus materiales académicos.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink text-xs sm:text-sm font-semibold rounded-control shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-ink">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Reserva de pedido en campus
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Artículos solicitados al vendedor estudiante:{' '}
            <span className="font-semibold text-ink">{currentSellerName}</span>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-status-error hover:underline font-medium flex items-center gap-1 p-1.5 rounded-control hover:bg-status-error-subtle motion-safe:transition-colors duration-micro focus-visible:outline-focus"
        >
          <Trash2 size={14} /> <span>Vaciar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-paper-2 rounded-card border border-rule shadow-sm overflow-hidden divide-y divide-rule">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-5 flex items-center gap-4">
                <img
                  src={
                    product.images && product.images[0]
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200'
                  }
                  alt={product.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-control object-cover border border-rule shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-semibold text-ink text-sm hover:text-accent motion-safe:transition-colors duration-micro truncate block focus-visible:outline-focus"
                  >
                    {product.title}
                  </Link>

                  <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
                    Precio unitario: {formatCOP(product.price)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-rule rounded-control overflow-hidden bg-paper-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2.5 py-1 text-xs font-semibold text-ink-muted hover:bg-paper-3 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold text-ink tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-2.5 py-1 text-xs font-semibold text-ink-muted hover:bg-paper-3 disabled:opacity-30 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-status-error hover:underline font-medium focus-visible:outline-focus"
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-ink-muted block">Subtotal</span>
                  <span className="text-base font-bold text-ink tabular-nums">
                    {formatCOP(product.price * quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order coordination & confirmation form */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCheckout}
            className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-5"
          >
            <h3 className="text-base font-semibold text-ink">
              Punto de recogida en campus
            </h3>

            {error && (
              <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Meeting Point */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <MapPin size={13} className="text-accent" />
                <span>Lugar de recogida dentro del Centro Tutorial Cereté</span>
              </label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="Centro Tutorial Cereté - Cafetería, Biblioteca, Portería..."
                className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
                required
              />
              <span className="text-xs text-ink-muted mt-1 block">
                * Todos los pedidos se entregan y recogen exclusivamente en el Centro Tutorial Cereté.
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                <FileText size={13} className="text-ink-muted" />
                <span>Notas para el vendedor (horarios de clase / detalles)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Salgo de clase a las 4:00 pm, nos vemos en la cafetería."
                className="w-full p-2.5 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus resize-none"
              />
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-paper-3 rounded-control border border-rule space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Total de productos:</span>
                <span className="font-semibold text-ink tabular-nums">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Comisión por servicio:</span>
                <span className="text-status-success font-medium">Gratis ($ 0 COP)</span>
              </div>
              <div className="border-t border-rule pt-2 flex items-center justify-between">
                <span className="font-semibold text-ink text-sm">Total a pagar al recibir:</span>
                <span className="font-bold text-xl sm:text-2xl text-ink tabular-nums">
                  {formatCOP(totalAmount)}
                </span>
              </div>
            </div>

            {/* Authentication warning or checkout button */}
            {!isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 bg-accent-subtle border border-accent/40 rounded-control text-xs text-accent-ink dark:text-accent flex items-start gap-2">
                  <LogIn size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Al pulsar el botón se enviará un mensaje al vendedor por WhatsApp con los datos de tu pedido y podrás iniciar sesión para formalizar la reserva.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoginAndReserve}
                  className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-sm rounded-control flex items-center justify-center gap-2 motion-safe:transition-opacity duration-micro shadow-sm whitespace-nowrap focus-visible:outline-focus"
                >
                  <MessageCircle size={16} className="shrink-0" />
                  <span>Iniciar sesión para reservar</span>
                </button>
              </div>
            ) : user?.role === 'VENDEDOR' && user.id === items[0].product.sellerId ? (
              <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error">
                No puedes ordenar tus propios productos. Debes iniciar sesión con una cuenta de comprador.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 text-sm disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
              >
                <span>{isLoading ? 'Confirmando pedido...' : 'Confirmar reserva en campus'}</span>
                <ArrowRight size={16} className="shrink-0" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
              <ShieldCheck size={14} className="text-status-success shrink-0" />
              <span>Pago en efectivo, Nequi o Daviplata al recibir en Cereté</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
