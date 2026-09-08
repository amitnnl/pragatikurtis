import { Heart, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt3D from '../components/Tilt3D';

export default function Wishlist({ wishlist, onRemoveFromWishlist, onAddToCart }) {
  const navigate = useNavigate();

  return (
    <div className="bg-cream min-h-screen text-text-dark">
      {/* Header with 3D Subtle Elevation */}
      <section className="pt-32 pb-12 border-b border-border-soft bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 max-w-7xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-secondary/30 mb-3 animate-float-3d">
              <Sparkles size={12} className="text-secondary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Curated Edit</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-text-dark tracking-tight">Your Wishlist</h1>
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest pb-1">
            {wishlist.length} {wishlist.length === 1 ? 'Piece' : 'Pieces'} Saved
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20 max-w-7xl">
        {wishlist.length === 0 ? (
          <div className="text-center py-28 px-6 border-2 border-dashed border-border-soft rounded-3xl max-w-2xl mx-auto bg-white/70 shadow-sm perspective-1000">
            {/* 3D Floating Heart with Gold Glow */}
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-secondary/30 flex items-center justify-center mx-auto animate-float-3d shadow-[0_16px_32px_rgba(128,27,52,0.15)]">
                <Heart className="w-12 h-12 text-primary fill-primary/20" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary animate-ping opacity-60"></span>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif text-text-dark mb-3">Your Wishlist is Empty</h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto text-sm font-light leading-relaxed">
              Curate your dream ethnic wardrobe. Explore our artisanal kurtis and royal suit sets, then save your favorites here.
            </p>
            <button 
              onClick={() => navigate('/shop')}
              className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-widest px-8 py-3.5 btn-3d-press"
            >
              Explore Collections <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {wishlist.map(product => (
              <motion.div 
                layout
                key={product.id} 
                className="h-full"
              >
                <Tilt3D maxTilt={9} glare={true} scale={1.02} className="h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-border-soft shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full preserve-3d">
                    
                    {/* Image Stage with 3D Depth */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-soft-surface">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </Link>

                      {/* 3D Floating Remove Action */}
                      <button 
                        onClick={() => onRemoveFromWishlist(product.id)}
                        aria-label="Remove from Wishlist"
                        style={{ transform: 'translateZ(26px)' }}
                        className="absolute top-3.5 right-3.5 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full text-text-muted hover:text-red-600 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-md btn-3d-press active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Price Pill */}
                      <div 
                        style={{ transform: 'translateZ(22px)' }}
                        className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-md border border-secondary/20"
                      >
                        ₹{Number(product.price).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Card Body & 3D Tactile CTA */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4 bg-white">
                      <div>
                        {product.category && (
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">
                            {product.category}
                          </span>
                        )}
                        <h3 className="font-serif font-medium text-text-dark text-base leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      <button 
                        onClick={() => { onAddToCart(product); onRemoveFromWishlist(product.id); }}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:shadow-lg btn-3d-press flex items-center justify-center gap-2"
                      >
                        Move to Bag
                      </button>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}