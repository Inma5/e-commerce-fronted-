import React, { useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Search,
} from 'lucide-react';

interface Product360ViewerProps {
  images: string[];
  title?: string;
  className?: string;
  badge?: React.ReactNode;
  isSoldOut?: boolean;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  title = 'Producto',
  className = '',
  badge,
  isSoldOut = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hover Zoom States
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const zoomScale = 2.2;

  // Fullscreen modal state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenHovered, setIsFullscreenHovered] = useState(false);
  const [fullscreenMousePos, setFullscreenMousePos] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const activeImages =
    images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'];
  const totalImages = activeImages.length;
  const hasMultiple = totalImages > 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setMousePos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
      setIsHovered(true);
    }
  };

  const handleTouchEnd = () => setIsHovered(false);

  const handleFullscreenMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFullscreenMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Contenedor Principal de la Imagen */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsFullscreen(true)}
        className={`relative aspect-4/3 sm:aspect-16/11 w-full rounded-card overflow-hidden bg-paper-3 border border-rule shadow-sm group select-none ${
          isHovered ? 'cursor-crosshair' : 'cursor-zoom-in'
        }`}
        title="Haz clic para abrir pantalla completa o pasa el cursor para ampliar"
      >
        {/* Capa de Imagen con Zoom en el cursor */}
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            transform: isHovered ? `scale(${zoomScale})` : 'scale(1)',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transition: isHovered
              ? 'transform-origin 0.05s ease-out, transform 0.15s ease-out'
              : 'transform 0.25s ease-out, transform-origin 0.25s ease-out',
          }}
        >
          <img
            src={activeImages[currentIndex]}
            alt={`${title} - Vista ${currentIndex + 1}`}
            className={`w-full h-full object-cover pointer-events-none ${
              isSoldOut ? 'grayscale opacity-60' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800';
            }}
          />
        </div>

        {/* Badge superior izquierdo */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            {badge}
          </div>
        )}

        {/* Contador de fotos */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 bg-navy text-navy-ink px-2.5 py-1 rounded-control text-xs font-medium flex items-center gap-1.5 z-10 border border-rule-2 shadow-sm pointer-events-none tabular-nums">
            <Camera size={13} className="text-accent shrink-0" />
            <span>
              {currentIndex + 1} de {totalImages}
            </span>
          </div>
        )}

        {/* Indicador inferior de lupa */}
        <div className="absolute bottom-3 right-3 bg-paper-2 text-ink px-2.5 py-1 rounded-control text-xs font-medium border border-rule shadow-sm flex items-center gap-1.5 z-10">
          <Search size={13} className="text-accent shrink-0" />
          {isHovered ? (
            <span className="text-xs font-semibold text-accent-ink dark:text-accent">
              Lupa activa
            </span>
          ) : (
            <span className="hidden sm:inline text-xs text-ink-muted">
              Pasa el cursor para zoom
            </span>
          )}

          <div className="w-px h-3 bg-rule mx-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="p-0.5 rounded-sm text-ink hover:text-accent motion-safe:transition-colors duration-micro focus-visible:outline-focus"
            title="Ver en pantalla completa"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Overlay Producto Agotado */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-20 pointer-events-none">
            <span className="bg-status-error text-white font-semibold px-4 py-1.5 rounded-control text-sm shadow-sm">
              Producto agotado
            </span>
          </div>
        )}

        {/* Flechas Laterales de Navegación */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-pill bg-paper-2 text-ink border border-rule flex items-center justify-center shadow-sm hover:bg-paper-3 motion-safe:transition-colors duration-micro z-20 focus-visible:outline-focus"
              aria-label="Ver foto anterior"
              title="Foto anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-pill bg-paper-2 text-ink border border-rule flex items-center justify-center shadow-sm hover:bg-paper-3 motion-safe:transition-colors duration-micro z-20 focus-visible:outline-focus"
              aria-label="Ver foto siguiente"
              title="Foto siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {hasMultiple && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {activeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                className={`relative w-16 h-16 rounded-control overflow-hidden border-2 motion-safe:transition-colors duration-micro shrink-0 bg-paper-2 focus-visible:outline-focus ${
                  currentIndex === idx
                    ? 'border-navy shadow-sm'
                    : 'border-rule hover:border-navy/60 opacity-80 hover:opacity-100'
                }`}
                title={`Ver foto ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Ángulo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-navy text-navy-ink text-xs tabular-nums px-1.5 py-0.2 rounded-sm font-medium">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal Pantalla Completa */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4 sm:p-6 motion-safe:transition-opacity duration-short"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="bg-paper-2 w-full max-w-5xl max-h-[92vh] rounded-card border border-rule shadow-card p-4 sm:p-6 flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-accent" />
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="text-xs text-ink-muted tabular-nums">
                    Foto {currentIndex + 1} de {totalImages}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-control bg-paper-3 hover:bg-paper-3/80 text-ink motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                title="Cerrar modal"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Lienzo Grande del Producto con Zoom */}
            <div
              ref={fullscreenContainerRef}
              onMouseMove={handleFullscreenMouseMove}
              onMouseEnter={() => setIsFullscreenHovered(true)}
              onMouseLeave={() => setIsFullscreenHovered(false)}
              className={`relative flex-1 min-h-[50vh] max-h-[70vh] w-full rounded-control overflow-hidden bg-paper-3 flex items-center justify-center ${
                isFullscreenHovered ? 'cursor-crosshair' : 'cursor-zoom-in'
              }`}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  transform: isFullscreenHovered ? `scale(${zoomScale + 0.4})` : 'scale(1)',
                  transformOrigin: `${fullscreenMousePos.x}% ${fullscreenMousePos.y}%`,
                  transition: isFullscreenHovered
                    ? 'transform-origin 0.05s ease-out, transform 0.15s ease-out'
                    : 'transform 0.25s ease-out, transform-origin 0.25s ease-out',
                }}
              >
                <img
                  src={activeImages[currentIndex]}
                  alt={`${title} - Foto ${currentIndex + 1}`}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Badge informativo en fullscreen */}
              <div className="absolute top-3 left-3 bg-navy text-navy-ink px-2.5 py-1 rounded-control text-xs font-medium flex items-center gap-1.5 border border-rule-2 pointer-events-none">
                <Search size={13} className="text-accent" />
                <span>
                  {isFullscreenHovered ? 'Lupa activa' : 'Mueve el cursor para ampliar detalles'}
                </span>
              </div>

              {/* Flechas de navegación en fullscreen */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-pill bg-paper-2 text-ink border border-rule flex items-center justify-center shadow-md hover:bg-paper-3 motion-safe:transition-colors duration-micro z-20 focus-visible:outline-focus"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-pill bg-paper-2 text-ink border border-rule flex items-center justify-center shadow-md hover:bg-paper-3 motion-safe:transition-colors duration-micro z-20 focus-visible:outline-focus"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas en pantalla completa */}
            {hasMultiple && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 justify-center">
                {activeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectIndex(idx)}
                    className={`w-14 h-14 rounded-control overflow-hidden border-2 motion-safe:transition-colors duration-micro shrink-0 bg-paper-2 focus-visible:outline-focus ${
                      currentIndex === idx
                        ? 'border-navy shadow-sm'
                        : 'border-rule opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
