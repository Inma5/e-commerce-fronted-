import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-navy-ink mt-16 border-t border-rule-2">
      {/* Upper informational section: Three clear value points */}
      <div id="como-funciona" className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Columna 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-control bg-paper-3/15 border border-rule-2 flex items-center justify-center text-accent shrink-0">
                <MapPin size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-navy-ink font-semibold text-sm leading-snug">
                  Entregas en el campus
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Coordina la entrega en un punto del Centro Tutorial Cereté.
                </p>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-control bg-paper-3/15 border border-rule-2 flex items-center justify-center text-accent shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-navy-ink font-semibold text-sm leading-snug">
                  Coordina directamente
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Acuerda horario y lugar con el vendedor por WhatsApp.
                </p>
              </div>
            </div>

            {/* Columna 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-control bg-paper-3/15 border border-rule-2 flex items-center justify-center text-accent shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-navy-ink font-semibold text-sm leading-snug">
                  Compra con confianza
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Revisa la información del vendedor antes de concretar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Masthead separator */}
      <div className="border-t border-rule-2 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left brand identity */}
            <div>
              <span className="font-semibold text-base tracking-tight text-navy-ink block">
                Campus<span className="text-accent">Market</span>
              </span>
              <p className="text-xs text-ink-muted mt-0.5">
                Compra y venta entre estudiantes del Centro Tutorial Cereté.
              </p>
            </div>

            {/* Right navigation links */}
            <nav className="flex items-center gap-5 text-xs text-ink-muted">
              <Link
                to="/"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    document.getElementById('catalogo-productos')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hover:text-accent motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              >
                Explorar productos
              </Link>
              <Link
                to="/requests"
                className="hover:text-accent motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              >
                Mural Estudiantil
              </Link>
              <a
                href="#como-funciona"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-accent motion-safe:transition-colors duration-micro focus-visible:outline-focus"
              >
                Cómo funciona
              </a>
            </nav>
          </div>

          {/* Bottom line */}
          <div className="pt-4 border-t border-rule-2/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
            <p>© {currentYear} CampusMarket · Centro Tutorial Cereté. Todos los derechos reservados.</p>
            <p>Comunidad universitaria</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
