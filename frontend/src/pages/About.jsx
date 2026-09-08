import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { FaLeaf, FaUsers, FaPenNib } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import Tilt3D from '../components/Tilt3D';

export default function About() {
  const [page, setPage] = useState({ page_title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/pages.php?slug=about-us');
        const data = await response.json();
        setPage(data);
      } catch (err) {
        console.error("Failed to fetch page content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.18,
        duration: 0.6,
        ease: "easeOut"
      },
    }),
  };

  return (
    <div className="bg-cream min-h-screen text-text-dark">
      <SEO 
        title="Our Story | Pragati Kurtis" 
        description="Discover the heritage, passion, and craftsmanship behind Pragati Kurtis. A tradition of elegance, redefined."
      />

      {/* Hero Section with 3D Ambience */}
      <motion.section 
        className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-cream flex items-center justify-center overflow-hidden border-b border-border-soft perspective-1000"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <motion.div 
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-secondary/30 mb-6 animate-float-3d">
            <Sparkles size={14} className="text-secondary" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Artisanal Heritage</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif text-text-dark tracking-tight uppercase leading-tight">
            {page.page_title || 'Weaving Dreams Into Reality'}
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-2xl mx-auto font-light tracking-wide text-text-muted leading-relaxed">
            A legacy of authentic traditional craftsmanship meeting the refined elegance of modern silhouette design.
          </p>
        </motion.div>
      </motion.section>

      {/* Our Mission Section with 3D Tilt Cards */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xs font-bold tracking-widest text-secondary uppercase mb-2">The Philosophy</h2>
            <h3 className="text-3xl md:text-5xl font-serif text-text-dark mb-5">Our Guiding Mission</h3>
            <p className="max-w-2xl mx-auto text-text-muted text-base md:text-lg leading-relaxed font-light">
              To celebrate and preserve the rich heritage of Indian textiles by creating timeless, elegant ethnic wear for the discerning woman. We are committed to ethical practices, sustainable sourcing, and empowering master artisans.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: FaLeaf, 
                title: "Sustainable Fabrics", 
                desc: "Using breathable, organic cottons and pure silks that are gentle on your skin and crafted sustainably.", 
                badge: "Eco Conscious" 
              },
              { 
                icon: FaUsers, 
                title: "Empowering Artisans", 
                desc: "Direct patronage, fair wages, and a global canvas for multi-generational generational craftsmen.", 
                badge: "Fair Trade" 
              },
              { 
                icon: FaPenNib, 
                title: "Exquisite Designs", 
                desc: "Harmonizing centuries-old handwork with contemporary cuts to craft heirloom-worthy silhouettes.", 
                badge: "Hand Embroidered" 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                custom={idx} 
                variants={featureVariants} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.4 }}
                className="h-full"
              >
                <Tilt3D maxTilt={10} glare={true} scale={1.03} className="h-full">
                  <div className="h-full p-8 rounded-3xl bg-cream/70 border border-border-soft hover:border-secondary/50 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center preserve-3d">
                    
                    {/* 3D Floating Icon Circle */}
                    <div 
                      style={{ transform: 'translateZ(28px)' }}
                      className="w-20 h-20 rounded-2xl bg-white shadow-[0_12px_24px_rgba(128,27,52,0.12)] border border-secondary/20 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    >
                      <feature.icon className="text-3xl text-primary" />
                    </div>

                    <span 
                      style={{ transform: 'translateZ(18px)' }}
                      className="text-[10px] font-bold uppercase tracking-wider text-secondary px-3 py-1 rounded-full bg-secondary/10 mb-3"
                    >
                      {feature.badge}
                    </span>

                    <h4 
                      style={{ transform: 'translateZ(20px)' }}
                      className="text-xl font-serif font-medium text-text-dark mb-3"
                    >
                      {feature.title}
                    </h4>

                    <p 
                      style={{ transform: 'translateZ(14px)' }}
                      className="text-text-muted leading-relaxed text-sm font-light"
                    >
                      {feature.desc}
                    </p>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Story Section with 3D Layered Portrait */}
      <section className="py-24 bg-cream relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            
            {/* Left — 3D Stage with Offset Frame */}
            <motion.div 
              className="md:w-1/2 w-full perspective-1000"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <Tilt3D maxTilt={7} glare={true} scale={1.02}>
                <div className="relative rounded-3xl p-3 bg-white shadow-2xl border border-border-soft preserve-3d">
                  {/* Floating 3D Accent Backplate */}
                  <div 
                    style={{ transform: 'translateZ(-18px) rotate(-2.5deg)' }}
                    className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl opacity-20 filter blur-xs -z-10"
                  ></div>

                  <img 
                    src="/banners/Sharara-Suit.jpg" 
                    alt="Pragati Artisanal Heritage" 
                    className="relative rounded-2xl object-cover w-full h-[520px] shadow-inner"
                  />

                  {/* Floating 3D Heritage Badge */}
                  <div 
                    style={{ transform: 'translateZ(30px)' }}
                    className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.18)] border border-secondary/30 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-sm">
                      PK
                    </div>
                    <div>
                      <p className="font-serif text-sm font-semibold text-text-dark">Since 2012</p>
                      <p className="text-[11px] text-secondary font-medium tracking-wide">Handcrafted in India</p>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </motion.div>

            {/* Right — Story Text */}
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold tracking-widest text-secondary uppercase mb-2 block">Our Origins</span>
              <h3 className="text-3xl md:text-5xl font-serif text-text-dark mb-6">The Pragati Story</h3>
              {loading ? (
                <div className="flex justify-start py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div 
                  className="prose prose-lg prose-headings:font-serif prose-p:text-text-muted prose-p:leading-relaxed font-light text-base"
                  dangerouslySetInnerHTML={{ __html: page.content || "<p>Pragati Kurtis was founded on the belief that everyday clothing should feel extraordinary. What began as a passionate tribute to Jaipur's textile traditions has blossomed into a beloved label celebrating timeless elegance and thoughtful modern styling.</p><p className='mt-4'>Each creation begins with premium natural yarns, hand-selected color palettes, and intricate zardozi, chikankari, or foil work, ensuring you celebrate every occasion wrapped in confidence and grace.</p>" }}
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship Gallery with Dual 3D Cards */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            <motion.div 
              className="md:w-1/2 order-2 md:order-1 grid grid-cols-2 gap-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
            >
              <motion.div 
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6 } } }} 
                className="mt-8"
              >
                <Tilt3D maxTilt={9} glare={true} scale={1.03}>
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-border-soft bg-cream">
                    <img src="/banners/Gown-Dresses.jpeg" alt="Gown Dress Craft" className="object-cover w-full aspect-[3/4] hover:scale-105 transition-transform duration-500" />
                    <div className="p-3 text-center bg-white border-t border-border-soft">
                      <p className="font-serif text-sm text-text-dark font-medium">Fine Draping</p>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>

              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6 } } }}>
                <Tilt3D maxTilt={9} glare={true} scale={1.03}>
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-border-soft bg-cream">
                    <img src="/banners/Afghani-Suits.jpg" alt="Afghani Suit Craft" className="object-cover w-full aspect-[3/4] hover:scale-105 transition-transform duration-500" />
                    <div className="p-3 text-center bg-white border-t border-border-soft">
                      <p className="font-serif text-sm text-text-dark font-medium">Intricate Border Work</p>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 order-1 md:order-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold tracking-widest text-secondary uppercase mb-2 block">The Art</span>
              <h3 className="text-3xl md:text-5xl font-serif text-text-dark mb-6">A Tradition of Excellence</h3>
              <p className="text-text-muted text-base md:text-lg leading-relaxed mb-6 font-light">
                Every Pragati Kurti is a masterpiece of precision and care. Our skilled artisans employ age-old techniques passed down through generations, ensuring that each stitch, embellishment, and fabric choice meets the highest standards of quality.
              </p>
              <p className="text-text-muted text-base md:text-lg leading-relaxed font-light">
                From hand-block printing to intricate embroidery, we honor the artistry of Indian textiles. This dedication to craftsmanship results in garments that are not just beautiful, but are also a testament to a rich cultural legacy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}