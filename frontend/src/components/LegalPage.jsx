import React from 'react';
import { motion } from 'framer-motion';
import SEO from './SEO';

const LegalPage = ({ title, description, lastUpdated, children }) => {
  return (
    <div className="bg-gray-50">
      <SEO title={title} description={description} />
      
      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-800 tracking-tighter">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-2 text-sm text-gray-500">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <motion.main 
        className="py-16 sm:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-md">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default LegalPage;
