import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Wishlist({ wishlist, onRemoveFromWishlist, onAddToCart }) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface min-h-screen">
      <section className="pt-24 pb-12 border-b border-muted/10">
        <div className="container mx-auto px-4 flex justify-between items-end">
          <h1 className="text-6xl font-serif font-bold text-text tracking-tighter uppercase">Wishlist</h1>
          <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest pb-2">{wishlist.length} Saved Items</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-24">
        {wishlist.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-muted/20 rounded-3xl">
            <Heart className="w-16 h-16 text-muted/50 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold mb-2">Your collection is empty</h2>
            <p className="text-muted/70 mb-10 max-w-xs mx-auto">Save your favorite handcrafted pieces here to find them easily later.</p>
            <button 
              onClick={() => navigate('/shop')}
              className="px-12 py-4 bg-accent text-white font-bold uppercase tracking-widest text-[10px] hover:bg-accent-dark transition-all duration-500"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {wishlist.map(product => (
              <motion.div 
                layout
                key={product.id} 
                className="group relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-100 mb-6">
                  <Link to={`/product/${product.id}`}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <button 
                    onClick={() => onRemoveFromWishlist(product.id)}
                    className="absolute top-4 right-4 p-2 bg-surface/80 backdrop-blur-sm rounded-full text-danger hover:bg-danger hover:text-white transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center px-4">
                     <h4 className="font-serif font-bold text-text-700 text-lg mb-1 truncate">{product.name}</h4>
                     <p className="text-muted/70 font-bold text-sm">₹{product.price}</p>
                  </div>
                  <button 
                    onClick={() => { onAddToCart(product); onRemoveFromWishlist(product.id); }}
                    className="w-full py-4 bg-surface text-text border-2 border-text font-bold uppercase tracking-widest text-[10px] hover:bg-text hover:text-surface transition-all duration-500 shadow-xl"
                  >
                    Move to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}