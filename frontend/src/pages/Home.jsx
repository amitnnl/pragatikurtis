import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const featuredCategories = [
  { name: 'Afghani Suits', image: '/banners/Afghani-Suits.jpg', slug: 'Afghani Suits' },
  { name: 'Straight Suits', image: '/banners/Straight-Suit.jpeg', slug: 'Straight Suits' },
  { name: 'Anarkali Suits', image: '/banners/Anarkali-Suit.jpeg', slug: 'Anarkali Suits' },
  { name: 'Gown/Dresses', image: '/banners/Gown-Dresses.jpeg', slug: 'Gown/Dresses' },
  { name: 'Sharara Suits', image: '/banners/Sharara-Suit.jpg', slug: 'Sharara Suits' }
];

export default function Home({ products, onAddToCart, onToggleWishlist, wishlist, user }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await authFetch('/banners.php');
        const data = await response.json();
        if (data.length > 0) setBanners(data);
      } catch (err) {
        console.error("Banner fetch error", err)
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  const trendingProducts = products.slice(0, 4);

  return (
    <div className="bg-surface font-sans overflow-x-hidden">
      <SEO 
        title="Boutique Ethnic Wear" 
        description="Premium handcrafted Kurtis, Suit Sets, and Designer Sarees. Discover elegance with Pragati Kurtis."
      />
      
      {banners.length > 0 && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${banners[currentSlide].image_url}')` }}
            >
              <div className="absolute inset-0 bg-primary/40"></div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
            <motion.div 
              key={currentSlide}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-4 max-w-3xl"
            >
              <p className="text-surface/90 text-sm md:text-base font-medium tracking-widest">
                {banners[currentSlide].subtitle}
              </p>
              <h1 className="text-4xl md:text-6xl font-serif text-surface leading-tight drop-shadow-md">
                {banners[currentSlide].title}
              </h1>
              <div className="pt-4">
                <Link to="/shop">
                  <button className="bg-accent text-surface px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-opacity-90 transition-all">
                    Discover Collection
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${currentSlide === i ? 'w-8 bg-accent' : 'w-2 bg-surface/50'}`}></button>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20 md:py-24 px-6 bg-surface-100">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-text-700">Shop by Category</h2>
            <p className="text-muted/70 mt-2 max-w-xl mx-auto">Explore our curated collections of ethnic wear, designed for the modern woman.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {featuredCategories.map((cat) => (
              <Link to={`/shop?category=${encodeURIComponent(cat.slug)}`} key={cat.name} className="group relative block aspect-[3/4] overflow-hidden rounded-xl shadow-sm">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-surface font-serif text-lg md:text-xl drop-shadow-sm">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 bg-primary text-surface text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif leading-tight">
            Elegance in Every Thread
          </h2>
          <p className="text-muted/30 max-w-2xl mx-auto">
            We believe in the timeless beauty of tradition, woven with a touch of modern elegance. Our collections are crafted to celebrate you.
          </p>
          <Link to="/about" className="inline-block bg-accent text-surface px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-opacity-90 transition-all">
            Our Story
          </Link>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-6 bg-surface-100">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-text-700">Trending Products</h2>
            <p className="text-muted/70 mt-2">Discover this season's most-loved styles.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {trendingProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart} 
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.some(item => item.id === product.id)}
                user={user}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="text-text-700 hover:text-accent text-sm font-bold uppercase tracking-wider border-b-2 border-accent pb-1 transition-all">
              View All Products <ArrowRight className="inline-block ml-1" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}