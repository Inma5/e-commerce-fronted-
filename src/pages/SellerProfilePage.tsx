import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersService } from '../services/users.service';
import { SellerPublicProfile } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ConditionBadge } from '../components/common/Badge';
import { OFFICIAL_CAMPUS, toWhatsAppClean, formatCOP } from '../utils/format';
import {
  MapPin,
  Star,
  Package,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<SellerPublicProfile | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchSeller = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usersService.getSellerProfile(id);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el perfil del vendedor');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6 text-ink">
        <div className="h-44 bg-paper-3 rounded-card" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-paper-3 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-paper-2 rounded-card border border-rule text-center space-y-4 shadow-sm text-ink">
        <AlertCircle size={40} className="text-status-error mx-auto" />
        <h3 className="text-lg font-semibold text-ink">Vendedor no encontrado</h3>
        <p className="text-xs text-ink-muted">{error || 'El estudiante no existe o no tiene rol de vendedor.'}</p>
        <Link to="/" className="inline-block px-4 py-2 bg-navy hover:opacity-90 text-navy-ink rounded-control text-xs font-semibold shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const phoneOrWhatsapp = profile.whatsapp || profile.phone;
  const cleanNumber = phoneOrWhatsapp ? toWhatsAppClean(phoneOrWhatsapp) : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-ink">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink motion-safe:transition-colors duration-micro focus-visible:outline-focus">
        <ArrowLeft size={14} /> <span>Volver al catálogo</span>
      </Link>

      {/* Seller Header Profile Card */}
      <div className="bg-paper-2 rounded-card border border-rule p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-control object-cover border border-rule"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-control bg-paper-3 text-accent font-semibold text-3xl flex items-center justify-center border border-rule">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-ink">{profile.name}</h1>
                <span className="bg-paper-3 text-ink text-xs font-medium px-2.5 py-0.5 rounded-pill border border-rule">
                  Vendedor de campus
                </span>
              </div>

              <p className="text-xs text-ink-muted flex items-center gap-1">
                <MapPin size={13} className="text-accent" />
                <span>{profile.campus || OFFICIAL_CAMPUS}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {cleanNumber && (
            <a
              href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`¡Hola ${profile.name}! Vi tus productos en CampusMarket y me gustaría consultar sobre ellos.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-control bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              <MessageCircle size={16} className="shrink-0" />
              <span>Contactar por WhatsApp</span>
            </a>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-rule">
          <div className="p-3 bg-paper rounded-control border border-rule text-center">
            <span className="text-xs font-normal text-ink-muted block">Productos disponibles</span>
            <span className="text-2xl font-bold text-ink tabular-nums">{profile.stats.totalProducts}</span>
          </div>

          <div className="p-3 bg-paper rounded-control border border-rule text-center">
            <span className="text-xs font-normal text-ink-muted block">Calificación promedio</span>
            <span className="text-2xl font-bold text-ink flex items-center justify-center gap-1">
              <Star size={18} className="fill-accent text-accent" />
              <span className="tabular-nums">{profile.stats.averageRating ? profile.stats.averageRating.toFixed(1) : '-'}</span>
            </span>
          </div>

          <div className="p-3 bg-paper rounded-control border border-rule text-center">
            <span className="text-xs font-normal text-ink-muted block">Reseñas recibidas</span>
            <span className="text-2xl font-bold text-ink tabular-nums">{profile.stats.totalReviews}</span>
          </div>
        </div>
      </div>

      {/* Seller Products Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
          <h2 className="text-lg sm:text-xl font-semibold text-ink flex items-center gap-2">
            <Package size={20} className="text-accent" />
            <span className="tabular-nums">Productos de {profile.name} ({(profile.products || []).length})</span>
          </h2>

          <div className="flex items-center gap-1 p-1 bg-paper-3 rounded-control border border-rule">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1 rounded-sm text-xs font-medium flex items-center gap-1.5 motion-safe:transition-colors duration-micro focus-visible:outline-focus ${
                viewLayout === 'grid'
                  ? 'bg-paper-2 text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Vista en tarjetas"
            >
              <LayoutGrid size={14} />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`px-3 py-1 rounded-sm text-xs font-medium flex items-center gap-1.5 motion-safe:transition-colors duration-micro focus-visible:outline-focus ${
                viewLayout === 'list'
                  ? 'bg-paper-2 text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Vista en lista"
            >
              <List size={14} />
              <span>Lista</span>
            </button>
          </div>
        </div>

        {(profile.products || []).length > 0 ? (
          viewLayout === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {profile.products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  showBuyButton={false}
                  product={{
                    ...prod,
                    seller: {
                      id: profile.id,
                      name: profile.name,
                      career: profile.career,
                      campus: profile.campus,
                      avatar: profile.avatar,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {profile.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-paper-2 rounded-control border border-rule p-3 shadow-2xs hover:border-navy motion-safe:transition-colors duration-micro flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-control overflow-hidden bg-paper-3 border border-rule shrink-0">
                      <img
                        src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300'}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <ConditionBadge condition={prod.condition} />
                        {prod.category && (
                          <span className="text-xs font-medium text-ink bg-paper-3 px-2 py-0.5 rounded-sm">
                            {prod.category.name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-ink text-sm truncate">{prod.title}</h4>
                      <p className="text-xs text-ink-muted line-clamp-1">{prod.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 sm:gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-rule shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-sm sm:text-base font-bold text-ink tabular-nums block">
                        {formatCOP(prod.price)}
                      </span>
                      <span className="text-xs text-ink-muted block tabular-nums">
                        {prod.stock <= 0 ? 'Agotado' : `${prod.stock} disp.`}
                      </span>
                    </div>

                    <Link
                      to={`/products/${prod.id}`}
                      className="h-8 px-3 bg-paper-2 hover:bg-paper-3 text-ink border border-rule font-medium text-xs rounded-control shadow-2xs flex items-center gap-1.5 motion-safe:transition-colors duration-micro shrink-0 whitespace-nowrap focus-visible:outline-focus"
                    >
                      <Eye size={13} />
                      <span>Ver producto</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-8 text-center bg-paper-2 rounded-card border border-rule text-ink-muted text-xs shadow-sm">
            Este vendedor actualmente no tiene productos en venta.
          </div>
        )}
      </div>

      {/* Seller Reviews Received */}
      <div className="bg-paper-2 rounded-card border border-rule p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-ink flex items-center gap-2">
          <Star size={18} className="text-accent fill-accent" />
          <span className="tabular-nums">Historial de valoraciones recibidas ({(profile.reviewsReceived || []).length})</span>
        </h3>

        {(profile.reviewsReceived || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.reviewsReceived.map((rev) => (
              <div key={rev.id} className="p-4 bg-paper rounded-control border border-rule space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">
                    {rev.buyer?.name || 'Estudiante'}
                  </span>
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
          <p className="text-xs text-ink-muted py-4">
            Este vendedor aún no ha recibido reseñas de otros estudiantes.
          </p>
        )}
      </div>
    </div>
  );
};
