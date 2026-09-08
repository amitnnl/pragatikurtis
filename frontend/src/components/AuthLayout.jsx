import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../config/branding';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex bg-cream text-text-dark">
    {/* Left – Decorative 3D Panel */}
    <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-16 perspective-1000">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-black/20 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="relative text-center space-y-6 max-w-md z-10">
        <Link to="/" className="inline-block font-serif text-4xl text-cream font-medium tracking-wide mb-4 hover:scale-105 transition-transform">
          {BRAND_CONFIG.shortName}
        </Link>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-secondary/40 animate-float-3d mx-auto">
          <Sparkles size={14} className="text-secondary" />
          <span className="text-xs uppercase tracking-widest text-cream font-semibold">The Heritage Club</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-serif text-white font-normal leading-snug">
          Celebrate Heritage with <em>Refined Splendor</em>
        </h2>
        
        <p className="text-white/70 font-light text-sm leading-relaxed max-w-sm mx-auto">
          Handcrafted royal suits and bespoke kurtis tailored for memorable celebrations.
        </p>

        <div className="flex gap-2.5 justify-center pt-6">
          {['Artisanal Craft', 'Complimentary Shipping', 'Bespoke Stitching'].map(tag => (
            <span key={tag} className="text-[10px] px-3.5 py-1.5 rounded-full border border-secondary/30 bg-white/5 text-cream/90 font-medium tracking-wider uppercase">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Right – 3D Form Panel */}
    <div className="flex-1 flex items-center justify-center px-6 py-16 perspective-1000">
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-border-soft card-3d-lift"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Mobile brand */}
        <Link to="/" className="lg:hidden block font-serif text-2xl text-primary font-medium text-center mb-6">
          {BRAND_CONFIG.shortName}
        </Link>

        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-text-dark">{title}</h1>
          <p className="text-text-muted text-xs sm:text-sm mt-1.5 font-light">{subtitle}</p>
        </div>

        {children}
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
