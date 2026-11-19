import React from 'react';
import { Category, ProductCondition } from '../../types';
import {
  Search,
  Filter,
  RotateCcw,
  Layers,
  BookOpen,
  Laptop,
  PenTool,
  Utensils,
  Shirt,
  Printer,
  Backpack,
  LayoutGrid,
} from 'lucide-react';
import { formatCOPInput } from '../../utils/format';

interface ProductFilterProps {
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  condition: ProductCondition | '';
  onConditionChange: (cond: ProductCondition | '') => void;
  minPrice: string;
  onMinPriceChange: (val: string) => void;
  maxPrice: string;
  onMaxPriceChange: (val: string) => void;
  onReset: () => void;
  totalProducts?: number;
}

const getCategoryIcon = (nameOrSlug: string, isSelected: boolean) => {
  const s = nameOrSlug.toLowerCase();
  const iconProps = {
    size: 14,
    className: isSelected ? 'text-accent shrink-0' : 'text-ink-muted shrink-0',
  };
  if (s.includes('libro')) return <BookOpen {...iconProps} />;
  if (s.includes('tecno') || s.includes('calcula')) return <Laptop {...iconProps} />;
  if (s.includes('papel') || s.includes('útil')) return <PenTool {...iconProps} />;
  if (s.includes('snack') || s.includes('comida')) return <Utensils {...iconProps} />;
  if (s.includes('ropa') || s.includes('merch')) return <Shirt {...iconProps} />;
  if (s.includes('servici') || s.includes('impresi')) return <Printer {...iconProps} />;
  return <Backpack {...iconProps} />;
};

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  condition,
  onConditionChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onReset,
  totalProducts,
}) => {
  const hasActiveFilters =
    search || selectedCategory || condition || minPrice || maxPrice;

  return (
    <div className="bg-paper-2 rounded-card border border-rule shadow-sm p-4 sm:p-5 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar libros, calculadoras, útiles, snacks..."
          className="w-full pl-10 pr-16 h-10 bg-paper-2 border border-rule rounded-control text-xs sm:text-sm text-ink placeholder:text-ink-muted focus-visible:outline-focus motion-safe:transition-colors duration-micro"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-xs font-medium focus-visible:outline-focus"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Category Horizontal Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Layers size={13} className="text-accent" />
            <span>Categorías del campus</span>
          </span>
          {totalProducts !== undefined && (
            <span className="text-xs text-ink-muted font-normal tabular-nums">
              {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-control text-xs font-medium whitespace-nowrap motion-safe:transition-colors duration-micro flex items-center gap-1.5 focus-visible:outline-focus ${
              selectedCategory === ''
                ? 'bg-navy text-navy-ink shadow-sm'
                : 'bg-paper text-ink-muted hover:bg-paper-3 hover:text-ink border border-rule'
            }`}
          >
            <LayoutGrid size={13} className={selectedCategory === '' ? 'text-accent' : 'text-ink-muted'} />
            <span>Todas</span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-control text-xs font-medium whitespace-nowrap motion-safe:transition-colors duration-micro flex items-center gap-1.5 focus-visible:outline-focus ${
                  isSelected
                    ? 'bg-navy text-navy-ink shadow-sm'
                    : 'bg-paper text-ink-muted hover:bg-paper-3 hover:text-ink border border-rule'
                }`}
              >
                {getCategoryIcon(cat.name, isSelected)}
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-sm tabular-nums ${
                      isSelected
                        ? 'bg-paper-3/20 text-accent font-semibold'
                        : 'bg-paper-3 text-ink-muted'
                    }`}
                  >
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category, Condition & Price Range Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5 border-t border-rule">
        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center gap-1">
            <Layers size={12} className="text-ink-muted" />
            <span>Categoría</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs font-medium text-ink focus-visible:outline-focus"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat._count?.products !== undefined ? `(${cat._count.products})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center gap-1">
            <Filter size={12} className="text-ink-muted" />
            <span>Condición</span>
          </label>
          <select
            value={condition}
            onChange={(e) => onConditionChange(e.target.value as ProductCondition | '')}
            className="w-full h-10 px-3 bg-paper-2 border border-rule rounded-control text-xs font-medium text-ink focus-visible:outline-focus"
          >
            <option value="">Todas las condiciones</option>
            <option value="NUEVO">Nuevo</option>
            <option value="COMO_NUEVO">Como nuevo</option>
            <option value="USADO_BUENO">Usado - Buen estado</option>
            <option value="USADO_REGULAR">Usado - Regular</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Precio mínimo (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-semibold text-xs">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="10.000"
              value={minPrice}
              onChange={(e) => onMinPriceChange(formatCOPInput(e.target.value))}
              className="w-full h-10 pl-7 pr-3 bg-paper-2 border border-rule rounded-control text-xs font-medium text-ink placeholder:text-ink-muted focus-visible:outline-focus tabular-nums"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5">
            Precio máximo (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted font-semibold text-xs">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="200.000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(formatCOPInput(e.target.value))}
              className="w-full h-10 pl-7 pr-3 bg-paper-2 border border-rule rounded-control text-xs font-medium text-ink placeholder:text-ink-muted focus-visible:outline-focus tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Reset button if active */}
      {hasActiveFilters && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onReset}
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 font-medium h-9 px-3.5 rounded-control hover:bg-paper-3 motion-safe:transition-colors duration-micro whitespace-nowrap focus-visible:outline-focus"
          >
            <RotateCcw size={12} />
            <span>Restablecer filtros</span>
          </button>
        </div>
      )}
    </div>
  );
};
