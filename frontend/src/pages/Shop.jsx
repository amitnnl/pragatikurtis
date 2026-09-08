import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-xs tracking-wider uppercase font-semibold transition-all duration-300 border active:scale-95 ${
      active
        ? 'bg-primary text-white border-primary shadow-gold-glow scale-105'
        : 'bg-soft-surface text-text-muted border-border-soft hover:bg-cream hover:text-primary hover:border-primary/40'
    }`}>
    {label}
  </button>
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.6, ease: "easeOut" } }),
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
    { value: 'newest', label: 'Latest Arrivals' },
    { value: 'price_asc', label: 'Price: Accessible First' },
    { value: 'price_desc', label: 'Price: Premium First' },
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
      } catch { setError('Failed to load pieces.'); }
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
    <div className="bg-cream min-h-screen">
      <SEO title="Shop — The Collection | Pragati Kurties" description="Browse our exclusive handmade collection of Kurtis, Gowns, Suit Sets, and elegant traditional wear." />

      {/* Cinematic Luxury Hero Header */}
      <div className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden border-b border-border-soft">
        {/* Background Image & Vignette Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/banners/shop-banner.jpg" 
            alt="The Collection — Pragati Kurties" 
            className="w-full h-full object-cover object-[center_35%] scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Multi-layered dark & royal wine gradient overlay for supreme legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#180e12]/85 via-[#22181C]/75 to-[#180e12]/95 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#22181C]/90 via-[#801B34]/35 to-[#22181C]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/15 via-transparent to-transparent pointer-events-none" />
          {/* Bottom fade into Warm Ivory Silk */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cream to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 text-center z-10 max-w-4xl">
          {/* Eyebrow badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-secondary/40 text-secondary-light text-xs md:text-sm font-semibold tracking-[0.35em] uppercase mb-4 shadow-sm"
          >
            <Sparkles size={13} className="text-secondary animate-pulse" />
            <span>Discover Elegance</span>
            <span className="w-1 h-1 rounded-full bg-secondary"></span>
            <span>Artisanal Edit</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-4xl sm:text-6xl md:text-7xl font-serif text-white leading-[1.1] tracking-tight drop-shadow-lg"
          >
            The Collection
          </motion.h1>

          {/* Editorial Tagline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.18 }}
            className="text-white/85 text-sm md:text-base font-light max-w-2xl mx-auto mt-4 leading-relaxed tracking-wide drop-shadow-sm"
          >
            Handcrafted with authentic zari work, pure silks, and regal silhouettes designed for timeless beauty and memorable celebrations.
          </motion.p>

          {/* Interactive Breadcrumb Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }} 
            className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/75 text-xs tracking-widest uppercase font-semibold border border-white/15"
          >
            <Link to="/" className="hover:text-secondary-light transition-colors">Home</Link>
            <span className="text-secondary">/</span>
            <span className="text-white font-bold">Shop</span>
            {selectedCategory !== 'All' && (
              <>
                <span className="text-secondary">/</span>
                <span className="text-secondary-light">{selectedCategory}</span>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-16 relative z-10">

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 bg-white p-4 md:pl-6 rounded-[2rem] md:rounded-full shadow-card border border-border-soft">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <input
              type="text" placeholder="Search collection…"
              className="w-full bg-soft-surface border-none rounded-full pl-12 pr-10 py-3.5 text-text-dark placeholder-text-muted/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors bg-white rounded-full p-1 shadow-sm">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${showFilters ? 'bg-primary text-white shadow-gold-glow' : 'bg-soft-surface text-text-dark hover:bg-cream hover:text-primary'}`}>
            <SlidersHorizontal size={16} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-primary shadow-sm" />}
          </button>

          {/* Sort */}
          <div className="relative w-full md:w-auto md:ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="w-full md:w-60 bg-soft-surface border-none rounded-full py-3.5 pl-6 pr-12 text-text-dark text-sm font-semibold tracking-wide appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="w-full md:w-auto text-xs tracking-widest uppercase font-bold text-sale hover:text-sale/80 transition-colors flex items-center justify-center gap-1.5 md:mr-4 py-2">
              <X size={16} /> Reset
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-border-soft shadow-card grid grid-cols-1 md:grid-cols-4 gap-10 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
                
                {/* Category */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-[0.2em] mb-4">Category</p>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map(cat => (
                      <FilterChip key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
                    ))}
                  </div>
                </div>
                {/* Fabric */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4">Fabric</p>
                  <div className="flex flex-wrap gap-2.5">
                    {fabrics.map(f => (
                      <FilterChip key={f} label={f} active={selectedFabric === f} onClick={() => setSelectedFabric(f)} />
                    ))}
                  </div>
                </div>
                {/* Occasion */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-success uppercase tracking-[0.2em] mb-4">Occasion</p>
                  <div className="flex flex-wrap gap-2.5">
                    {occasions.map(o => (
                      <FilterChip key={o} label={o} active={selectedOccasion === o} onClick={() => setSelectedOccasion(o)} />
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-4">Price Range</p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Min"
                      value={priceRange[0]}
                      onChange={e => setPriceRange([parseInt(e.target.value || '0'), priceRange[1]])}
                      className="w-24 bg-soft-surface border border-border-soft rounded-xl px-4 py-3 text-text-dark placeholder-text-muted/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                    <span className="text-border-soft font-light">—</span>
                    <input type="number" placeholder="Max"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value || '20000')])}
                      className="w-24 bg-soft-surface border border-border-soft rounded-xl px-4 py-3 text-text-dark placeholder-text-muted/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                  </div>
                  <p className="text-xs font-bold text-text-muted mt-4 tracking-widest">₹{priceRange[0]} – ₹{priceRange[1]}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-8 ml-2 flex items-center gap-2">
          {loading ? (
             <><span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Curating Artisanal Collection…</>
          ) : (
             <><span className="w-2 h-2 rounded-full bg-success"></span> {totalProducts} Piece{totalProducts !== 1 ? 's' : ''} Found</>
          )}
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-soft-surface border border-border-soft shadow-sm animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-border-soft shadow-sm">
            <p className="text-text-muted text-base font-light">{error}</p>
          </div>
        ) : shopProducts.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
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
          <div className="text-center py-28 bg-white border border-border-soft rounded-[3rem] shadow-card relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-white to-white opacity-80"></div>
            <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Filter className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-3xl font-serif text-text-dark mb-3">No Pieces Found</h3>
                <p className="text-text-muted font-light text-base mb-8">Try exploring different categories or filters.</p>
                <button onClick={resetFilters} className="bg-primary hover:bg-primary-dark text-white font-semibold uppercase tracking-widest text-xs rounded-full px-8 py-3.5 transition-all shadow-3d hover:-translate-y-0.5 transform">
                  Clear All Filters
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}