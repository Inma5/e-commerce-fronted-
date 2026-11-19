import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ThemeToggle } from './ThemeToggle';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Store,
  Plus,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-navy border-b border-rule-2 shadow-sm text-navy-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus-visible:outline-focus">
            <div className="w-9 h-9 rounded-control bg-paper-2 border border-rule-2 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/icon.png"
                alt="CampusMarket"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-navy-ink">
                Campus<span className="text-accent">Market</span>
              </span>
              <span className="block text-xs text-ink-muted -mt-0.5 font-normal">
                Centro Tutorial Cereté
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2.5">
            <Link
              to="/requests"
              className="text-xs font-medium text-navy-ink hover:text-accent motion-safe:transition-colors duration-micro flex items-center gap-1.5 px-3.5 py-2 rounded-control hover:bg-paper-3/20 border border-transparent hover:border-rule-2 focus-visible:outline-focus whitespace-nowrap"
              title="Mural de solicitudes y peticiones estudiantiles"
            >
              <Compass size={15} className="text-accent shrink-0" />
              <span>Mural Estudiantil</span>
            </Link>

            {isAuthenticated && isSeller && (
              <>
                <Link
                  to="/seller"
                  className="text-xs font-medium text-navy-ink bg-paper-3/15 hover:bg-paper-3/25 px-3.5 py-2 rounded-control border border-rule-2 hover:border-accent motion-safe:transition-colors duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
                >
                  <Store size={14} className="text-accent shrink-0" />
                  <span>Panel Vendedor</span>
                </Link>
                <Link
                  to="/seller?action=new"
                  className="text-xs font-semibold text-accent-ink bg-accent hover:opacity-90 active:opacity-95 px-3.5 py-2 rounded-control shadow-sm motion-safe:transition-opacity duration-micro flex items-center gap-1.5 focus-visible:outline-focus whitespace-nowrap"
                >
                  <Plus size={14} className="shrink-0" />
                  <span>Publicar Producto</span>
                </Link>
              </>
            )}

            {isAuthenticated && !isSeller && (
              <Link
                to="/orders"
                className="text-xs font-medium text-navy-ink hover:text-accent motion-safe:transition-colors duration-micro flex items-center gap-1.5 px-3.5 py-2 rounded-control focus-visible:outline-focus whitespace-nowrap"
              >
                <PackageCheck size={16} className="shrink-0" />
                <span>Mis Pedidos</span>
              </Link>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            {!isSeller && (
              <Link
                to="/cart"
                className="relative p-2 rounded-control text-navy-ink hover:text-accent hover:bg-paper-3/15 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                title="Carrito de compras"
              >
                <ShoppingBag size={19} />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-ink font-semibold text-xs tabular-nums w-5 h-5 rounded-pill flex items-center justify-center shadow-sm">
                    {totalCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-control border border-rule-2 hover:border-accent bg-paper-3/15 text-navy-ink motion-safe:transition-colors duration-micro text-left focus-visible:outline-focus"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-sm object-cover border border-rule-2"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-sm bg-navy text-accent font-semibold flex items-center justify-center text-xs border border-rule-2">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-navy-ink leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {user.role === 'VENDEDOR' ? 'Vendedor' : 'Estudiante'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-ink-muted motion-safe:transition-transform duration-short ${
                      isProfileDropdownOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-card border border-rule bg-paper-2 text-ink shadow-card overflow-hidden z-50 motion-safe:transition-opacity duration-micro"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    role="menu"
                    aria-label="Menú de usuario"
                  >
                    {/* Header */}
                    <div className="px-3.5 py-3 border-b border-rule bg-paper-2">
                      <div className="flex items-center gap-2.5">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-pill object-cover border border-rule shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-pill bg-navy text-accent font-semibold flex items-center justify-center text-xs shrink-0 border border-rule">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                          <span className="font-semibold text-sm text-ink truncate leading-tight" title={user.name}>
                            {user.name}
                          </span>
                          {(isSeller || user.role === 'VENDEDOR') && (
                            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-pill bg-accent-subtle text-accent-ink dark:text-accent border border-accent/40">
                              Vendedor
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="p-1.5 space-y-0.5" role="none">
                      <Link
                        to="/seller"
                        role="menuitem"
                        className="flex h-9 items-center gap-2.5 px-3.5 text-xs font-medium text-ink hover:bg-paper-3 rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
                      >
                        <LayoutDashboard size={15} className="text-ink shrink-0" />
                        <span>Panel de ventas</span>
                      </Link>

                      <Link
                        to="/seller?action=new"
                        role="menuitem"
                        className="flex h-9 items-center justify-between px-3.5 text-xs font-medium text-ink bg-paper-3 hover:bg-paper-3/80 border border-rule rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2.5">
                          <Plus size={15} className="text-accent shrink-0" />
                          <span>Publicar producto</span>
                        </div>
                      </Link>

                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex h-9 items-center gap-2.5 px-3.5 text-xs font-medium text-ink hover:bg-paper-3 rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
                      >
                        <UserIcon size={15} className="text-ink shrink-0" />
                        <span>Mi perfil</span>
                      </Link>

                      {/* Separator & Logout */}
                      <div className="pt-1 mt-1 border-t border-rule" role="none">
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full flex h-9 items-center gap-2.5 px-3.5 text-xs font-medium text-status-error hover:bg-status-error-subtle rounded-control motion-safe:transition-colors duration-micro focus-visible:outline-focus text-left whitespace-nowrap"
                        >
                          <LogOut size={15} className="text-status-error shrink-0" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-navy-ink hover:text-accent motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-accent-ink bg-accent hover:opacity-90 active:opacity-95 rounded-control motion-safe:transition-opacity duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger & cart button */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />
            {!isSeller && (
              <Link
                to="/cart"
                className="relative p-2 text-navy-ink focus-visible:outline-focus"
                title="Carrito"
              >
                <ShoppingBag size={20} />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-ink font-semibold text-xs tabular-nums w-4 h-4 rounded-pill flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-navy-ink hover:text-accent focus-visible:outline-focus"
              aria-label="Abrir menú de navegación"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-rule-2 bg-navy px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && user && (
            <div className="p-3 bg-paper-3/15 rounded-control border border-rule-2 space-y-2">
              <div className="flex items-center gap-2.5">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-pill object-cover border border-rule-2 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-pill bg-navy text-accent font-semibold flex items-center justify-center text-xs shrink-0 border border-rule-2">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                  <p className="font-semibold text-navy-ink text-sm truncate">{user.name}</p>
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-pill bg-accent-subtle text-accent border border-accent/40">
                    {user.role === 'VENDEDOR' ? 'Vendedor' : 'Estudiante'}
                  </span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-rule-2/60 flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="shrink-0 font-normal">Conectado como:</span>
                <span className="truncate text-navy-ink font-medium" title={user.email}>
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/requests"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-2.5 rounded-control text-xs font-medium text-navy-ink bg-paper-3/15 hover:bg-paper-3/25 border border-rule-2 flex items-center justify-between mb-2 motion-safe:transition-colors duration-micro"
            >
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-accent shrink-0" />
                <span>Mural Estudiantil</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-pill bg-navy text-accent border border-accent/30 font-medium">
                Peticiones
              </span>
            </Link>

            {isAuthenticated && isSeller && (
              <>
                <Link
                  to="/seller"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-control text-xs font-semibold text-navy-ink bg-paper-3/15 border border-rule-2"
                >
                  Panel Vendedor
                </Link>
                <Link
                  to="/seller?action=new"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-control text-xs font-semibold text-accent-ink bg-accent"
                >
                  + Publicar Nuevo Producto
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {!isSeller && (
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-control text-xs font-medium text-navy-ink hover:bg-paper-3/15"
                  >
                    Mis Pedidos
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-control text-xs font-medium text-navy-ink hover:bg-paper-3/15"
                >
                  Mi Perfil Universitario
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-control text-xs font-medium text-status-error hover:bg-paper-3/15 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2 rounded-control border border-rule-2 text-navy-ink font-medium text-xs hover:bg-paper-3/15"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2 rounded-control bg-accent text-accent-ink font-semibold text-xs"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile visual mode */}
            <div className="pt-3 border-t border-rule-2 space-y-1.5">
              <span className="block text-xs font-normal text-ink-muted px-1">
                Modo visual
              </span>
              <ThemeToggle variant="segmented" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
