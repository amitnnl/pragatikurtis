import { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, user }) {
  const [isHovered, setIsHovered] = useState(false);
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];

  const displayPrice = user?.role === 'dealer' && user?.is_approved == 1 && product.dealer_price
    ? product.dealer_price : product.price;
  const originalPrice = user?.role === 'dealer' && user?.is_approved == 1 && product.dealer_price
    ? product.price : null;

  const handleQuickAdd = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart({ ...product, selectedSize: size });
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface-100 shadow-sm">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
            isWishlisted
              ? 'bg-accent text-white scale-110'
              : 'bg-white/90 text-text-700 backdrop-blur-sm hover:bg-accent hover:text-white hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* New badge */}
        {product.is_new && (
          <span className="absolute top-3 left-3 badge bg-accent text-white text-[10px]">New</span>
        )}

        {/* Quick action overlay */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-400 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/95 backdrop-blur-sm p-3 mx-2 mb-2 rounded-xl shadow-lg">
            <p className="text-[10px] font-bold text-text-700/50 uppercase tracking-widest mb-2 text-center">Quick Add</p>
            <div className="flex justify-center items-center gap-1.5 flex-wrap">
              {sizes.slice(0, 5).map(size => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className="min-w-[2rem] h-8 px-2 text-xs font-bold border border-muted/20 rounded-lg text-text-700 hover:bg-accent hover:text-white hover:border-accent transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Details link */}
        <Link to={`/product/${product.id}`}
          className={`absolute left-3 bottom-3 flex items-center gap-1.5 text-[11px] font-semibold text-white bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ display: isHovered ? 'flex' : 'none' }}
        >
          <Eye size={12} /> View
        </Link>
      </div>

      {/* Info */}
      <div className="mt-4 px-1">
        <p className="text-[11px] text-accent font-semibold tracking-widest uppercase">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h4 className="font-serif text-base md:text-lg text-text-700 mt-0.5 leading-snug hover:text-accent transition-colors line-clamp-2">{product.name}</h4>
        </Link>
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-text-700 font-bold text-base">₹{displayPrice}</p>
          {originalPrice && (
            <p className="text-muted/60 text-sm line-through">₹{originalPrice}</p>
          )}
        </div>
      </div>
    </div>
  );
}