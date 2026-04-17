import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag } from 'lucide-react';
import { translations, Language } from './i18n';
import { useAppStore } from './store';

const CATEGORIES = {
  hairType: ['type_straight', 'type_wavy', 'type_curly', 'type_coily'],
  concern: ['concern_frizz', 'concern_damage', 'concern_dryness', 'concern_scalp'],
  ingredient: ['ing_argan', 'ing_marula', 'ing_jojoba', 'ing_rosemary']
};

export default function ShopView({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { products, trackProductView, searchQuery, setSearchQuery, addToCart } = useAppStore();
  
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({
    hairType: [],
    concern: [],
    ingredient: []
  });
  
  // Debounced search internal state
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);
  
  useEffect(() => setLocalSearch(searchQuery), [searchQuery]);

  const handleFilterToggle = (category: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearAll = () => {
    setActiveFilters({ hairType: [], concern: [], ingredient: [] });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Check Search Match
      const searchMatch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ingredient.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
        
      if (!searchMatch) return false;

      // 2. Check Filters Match
      const typeMatch = activeFilters.hairType.length === 0 || p.type.some(t => activeFilters.hairType.includes(t));
      const concernMatch = activeFilters.concern.length === 0 || p.concern.some(c => activeFilters.concern.includes(c));
      const ingMatch = activeFilters.ingredient.length === 0 || p.ingredient.some(i => activeFilters.ingredient.includes(i));
      return typeMatch && concernMatch && ingMatch;
    });
  }, [activeFilters, products, searchQuery]);

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      {/* Filters Sidebar */}
      <aside className="flex flex-col gap-8">
        <div className="flex justify-between items-center border-b border-brand-ink/10 pb-4">
          <h3 className="font-serif text-2xl">{(t as any).filters}</h3>
          {(activeFilters.hairType.length > 0 || activeFilters.concern.length > 0 || activeFilters.ingredient.length > 0) && (
            <button onClick={clearAll} className="text-[10px] uppercase tracking-widest text-brand-accent hover:opacity-70 transition-opacity">
              {(t as any).clearAll}
            </button>
          )}
        </div>
        
        {/* Render categories */}
        {Object.entries(CATEGORIES).map(([catKey, options]) => (
          <div key={catKey}>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/50 mb-4">{(t as any)[catKey]}</h4>
            <div className="flex flex-col gap-3">
              {options.map(opt => {
                const isActive = activeFilters[catKey].includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${isActive ? 'border-brand-ink bg-brand-ink' : 'border-brand-ink/20 group-hover:border-brand-ink/50'}`}>
                      {isActive && <div className="w-1.5 h-1.5 bg-brand-bg md:w-2 md:h-2" />}
                    </div>
                    {/* Hidden input for accessibility */}
                    <input type="checkbox" className="hidden" checked={isActive} onChange={() => handleFilterToggle(catKey, opt)} />
                    <span className={`text-[13px] tracking-wide ${isActive ? 'font-medium' : 'text-brand-ink/80'}`}>
                      {(t as any)[opt]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
      
      {/* Products Grid */}
      <div>
        <div className="mb-8 flex flex-col gap-4 border-b border-brand-ink/10 pb-6 md:border-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
            <h2 className="font-serif text-3xl md:text-5xl">{t.shopAll}</h2>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 rtl:left-auto rtl:right-4" size={16} />
              <input 
                type="text" 
                placeholder="Search products, ingredients..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-brand-image/50 border border-brand-ink/10 rounded-full py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">
              {filteredProducts.length} {(t as any).results}
            </span>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-brand-ink/50 font-serif text-xl md:text-2xl border border-brand-ink/5 bg-brand-card/50">
            {(t as any).noResults}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={product.id} 
                  className="flex flex-col group cursor-pointer"
                  onClick={() => trackProductView(product.id)}
                >
                  <div className="w-full aspect-[4/5] bg-brand-image mb-4 relative overflow-hidden flex items-center justify-center transition-colors duration-700">
                    <img 
                      src={`https://picsum.photos/seed/${product.img}/400/500`} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-multiply opacity-80 dark:mix-blend-screen dark:opacity-50 group-hover:scale-105 group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:opacity-100 dark:group-hover:mix-blend-normal dark:group-hover:opacity-100 transition-all duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute bottom-4 start-4 end-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                        className="w-full bg-brand-ink text-brand-bg py-3 px-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors flex items-center justify-between"
                      >
                        <span>{(t as any).quickAdd}</span>
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-serif text-lg leading-tight group-hover:text-brand-accent transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[13px] opacity-60 mt-1">{product.price}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
