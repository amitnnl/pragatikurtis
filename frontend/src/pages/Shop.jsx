import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-xs tracking-wider uppercase font-semibold transition-all duration-300 border ${
      active
        ? 'bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/20 scale-105'
        : 'bg-[#faf9f6] text-gray-500 border-transparent hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
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
    <div className="bg-[#faf9f6] min-h-screen">
      <SEO title="Shop — The Collection | Pragati Kurties" description="Browse our exclusive handmade collection of Kurtis, Gowns, Suit Sets, and elegant traditional wear." />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-[#faf9f6] overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute top-20 left-0 w-80 h-80 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/2"></div>
        <div className="relative container mx-auto px-6 text-center z-10 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mb-4 drop-shadow-sm">Discover Elegance</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-serif text-gray-900 leading-[1.1]">
            The Collection
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 mt-6 text-xs md:text-sm tracking-widest uppercase font-semibold">Home <span className="mx-3 text-rose-200">/</span> Shop</motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-16 relative z-10">

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 bg-white p-4 md:pl-6 rounded-[2rem] md:rounded-full shadow-2xl shadow-rose-900/5 border border-rose-50/50">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <input
              type="text" placeholder="Search collection…"
              className="w-full bg-[#faf9f6] border-none rounded-full pl-12 pr-10 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all shadow-inner text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors bg-white rounded-full p-1 shadow-sm">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${showFilters ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' : 'bg-[#faf9f6] text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
            <SlidersHorizontal size={16} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />}
          </button>

          {/* Sort */}
          <div className="relative w-full md:w-auto md:ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="w-full md:w-60 bg-[#faf9f6] border-none rounded-full py-3.5 pl-6 pr-12 text-gray-700 text-sm font-semibold tracking-wide appearance-none cursor-pointer focus:ring-2 focus:ring-rose-200 outline-none transition-all shadow-inner">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="w-full md:w-auto text-xs tracking-widest uppercase font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center justify-center gap-1.5 md:mr-4 py-2">
              <X size={16} /> Reset
            </button>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-rose-50 shadow-2xl shadow-rose-900/5 grid grid-cols-1 md:grid-cols-4 gap-10 relative overflow-hidden">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
                
                {/* Category */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-4">Category</p>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map(cat => (
                      <FilterChip key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
                    ))}
                  </div>
                </div>
                {/* Fabric */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-rose-500 uppercase tracking-[0.2em] mb-4">Fabric</p>
                  <div className="flex flex-wrap gap-2.5">
                    {fabrics.map(f => (
                      <FilterChip key={f} label={f} active={selectedFabric === f} onClick={() => setSelectedFabric(f)} />
                    ))}
                  </div>
                </div>
                {/* Occasion */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-[0.2em] mb-4">Occasion</p>
                  <div className="flex flex-wrap gap-2.5">
                    {occasions.map(o => (
                      <FilterChip key={o} label={o} active={selectedOccasion === o} onClick={() => setSelectedOccasion(o)} />
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-4">Price Range</p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Min"
                      value={priceRange[0]}
                      onChange={e => setPriceRange([parseInt(e.target.value || '0'), priceRange[1]])}
                      className="w-24 bg-[#faf9f6] border-none rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm font-medium" />
                    <span className="text-gray-300 font-light">—</span>
                    <input type="number" placeholder="Max"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value || '20000')])}
                      className="w-24 bg-[#faf9f6] border-none rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm font-medium" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 mt-4 tracking-widest">₹{priceRange[0]} – ₹{priceRange[1]}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 mb-8 ml-2 flex items-center gap-2">
          {loading ? (
             <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Curating Collection…</>
          ) : (
             <><span className="w-2 h-2 rounded-full bg-emerald-400"></span> {totalProducts} Piece{totalProducts !== 1 ? 's' : ''} Found</>
          )}
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white border border-rose-50 shadow-sm animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-rose-50 shadow-xl">
            <p className="text-gray-500 text-lg font-light">{error}</p>
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
          <div className="text-center py-32 bg-white border border-rose-50 rounded-[3rem] shadow-xl shadow-rose-900/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-white opacity-80"></div>
            <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Filter className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-4xl font-serif text-gray-900 mb-4">No Pieces Found</h3>
                <p className="text-gray-500 font-light text-xl mb-10">Try exploring different categories or styles.</p>
                <button onClick={resetFilters} className="bg-gray-900 hover:bg-rose-900 text-white font-semibold uppercase tracking-widest text-sm rounded-full px-10 py-4 transition-colors duration-300 shadow-2xl shadow-gray-900/10 hover:-translate-y-1 transform">
                  Clear All Filters
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}