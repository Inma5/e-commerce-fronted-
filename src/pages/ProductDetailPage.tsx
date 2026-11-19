import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { Product } from '../types';
import { ConditionBadge } from '../components/common/Badge';
import { Product360Viewer } from '../components/products/Product360Viewer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCOP, OFFICIAL_CAMPUS } from '../utils/format';
import {
  MapPin,
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isSeller } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productsService.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6 text-ink">
        <div className="h-4 bg-paper-3 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-paper-3 rounded-card" />
          <div className="space-y-4">
            <div className="h-8 bg-paper-3 rounded w-3/4" />
            <div className="h-6 bg-paper-3 rounded w-1/4" />
            <div className="h-24 bg-paper-3 rounded-control" />
            <div className="h-12 bg-paper-3 rounded-control" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <AlertCircle size={40} className="text-status-error mx-auto" />
        <h3 className="text-xl font-bold text-ink">Producto no disponible</h3>
        <p className="text-xs text-ink-muted">{error || 'El producto no existe o fue retirado.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0 || product.status === 'SOLD_OUT';

  const handleAddToCart = () => {
    setCartError(null);
    const res = addToCart(product, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      setCartError(res.message || 'Error al añadir al carrito');
      setTimeout(() => setCartError(null), 5000);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'];

  const reviews = product.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-ink">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
        <Link to="/" className="hover:text-accent flex items-center gap-1 motion-safe:transition-colors duration-micro focus-visible:outline-focus">
          <ArrowLeft size={14} /> <span>Catálogo</span>
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span className="text-ink-muted">{product.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-ink font-semibold truncate max-w-[200px] sm:max-w-md">
          {product.title}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Images Column */}
        <div className="lg:col-span-7 space-y-4">
          <Product360Viewer
            images={images}
            title={product.title}
            badge={<ConditionBadge condition={product.condition} />}
            isSoldOut={isSoldOut}
          />

          {/* Detailed Description */}
          <div className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-3 mt-6">
            <h3 className="font-semibold text-ink text-base sm:text-lg">Descripción del producto</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Purchase Info & Seller Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              {product.category && (
                <span className="text-xs font-medium text-accent-ink dark:text-accent">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1 leading-tight">
                {product.title}
              </h1>

              {/* Rating summary */}
              {averageRating && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(Number(averageRating)) ? 'fill-accent text-accent' : 'text-rule'}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-ink tabular-nums">{averageRating}</span>
                  <span className="text-xs text-ink-muted tabular-nums">({reviews.length} reseñas)</span>
                </div>
              )}
            </div>

            {/* Price Tag & Stock */}
            <div className="p-4 bg-paper-3 rounded-control border border-rule flex items-center justify-between">
              <div>
                <span className="text-xs font-normal text-ink-muted">Precio oficial (COP)</span>
                <p className="text-2xl sm:text-3xl font-bold text-ink tabular-nums">
                  {formatCOP(product.price)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-normal text-ink-muted">Stock</span>
                <p className={`text-xs sm:text-sm font-semibold tabular-nums ${product.stock <= 1 ? 'text-accent-ink dark:text-accent' : 'text-status-success'}`}>
                  {isSoldOut ? 'Agotado' : `${product.stock} unidades`}
                </p>
              </div>
            </div>

            {/* Meeting Point Box */}
            <div className="p-3.5 rounded-control bg-paper-3 border border-rule space-y-1">
              <div className="flex items-center gap-2 text-ink text-xs font-medium">
                <MapPin size={15} className="text-accent shrink-0" />
                <span>Punto de recogida oficial:</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-ink pl-5.5">
                {product.meetingPoint || OFFICIAL_CAMPUS} (Sede oficial universitaria)
              </p>
            </div>

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-medium text-ink">Cantidad:</label>
                <div className="flex items-center border border-rule rounded-control overflow-hidden bg-paper-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-2.5 py-1 bg-paper-3 hover:bg-paper-3/80 text-ink disabled:opacity-40 text-xs font-semibold motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1 text-xs font-semibold text-ink min-w-[2rem] text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-2.5 py-1 bg-paper-3 hover:bg-paper-3/80 text-ink disabled:opacity-40 text-xs font-semibold motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-bold text-ink tabular-nums">
                  Total: {formatCOP(product.price * quantity)}
                </span>
              </div>
            )}

            {/* Cart Error Message */}
            {cartError && (
              <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{cartError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {user && (user.id === product.sellerId || (product.seller && user.id === product.seller.id)) ? (
                <div className="p-3 bg-paper-3 border border-rule rounded-control text-xs text-ink font-medium text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-accent shrink-0" />
                  <span>Este es tu producto publicado en el campus. Puedes gestionarlo desde tu panel de vendedor.</span>
                </div>
              ) : isSeller ? (
                <div className="p-3 bg-paper-3 border border-rule rounded-control text-xs text-ink-muted font-normal text-center">
                  Tu cuenta es de tipo Vendedor. Las reservas de productos son exclusivas para cuentas de estudiantes compradores.
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`w-full h-11 px-5 font-semibold text-sm rounded-control border motion-safe:transition-colors duration-micro flex items-center justify-center gap-2 shadow-sm whitespace-nowrap focus-visible:outline-focus ${
                    justAdded
                      ? 'bg-status-success-subtle text-status-success border-status-success/30'
                      : 'bg-navy hover:opacity-90 active:opacity-95 text-navy-ink border-navy'
                  } disabled:opacity-50`}
                >
                  {justAdded ? (
                    <>
                      <Check size={16} className="text-status-success" />
                      <span>¡Añadido a tus reservas!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Añadir a reservas de campus</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs text-ink-muted justify-center">
              <ShieldCheck size={14} className="text-status-success shrink-0" />
              <span>Trato seguro cara a cara entre universitarios</span>
            </div>
          </div>

          {/* Seller Profile Card */}
          {product.seller && (
            <div className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  Estudiante vendedor
                </span>
                <span className="text-xs bg-paper-3 text-ink font-medium px-2 py-0.5 rounded-pill border border-rule">
                  Verificado en campus
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                {product.seller.avatar ? (
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-12 h-12 rounded-control object-cover border border-rule"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-control bg-paper-3 text-accent font-semibold text-lg flex items-center justify-center border border-rule">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-ink text-sm sm:text-base">
                    {product.seller.name}
                  </h4>
                  {product.seller.campus && (
                    <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-accent shrink-0" />
                      <span>{product.seller.campus}</span>
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/sellers/${product.seller.id}`}
                className="w-full h-10 px-4 flex items-center justify-center rounded-control bg-paper-2 hover:bg-paper-3 border border-rule text-ink font-semibold text-xs motion-safe:transition-colors duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
              >
                Ver más productos y reputación del vendedor
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-ink flex items-center gap-2">
            <Star size={18} className="text-accent fill-accent" />
            <span className="tabular-nums">Reseñas de compañeros compradores ({reviews.length})</span>
          </h3>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-control bg-paper border border-rule space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-pill bg-paper-3 text-ink text-xs font-semibold flex items-center justify-center">
                      {rev.buyer?.name ? rev.buyer.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <span className="text-xs font-semibold text-ink">
                      {rev.buyer?.name || 'Estudiante'}
                    </span>
                  </div>
                  <div className="flex text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < rev.rating ? 'fill-accent text-accent' : 'text-rule'}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-ink-muted italic">"{rev.comment}"</p>
                )}
                <span className="text-xs text-ink-muted block tabular-nums">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-ink-muted text-xs">
            Aún no hay reseñas registradas para este producto. Sé el primero en calificar tras recibirlo.
          </div>
        )}
      </div>

    </div>
  );
};
