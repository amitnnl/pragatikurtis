import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
      active
        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
        : 'bg-surface text-text-700 border-muted/20 hover:border-accent hover:text-accent'
    }`}>
    {label}
  </button>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
};

export default function Shop({ onAddToCart, onToggleWishlist, wishlist, user }) {
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Kurti', 'Gown', 'Suit Set', 'Lehenga', 'Saree', 'Afghani Suits', 'Straight Suits', 'Anarkali Suits'];
  const fabrics = ['All', 'Cotton', 'Silk', 'Georgette', 'Rayon', 'Chiffon'];
  const occasions = ['All', 'Casual', 'Party', 'Wedding', 'Festive'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  useEffect(() => {
    const fetchShopProducts = async () => {
      setLoading(true); setError(null);
      const params = new URLSearchParams({ min_price: priceRange[0], max_price: priceRange[1], sort_by: sortBy });
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedColor !== 'All') params.append('color', selectedColor);
      if (selectedFabric !== 'All') params.append('fabric', selectedFabric);
      if (selectedOccasion !== 'All') params.append('occasion', selectedOccasion);
      try {
        const response = await authFetch(`/products.php?${params}`);
        const result = await response.json();
        setShopProducts(result.products || []);
        setTotalProducts(result.total_products || 0);
      } catch { setError('Failed to load products.'); }
      finally { setLoading(false); }
    };
    fetchShopProducts();
  }, [selectedCategory, priceRange, searchTerm, sortBy, selectedColor, selectedFabric, selectedOccasion]);

  const resetFilters = () => {
    setSelectedCategory('All'); setPriceRange([0, 20000]);
    setSelectedColor('All'); setSelectedFabric('All'); setSelectedOccasion('All'); setSearchTerm('');
  };
  const hasFilters = selectedCategory !== 'All' || selectedFabric !== 'All' || selectedOccasion !== 'All' || searchTerm;

  return (
    <div className="bg-surface">
      <SEO title="Shop — The Collection" description="Browse our exclusive collection of Kurtis, Gowns, Suit Sets, and more." />

      {/* Hero Header */}
      <div className="pt-32 pb-12 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <div className="relative container mx-auto px-6">
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our Collection</p>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white">The Collection</h1>
          <p className="text-white/40 mt-2 text-sm">Home / Shop</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text" placeholder="Search collection…"
              className="input-field pl-10 py-2.5 text-sm w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50 w-4 h-4" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text-700">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface border-muted/20 text-text-700 hover:border-accent'}`}>
            <SlidersHorizontal size={15} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>

          {/* Sort */}
          <div className="relative ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer w-44">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none" />
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="text-sm text-muted/60 hover:text-accent transition-colors flex items-center gap-1">
              <X size={14} /> Reset
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8">
              <div className="bg-surface-100 rounded-2xl p-6 border border-muted/10 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category */}
                <div>
                  <p className="text-xs font-bold text-muted/50 uppercase tracking-widest mb-3">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <FilterChip key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
                    ))}
                  </div>
                </div>
                {/* Fabric */}
                <div>
                  <p className="text-xs font-bold text-muted/50 uppercase tracking-widest mb-3">Fabric</p>
                  <div className="flex flex-wrap gap-2">
                    {fabrics.map(f => (
                      <FilterChip key={f} label={f} active={selectedFabric === f} onClick={() => setSelectedFabric(f)} />
                    ))}
                  </div>
                </div>
                {/* Occasion */}
                <div>
                  <p className="text-xs font-bold text-muted/50 uppercase tracking-widest mb-3">Occasion</p>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map(o => (
                      <FilterChip key={o} label={o} active={selectedOccasion === o} onClick={() => setSelectedOccasion(o)} />
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <p className="text-xs font-bold text-muted/50 uppercase tracking-widest mb-3">Price Range</p>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min"
                      value={priceRange[0]}
                      onChange={e => setPriceRange([parseInt(e.target.value || '0'), priceRange[1]])}
                      className="input-field py-2 text-sm w-24" />
                    <span className="text-muted/50">—</span>
                    <input type="number" placeholder="Max"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value || '20000')])}
                      className="input-field py-2 text-sm w-24" />
                  </div>
                  <p className="text-xs text-muted/50 mt-2">₹{priceRange[0]} – ₹{priceRange[1]}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <p className="text-sm text-muted/60 mb-8">
          {loading ? 'Loading…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted/50 text-lg font-light">{error}</p>
          </div>
        ) : shopProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            <AnimatePresence>
              {shopProducts.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} initial="hidden" animate="visible" custom={i} layout>
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === product.id)}
                    user={user}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-muted/10 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-7 h-7 text-muted/30" />
            </div>
            <h3 className="text-xl font-serif text-text-700">No Products Found</h3>
            <p className="text-muted/50 mt-2 font-light">Try adjusting your filters.</p>
            <button onClick={resetFilters} className="mt-6 btn-primary text-sm px-6 py-2.5">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}