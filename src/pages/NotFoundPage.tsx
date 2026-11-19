import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center bg-paper text-ink">
      <div className="max-w-md space-y-5 bg-paper-2 p-8 rounded-card border border-rule shadow-card">
        <div className="w-16 h-16 rounded-control bg-paper border border-rule flex items-center justify-center mx-auto shadow-sm overflow-hidden">
          <img src="/icon.png" alt="CampusMarket" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-bold text-ink tabular-nums">404</h1>
        <h2 className="text-lg font-semibold text-ink">Página no encontrada en el campus</h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          La ruta a la que intentas ingresar no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink rounded-control text-xs sm:text-sm font-semibold motion-safe:transition-opacity duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
        >
          <ArrowLeft size={16} className="shrink-0" /> <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
};
