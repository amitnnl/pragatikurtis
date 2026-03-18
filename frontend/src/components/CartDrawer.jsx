import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, cartTotal }) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        className="absolute inset-0 bg-primary/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-sm bg-surface-100 h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-surface-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text-700">Your Bag</h2>
          <button onClick={onClose} className="text-text-500 hover:text-text-700 transition-colors"><X size={24} /></button>
        </div>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="w-16 h-16 text-text-500/20 mb-4" />
            <p className="font-semibold text-text-700">Your bag is empty.</p>
            <p className="text-sm text-text-500 mt-1">Add some items to get started.</p>
            <button onClick={onClose} className="mt-6 bg-accent text-white px-6 py-3 rounded-lg text-sm font-bold">Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.cartItemId} 
                  className="flex gap-4"
                >
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md bg-text-500/10" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-text-700 text-sm pr-2">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-text-500/50 hover:text-text-700 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    {item.selectedSize && <p className="text-xs text-text-500 mt-1">Size: {item.selectedSize}</p>}
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center border border-surface-200 rounded-md">
                        <button onClick={() => updateQuantity(item.cartItemId, -1)} disabled={item.quantity <= 1} className="p-2 disabled:opacity-30 text-text-700"><Minus size={14} /></button>
                        <span className="text-sm font-semibold w-6 text-center text-text-700">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-2 text-text-700"><Plus size={14} /></button>
                      </div>
                      <span className="font-semibold text-text-700">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 border-t border-surface-200 bg-surface">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-text-500">Subtotal</span>
                <span className="font-semibold text-text-700">₹{cartTotal}</span>
              </div>
              <p className="text-xs text-text-500/70 mb-4 text-right">Taxes & shipping calculated at checkout</p>
              
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg text-sm uppercase tracking-wider"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
