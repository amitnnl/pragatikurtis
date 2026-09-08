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
        <div className="px-6 py-5 border-b border-border-soft flex justify-between items-center bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart size={18} />
            </div>
            <h2 className="text-lg font-serif font-medium text-text-dark">Your Shopping Bag</h2>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cart.length}
              </span>
            )}
          </div>
          <button onClick={onClose}
            aria-label="Close Shopping Bag"
            className="w-9 h-9 rounded-full bg-cream hover:bg-primary hover:text-white flex items-center justify-center text-text-dark transition-all btn-3d-press">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-cream/40 perspective-800">
            <div className="w-20 h-20 rounded-3xl bg-white border border-secondary/30 flex items-center justify-center mb-5 animate-float-3d shadow-[0_14px_30px_rgba(128,27,52,0.12)]">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-text-dark">Your bag is empty</h3>
            <p className="text-sm text-text-muted mt-2 mb-6 font-light">Explore our handcrafted silhouettes to begin.</p>
            <button onClick={onClose} className="btn-primary text-xs uppercase tracking-widest px-7 py-3 btn-3d-press">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-cream/30">
              <AnimatePresence mode="popLayout">
                {cart.map(item => (
                  <motion.div
                    layout
                    key={item.cartItemId}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex gap-4 bg-white p-3.5 rounded-2xl border border-border-soft shadow-sm hover:shadow-md card-3d-lift"
                  >
                    <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-soft-surface shrink-0 border border-border-soft/60">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0 py-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-sm text-text-dark font-medium leading-snug line-clamp-2">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.cartItemId)}
                          aria-label="Remove item"
                          className="text-text-muted/60 hover:text-red-500 transition-colors shrink-0 mt-0.5 btn-3d-press p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Variants and Sizes */}
                      <p className="text-[11px] text-text-muted mt-1 flex flex-wrap gap-x-1.5">
                        {item.selectedSize && <span>Size: <strong className="text-text-dark">{item.selectedSize}</strong></span>}
                        {item.selectedColor && <span>| {item.selectedColor}</span>}
                        {item.selectedFabric && <span>| {item.selectedFabric}</span>}
                      </p>

                      {/* Custom Stitching Badge */}
                      {item.isCustomStitching && (
                        <div className="mt-1.5 p-1.5 bg-secondary/10 rounded-md border border-secondary/30">
                           <p className="text-[10px] font-bold text-secondary mb-0.5">Custom Fit (+₹150)</p>
                           {item.customMeasurements && (
                             <p className="text-[9px] text-text-muted leading-tight">
                               B:{item.customMeasurements.bust || '-'}, W:{item.customMeasurements.waist || '-'}, H:{item.customMeasurements.hips || '-'}, L:{item.customMeasurements.length || '-'}
                             </p>
                           )}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <div className="flex items-center gap-1 border border-border-soft rounded-lg overflow-hidden bg-cream/70">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-text-dark hover:bg-white disabled:opacity-30 transition-all btn-3d-press">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-text-dark">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-7 h-7 flex items-center justify-center text-text-dark hover:bg-white transition-all btn-3d-press">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-5 bg-white border-t border-border-soft space-y-4 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-dark">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span className="font-semibold text-text-dark">₹{shippingAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-text-dark pt-2 border-t border-border-soft">
                  <span>Estimated Total</span>
                  <span className="text-primary font-bold">₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted/70 text-center">Taxes & shipping verified at checkout.</p>
              <button onClick={handleCheckout}
                className="w-full btn-primary justify-center text-xs uppercase tracking-widest py-4 btn-3d-press shadow-[0_12px_26px_rgba(128,27,52,0.35)]">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
