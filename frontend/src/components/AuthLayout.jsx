import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/branding';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex bg-surface">
    {/* Left – Decorative Panel */}
    <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-16">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
      <div className="relative text-center space-y-6 max-w-md">
        <Link to="/" className="block font-serif text-4xl text-white font-light mb-8">
          {BRAND_CONFIG.shortName}
        </Link>
        <h2 className="text-3xl md:text-4xl font-serif font-light text-white leading-snug">
          Celebrate Tradition<br />with <em>Vibrant Elegance</em>
        </h2>
        <p className="text-white/40 font-light leading-relaxed">
          Handcrafted ethnic wear for the modern woman. Discover timeless beauty in every thread.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          {['New Arrivals', 'Exclusive Deals', 'Premium Quality'].map(tag => (
            <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full border border-white/15 text-white/50 font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Right – Form Panel */}
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Mobile brand */}
        <Link to="/" className="lg:hidden block font-serif text-2xl text-primary font-light text-center mb-8">
          {BRAND_CONFIG.shortName}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-light text-text-700">{title}</h1>
          <p className="text-muted/60 mt-2 font-light">{subtitle}</p>
        </div>

        {children}
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
