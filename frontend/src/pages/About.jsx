import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { FaLeaf, FaUsers, FaPenNib } from 'react-icons/fa';

// Placeholder team members
const teamMembers = [
  { name: 'Anjali Sharma', role: 'Founder & Lead Designer', image: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Rohan Gupta', role: 'Head of Operations', image: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Priya Singh', role: 'Marketing Director', image: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Amit Patel', role: 'Master Tailor', image: 'https://i.pravatar.cc/150?img=4' },
];

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
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  };

  return (
    <div className="bg-cream-100">
      <SEO 
        title="Our Story | Pragati Kurties" 
        description="Discover the heritage, passion, and craftsmanship behind Pragati Kurties. A tradition of elegance, redefined."
      />

      {/* Hero Section */}
      <motion.section 
        className="relative h-[60vh] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('/banners/Anarkali-Suit.jpeg')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <motion.div 
          className="relative z-10 text-center px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter uppercase">
            {page.page_title || 'Weaving Dreams into Dresses'}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            A legacy of traditional craftsmanship meeting the pinnacle of modern fashion.
          </p>
        </motion.div>
      </motion.section>

      {/* Our Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif text-gray-800 mb-6">Our Mission</h2>
          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
            To celebrate and preserve the rich heritage of Indian textiles by creating timeless, elegant kurties for the modern woman. We are committed to ethical practices, sustainable sourcing, and empowering local artisans.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div custom={0} variants={featureVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
              <FaLeaf className="text-5xl text-green-600 mb-4"/>
              <h3 className="text-xl font-semibold text-gray-800">Sustainable Fabrics</h3>
              <p className="text-gray-600 mt-2">Using eco-friendly materials that are kind to your skin and the planet.</p>
            </motion.div>
            <motion.div custom={1} variants={featureVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
              <FaUsers className="text-5xl text-blue-600 mb-4"/>
              <h3 className="text-xl font-semibold text-gray-800">Empowering Artisans</h3>
              <p className="text-gray-600 mt-2">Providing fair wages and a global platform for talented local craftsmen.</p>
            </motion.div>
            <motion.div custom={2} variants={featureVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
              <FaPenNib className="text-5xl text-red-600 mb-4"/>
              <h3 className="text-xl font-semibold text-gray-800">Exquisite Designs</h3>
              <p className="text-gray-600 mt-2">Blending traditional motifs with contemporary styles for a unique aesthetic.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-24"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <img src="/banners/Sharara-Suit.jpg" alt="Craftsmanship" className="rounded-lg shadow-xl object-cover w-full h-full" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-4xl font-serif text-gray-800 mb-6 text-center md:text-left">Our Story</h2>
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div 
                className="prose prose-lg text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Meet the Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif text-center text-gray-800 mb-12">Meet Our Creative Force</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 shadow-md" />
                <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
                <p className="text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Craftsmanship Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-serif text-gray-800 mb-6">A Tradition of Excellence</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Every Pragati Kurti is a masterpiece of precision and care. Our skilled artisans employ age-old techniques passed down through generations, ensuring that each stitch, embellishment, and fabric choice meets the highest standards of quality.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                From hand-block printing to intricate embroidery, we honor the artistry of Indian textiles. This dedication to craftsmanship results in garments that are not just beautiful, but are also a testament to a rich cultural legacy.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <motion.img whileHover={{ scale: 1.05 }} src="/banners/Gown-Dresses.jpeg" alt="Detail 1" className="rounded-lg shadow-lg object-cover w-full h-64" />
              <motion.img whileHover={{ scale: 1.05 }} src="/banners/Afghani-Suits.jpg" alt="Detail 2" className="rounded-lg shadow-lg object-cover w-full h-64" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}