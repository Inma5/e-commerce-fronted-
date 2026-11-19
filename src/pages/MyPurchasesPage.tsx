import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/orders.service';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/common/Badge';
import { ReviewModal } from '../components/orders/ReviewModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { formatCOP, OFFICIAL_CAMPUS, toWhatsAppClean } from '../utils/format';
import {
  PackageCheck,
  MapPin,
  MessageCircle,
  Calendar,
  XCircle,
  Star,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export const MyPurchasesPage: React.FC = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<Order | null>(null);
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersService.getBuyerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar tus pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleOpenCancelModal = (orderId: string) => {
    setActionError(null);
    setCancelModal({
      isOpen: true,
      orderId,
      isLoading: false,
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.orderId) return;

    setCancelModal((prev) => ({ ...prev, isLoading: true }));
    setActionError(null);
    try {
      await ordersService.cancelOrderByBuyer(cancelModal.orderId);
      setCancelModal({ isOpen: false, orderId: null, isLoading: false });
      await fetchOrders();
    } catch (err: any) {
      setActionError(err.message || 'Error al cancelar el pedido');
      setCancelModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <PackageCheck size={40} className="text-navy mx-auto" />
        <h3 className="text-xl font-bold text-ink">Portal exclusivo de vendedores</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Como vendedor, tu cuenta está configurada para gestionar inventario y recibir pedidos de compradores del campus.
        </p>
        <Link
          to="/seller"
          className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
        >
          Ir al panel de vendedor
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <PackageCheck size={40} className="text-navy mx-auto" />
        <h3 className="text-xl font-bold text-ink">Inicia sesión para ver tus pedidos</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          Revisa el estado de entrega en campus y califica a tus compañeros vendedores.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-ink">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Mis pedidos y compras en campus
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Historial de reservas, estado de confirmación y entregas con compañeros.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-4 py-2 bg-paper-2 hover:bg-paper-3 border border-rule rounded-control text-xs font-semibold text-ink flex items-center gap-1.5 shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-status-error-subtle border border-status-error/30 rounded-card text-xs text-status-error flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-paper-3 rounded-card" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const sellerPhone = order.seller?.phone;
            const cleanPhone = sellerPhone ? toWhatsAppClean(sellerPhone) : '';

            return (
              <div
                key={order.id}
                className="bg-paper-2 rounded-card border border-rule shadow-sm p-5 sm:p-6 space-y-4 hover:border-navy motion-safe:transition-colors duration-micro"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink text-sm">
                      Pedido #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-muted tabular-nums">
                    <Calendar size={13} />
                    <span>{new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Seller & Campus Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-paper rounded-control border border-rule space-y-1">
                    <span className="text-xs font-medium text-ink-muted">Vendedor</span>
                    <p className="font-semibold text-ink text-sm">{order.seller?.name || 'Estudiante'}</p>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${order.seller?.name}! Te escribo sobre mi Pedido #${order.orderNumber} en CampusMarket.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-ink hover:text-accent font-medium mt-1 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                      >
                        <MessageCircle size={13} className="text-accent" /> <span>Chatear por WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="p-3 bg-paper rounded-control border border-rule space-y-1">
                    <span className="text-xs font-medium text-ink-muted">Lugar de entrega</span>
                    <p className="font-semibold text-ink flex items-center gap-1 text-sm">
                      <MapPin size={14} className="text-accent shrink-0" />
                      <span>{order.meetingPoint || OFFICIAL_CAMPUS}</span>
                    </p>
                    {order.notes && (
                      <p className="text-ink-muted italic mt-1">Nota: "{order.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-rule">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product?.images && item.product.images[0]
                              ? item.product.images[0]
                              : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'
                          }
                          alt={item.product?.title || 'Producto'}
                          className="w-12 h-12 rounded-control object-cover border border-rule"
                        />
                        <div>
                          <p className="text-xs font-semibold text-ink">
                            {item.product?.title || 'Producto universitario'}
                          </p>
                          <p className="text-xs text-ink-muted tabular-nums">
                            {item.quantity} x {formatCOP(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-ink tabular-nums">
                        {formatCOP(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer row: Total & Actions */}
                <div className="pt-3 border-t border-rule flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-normal text-ink-muted">Total a pagar:</span>
                    <span className="text-xl font-bold text-ink tabular-nums">
                      {formatCOP(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleOpenCancelModal(order.id)}
                        className="px-3.5 py-2 rounded-control bg-status-error-subtle hover:opacity-90 text-status-error font-medium text-xs flex items-center gap-1.5 motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
                      >
                        <XCircle size={14} className="shrink-0" />
                        <span>Cancelar pedido</span>
                      </button>
                    )}

                    {(order.status === 'DELIVERED' || order.status === 'CONFIRMED') && order.seller && (
                      <button
                        onClick={() => setSelectedReviewOrder(order)}
                        className="px-4 py-2 rounded-control bg-paper-2 hover:bg-paper-3 text-ink border border-rule font-medium text-xs flex items-center gap-1.5 motion-safe:transition-colors duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
                      >
                        <Star size={14} className="fill-accent text-accent shrink-0" />
                        <span>Calificar vendedor</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center bg-paper-2 rounded-card border border-rule max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-paper-3 text-ink-muted rounded-control flex items-center justify-center mx-auto border border-rule">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-base font-semibold text-ink">Aún no has realizado pedidos</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Explora libros, calculadoras y útiles en el campus para crear tu primera reserva.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewOrder && selectedReviewOrder.seller && (
        <ReviewModal
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          sellerId={selectedReviewOrder.sellerId}
          sellerName={selectedReviewOrder.seller?.name || 'Vendedor'}
          productId={selectedReviewOrder.items[0]?.productId}
          productTitle={selectedReviewOrder.items[0]?.product?.title}
          onSuccess={fetchOrders}
        />
      )}

      {/* Cancellation Confirm Modal */}
      <ConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null, isLoading: false })}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar este pedido?"
        message="Al cancelar este pedido, los productos volverán inmediatamente al stock disponible del vendedor para otros estudiantes de la sede."
        confirmText="Sí, cancelar pedido"
        cancelText="Conservar pedido"
        type="danger"
        isLoading={cancelModal.isLoading}
      />
    </div>
  );
};
