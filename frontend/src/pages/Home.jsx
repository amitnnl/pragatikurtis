import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, CreditCard, ArrowRight, Instagram, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Tilt3D from '../components/Tilt3D';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext';
import { BRAND_CONFIG } from '../config/branding';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

export default function Home({ products, onAddToCart, onToggleWishlist, wishlist, user }) {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Fetch Categories
    authFetch('/categories.php')
      .then(r => r.json())
      .then(d => { if (d.length > 0) setCategories(d); })
      .catch(() => {});
      
    // Fetch Banners
    authFetch('/banners.php')
      .then(r => r.json())
      .then(d => { if (d.length > 0) setBanners(d); })
      .catch(() => {});
      
    // Fetch Featured Reviews
    authFetch('/reviews.php?featured=1')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setReviews(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const newArrivals = products.slice(0, 4);
  const bestSellers = products.slice(4, 12);

  // Parse Occasions JSON safely
  let occasions = [];
  try {
    occasions = settings?.home_occasions_list ? JSON.parse(settings.home_occasions_list) : [];
  } catch (e) {
    occasions = [
      { title: 'Everyday', desc: 'Comfortable everyday styles', img: '/banners/Straight-Suit.jpeg' },
      { title: 'Office', desc: 'Elegant workwear', img: '/banners/Afghani-Suits.jpg' },
      { title: 'Festive', desc: 'Celebrate beautifully', img: '/banners/Anarkali-Suit.jpeg' },
      { title: 'Wedding', desc: 'Make every moment special', img: '/banners/Sharara-Suit.jpg' }
    ];
  }

  // Backend URL helper for images that might be relative
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    return baseUrl + url;
  };

  const heroBanner = banners.length > 0 ? banners[currentSlide] : null;

  return (
    <div className="bg-cream font-sans overflow-x-hidden">
      <SEO title={`${settings?.site_name || BRAND_CONFIG.name} | Premium Indian Ethnic Wear`} description={settings?.site_description || "Discover elegant suits and kurtis designed for everyday comfort, festive moments, and everything in between."} />

      {/* ── 1. Hero Section with 3D Dynamic Depth ── */}
      <section className="relative min-h-[70vh] md:min-h-[82vh] flex items-center bg-soft-surface pt-14 md:pt-16 pb-10 md:pb-14 border-b border-border-soft overflow-hidden">
        {/* Subtle Ambient Gold Glow in Background */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none -z-0"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-14"
            >
              {/* Left Text */}
              <div className="flex-1 text-center md:text-left py-8 md:py-0">
                <motion.div 
                  initial="hidden" animate="visible" variants={fadeUp} custom={0}
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-secondary/40 text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
                >
                  <Sparkles size={13} className="text-secondary" />
                  <span>Royal Heritage & Festive Elegance</span>
                </motion.div>
                <motion.h1 
                  initial="hidden" animate="visible" variants={fadeUp} custom={0}
                  className="text-3xl md:text-5xl lg:text-6xl font-serif text-text-dark leading-[1.18] mb-4 md:mb-5 font-normal"
                >
                  {heroBanner ? heroBanner.title.split('\\n').map((line, i) => <span key={i}>{line}<br/></span>) : <>Fresh Styles.<br /><span className="italic font-medium text-primary">Beautifully You.</span></>}
                </motion.h1>
                <motion.p 
                  initial="hidden" animate="visible" variants={fadeUp} custom={1}
                  className="text-text-muted text-base md:text-lg font-light mb-7 md:mb-9 max-w-lg mx-auto md:mx-0 leading-relaxed"
                >
                  {heroBanner?.subtitle || "Discover elegant suits and kurtis designed for everyday comfort, festive moments, and everything in between."}
                </motion.p>
                <motion.div 
                  initial="hidden" animate="visible" variants={fadeUp} custom={2}
                  className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
                >
                  <Link to={heroBanner?.link_url || "/shop?collection=new"} className="w-full sm:w-auto btn-primary py-3.5 px-9 text-xs">
                    SHOP NOW
                  </Link>
                  <Link to="/shop" className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-text-dark hover:text-primary transition-colors py-3.5 px-6 flex items-center justify-center gap-2 border border-border-soft rounded-[10px] bg-white hover:border-primary">
                    EXPLORE COLLECTION <ChevronRight size={16} />
                  </Link>
                </motion.div>
              </div>

              {/* Right Image with 3D Dynamic Tilt & Ambient Floating */}
              <div className="flex-1 w-full flex justify-center perspective-1200">
                <Tilt3D maxTilt={6} scale={1.01} className="w-full max-w-md md:max-w-none h-[45vh] md:h-[65vh]">
                  <div className="w-full h-full relative rounded-t-full md:rounded-tl-full md:rounded-tr-none md:rounded-bl-full overflow-hidden shadow-2xl border-4 border-white/80">
                     <img 
                       src={heroBanner ? getImageUrl(heroBanner.image_url) : "/banners/Afghani-Suits.jpg"} 
                       alt="Elegant Indian Fashion" 
                       onError={(e) => { e.currentTarget.src = "/banners/Afghani-Suits.jpg"; }}
                       className="w-full h-full object-cover object-top"
                     />
                     
                     {/* 3D Floating Heritage Badge */}
                     <div 
                       style={{ transform: "translateZ(26px)" }}
                       className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-secondary/30 hidden sm:flex items-center gap-3 z-20"
                     >
                       <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-xs">
                         PK
                       </div>
                       <div>
                         <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">100% Handcrafted</p>
                         <p className="text-xs font-serif font-semibold text-text-dark">Pure Cotton & Silk Sets</p>
                       </div>
                     </div>
                  </div>
                </Tilt3D>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Slider Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-primary w-8' : 'bg-primary/30'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Trust / Benefits Strip ── */}
      <section className="bg-soft-mint border-y border-border-soft py-6 md:py-8 relative z-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: ShieldCheck, title: 'Premium Quality', desc: 'Carefully selected fabrics' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
              { icon: CreditCard, title: 'COD Available', desc: 'Pay on delivery' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
            ].map((perk, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-primary">
                  <perk.icon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-semibold text-text-dark text-sm md:text-base mb-0.5">{perk.title}</h4>
                  <p className="text-text-muted text-xs md:text-sm font-light">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Shop By Category ── */}
      <section className="py-12 md:py-16 px-6 bg-cream">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-heading mb-2">Shop By Category</h2>
            <p className="section-sub mt-1">Find a style made for every occasion.</p>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 ${categories.length === 6 ? 'lg:grid-cols-6' : categories.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4 md:gap-6`}>
            {categories.map((cat, i) => (
              <motion.div key={cat.id || cat.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="group block text-center">
                  <Tilt3D maxTilt={8} scale={1.03} className="mb-3 rounded-2xl">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-soft-surface mx-auto relative shadow-sm border border-border-soft group-hover:border-secondary/60 group-hover:shadow-3d transition-all duration-300">
                       <div className="w-full h-full overflow-hidden relative">
                          <img 
                            src={getImageUrl(cat.image_url)} 
                            alt={cat.name} 
                            onError={(e) => { 
                              const fallbacks = ['/banners/Afghani-Suits.jpg', '/banners/Anarkali-Suit.jpeg', '/banners/Gown-Dresses.jpeg', '/banners/Sharara-Suit.jpg', '/banners/Straight-Suit.jpeg'];
                              e.currentTarget.src = fallbacks[i % fallbacks.length]; 
                            }}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 bg-white" 
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
                       </div>
                    </div>
                  </Tilt3D>
                  <h3 className="font-medium text-text-dark group-hover:text-primary transition-colors text-sm md:text-base">{cat.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-secondary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 font-semibold">
                    Explore <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. New Arrivals ── */}
      <section className="py-12 md:py-16 px-6 bg-white relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-heading mb-2">Fresh Arrivals</h2>
            <p className="section-sub mt-1">New season. New styles.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {newArrivals.map((product, i) => (
              <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <ProductCard product={product} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.some(item => item.id === product.id)} user={user} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-10">
             <Link to="/shop?collection=new" className="btn-outline inline-block">VIEW ALL NEW ARRIVALS</Link>
          </div>
        </div>
      </section>

      {/* ── 5. Shop By Occasion with 3D Depth ── */}
      <section className="py-12 md:py-16 px-6 bg-cream">
        <div className="container mx-auto max-w-[1400px]">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-heading">Dress For Every Occasion</h2>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar">
            {occasions.map((occ, i) => (
              <motion.div key={occ.title || i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="snap-center shrink-0 w-[85vw] md:w-auto"
              >
                <Tilt3D maxTilt={6} scale={1.02} className="w-full h-full rounded-2xl">
                  <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden group shadow-lg border border-border-soft hover:shadow-3d transition-all duration-500">
                    <img src={getImageUrl(occ.img)} alt={occ.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-text-dark/95 via-text-dark/35 to-transparent"></div>
                    
                    {/* Layered 3D Floating Caption */}
                    <div 
                      style={{ transform: "translateZ(26px)" }}
                      className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white z-20"
                    >
                       <h3 className="font-serif text-2xl md:text-3xl mb-1.5">{occ.title}</h3>
                       <p className="font-light text-xs md:text-sm text-cream/90 mb-4 md:mb-6">{occ.desc}</p>
                       <Link to={`/shop?occasion=${encodeURIComponent(occ.title)}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors w-max">
                         Explore <ArrowRight size={16} />
                       </Link>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Best Sellers ── */}
      <section className="py-12 md:py-16 px-6 bg-white relative">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="section-heading mb-1.5">Our Best Sellers</h2>
              <p className="section-sub ml-0 mt-1">Loved by women everywhere.</p>
            </div>
            <Link to="/shop?collection=bestsellers" className="text-xs font-bold uppercase tracking-widest text-text-dark hover:text-primary transition-colors flex items-center gap-2">
              VIEW ALL BEST SELLERS <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 gap-y-8">
            {bestSellers.map((product, i) => (
              <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <ProductCard product={product} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.some(item => item.id === product.id)} user={user} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Editorial Collection Banner ── */}
      <section className="relative min-h-[48vh] md:min-h-[55vh] flex items-center bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-55">
           <img 
             src={settings?.home_editorial_image_url ? getImageUrl(settings.home_editorial_image_url) : "/banners/Anarkali-Suit.jpeg"} 
             onError={(e) => { e.currentTarget.src = "/banners/Anarkali-Suit.jpeg"; }}
             className="w-full h-full object-cover object-center" 
             alt={settings?.home_editorial_title || "Spring Summer Collection"} 
           />
           <div className="absolute inset-0 bg-primary/30 mix-blend-multiply"></div>
        </div>
        <div className="relative container mx-auto px-6 text-center max-w-3xl z-10 py-14 md:py-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-secondary text-xs font-bold tracking-[0.3em] uppercase mb-4">{settings?.home_editorial_subtitle || "Spring / Summer Collection"}</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-serif leading-[1.15] mb-5" dangerouslySetInnerHTML={{ __html: settings?.home_editorial_title || 'Light. Beautiful.<br />Effortless.' }}></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-cream/90 text-base md:text-lg font-light mb-7 leading-relaxed">
              {settings?.home_editorial_text || "Discover breathable fabrics, refreshing colors and effortless silhouettes made for the season."}
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <Link to={settings?.home_editorial_link || "/shop?collection=summer"} className="inline-block bg-white text-text-dark px-8 py-3.5 rounded-[10px] text-xs font-bold uppercase tracking-widest hover:bg-soft-surface transition-colors shadow-xl">
                EXPLORE COLLECTION
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. Brand Story with 3D Framed Depth ── */}
      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16">
            {/* Left Image: 3D Dynamic Framed Portrait */}
            <div className="w-full md:w-5/12 flex justify-center">
              <Tilt3D maxTilt={6} scale={1.02} className="w-full max-w-[360px] lg:max-w-[390px]">
                <div className="relative group">
                  {/* Decorative background accent frame */}
                  <div className="absolute -inset-2.5 bg-soft-surface rounded-[26px] -rotate-2 border border-border-soft -z-10 transition-transform duration-500 group-hover:rotate-0"></div>
                  
                  <div className="relative aspect-[4/5] rounded-[22px] overflow-hidden shadow-xl border border-border-soft bg-soft-surface group-hover:shadow-3d transition-all duration-500">
                     <img 
                       src={getImageUrl(settings?.home_philosophy_image) || "/banners/Straight-Suit.jpeg"} 
                       alt="Our Story" 
                       onError={(e) => { e.currentTarget.src = "/banners/Straight-Suit.jpeg"; }}
                       className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                     
                     {/* 3D floating artisanal badge overlay */}
                     <div 
                       style={{ transform: "translateZ(24px)" }}
                       className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-xl shadow-sm border border-secondary/30 flex items-center justify-between z-20"
                     >
                       <div>
                         <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Artisan Heritage</p>
                         <p className="text-xs font-serif font-semibold text-text-dark">Pure Handcrafted Kurtis</p>
                       </div>
                       <span className="text-primary text-[11px] font-bold bg-soft-surface border border-secondary/30 px-2 py-0.5 rounded-md">Boutique</span>
                     </div>
                  </div>
                </div>
              </Tilt3D>
            </div>

            {/* Right Text Content: Harmonious Typography and Hallmarks */}
            <div className="w-full md:w-7/12 text-center md:text-left flex flex-col justify-center">
               <div className="inline-flex items-center gap-2 self-center md:self-start px-3.5 py-1 rounded-full bg-soft-surface border border-secondary/40 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                 {settings?.home_philosophy_subtitle || "Our Philosophy"}
               </div>

               <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-text-dark leading-[1.2] mb-3.5 font-medium" 
                   dangerouslySetInnerHTML={{ __html: settings?.home_philosophy_title || 'Made With Love<br />For Every Woman' }}>
               </h2>

               <p className="text-text-muted text-sm md:text-base font-light leading-relaxed mb-5 max-w-xl">
                 {settings?.home_philosophy_text || "Pragati Kurtis brings together timeless Indian silhouettes, beautiful fabrics and modern styling to create pieces you’ll love wearing again and again. Every stitch reflects our commitment to quality, comfort, and the undeniable elegance of the Indian woman."}
               </p>

               {/* Craftsmanship Highlights for Perfect Height Balance */}
               <div className="grid grid-cols-3 gap-3 py-3.5 my-1 border-y border-border-soft text-left">
                 <div>
                   <p className="text-primary font-serif text-base md:text-lg font-bold">100%</p>
                   <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider mt-0.5">Pure Fabrics</p>
                 </div>
                 <div>
                   <p className="text-primary font-serif text-base md:text-lg font-bold">Artisan</p>
                   <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider mt-0.5">Handcrafted</p>
                 </div>
                 <div>
                   <p className="text-primary font-serif text-base md:text-lg font-bold">Tailored</p>
                   <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider mt-0.5">Comfort Fit</p>
                 </div>
               </div>

               <div className="pt-4">
                 <Link to="/about" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-primary hover:text-text-dark transition-colors pb-1 border-b-2 border-primary hover:border-text-dark group">
                   OUR STORY <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Customer Reviews ── */}
      {reviews && reviews.length > 0 && (
      <section className="py-12 md:py-16 px-6 bg-soft-surface border-y border-border-soft overflow-hidden">
        <div className="container mx-auto max-w-7xl">
           <div className="text-center mb-8 md:mb-10">
             <h2 className="section-heading text-primary">Loved By Women Like You ❤️</h2>
           </div>
           
           <div className="flex overflow-x-auto gap-6 pb-4 md:pb-6 snap-x snap-mandatory hide-scrollbar">
              {reviews.map((review, i) => (
                <div key={i} className="snap-center shrink-0 w-[300px] md:w-[380px]">
                  <Tilt3D maxTilt={5} scale={1.02} className="h-full">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border-soft hover:shadow-3d transition-all duration-300 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1 text-secondary mb-4">
                          {[...Array(parseInt(review.rating) || 5)].map((_, j) => <ShieldCheck key={j} size={16} className="fill-current text-secondary border-none" />)}
                        </div>
                        <p className="text-text-dark font-serif text-base md:text-lg leading-relaxed mb-6">"{review.review_text}"</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border-soft/60">
                         <div>
                           <p className="font-bold text-text-dark text-sm md:text-base">{review.user_name || 'Verified Customer'}</p>
                           <p className="text-xs text-text-muted uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12} className="text-primary"/> Verified Buyer</p>
                         </div>
                         <Link to={`/product/${review.product_id}`} className="text-xs text-primary font-medium w-24 text-right truncate hover:underline">
                            {review.product_name}
                         </Link>
                      </div>
                    </div>
                  </Tilt3D>
                </div>
              ))}
           </div>
        </div>
      </section>
      )}

      {/* ── 10. Instagram Gallery with 3D Tilt ── */}
      <section className="py-12 md:py-16 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-heading mb-2">{settings?.home_instagram_title || "Follow Our Style"}</h2>
            <a 
              href={settings?.social_instagram || "https://instagram.com/pragatikurtis"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="section-sub mt-1 inline-flex items-center justify-center gap-2 hover:text-primary transition-colors font-medium"
            >
              <Instagram size={18} className="text-primary" /> {settings?.home_instagram_handle || "@pragatikurtis"}
            </a>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
             {[
               { name: "Afghani Suits", tag: "#AfghaniVibes", img: "/banners/Afghani-Suits.jpg" },
               { name: "Anarkali Suits", tag: "#AnarkaliFlow", img: "/banners/Anarkali-Suit.jpeg" },
               { name: "Gown / Dresses", tag: "#FestiveElegance", img: "/banners/Gown-Dresses.jpeg" },
               { name: "Sharara Suits", tag: "#ShararaSilhouette", img: "/banners/Sharara-Suit.jpg" },
               { name: "Straight Suits", tag: "#TimelessGrace", img: "/banners/Straight-Suit.jpeg" }
             ].map((item, i) => (
               <motion.div key={item.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                 <a 
                   href={settings?.social_instagram || "https://instagram.com/pragatikurtis"} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="group block text-center"
                 >
                   <Tilt3D maxTilt={8} scale={1.03} className="mb-3 rounded-2xl">
                     <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-soft-surface mx-auto relative shadow-sm border border-border-soft group-hover:border-secondary/60 group-hover:shadow-3d transition-all duration-300">
                       <div className="w-full h-full overflow-hidden relative">
                         <img 
                           src={getImageUrl(item.img)} 
                           className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 bg-white" 
                           alt={item.name}
                           onError={(e) => { e.currentTarget.src = item.img; }}
                         />
                         
                         {/* 3D Floating Instagram Overlay */}
                         <div className="absolute inset-0 bg-primary/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <div 
                              style={{ transform: "translateZ(25px)" }}
                              className="w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 border border-secondary/30"
                            >
                               <Instagram size={22} />
                            </div>
                         </div>
                       </div>
                     </div>
                   </Tilt3D>
                   <h3 className="font-medium text-text-dark group-hover:text-primary transition-colors text-sm md:text-base">{item.name}</h3>
                   <div className="flex items-center justify-center gap-1 text-[10px] text-secondary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 font-semibold">
                     View Look <ArrowRight size={12} />
                   </div>
                 </a>
               </motion.div>
             ))}
          </div>
          <div className="text-center mt-8 md:mt-10">
             <a href={settings?.social_instagram || "https://instagram.com/pragatikurtis"} target="_blank" rel="noopener noreferrer" className="btn-outline inline-block">FOLLOW US ON INSTAGRAM</a>
          </div>
        </div>
      </section>
    </div>
  );
}