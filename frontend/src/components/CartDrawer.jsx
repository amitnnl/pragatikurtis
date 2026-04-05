import { ShoppingBag, X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, cartTotal }) {
  const navigate = useNavigate();
  const shippingAmount = cartTotal >= 999 ? 100 : 150;
  const orderTotal = cartTotal + shippingAmount;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: isOpen ? 1 : 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="relative w-full max-w-sm bg-surface h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-200 flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-accent" />
            <h2 className="text-lg font-serif font-medium text-text-700">Your Bag</h2>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-100 hover:bg-primary hover:text-white flex items-center justify-center text-text-500 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-5">
              <ShoppingBag className="w-9 h-9 text-muted/30" />
            </div>
            <h3 className="font-serif text-xl text-text-700">Your bag is empty</h3>
            <p className="text-sm text-muted/60 mt-2 mb-6 font-light">Add some beautiful pieces to get started.</p>
            <button onClick={onClose} className="btn-primary text-sm px-6 py-3">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div
                    layout
                    key={item.cartItemId}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex gap-4 bg-surface-100 p-3 rounded-2xl"
                  >
                    <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-surface-200 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0 py-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-sm text-text-700 leading-snug line-clamp-2">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.cartItemId)}
                          className="text-muted/40 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Variants and Sizes */}
                      <p className="text-[11px] text-muted/70 mt-1 flex flex-wrap gap-x-1.5">
                        {item.selectedSize && <span>Size: <strong className="text-text-700">{item.selectedSize}</strong></span>}
                        {item.selectedColor && <span>| {item.selectedColor}</span>}
                        {item.selectedFabric && <span>| {item.selectedFabric}</span>}
                      </p>

                      {/* Custom Stitching Badge */}
                      {item.isCustomStitching && (
                        <div className="mt-1.5 p-1.5 bg-accent/10 rounded-md border border-accent/20">
                           <p className="text-[10px] font-bold text-accent mb-0.5">Custom Fit (+₹150)</p>
                           {item.customMeasurements && (
                             <p className="text-[9px] text-text-500 leading-tight">
                               B:{item.customMeasurements.bust || '-'}, W:{item.customMeasurements.waist || '-'}, H:{item.customMeasurements.hips || '-'}, L:{item.customMeasurements.length || '-'}
                             </p>
                           )}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <div className="flex items-center gap-1 border border-surface-200 rounded-lg overflow-hidden bg-surface">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-text-700 hover:bg-muted/10 disabled:opacity-30 transition-all">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center text-text-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-7 h-7 flex items-center justify-center text-text-700 hover:bg-muted/10 transition-all">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-text-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-5 bg-surface border-t border-surface-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-700">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted/70">
                  <span>Shipping</span>
                  <span className="font-semibold text-text-700">₹{shippingAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-text-700 pt-2 border-t border-muted/10">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted/50 text-center">Shipping calculated at checkout. (Including GST)</p>
              <button onClick={handleCheckout}
                className="w-full btn-primary justify-center text-sm py-4">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
