import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { FaLeaf, FaUsers, FaPenNib } from 'react-icons/fa';

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
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      },
    }),
  };

  return (
    <div className="bg-[#faf9f6]">
      <SEO 
        title="Our Story | Pragati Kurties" 
        description="Discover the heritage, passion, and craftsmanship behind Pragati Kurties. A tradition of elegance, redefined."
      />

      {/* Hero Section */}
      <motion.section 
        className="relative pt-40 pb-20 md:pt-48 md:pb-32 bg-[#faf9f6] flex items-center justify-center overflow-hidden border-b border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/2 translate-y-1/2"></div>
        <motion.div 
          className="relative z-10 text-center px-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
        >
          <span className="block text-sm md:text-md uppercase tracking-[0.3em] mb-6 text-rose-400 font-semibold">Our Heritage</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tight uppercase">
            {page.page_title || 'Weaving Dreams'}
          </h1>
          <p className="mt-8 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide text-gray-500 leading-relaxed">
            A legacy of traditional craftsmanship meeting the pinnacle of modern fashion.
          </p>
        </motion.div>
      </motion.section>

      {/* Our Mission Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-semibold tracking-widest text-rose-500 uppercase mb-2">The Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Our Mission</h3>
            <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
              To celebrate and preserve the rich heritage of Indian textiles by creating timeless, elegant kurties for the modern woman. We are committed to ethical practices, sustainable sourcing, and empowering local artisans.
            </p>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: FaLeaf, title: "Sustainable Fabrics", desc: "Using eco-friendly materials that are kind to your skin and the planet.", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: FaUsers, title: "Empowering Artisans", desc: "Providing fair wages and a global platform for talented local craftsmen.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: FaPenNib, title: "Exquisite Designs", desc: "Blending traditional motifs with contemporary styles for a unique aesthetic.", color: "text-rose-600", bg: "bg-rose-50" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                custom={idx} 
                variants={featureVariants} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.5 }}
                className="flex flex-col items-center group"
              >
                <div className={`w-24 h-24 rounded-full ${feature.bg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-4xl ${feature.color}`}/>
                </div>
                <h4 className="text-xl font-serif font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed px-4">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-rose-100 rounded-lg transform -rotate-3 scale-105"></div>
              <img src="/banners/Sharara-Suit.jpg" alt="Craftsmanship" className="relative rounded-lg shadow-2xl object-cover w-full h-[600px] z-10" />
            </motion.div>

            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-2">Our Origins</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">The Pragati Story</h3>
              {loading ? (
                <div className="flex justify-start py-10"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <div 
                  className="prose prose-lg prose-headings:font-serif prose-p:text-gray-600 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              className="md:w-1/2 order-2 md:order-1 grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
            >
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6 } } }} className="mt-8">
                <img src="/banners/Gown-Dresses.jpeg" alt="Detail 1" className="rounded-lg shadow-xl object-cover w-full aspect-[3/4]" />
              </motion.div>
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.6 } } }}>
                 <img src="/banners/Afghani-Suits.jpg" alt="Detail 2" className="rounded-lg shadow-xl object-cover w-full aspect-[3/4]" />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 order-1 md:order-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-semibold tracking-widest text-rose-500 uppercase mb-2">The Art</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">A Tradition of Excellence</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">
                Every Pragati Kurti is a masterpiece of precision and care. Our skilled artisans employ age-old techniques passed down through generations, ensuring that each stitch, embellishment, and fabric choice meets the highest standards of quality.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                From hand-block printing to intricate embroidery, we honor the artistry of Indian textiles. This dedication to craftsmanship results in garments that are not just beautiful, but are also a testament to a rich cultural legacy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>


    </div>
  );
}