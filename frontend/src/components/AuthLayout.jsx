import { motion } from 'framer-motion';
import { BRAND_CONFIG } from '../config/branding';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-text-700 mb-1">
          {BRAND_CONFIG.shortName}
        </h1>
        <h2 className="text-3xl font-serif font-semibold text-text-700">{title}</h2>
        <p className="text-text-500 mt-2">{subtitle}</p>
      </div>
      
      <div className="bg-surface-100 p-8 rounded-xl shadow-md border border-surface-200">
        {children}
      </div>
    </motion.div>
  </div>
);

export default AuthLayout;
