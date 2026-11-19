import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ConditionBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';
import {
  MapPin,
  ShoppingBag,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
  Eye,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showBuyButton?: boolean;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBuyButton = true,
  priority = false,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user, isSeller } = useAuth();

  const isOwner = !!user && (user.id === product.sellerId || (product.seller && user.id === product.seller.id));
  const canBuy = showBuyButton && !isSeller && !isOwner;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartError(null);

    const res = addToCart(product, 1);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } else {
      setCartError(res.message || 'No se pudo añadir');
      setTimeout(() => setCartError(null), 4000);
    }
  };

  const imageSrc =
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

  const isSoldOut = product.stock <= 0 || product.status === 'SOLD_OUT';
  const has360 = product.images && product.images.length > 1;

  return (
    <div className="group bg-paper-2 rounded-card border border-rule shadow-sm hover:border-navy hover:shadow-card motion-safe:transition-colors duration-micro flex flex-col overflow-hidden relative">
      {/* Image & Badges Container */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-paper-3 aspect-4/3 focus-visible:outline-focus">
        <img
          src={imageSrc}
          alt={product.title}
          className={`w-full h-full object-cover ${
            isSoldOut ? 'grayscale opacity-60' : ''
          }`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Floating condition badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <ConditionBadge condition={product.condition} />
        </div>

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-3 right-3 bg-navy text-navy-ink text-xs font-medium px-2.5 py-0.5 rounded-control z-10">
            {product.category.name}
          </div>
        )}

        {/* Multi-photo badge */}
        {has360 && (
          <div className="absolute bottom-3 left-3 bg-navy text-navy-ink text-xs font-medium px-2 py-0.5 rounded-sm flex items-center gap-1 z-10 border border-rule-2 shadow-sm">
            <Camera size={12} className="text-accent shrink-0" />
            <span className="tabular-nums">{product.images.length} fotos</span>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="bg-status-error text-white font-semibold text-xs px-3 py-1 rounded-control shadow-sm">
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <Link
            to={`/products/${product.id}`}
            className="font-semibold text-ink text-sm sm:text-base leading-snug hover:text-accent motion-safe:transition-colors duration-micro line-clamp-2 focus-visible:outline-focus"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Campus Meeting Point */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-muted">
            <MapPin size={13} className="text-accent shrink-0" />
            <span className="truncate">
              {product.meetingPoint || 'Centro Tutorial Cereté'}
            </span>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <Link
              to={`/sellers/${product.seller.id}`}
              className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-rule group/seller focus-visible:outline-focus"
            >
              {product.seller.avatar ? (
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-5 h-5 rounded-pill object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-pill bg-paper-3 text-ink text-xs font-semibold flex items-center justify-center">
                  {product.seller.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs truncate">
                <span className="font-medium text-ink group-hover/seller:text-accent motion-safe:transition-colors duration-micro truncate">
                  {product.seller.name}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="pt-2 border-t border-rule">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs font-normal text-ink-muted block">Precio (COP)</span>
              <p className="text-lg sm:text-xl font-bold text-ink tracking-tight tabular-nums">
                {formatCOP(product.price)}
              </p>
            </div>

            <div className="text-right">
              {product.stock <= 1 && !isSoldOut ? (
                <span className="text-xs font-medium text-accent-ink dark:text-accent flex items-center gap-0.5">
                  <Sparkles size={11} className="text-accent shrink-0" /> ¡Último!
                </span>
              ) : (
                <span className="text-xs text-ink-muted tabular-nums">
                  {isSoldOut ? 'Sin stock' : `${product.stock} disponibles`}
                </span>
              )}
            </div>
          </div>

          {/* Error banner */}
          {cartError && (
            <div className="mb-2 p-2 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-1 leading-tight">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{cartError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className={canBuy ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1'}>
            <Link
              to={`/products/${product.id}`}
              className="w-full h-9 px-3 rounded-control bg-paper-2 hover:bg-paper-3 text-ink border border-rule font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              <Eye size={14} className="shrink-0 text-ink-muted" />
              <span>Ver detalle</span>
            </Link>

            {canBuy && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`w-full h-9 px-3 rounded-control font-semibold text-xs flex items-center justify-center gap-1.5 motion-safe:transition-colors duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap ${
                  justAdded
                    ? 'bg-status-success-subtle text-status-success border border-status-success/30'
                    : 'bg-navy hover:opacity-90 active:opacity-95 text-navy-ink'
                } disabled:opacity-50 disabled:pointer-events-none`}
                title="Añadir a la reserva de campus"
              >
                {justAdded ? (
                  <>
                    <Check size={14} className="text-status-success shrink-0" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} className="shrink-0" />
                    <span>Reservar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
