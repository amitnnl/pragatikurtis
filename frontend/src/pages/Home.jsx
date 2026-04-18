import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext';

const perks = [
  { icon: Truck, title: 'Complimentary Delivery', desc: 'On orders above ₹999' },
  { icon: RotateCcw, title: 'Seamless Returns', desc: '30-day elegant return policy' },
  { icon: ShieldCheck, title: 'Artisan Authenticity', desc: '100% original handcrafted guarantee' },
  { icon: Headphones, title: 'Concierge Support', desc: 'Always at your service 24/7' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" } }),
};

export default function Home({ products, onAddToCart, onToggleWishlist, wishlist, user }) {
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    authFetch('/banners.php').then(r => r.json()).then(d => { if (d.length > 0) setBanners(d); }).catch(() => {});
    authFetch('/categories.php').then(r => r.json()).then(d => { if (d.length > 0) setCategories(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => setCurrentSlide(p => (p + 1) % banners.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + banners.length) % banners.length);
  const trendingProducts = products.slice(0, 8);

  return (
    <div className="bg-[#faf9f6] font-sans overflow-x-hidden">
      <SEO title="Boutique Ethnic Wear | Pragati Kurties" description="Premium handcrafted Kurtis, Suit Sets, and Designer Sarees. Shop Pragati Kurtis online." />

      {/* ── Hero Slider ── */}
      {banners.length > 0 && (
        <section className="relative h-[85vh] md:h-[95vh] min-h-[500px] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-[position:center_top] md:bg-center"
              style={{ backgroundImage: `url('${banners[currentSlide].image_url}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-black/40" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-end md:justify-center text-center pb-24 md:pb-0">
            <div className="container mx-auto px-6 md:px-16">
              <motion.div
                key={`content-${currentSlide}`}
                initial="hidden" animate="visible"
                className="max-w-4xl mx-auto space-y-6 flex flex-col items-center"
              >
                <motion.span variants={fadeUp} custom={0} className="text-rose-200 font-semibold text-xs md:text-sm tracking-[0.4em] uppercase drop-shadow-md">
                  {banners[currentSlide].subtitle || 'Exclusive Collection'}
                </motion.span>
                <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl md:text-8xl font-serif font-light text-white leading-[1.1] drop-shadow-2xl">
                  {banners[currentSlide].title}
                </motion.h1>
                <motion.div variants={fadeUp} custom={2} className="flex gap-6 pt-8 justify-center items-center">
                  <Link to="/shop" className="bg-white text-gray-900 hover:bg-rose-50 px-8 py-4 rounded-full tracking-widest uppercase text-sm font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Explore Collection
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Arrows */}
          <button onClick={prevSlide} className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center text-white transition-all group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center text-white transition-all group">
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`rounded-full cursor-pointer transition-all duration-500 ${currentSlide === i ? 'w-10 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/80'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ── Perks Strip ── */}
      <section className="bg-white py-12 relative z-20 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-gray-100">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:px-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-rose-600" />
                </div>
                <div>
                  <p className="font-serif font-semibold text-gray-900 text-lg mb-1">{title}</p>
                  <p className="text-gray-500 text-sm font-light leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-24 md:py-32 px-6 bg-[#faf9f6] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Curations</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Shop by Category</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-lg font-light max-w-2xl mx-auto">Discover our handcrafted collections of ethnic wear specifically designed for the absolute modern woman.</motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={i * 0.1}>
                <Link to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-[2rem] shadow-xl shadow-rose-900/5 bg-white">
                  <img src={cat.image_url || cat.image} alt={cat.name} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-white font-serif text-2xl mb-2">{cat.name}</h3>
                    <p className="text-rose-200 text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Explore <ArrowRight size={14} />
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Banner ── */}
      <section className="relative py-32 overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 w-full h-full opacity-40">
           <img src="/banners/Anarkali-Suit.jpeg" className="w-full h-full object-cover" alt="Brand background" />
           <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
        </div>
        <div className="relative container mx-auto px-6 text-center space-y-8 max-w-4xl z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
            <motion.p variants={fadeUp} custom={0} className="text-rose-300 text-xs font-semibold tracking-[0.4em] uppercase mb-6">{settings?.home_philosophy_subtitle || 'Our Philosophy'}</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-serif font-light leading-[1.1] drop-shadow-2xl mb-8" dangerouslySetInnerHTML={{ __html: settings?.home_philosophy_title || 'Elegance in<br /><em>Every Thread</em>' }} />
            <motion.p variants={fadeUp} custom={2} className="text-gray-300 text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
              {settings?.home_philosophy_text || 'We believe in the timeless beauty of tradition, woven with a touch of modern elegance. Our collections are crafted to celebrate you.'}
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <Link to="/about" className="inline-flex items-center gap-3 bg-transparent border border-white/40 hover:border-white px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all duration-500">
                Our Heritage <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Trending Products ── */}
      <section className="py-24 md:py-32 px-6 bg-white relative">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-rose-500 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Fresh Arrivals</p>
              <h2 className="text-4xl md:text-6xl font-serif text-gray-900">Trending Now</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-gray-900 hover:text-rose-600 transition-colors pb-2">
              View Collection <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
            {trendingProducts.map((product, i) => (
              <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUp} custom={i * 0.05}>
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
      <section className="py-24 bg-[#faf9f6] relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-rose-100/60 rounded-full mix-blend-multiply filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-amber-50/60 rounded-full mix-blend-multiply filter blur-3xl transform -translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="max-w-4xl mx-auto bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-rose-900/5 p-10 md:p-20 text-center border border-white"
          >
            <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">{settings?.newsletter_title || 'Join the Inner Circle'}</h3>
            <p className="text-gray-500 text-lg font-light mb-12 max-w-xl mx-auto leading-relaxed">{settings?.newsletter_subtitle || 'Subscribe to our newsletter for exclusive early access to collections and receive 10% off your first order.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input type="email" placeholder="Enter your email address" className="w-full bg-white border border-gray-100 rounded-full px-8 py-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 outline-none shadow-sm transition-all" />
              <button className="bg-gray-900 hover:bg-rose-900 text-white font-semibold uppercase tracking-widest text-sm rounded-full px-10 py-4 transition-colors duration-300 whitespace-nowrap shadow-xl">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}