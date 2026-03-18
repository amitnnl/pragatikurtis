import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, user }) {
  const [isHovered, setIsHovered] = useState(false);
  const sizes = product.sizes ? product.sizes.split(',') : ['S', 'M', 'L', 'XL'];

  const handleQuickAdd = (size) => {
    onAddToCart({ ...product, selectedSize: size });
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-100 rounded-lg shadow-sm">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="300"
            height="400"
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isWishlisted ? 'bg-accent text-white' : 'bg-surface-100/80 text-text-700 backdrop-blur-sm hover:bg-accent hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        
        {/* Quick Add Sizes */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-2 bg-surface-100/90 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs font-semibold text-text-700 mr-2">Quick Add:</span>
            {sizes.map(size => (
              <button 
                key={size} 
                onClick={() => handleQuickAdd(size)}
                className="w-8 h-8 text-xs font-bold border border-muted/20 rounded-md text-text-700 hover:bg-accent hover:text-white hover:border-accent transition-all"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-500 font-medium tracking-wide">{product.category}</p>
        <Link to={`/product/${product.id}`} className="block mt-1">
          <h4 className="font-serif text-lg text-text-700 hover:text-accent transition-colors">{product.name}</h4>
        </Link>
        
        <div className="mt-2">
          {user?.role === 'dealer' && user?.is_approved == 1 && product.dealer_price ? (
             <div className="flex items-baseline justify-center gap-2">
                <p className="text-text-700 font-bold text-base">₹{product.dealer_price}</p>
                <p className="text-sm text-text-500 line-through">₹{product.price}</p>
             </div>
          ) : (
             <p className="text-text-700 font-bold text-base">₹{product.price}</p>
          )}
        </div>
      </div>
    </div>
  )
}