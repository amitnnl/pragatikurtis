import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import useRazorpay from "react-razorpay";
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext'; // Import useSettings

const CheckoutStep = ({ number, title, active }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${active ? 'bg-accent text-surface' : 'bg-surface-200 text-text-500'}`}>
      {active ? number : '✓'}
    </div>
    <span className={`font-semibold ${active ? 'text-text-700' : 'text-text-500'}`}>{title}</span>
  </div>
);

export default function Checkout({ cart, cartTotal, user, clearCart }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [Razorpay] = useRazorpay();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings(); // Get settings from context
  
  if (settingsLoading) return <div>Loading checkout settings...</div>;
  if (settingsError) return <div>Error loading checkout settings: {settingsError.message}</div>;
  if (!settings) return null; // Fallback for when settings are not yet loaded
  
  const [shippingAddress, setShippingAddress] = useState({ name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const shippingAmount = parseFloat(settings.shipping_cost);
  const taxRate = parseFloat(settings.tax_rate) / 100;
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + shippingAmount + taxAmount;

  const displayRazorpay = async () => {
    setLoading(true);
    const orderData = await authFetch('/create_order.php', {
      method: 'POST',
      body: JSON.stringify({ amount: finalTotal })
    }).then(t => t.json());

    if(orderData.status !== 'success') {
      alert(orderData.message || 'Failed to create order.');
      return setLoading(false);
    }

    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: "INR",
      name: "Pragati Kurtis",
      order_id: orderData.order_id,
      handler: (res) => handlePlaceOrder('razorpay', res),
      prefill: { name: shippingAddress.name, email: shippingAddress.email, contact: shippingAddress.phone },
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (res) => {
        alert(res.error.description);
        setLoading(false);
    });
    rzp.open();
  };

  const handlePlaceOrder = async (method = 'cod', paymentResponse = null) => {
    setLoading(true);
    try {
      const payload = {
        cart,
        total_amount: finalTotal,
        payment_method: method,
        ...shippingAddress,
        user_id: user?.id,
        payment_id: paymentResponse?.razorpay_payment_id
      };

      const data = await authFetch(`/orders.php`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(res => res.json());

      if (data.status === 'success') {
        clearCart();
        setStep(3);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Order placement failed.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return <div className="container mx-auto px-4 py-40 text-center"><h2 className="text-3xl font-serif text-text-700 mb-6">Your bag is empty</h2><button onClick={() => navigate('/')} className="px-8 py-3 bg-accent text-surface font-bold text-sm rounded-lg">Explore Shop</button></div>
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <header className="flex items-center justify-between border-b border-surface-200 pb-6 mb-8">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-500 hover:text-text-700 transition-colors">
             <ChevronLeft size={20}/> <span className="text-sm font-medium">Back</span>
           </button>
           <h1 className="text-2xl md:text-3xl font-serif text-text-700">Checkout</h1>
        </header>

        <AnimatePresence mode="wait">
          {step === 3 ? (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 md:py-24 space-y-6 bg-surface-100 rounded-xl shadow-md">
               <div className="w-20 h-20 bg-success-soft text-success rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle size={40}/>
               </div>
               <h2 className="text-3xl md:text-4xl font-serif text-text-700">Order Received!</h2>
               <p className="text-muted/70 max-w-md mx-auto">Thank you. Your order is being processed and a confirmation will be sent to your email.</p>
               <div className="flex justify-center gap-4 pt-4">
                  <button onClick={() => navigate('/')} className="px-6 py-3 bg-accent text-surface font-bold text-sm rounded-lg">Back to Home</button>
                  {user && <button onClick={() => navigate('/profile')} className="px-6 py-3 border border-surface-200 text-text-700 font-bold text-sm rounded-lg">Track Order</button>}
               </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
              {/* Order Summary */}
              <aside className="w-full bg-surface-100 p-6 md:p-8 rounded-xl shadow-md lg:sticky lg:top-28">
                <h3 className="text-lg font-semibold text-text-700 border-b border-surface-200 pb-4 mb-6">Order Summary</h3>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.cartItemId} className="flex gap-4 items-center">
                      <img src={item.image} className="w-16 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold truncate text-text-700">{item.name}</p>
                        <p className="text-xs text-muted/70">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm text-text-700">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-surface-200 mt-6 space-y-2">
                   <div className="flex justify-between text-sm"><span className="text-muted/70">Subtotal</span><span className="font-semibold text-text-700">₹{cartTotal.toFixed(2)}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-muted/70">Shipping</span><span className="font-semibold text-text-700">₹{shippingAmount.toFixed(2)}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-muted/70">Tax</span><span className="font-semibold text-text-700">₹{taxAmount.toFixed(2)}</span></div>
                   <div className="flex justify-between text-lg pt-4 border-t border-surface-200 mt-4"><span className="font-bold text-text-700">Total</span><span className="font-bold text-text-700">₹{finalTotal.toFixed(2)}</span></div>
                </div>
              </aside>
              
              {/* Shipping & Payment Form */}
              <main className="w-full bg-surface-100 p-6 md:p-8 rounded-xl shadow-md">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="shipping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="text-lg font-semibold text-text-700 mb-6">Shipping Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input placeholder="Full Name" value={shippingAddress.name} onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                          <input placeholder="Email" type="email" value={shippingAddress.email} onChange={e => setShippingAddress({...shippingAddress, email: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                        </div>
                        <input placeholder="Phone" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                        <input placeholder="Street Address" value={shippingAddress.street} onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <input placeholder="City" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                          <input placeholder="State" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                          <input placeholder="Postal Code" value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full"/>
                        </div>
                        <button onClick={() => setStep(2)} disabled={!shippingAddress.street} className="w-full mt-4 py-4 bg-accent text-surface font-bold rounded-lg hover:bg-opacity-90 transition-all text-sm uppercase tracking-wider disabled:bg-surface-300">Continue to Payment</button>
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                       <h3 className="text-lg font-semibold text-text-700 mb-6">Payment Method</h3>
                       <button onClick={displayRazorpay} disabled={loading} className="w-full flex items-center justify-between p-6 bg-surface border-2 border-accent rounded-xl">
                          <div className="text-left">
                            <p className="font-bold text-text-700">Online Payment</p>
                            <p className="text-xs text-muted/70 mt-1">Cards, UPI, Netbanking via Razorpay</p>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-accent bg-accent"></div>
                       </button>
                       <button onClick={() => setStep(1)} className="text-sm text-text-500 hover:text-text-700 mt-6">← Go back to shipping</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
);
}
