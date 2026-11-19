import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Plus, MessageSquare, Clock, GraduationCap } from 'lucide-react';
import { requestsService } from '../../services/requests.service';
import { StudentRequest } from '../../types';
import { formatCOP } from '../../utils/format';

export const MuralShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [recentRequests, setRecentRequests] = useState<StudentRequest[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    requestsService
      .getRequests({ limit: 3, status: 'OPEN' })
      .then((res) => {
        if (isMounted) {
          setRecentRequests(res.requests || []);
          setTotalCount(res.pagination?.total || (res.requests ? res.requests.length : 0));
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecentRequests([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="mural-showcase-title"
      className={`space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-control bg-paper-3 border border-rule flex items-center justify-center text-accent shrink-0">
              <Compass size={16} />
            </div>
            <h2
              id="mural-showcase-title"
              className="text-base sm:text-lg font-semibold text-ink tracking-tight"
            >
              Mural Estudiantil <span className="text-accent">· Se Busca</span>
            </h2>
            {totalCount > 0 && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium bg-status-success-subtle text-status-success border border-status-success/30 tabular-nums">
                {totalCount} {totalCount === 1 ? 'petición activa' : 'peticiones activas'}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed max-w-2xl font-normal">
            ¿No encuentras lo que buscas en el catálogo? Pídelo a tus compañeros o responde a quienes buscan materiales académicos en el Centro Tutorial Cereté.
          </p>
        </div>

        {/* Main actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/requests?action=new"
            className="h-10 px-4 bg-accent hover:opacity-90 active:opacity-95 text-accent-ink font-semibold text-xs sm:text-sm rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
          >
            <Plus size={15} className="shrink-0" />
            <span>Publicar lo que busco</span>
          </Link>
          <Link
            to="/requests"
            className="h-10 px-4 bg-paper-3 hover:bg-paper-3/80 text-ink font-medium text-xs sm:text-sm rounded-control border border-rule motion-safe:transition-colors duration-micro flex items-center gap-1 focus-visible:outline-focus whitespace-nowrap"
          >
            <span>Ver todo el mural</span>
            <ArrowRight size={14} className="text-accent shrink-0" />
          </Link>
        </div>
      </div>

      {/* Grid of recent requests */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-paper rounded-card p-4 border border-rule animate-pulse space-y-3"
            >
              <div className="h-3.5 bg-paper-3 rounded w-2/3" />
              <div className="h-5 bg-paper-3 rounded w-4/5" />
              <div className="h-3 bg-paper-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : recentRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {recentRequests.map((req) => (
            <Link
              key={req.id}
              to="/requests"
              className="group bg-paper hover:bg-paper-2 rounded-card p-4 border border-rule hover:border-accent motion-safe:transition-colors duration-micro flex flex-col justify-between space-y-3 shadow-sm focus-visible:outline-focus"
            >
              <div className="space-y-2">
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1 truncate font-medium max-w-[170px]">
                    <GraduationCap size={12} className="text-accent shrink-0" />
                    <span className="truncate">{req.career || req.user.name}</span>
                  </span>
                  <span className="shrink-0 flex items-center gap-0.5 text-ink-muted tabular-nums">
                    <Clock size={11} />
                    {new Date(req.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {/* Title & description */}
                <div>
                  <h3 className="text-sm font-semibold text-ink leading-snug line-clamp-1 group-hover:text-accent motion-safe:transition-colors duration-micro">
                    {req.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              </div>

              {/* Budget & Offers */}
              <div className="pt-2 border-t border-rule flex items-center justify-between text-xs">
                {req.maxBudget ? (
                  <span className="font-semibold text-accent-ink dark:text-accent text-xs bg-accent-subtle px-2 py-0.5 rounded-sm border border-accent/30 tabular-nums">
                    Máx: {formatCOP(req.maxBudget)}
                  </span>
                ) : (
                  <span className="text-xs text-ink-muted font-normal">
                    A convenir
                  </span>
                )}

                <span className="text-xs font-medium text-ink flex items-center gap-1 tabular-nums">
                  <MessageSquare size={12} className="text-accent shrink-0" />
                  <span>{req.offers?.length || 0} {req.offers?.length === 1 ? 'oferta' : 'ofertas'}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-card bg-paper border border-rule space-y-1.5">
            <div className="w-7 h-7 rounded-sm bg-paper-3 text-ink flex items-center justify-center font-semibold text-xs tabular-nums">
              01
            </div>
            <h4 className="text-xs font-semibold text-ink">
              Libros y calculadoras
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Pide libros de cálculo, física, calculadoras científicas y apuntes de semestres anteriores.
            </p>
          </div>

          <div className="p-4 rounded-card bg-paper border border-rule space-y-1.5">
            <div className="w-7 h-7 rounded-sm bg-paper-3 text-ink flex items-center justify-center font-semibold text-xs tabular-nums">
              02
            </div>
            <h4 className="text-xs font-semibold text-ink">
              Batas y materiales
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Consigue equipo de laboratorio, útiles de dibujo técnico y herramientas para tus clases.
            </p>
          </div>

          <div className="p-4 rounded-card bg-paper border border-rule space-y-1.5">
            <div className="w-7 h-7 rounded-sm bg-paper-3 text-ink flex items-center justify-center font-semibold text-xs tabular-nums">
              03
            </div>
            <h4 className="text-xs font-semibold text-ink">
              Responde y coordina
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Si tienes artículos que no utilizas, propón una oferta y coordina la entrega en el campus Cereté.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
