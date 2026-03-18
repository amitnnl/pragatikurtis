import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const FilterGroup = ({ title, children }) => (
  <div className="py-6 border-b border-muted/10">
    <h4 className="text-sm font-semibold text-text mb-4">{title}</h4>
    {children}
  </div>
);

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
  const [showFilters, setShowFilters] = useState(true);

  const categories = ['All', 'Kurti', 'Gown', 'Suit Set', 'Lehenga', 'Saree'];
  const colors = ['All', 'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink'];
  const fabrics = ['All', 'Cotton', 'Silk', 'Georgette', 'Rayon', 'Chiffon'];
  const occasions = ['All', 'Casual', 'Party', 'Wedding', 'Festive'];
  
  useEffect(() => {
    const fetchShopProducts = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        min_price: priceRange[0],
        max_price: priceRange[1],
        sort_by: sortBy,
      });
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedColor !== 'All') params.append('color', selectedColor);
      if (selectedFabric !== 'All') params.append('fabric', selectedFabric);
      if (selectedOccasion !== 'All') params.append('occasion', selectedOccasion);
      
      try {
        const response = await authFetch(`/products.php?${params.toString()}`);
        const result = await response.json();
        setShopProducts(result.products || []);
        setTotalProducts(result.total_products || 0);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchShopProducts();
  }, [selectedCategory, priceRange, searchTerm, sortBy, selectedColor, selectedFabric, selectedOccasion]);

  return (
    <div className="bg-surface">
      <SEO 
        title="The Collection" 
        description="Browse our exclusive collection of Kurtis, Gowns, Suit Sets, and more."
      />
      
      <header className="pt-32 pb-12 bg-surface border-b border-muted/10">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-text">The Collection</h1>
          <p className="text-muted/70 mt-2">Home / Shop</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64">
            <div className="sticky top-28">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-700">Filters</h3>
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-muted/70 hover:text-text">
                  {showFilters ? <X size={20} /> : <Filter size={20} />}
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <FilterGroup title="Category">
                      <div className="space-y-2">
                        {categories.map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`block w-full text-left text-sm transition-colors ${selectedCategory === cat ? 'text-accent font-semibold' : 'text-muted/70 hover:text-text'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </FilterGroup>

                    <FilterGroup title="Price">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value || '0'), priceRange[1]])}
                          className="w-full p-2 border border-muted/20 rounded-lg text-sm bg-surface"
                        />
                        <span className="text-muted/70">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value || '20000')])}
                          className="w-full p-2 border border-muted/20 rounded-lg text-sm bg-surface"
                        />
                      </div>
                      <p className="text-sm text-center text-muted/70 mt-2">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</p>
                    </FilterGroup>

                    <FilterGroup title="Color">
                      <div className="space-y-2">
                        {colors.map(color => (
                          <button 
                            key={color} 
                            onClick={() => setSelectedColor(color)}
                            className={`block w-full text-left text-sm transition-colors ${selectedColor === color ? 'text-accent font-semibold' : 'text-muted/70 hover:text-text'}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </FilterGroup>

                    <FilterGroup title="Fabric">
                      <div className="space-y-2">
                        {fabrics.map(fabric => (
                          <button 
                            key={fabric} 
                            onClick={() => setSelectedFabric(fabric)}
                            className={`block w-full text-left text-sm transition-colors ${selectedFabric === fabric ? 'text-accent font-semibold' : 'text-muted/70 hover:text-text'}`}
                          >
                            {fabric}
                          </button>
                        ))}
                      </div>
                    </FilterGroup>

                    <FilterGroup title="Occasion">
                      <div className="space-y-2">
                        {occasions.map(occasion => (
                          <button 
                            key={occasion} 
                            onClick={() => setSelectedOccasion(occasion)}
                            className={`block w-full text-left text-sm transition-colors ${selectedOccasion === occasion ? 'text-accent font-semibold' : 'text-muted/70 hover:text-text'}`}
                          >
                            {occasion}
                          </button>
                        ))}
                      </div>
                    </FilterGroup>
                    
                    <button 
                      onClick={() => { setSelectedCategory('All'); setPriceRange([0, 20000]); setSelectedColor('All'); setSelectedFabric('All'); setSelectedOccasion('All'); }}
                      className="w-full mt-6 py-2 text-sm text-muted/70 border border-muted/20 rounded-lg hover:bg-muted/10 hover:text-text transition-colors"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="relative w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search this collection..." 
                  className="w-full sm:w-64 py-2 pl-10 pr-4 bg-surface border border-muted/20 rounded-lg focus:ring-2 focus:ring-accent transition text-sm text-text-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70 w-5 h-5" />
              </div>

               <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted/70">Sort by:</span>
                  <select 
                    className="bg-surface border-0 text-sm font-semibold outline-none cursor-pointer text-text-700"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
               </div>
            </div>
            
            <p className="text-sm text-muted/70 mb-8">{loading ? 'Loading...' : `${totalProducts} products found`}</p>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted/10 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-muted/70 py-20">{error}</p>
            ) : shopProducts.length > 0 ? (
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {shopProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === product.id)}
                    user={user}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-muted/20 rounded-xl">
                <h3 className="text-lg font-semibold text-text-700">No Products Found</h3>
                <p className="text-muted/70 mt-2">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}