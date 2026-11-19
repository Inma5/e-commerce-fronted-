import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestsService, CreateRequestPayload, CreateOfferPayload } from '../services/requests.service';
import { productsService } from '../services/products.service';
import { StudentRequest, RequestStatus, Product } from '../types';
import { formatCOP, formatCOPInput, parseCOP, toWhatsAppClean } from '../utils/format';
import { Modal } from '../components/common/Modal';
import {
  Compass,
  Search,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  MessageCircle,
  ExternalLink,
  DollarSign,
  AlertCircle,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ChevronDown,
  X,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';

const CAREER_OPTIONS = [
  'Todas las carreras',
  'Administración de Empresas',
  'Contaduría Pública',
  'Ingeniería de Sistemas',
  'Licenciatura en Educación',
  'Salud y Enfermería',
  'Otras carreras',
];

export const RequestsPage: React.FC = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'RESOLVED'>('OPEN');
  const [careerFilter, setCareerFilter] = useState('all');

  // Modal new request
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newCareer, setNewCareer] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal reply offer
  const [activeRequestForOffer, setActiveRequestForOffer] = useState<StudentRequest | null>(null);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Expanded offers state
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      if (isAuthenticated) {
        setIsCreateModalOpen(true);
      }
    }
  }, [searchParams, isAuthenticated]);

  const toggleExpand = (id: string) => {
    setExpandedRequests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestsService.getRequests({
        status: statusFilter === 'all' ? undefined : (statusFilter as RequestStatus),
        career: careerFilter === 'all' ? undefined : careerFilter,
        search: searchQuery.trim() || undefined,
      });
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las peticiones del campus');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, careerFilter, searchQuery]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      productsService
        .getMyProducts()
        .then((prods) => setMyProducts(Array.isArray(prods) ? prods.filter((p) => p.status === 'AVAILABLE') : []))
        .catch(() => setMyProducts([]));
    }
  }, [isAuthenticated, isSeller]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmittingRequest(true);
    setCreateError(null);

    try {
      const payload: CreateRequestPayload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        career: newCareer.trim() || undefined,
        maxBudget: newBudget ? parseCOP(newBudget) : undefined,
      };

      await requestsService.createRequest(payload);
      setNewTitle('');
      setNewDescription('');
      setNewBudget('');
      setNewCareer('');
      setIsCreateModalOpen(false);
      loadRequests();
    } catch (err: any) {
      setCreateError(err.message || 'No se pudo publicar la solicitud');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleOpenOfferModal = (req: StudentRequest) => {
    setActiveRequestForOffer(req);
    setOfferMessage('');
    setOfferPrice('');
    setSelectedProductId('');
    setOfferError(null);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForOffer || !offerMessage.trim()) return;

    setIsSubmittingOffer(true);
    setOfferError(null);

    try {
      const payload: CreateOfferPayload = {
        message: offerMessage.trim(),
        price: offerPrice ? parseCOP(offerPrice) : undefined,
        productId: selectedProductId || undefined,
      };

      await requestsService.createOffer(activeRequestForOffer.id, payload);
      setActiveRequestForOffer(null);
      loadRequests();
    } catch (err: any) {
      setOfferError(err.message || 'No se pudo registrar la oferta');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleToggleStatus = async (req: StudentRequest) => {
    const newStatus: RequestStatus = req.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
    try {
      await requestsService.updateStatus(req.id, newStatus);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar el estado');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta petición del mural?')) return;
    try {
      await requestsService.deleteRequest(id);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar la petición');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('¿Deseas retirar tu oferta?')) return;
    try {
      await requestsService.deleteOffer(offerId);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'No se pudo retirar la oferta');
    }
  };

  return (
    <div className="min-h-[85vh] bg-paper text-ink py-8 motion-safe:transition-colors duration-micro">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* HERO BANNER EDITORIAL MURAL ESTUDIANTIL */}
        <section className="bg-navy rounded-card p-6 sm:p-8 text-navy-ink relative overflow-hidden border border-rule-2 shadow-sm">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-control bg-paper-3/15 border border-rule-2 flex items-center justify-center text-accent shrink-0">
                  <Compass size={18} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-ink">
                  Mural Estudiantil <span className="text-accent">· Centro Tutorial Cereté</span>
                </h1>
              </div>

              <p className="text-sm text-ink-muted leading-relaxed font-normal">
                Publica lo que necesitas o propón ofertas directamente a compañeros.
              </p>

              {/* Value points */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-accent shrink-0" />
                  <span>Entregas en campus Cereté</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={13} className="text-accent shrink-0" />
                  <span>Trato directo por WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-accent shrink-0" />
                  <span>Comunidad de estudiantes</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-10 px-5 bg-accent hover:opacity-90 active:opacity-95 text-accent-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 focus-visible:outline-focus whitespace-nowrap"
                >
                  <Plus size={16} className="shrink-0" />
                  <span>Publicar lo que busco</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="h-10 px-5 bg-accent hover:opacity-90 active:opacity-95 text-accent-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center justify-center gap-2 focus-visible:outline-focus whitespace-nowrap"
                >
                  <Sparkles size={16} className="shrink-0" />
                  <span>Inicia sesión para publicar</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* FILTERS AND SEARCH */}
        <section aria-label="Filtros del mural" className="bg-paper-2 rounded-card p-4 border border-rule shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por libro, material, bata de laboratorio..."
              className="w-full h-9.5 pl-10 pr-9 bg-paper border border-rule rounded-control text-xs text-ink placeholder:text-ink-muted focus-visible:outline-focus"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink focus-visible:outline-focus"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Career filter */}
            <select
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
              className="h-9.5 px-3 bg-paper border border-rule rounded-control text-xs font-medium text-ink focus-visible:outline-focus"
            >
              {CAREER_OPTIONS.map((c) => (
                <option key={c} value={c === 'Todas las carreras' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-paper p-1 rounded-control border border-rule">
              <button
                type="button"
                onClick={() => setStatusFilter('OPEN')}
                className={`h-8 px-3.5 rounded-sm text-xs font-medium motion-safe:transition-colors duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap ${
                  statusFilter === 'OPEN'
                    ? 'bg-navy text-navy-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-3'
                }`}
              >
                <span>Buscando</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`h-8 px-3.5 rounded-sm text-xs font-medium motion-safe:transition-colors duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-navy text-navy-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-3'
                }`}
              >
                <Check size={12} />
                <span>Conseguidas</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`h-8 px-3.5 rounded-sm text-xs font-medium motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-navy text-navy-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-3'
                }`}
              >
                Todas
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadRequests}
              className="h-9 w-9 bg-paper border border-rule text-ink-muted hover:text-ink rounded-control flex items-center justify-center shrink-0 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              title="Actualizar peticiones"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-accent' : ''} />
            </button>
          </div>
        </section>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-4 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LIST OF REQUESTS */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-paper-2 rounded-card p-6 border border-rule animate-pulse space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-paper-3 rounded w-1/4" />
                  <div className="h-5 bg-paper-3 rounded w-20" />
                </div>
                <div className="h-6 bg-paper-3 rounded w-3/4" />
                <div className="h-4 bg-paper-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-paper-2 rounded-card border border-rule p-10 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-pill bg-paper-3 text-ink flex items-center justify-center mx-auto border border-rule">
              <Compass size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-ink">
                No hay peticiones registradas con estos filtros
              </h2>
              <p className="text-xs text-ink-muted max-w-md mx-auto mt-1 leading-relaxed">
                Sé el primero en solicitar lo que necesitas para tus clases en el Centro Tutorial Cereté.
              </p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-navy hover:opacity-90 text-navy-ink text-xs font-semibold rounded-control motion-safe:transition-opacity duration-micro inline-flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
              >
                <Plus size={15} />
                <span>Publicar mi solicitud ahora</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-navy hover:opacity-90 text-navy-ink text-xs font-semibold rounded-control motion-safe:transition-opacity duration-micro inline-flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
              >
                <Sparkles size={15} />
                <span>Inicia sesión para publicar</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isOwner = user?.id === req.userId;
              const hasOffers = req.offers && req.offers.length > 0;
              const isExpanded = !!expandedRequests[req.id];

              return (
                <article
                  key={req.id}
                  className={`bg-paper-2 rounded-card border motion-safe:transition-colors duration-micro shadow-sm ${
                    req.status === 'RESOLVED'
                      ? 'border-rule opacity-85'
                      : 'border-rule hover:border-navy'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3.5">
                      <div className="flex items-center gap-2.5">
                        {req.user.avatar ? (
                          <img
                            src={req.user.avatar}
                            alt={req.user.name}
                            className="w-8 h-8 rounded-pill object-cover border border-rule shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-pill bg-navy text-accent font-semibold text-xs flex items-center justify-center border border-rule-2 shrink-0">
                            {req.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-ink block leading-tight">
                            {req.user.name}
                          </span>
                          <span className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                            <GraduationCap size={12} className="text-accent" />
                            <span>{req.career || 'Estudiante Cereté'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {req.status === 'OPEN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-status-success-subtle text-status-success border border-status-success/30">
                            Buscando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium bg-paper-3 text-ink border border-rule">
                            <CheckCircle2 size={12} />
                            <span>Conseguido</span>
                          </span>
                        )}

                        <span className="text-xs text-ink-muted flex items-center gap-1 shrink-0 tabular-nums">
                          <Clock size={11} />
                          {new Date(req.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-semibold text-ink leading-snug">
                          {req.title}
                        </h2>
                        {req.maxBudget ? (
                          <div className="shrink-0 bg-accent-subtle border border-accent/40 text-accent-ink dark:text-accent px-2.5 py-0.5 rounded-control text-xs font-semibold flex items-center gap-1 tabular-nums">
                            <DollarSign size={13} />
                            <span>Presupuesto máx: {formatCOP(req.maxBudget)}</span>
                          </div>
                        ) : (
                          <div className="shrink-0 bg-paper-3 text-ink-muted px-2.5 py-0.5 rounded-control text-xs font-normal">
                            Presupuesto a convenir
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                        {req.description}
                      </p>
                    </div>

                    {/* Actions & Offers */}
                    <div className="pt-3 border-t border-rule flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(req.id)}
                        className="text-xs font-medium text-ink hover:text-accent flex items-center gap-1.5 focus-visible:outline-focus rounded-sm tabular-nums"
                      >
                        <MessageSquare size={14} className="text-accent" />
                        <span>
                          {req.offers?.length || 0} {req.offers?.length === 1 ? 'oferta recibida' : 'ofertas recibidas'}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`motion-safe:transition-transform duration-short ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <div className="flex items-center gap-2">
                        {!isOwner && req.status === 'OPEN' && isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => handleOpenOfferModal(req)}
                            className="h-8 px-3 bg-navy hover:opacity-90 text-navy-ink font-semibold text-xs rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
                          >
                            <Send size={12} />
                            <span>Tengo este artículo (Hacer oferta)</span>
                          </button>
                        )}

                        {isOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(req)}
                              className={`h-8 px-3 rounded-control text-xs font-medium border motion-safe:transition-colors duration-micro flex items-center gap-1 focus-visible:outline-focus ${
                                req.status === 'OPEN'
                                  ? 'border-status-success text-status-success hover:bg-status-success-subtle'
                                  : 'border-rule text-ink hover:bg-paper-3'
                              }`}
                            >
                              <CheckCircle2 size={13} />
                              <span>{req.status === 'OPEN' ? 'Marcar conseguido' : 'Reabrir'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id)}
                              className="h-8 px-2 text-status-error hover:bg-status-error-subtle rounded-control text-xs font-medium motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                              title="Eliminar petición"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED OFFERS */}
                  {isExpanded && (
                    <div className="bg-paper/50 p-5 sm:p-6 border-t border-rule space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5 tabular-nums">
                          <MessageSquare size={13} className="text-accent" />
                          <span>Propuestas de compañeros ({req.offers?.length || 0})</span>
                        </h3>
                      </div>

                      {!hasOffers ? (
                        <p className="text-xs text-ink-muted py-2">
                          Aún no hay propuestas registradas para esta petición. Si tienes este artículo o material, ¡sé el primero en responderle al compañero!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {req.offers.map((offer) => {
                            const isOfferOwner = user?.id === offer.sellerId;
                            const whatsappNum = offer.seller.whatsapp || offer.seller.phone;
                            const whatsappUrl = whatsappNum
                              ? `https://wa.me/${toWhatsAppClean(whatsappNum)}?text=${encodeURIComponent(
                                  `Hola ${offer.seller.name}, vi tu oferta en CampusMarket para mi solicitud de "${req.title}". Me interesa coordinar contigo en el campus.`
                                )}`
                              : null;

                            return (
                              <div
                                key={offer.id}
                                className="bg-paper-2 rounded-control p-4 border border-rule shadow-sm space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-2.5">
                                  <div className="flex items-center gap-2">
                                    {offer.seller.avatar ? (
                                      <img
                                        src={offer.seller.avatar}
                                        alt={offer.seller.name}
                                        className="w-6 h-6 rounded-pill object-cover border border-rule shrink-0"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-pill bg-navy text-accent text-xs font-semibold flex items-center justify-center shrink-0">
                                        {offer.seller.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-xs font-semibold text-ink">
                                      {offer.seller.name}
                                    </span>
                                    {offer.seller.career && (
                                      <span className="text-xs text-ink-muted">
                                        • {offer.seller.career}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {offer.price && (
                                      <span className="text-xs font-medium text-status-success bg-status-success-subtle px-2 py-0.5 rounded-sm border border-status-success/30 tabular-nums">
                                        Ofrece: {formatCOP(offer.price)}
                                      </span>
                                    )}
                                    <span className="text-xs text-ink-muted tabular-nums">
                                      {new Date(offer.createdAt).toLocaleDateString('es-CO', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-ink-muted leading-relaxed">
                                  {offer.message}
                                </p>

                                {/* Linked product */}
                                {offer.product && (
                                  <div className="flex items-center gap-3 p-2 bg-paper-3 rounded-control border border-rule">
                                    {offer.product.images?.[0] ? (
                                      <img
                                        src={offer.product.images[0]}
                                        alt={offer.product.title}
                                        className="w-11 h-11 object-cover rounded-sm shrink-0"
                                      />
                                    ) : (
                                      <div className="w-11 h-11 bg-navy text-accent rounded-sm flex items-center justify-center font-semibold text-xs shrink-0">
                                        CMP
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-ink truncate">
                                        {offer.product.title}
                                      </p>
                                      <p className="text-xs font-semibold text-accent-ink dark:text-accent tabular-nums">
                                        {formatCOP(offer.product.price)}
                                      </p>
                                    </div>
                                    <Link
                                      to={`/products/${offer.product.id}`}
                                      className="h-8 px-3 bg-paper-2 border border-rule text-ink text-xs font-semibold rounded-control flex items-center gap-1.5 hover:bg-paper-3 shrink-0 motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
                                    >
                                      <span>Ver artículo</span>
                                      <ExternalLink size={12} className="shrink-0" />
                                    </Link>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                  {whatsappUrl ? (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-status-success hover:underline focus-visible:outline-focus"
                                    >
                                      <MessageCircle size={14} />
                                      <span>Hablar por WhatsApp con el compañero</span>
                                    </a>
                                  ) : (
                                    <span className="text-xs text-ink-muted">Contacto mediante perfil de campus</span>
                                  )}

                                  {isOfferOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOffer(offer.id)}
                                      className="text-xs text-status-error hover:underline flex items-center gap-1 ml-auto focus-visible:outline-focus"
                                    >
                                      <Trash2 size={11} />
                                      <span>Retirar mi oferta</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: PUBLISH NEW REQUEST */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publicar lo que buscas en el Campus"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <p className="text-xs text-ink-muted">
            Detalla claramente el artículo, libro o material que requieres para tus clases en el Centro Tutorial Cereté.
          </p>

          {createError && (
            <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              ¿Qué estás buscando? *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej: Libro de Cálculo Stewart 7ma edición o Bata de laboratorio"
              className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Descripción y detalles *
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Especifica edición, estado aceptable (usado o nuevo), talla o semestre..."
              className="w-full p-2.5 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Presupuesto máximo (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted">$</span>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(formatCOPInput(e.target.value))}
                  placeholder="35.000"
                  className="w-full h-10 pl-7 pr-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus tabular-nums"
                />
              </div>
              <span className="text-xs text-ink-muted mt-1 block font-normal">Opcional (déjalo vacío si es a convenir)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Carrera / Programa
              </label>
              <input
                type="text"
                value={newCareer}
                onChange={(e) => setNewCareer(e.target.value)}
                placeholder={user?.career || 'Ej: Ingeniería de Sistemas'}
                className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus"
              />
              <span className="text-xs text-ink-muted mt-1 block font-normal">Para identificar tu facultad</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-rule">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="h-10 px-4 rounded-control text-xs sm:text-sm font-medium text-ink-muted hover:bg-paper-3 motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingRequest}
              className="h-10 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
            >
              <span>{isSubmittingRequest ? 'Publicando...' : 'Publicar Solicitud'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REPLY OFFER */}
      <Modal
        isOpen={!!activeRequestForOffer}
        onClose={() => setActiveRequestForOffer(null)}
        title={`Hacer oferta a: ${activeRequestForOffer?.title || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitOffer} className="space-y-4">
          <p className="text-xs text-ink-muted">
            Proponle tu artículo al compañero. Puedes adjuntar un precio propuesto y vincular una publicación existente.
          </p>

          {offerError && (
            <div className="p-3 bg-status-error-subtle border border-status-error/30 rounded-control text-xs text-status-error flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{offerError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Mensaje de tu oferta *
            </label>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              rows={3}
              placeholder="Ej: Tengo el libro en excelente estado, con portada forrada..."
              className="w-full p-2.5 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">
              Precio propuesto (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-muted">$</span>
              <input
                type="text"
                value={offerPrice}
                onChange={(e) => setOfferPrice(formatCOPInput(e.target.value))}
                placeholder="Ej: 30.000"
                className="w-full h-10 pl-7 pr-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus tabular-nums"
              />
            </div>
          </div>

          {myProducts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-ink mb-1">
                Vincular publicación existente (opcional)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink focus-visible:outline-focus"
              >
                <option value="">-- No vincular producto --</option>
                {myProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCOP(p.price)})
                  </option>
                ))}
              </select>
              <span className="text-xs text-ink-muted mt-1 block font-normal">
                Permite al solicitante ver tus fotos y comprar con 1 clic
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-rule">
            <button
              type="button"
              onClick={() => setActiveRequestForOffer(null)}
              className="h-10 px-4 rounded-control text-xs sm:text-sm font-medium text-ink-muted hover:bg-paper-3 motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingOffer}
              className="h-10 px-5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 disabled:opacity-50 focus-visible:outline-focus whitespace-nowrap"
            >
              <span>{isSubmittingOffer ? 'Enviando...' : 'Enviar Propuesta'}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
