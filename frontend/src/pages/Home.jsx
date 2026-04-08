import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';

const featuredCategories = [
  { name: 'Afghani Suits', image: '/banners/Afghani-Suits.jpg', slug: 'Afghani Suits' },
  { name: 'Straight Suits', image: '/banners/Straight-Suit.jpeg', slug: 'Straight Suits' },
  { name: 'Anarkali Suits', image: '/banners/Anarkali-Suit.jpeg', slug: 'Anarkali Suits' },
  { name: 'Gown / Dresses', image: '/banners/Gown-Dresses.jpeg', slug: 'Gown/Dresses' },
  { name: 'Sharara Suits', image: '/banners/Sharara-Suit.jpg', slug: 'Sharara Suits' }
];

const perks = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: ShieldCheck, title: 'Authentic Products', desc: '100% original guarantee' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] } }),
};

export default function Home({ products, onAddToCart, onToggleWishlist, wishlist, user }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    authFetch('/banners.php').then(r => r.json()).then(d => { if (d.length > 0) setBanners(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % banners.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + banners.length) % banners.length);
  const trendingProducts = products.slice(0, 8);

  return (
    <div className="bg-surface font-sans overflow-x-hidden">
      <SEO title="Boutique Ethnic Wear" description="Premium handcrafted Kurtis, Suit Sets, and Designer Sarees. Shop Pragati Kurtis online." />

      {/* ── Hero Slider ── */}
      {banners.length > 0 && (
        <section className="relative h-[75vh] md:h-[88vh] min-h-[480px] md:min-h-[520px] w-full overflow-hidden grain">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-[position:center_top] md:bg-center"
              style={{ backgroundImage: `url('${banners[currentSlide].image_url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 md:px-16 pt-12 md:pt-0">
              <motion.div
                key={`content-${currentSlide}`}
                initial="hidden" animate="visible"
                className="max-w-xl space-y-4 md:space-y-6"
              >
                <motion.p variants={fadeUp} custom={0} className="text-accent font-semibold text-xs tracking-[0.25em] uppercase">
                  New Collection
                </motion.p>
                <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-7xl font-serif font-light text-white leading-[1.15] md:leading-[1.1]">
                  {banners[currentSlide].title}
                </motion.h1>
                <motion.p variants={fadeUp} custom={2} className="text-white/80 text-base md:text-lg font-light max-w-sm md:max-w-none">
                  {banners[currentSlide].subtitle}
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="flex gap-4 pt-3 md:pt-2">
                  <Link to="/shop" className="btn-primary py-2.5 px-6 md:py-3 md:px-8 text-sm md:text-base">
                    Shop Now
                  </Link>
                  <Link to="/about" className="text-white/90 hover:text-white font-medium flex items-center gap-2 group text-sm">
                    Our Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Arrows - Hidden on mobile, visible on md and up */}
          <button onClick={prevSlide} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 items-center justify-center text-white transition-all">
            <ChevronLeft size={22} />
          </button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 items-center justify-center text-white transition-all">
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`rounded-full cursor-pointer transition-all duration-400 ${currentSlide === i ? 'w-8 h-2 bg-accent' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ── Perks Strip ── */}
      <section className="bg-primary text-white py-5 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-20 md:py-28 px-6 bg-surface">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Explore</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-heading">Shop by Category</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="section-sub">Curated collections of ethnic wear for the modern woman.</motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {featuredCategories.map((cat, i) => (
              <motion.div key={cat.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}>
                <Link to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-md card-hover">
                  <img src={cat.image} alt={cat.name} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-serif text-lg leading-tight">{cat.name}</h3>
                    <p className="text-white/60 text-xs mt-1 group-hover:text-accent transition-colors">Shop Now →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Banner ── */}
      <section className="relative py-24 overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        </div>
        <div className="relative container mx-auto px-6 text-center space-y-6 max-w-3xl">
          <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase">Our Philosophy</p>
          <h2 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.15]">
            Elegance in<br /><em>Every Thread</em>
          </h2>
          <p className="text-white/50 text-lg font-light leading-relaxed">
            We believe in the timeless beauty of tradition, woven with a touch of modern elegance. Our collections are crafted to celebrate you.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 btn-outline text-white border-white/30">
            Our Story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Trending Products ── */}
      <section className="py-20 md:py-28 px-6 bg-surface-100">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Fresh Arrivals</p>
              <h2 className="section-heading">Trending Now</h2>
            </div>
            <Link to="/shop" className="self-start sm:self-auto text-text-700 hover:text-accent font-semibold text-sm flex items-center gap-2 group shrink-0">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {trendingProducts.map((product, i) => (
              <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.06}>
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some(item => item.id === product.id)}
                  user={user}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter Strip ── */}
      <section className="py-16 bg-accent/10 border-y border-accent/20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-serif text-text-700 mb-3">Get Exclusive Offers</h3>
          <p className="text-muted text-sm mb-6">Subscribe to our newsletter and get 10% off your first order.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email..." className="input-field flex-1" />
            <button className="btn-primary whitespace-nowrap px-6 py-3">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}