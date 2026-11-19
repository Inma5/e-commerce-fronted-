import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { Product, Category, ProductCondition } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilter } from '../components/products/ProductFilter';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { MuralShowcase } from '../components/common/MuralShowcase';
import { parseCOP } from '../utils/format';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Laptop,
  PenTool,
  Utensils,
  Shirt,
  Printer,
  Backpack,
  RotateCcw,
  Layers,
} from 'lucide-react';

const getCategoryIcon = (nameOrSlug: string, isSelected: boolean) => {
  const s = nameOrSlug.toLowerCase();
  const iconProps = {
    size: 20,
    className: isSelected ? 'text-accent' : 'text-ink',
  };
  if (s.includes('libro')) return <BookOpen {...iconProps} />;
  if (s.includes('tecno') || s.includes('calcula')) return <Laptop {...iconProps} />;
  if (s.includes('papel') || s.includes('útil')) return <PenTool {...iconProps} />;
  if (s.includes('snack') || s.includes('comida')) return <Utensils {...iconProps} />;
  if (s.includes('ropa') || s.includes('merch')) return <Shirt {...iconProps} />;
  if (s.includes('servici') || s.includes('impresi')) return <Printer {...iconProps} />;
  return <Backpack {...iconProps} />;
};

export const HomePage: React.FC = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [condition, setCondition] = useState<ProductCondition | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getCategories();
        setCategories(data);
      } catch (err) {
        console.warn('Error al cargar categorías:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedMin = minPrice ? parseCOP(minPrice) : undefined;
      const parsedMax = maxPrice ? parseCOP(maxPrice) : undefined;

      const res = await productsService.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        condition: condition || undefined,
        minPrice: parsedMin && parsedMin > 0 ? parsedMin : undefined,
        maxPrice: parsedMax && parsedMax > 0 ? parsedMax : undefined,
        page,
        limit: 12,
      });

      setProducts(Array.isArray(res?.products) ? res.products : []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotalProducts(res?.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setError(
        err.message ||
          'No se pudo conectar con el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, condition, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="min-w-0 pb-16">
      {/* Hero Banner Universitario · Stage Posture */}
      <section className="relative overflow-hidden bg-navy text-navy-ink py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-rule-2">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-control bg-paper-3/15 border border-rule-2 text-accent text-xs font-medium">
              <Sparkles size={13} className="text-accent shrink-0" />
              <span>Mercado universitario de Cereté</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-navy-ink leading-tight">
              Lo que necesitas, <span className="text-accent">entre estudiantes.</span>
            </h1>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-normal max-w-xl">
              Compra y vende en Cereté fácil y entre compañeros.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="#catalogo-productos"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalogo-productos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-accent hover:opacity-90 active:opacity-95 text-accent-ink font-semibold text-sm shadow-sm motion-safe:transition-opacity duration-micro focus-visible:outline-focus whitespace-nowrap"
              >
                <ShoppingBag size={18} className="shrink-0" />
                <span>Explorar productos</span>
              </a>
              <Link
                to={isAuthenticated && isSeller ? '/seller?action=new' : isAuthenticated ? '/seller' : '/login'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-paper-3/20 hover:bg-paper-3/30 active:bg-paper-3/40 border border-rule-2 text-navy-ink font-semibold text-sm shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
              >
                <Plus size={18} className="text-accent shrink-0" />
                <span>Publicar producto</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div id="catalogo-productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6">
        {/* Showcase de Categorías */}
        {categories.length > 0 && (
          <section className="bg-paper-2 border border-rule rounded-card p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-ink tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-accent" />
                  <span>Explorar por categoría</span>
                </h2>
                <p className="text-xs text-ink-muted">
                  Filtra el catálogo académico por facultad o área
                </p>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className="text-xs font-medium text-ink hover:text-accent flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-paper-3 hover:bg-paper-3/80 motion-safe:transition-colors duration-micro focus-visible:outline-focus"
                >
                  <RotateCcw size={12} className="text-accent" />
                  <span>Ver todas</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? '' : cat.id);
                      setPage(1);
                    }}
                    className={`p-3 rounded-control border text-center motion-safe:transition-colors duration-micro flex flex-col items-center justify-center gap-2 group focus-visible:outline-focus ${
                      isSelected
                        ? 'border-navy bg-navy text-navy-ink shadow-sm'
                        : 'border-rule bg-paper text-ink hover:border-navy hover:bg-paper-2'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-control flex items-center justify-center ${
                        isSelected ? 'bg-paper-3/20' : 'bg-paper-3'
                      }`}
                    >
                      {getCategoryIcon(cat.name, isSelected)}
                    </div>
                    <div className="w-full">
                      <span className="block text-xs font-medium leading-tight truncate">
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Mural Estudiantil Showcase */}
        <MuralShowcase />

        {/* Filters and Search Bar */}
        <ProductFilter
          categories={categories}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(id) => {
            setSelectedCategory(id);
            setPage(1);
          }}
          condition={condition}
          onConditionChange={(cond) => {
            setCondition(cond);
            setPage(1);
          }}
          minPrice={minPrice}
          onMinPriceChange={(val) => {
            setMinPrice(val);
            setPage(1);
          }}
          maxPrice={maxPrice}
          onMaxPriceChange={(val) => {
            setMaxPrice(val);
            setPage(1);
          }}
          onReset={handleResetFilters}
          totalProducts={totalProducts}
        />

        {/* Backend alert */}
        {error && (
          <div className="bg-status-error-subtle border border-status-error/30 rounded-card p-5 text-status-error flex items-start gap-3">
            <AlertCircle size={22} className="shrink-0 mt-0.5 text-status-error" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">No se pudo cargar el catálogo de productos</h4>
              <p className="text-xs text-status-error leading-relaxed">{error}</p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-status-error hover:opacity-90 active:opacity-95 text-white text-xs font-semibold rounded-control motion-safe:transition-opacity duration-micro flex items-center gap-1.5 shadow-sm focus-visible:outline-focus whitespace-nowrap"
                >
                  <RefreshCw size={13} className="shrink-0" />
                  <span>Reintentar conexión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (products && products.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !error ? (
          <div className="bg-paper-2 rounded-card border border-rule p-8 sm:p-10 text-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-paper-3 text-ink rounded-control flex items-center justify-center mx-auto border border-rule">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {search || selectedCategory || condition || minPrice || maxPrice
                  ? 'No se encontraron productos'
                  : 'Aún no hay productos publicados en el campus'}
              </h3>
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                {search || selectedCategory || condition || minPrice || maxPrice
                  ? 'Intenta ajustar o limpiar tus filtros de búsqueda para encontrar publicaciones universitarias.'
                  : 'Sé el primero en publicar libros, apuntes o útiles académicos para la comunidad del Centro Tutorial Cereté.'}
              </p>
            </div>
            {search || selectedCategory || condition || minPrice || maxPrice ? (
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink text-xs sm:text-sm font-semibold rounded-control motion-safe:transition-opacity duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
              >
                Restablecer filtros
              </button>
            ) : (
              <Link
                to={isAuthenticated && isSeller ? '/seller?action=new' : isAuthenticated ? '/seller' : '/login'}
                className="inline-block px-5 py-2.5 bg-navy hover:opacity-90 active:opacity-95 text-navy-ink text-xs sm:text-sm font-semibold rounded-control motion-safe:transition-opacity duration-micro shadow-sm focus-visible:outline-focus whitespace-nowrap"
              >
                {isAuthenticated && isSeller ? 'Publicar un producto' : 'Iniciar sesión para publicar'}
              </Link>
            )}
          </div>
        ) : null}

        {/* Pagination controls */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-control border border-rule bg-paper-2 text-ink hover:bg-paper-3 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              <ChevronLeft size={16} className="shrink-0" />
              <span>Anterior</span>
            </button>
            <span className="text-xs font-medium text-ink-muted px-3 tabular-nums">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-control border border-rule bg-paper-2 text-ink hover:bg-paper-3 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 shadow-sm motion-safe:transition-colors duration-micro focus-visible:outline-focus whitespace-nowrap"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} className="shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
