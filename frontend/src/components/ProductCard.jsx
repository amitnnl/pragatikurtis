import { useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt3D from './Tilt3D';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, user }) {
  const [isHovered, setIsHovered] = useState(false);
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];

  const displayPrice = user?.role === 'dealer' && user?.is_approved == 1 && product.dealer_price
    ? product.dealer_price : product.price;
  const originalPrice = user?.role === 'dealer' && user?.is_approved == 1 && product.dealer_price
    ? product.price : (product.original_price || (product.price * 1.25).toFixed(0));
    
  const discount = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart({ ...product, selectedSize: sizes[0] }); // Add default size
  };

  return (
    <div
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Dynamic Tilt Image Container */}
      <Tilt3D maxTilt={7} scale={1.03} className="mb-4 rounded-[16px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-soft-surface border border-border-soft/80 group-hover:border-primary/40 group-hover:shadow-3d transition-all duration-500">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Wishlist with 3D Z-elevation */}
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
            style={{ transform: "translateZ(26px)" }}
            aria-label="Toggle wishlist"
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
              isWishlisted
                ? 'bg-primary text-white scale-110 shadow-md'
                : 'bg-white/85 text-text-muted backdrop-blur-sm hover:bg-primary hover:text-white hover:scale-110 shadow-sm'
            }`}
          >
            <Heart size={18} className={`${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Badges with 3D Z-elevation */}
          <div 
            style={{ transform: "translateZ(24px)" }}
            className="absolute top-3 left-3 flex flex-col gap-1.5 z-20"
          >
            {product.is_new && (
              <span className="bg-white/95 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm border border-secondary/30">New</span>
            )}
            {discount > 0 && (
              <span className="bg-sale text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Quick action overlay with 3D Z-elevation */}
          <div 
            style={{ transform: "translateZ(28px)" }}
            className={`absolute bottom-3 left-3 right-3 transition-all duration-300 z-20 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
             <button
               onClick={handleQuickAdd}
               className="w-full bg-white/95 backdrop-blur-md text-text-dark font-medium text-xs tracking-wider uppercase py-3 rounded-[10px] flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-lg border border-border-soft hover:border-primary active:scale-95"
             >
               <ShoppingBag size={15} />
               QUICK ADD
             </button>
          </div>
        </div>
      </Tilt3D>

      {/* Info */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] text-text-muted uppercase tracking-widest">{product.category}</p>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star size={10} className="fill-current" />
            <span className="text-[10px] text-text-muted font-medium ml-0.5">4.8 (42)</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h4 className="font-serif text-lg text-text-dark leading-snug hover:text-primary transition-colors line-clamp-1">{product.name}</h4>
        </Link>
        
        <div className="flex items-center gap-2 mt-2">
          <p className="text-text-dark font-semibold">₹{displayPrice}</p>
          {originalPrice && (
            <p className="text-text-muted text-sm line-through">₹{originalPrice}</p>
          )}
        </div>
      </div>
    </div>
  );
}