import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-cream border-t border-border-soft pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="font-serif text-3xl text-text-dark">
              {settings?.site_short_name || 'Pragati Kurtis'}
            </Link>
            <p className="text-text-muted leading-relaxed">
              Elegant Indian fashion for every occasion. Discover timeless silhouettes and beautiful fabrics.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border-soft flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="font-semibold text-text-dark tracking-widest uppercase text-sm mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-text-muted hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/shop?collection=new" className="text-text-muted hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?collection=bestsellers" className="text-text-muted hover:text-primary transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-semibold text-text-dark tracking-widest uppercase text-sm mb-6">Customer Care</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-text-muted hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="text-text-muted hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-text-muted hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faqs" className="text-text-muted hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/track-order" className="text-text-muted hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 4: Information */}
          <div>
            <h4 className="font-semibold text-text-dark tracking-widest uppercase text-sm mb-6">Information</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-text-muted hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-text-muted hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-text-muted hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border-soft pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm text-center md:text-left">
            © {new Date().getFullYear()} Pragati Kurtis. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-text-muted text-sm">
            <span>Secured Payment Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
