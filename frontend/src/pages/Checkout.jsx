import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, Tag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import useRazorpay from "react-razorpay";
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/SEO';

export default function Checkout({ cart, cartTotal, user, clearCart }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [Razorpay] = useRazorpay();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: '', 
    street: '', 
    city: '', 
    state: '', 
    zip: '', 
    country: 'India' 
  });

  const shippingAmount = cartTotal >= 999 ? 100 : 150;
  
  // Loyalty points logic: 1 point = ₹1 discount
  const maxPoints = parseInt(user?.loyalty_points || 0);
  const pointsDiscount = redeemPoints ? Math.min(maxPoints, cartTotal) : 0;
  const finalTotal = cartTotal + shippingAmount - pointsDiscount;

  const displayRazorpay = async () => {
    setLoading(true);
    try {
      const orderData = await authFetch('/create_order.php', {
        method: 'POST',
        body: JSON.stringify({ amount: finalTotal })
      }).then(t => t.json());

      if(orderData.status !== 'success') {
        alert(orderData.message || 'Failed to create order.');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "Pragati Kurtis",
        description: "Payment for Order",
        order_id: orderData.order_id,
        handler: (res) => handlePlaceOrder('razorpay', res),
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: { color: "#E67E22" }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response){
          alert("Payment failed: " + response.error.description);
          setLoading(false);
      });
      rzp.open();
    } catch (err) {
      alert("Error initializing payment.");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (method, paymentResponse = null) => {
      setLoading(true);
      const payload = {
        cart,
        total_amount: finalTotal,
        shipping_amount: shippingAmount,
        tax_amount: 0,
        points_redeemed: pointsDiscount,
        payment_method: method,
        shipping_address_line1: shippingAddress.street,
        shipping_address_line2: '',
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_postal_code: shippingAddress.zip,
        shipping_country: shippingAddress.country,
        guest_name: shippingAddress.name,
        guest_email: shippingAddress.email,
        user_id: user?.id,
        payment_id: paymentResponse?.razorpay_payment_id,
        razorpay_order_id: paymentResponse?.razorpay_order_id
      };

      try {
        const data = await authFetch(`/orders.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.json());

        if (data.status === 'success') {
          clearCart();
          setStep(3);
        } else {
          alert('Failed to place order: ' + data.message);
        }
      } catch (error) {
        alert('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <h1 className="text-3xl font-serif text-text-700 mb-8">Your bag is empty</h1>
        <button onClick={() => navigate('/shop')} className="btn-primary px-8">Go to Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-surface pt-28 pb-20">
      <SEO title="Checkout" description="Complete your order at Pragati Kurtis." />
      
      <div className="container mx-auto px-6">
        <header className="mb-12">
           <button onClick={() => navigate(-1)} className="text-muted/50 hover:text-text-700 flex items-center gap-2 mb-4 group transition-colors">
             <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
             <span className="text-sm font-medium">Back</span>
           </button>
           <h1 className="text-4xl font-serif text-text-700">Checkout</h1>
        </header>

        <AnimatePresence mode="wait">
          {step === 3 ? (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-8 bg-surface-100 rounded-3xl border border-muted/8 shadow-xl max-w-2xl mx-auto space-y-6">
               <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={48}/>
               </div>
               <h2 className="text-4xl font-serif text-text-700">Order Received!</h2>
               <p className="text-muted/60 max-w-md mx-auto font-light">Thank you for shopping with us. Your order is being processed and you'll receive an email confirmation shortly.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                  <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
                  {user && <button onClick={() => navigate('/profile')} className="btn-outline">Track Your Order</button>}
               </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Shipping & Payment Form */}
              <main className="lg:col-span-7 space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <div className="bg-white rounded-2xl p-8 border border-muted/8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">1</div>
                          <h3 className="text-xl font-serif text-text-700">Shipping Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Full Name</label>
                            <input placeholder="Enter name" value={shippingAddress.name} onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} className="input-field py-2.5"/>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Email Address</label>
                            <input placeholder="Enter email" type="email" value={shippingAddress.email} onChange={e => setShippingAddress({...shippingAddress, email: e.target.value})} className="input-field py-2.5"/>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Phone Number</label>
                             <input placeholder="Enter phone" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} className="input-field py-2.5"/>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Postal Code</label>
                             <input placeholder="6-digit ZIP" value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} className="input-field py-2.5"/>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Street Address</label>
                           <input placeholder="House No, Building, Street…" value={shippingAddress.street} onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})} className="input-field py-2.5"/>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">City</label>
                              <input placeholder="Enter city" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="input-field py-2.5"/>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">State</label>
                              <input placeholder="Enter state" value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} className="input-field py-2.5"/>
                           </div>
                        </div>

                        <button onClick={() => setStep(2)} disabled={!shippingAddress.street || !shippingAddress.zip} className="w-full mt-4 btn-primary py-4 uppercase tracking-widest text-xs disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none">
                          Continue to Payment
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                       <div className="bg-white rounded-2xl p-8 border border-muted/8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">2</div>
                          <h3 className="text-xl font-serif text-text-700">Payment Option</h3>
                        </div>

                        <button onClick={displayRazorpay} disabled={loading} className="w-full flex items-center justify-between p-6 bg-accent/5 border-2 border-accent rounded-2xl group transition-all">
                           <div className="text-left">
                             <p className="font-bold text-text-700">Secure Online Payment</p>
                             <p className="text-xs text-muted/60 mt-1">Cards, UPI, Netbanking via Razorpay</p>
                           </div>
                           <div className="w-6 h-6 rounded-full border-2 border-accent bg-accent flex items-center justify-center text-white scale-110">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                           </div>
                        </button>

                        <div className="pt-4">
                          <button onClick={() => setStep(1)} className="text-xs font-bold text-muted/40 hover:text-accent uppercase tracking-widest transition-colors">
                            ← Back to Shipping
                          </button>
                        </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              {/* Order Summary */}
              <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-muted/8 shadow-sm">
                  <h3 className="text-lg font-serif text-text-700 border-b border-muted/10 pb-4 mb-6 uppercase tracking-wider text-xs font-bold">Your Order</h3>
                  <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.cartItemId} className="flex gap-4 items-center">
                        <div className="w-16 aspect-[3/4] shrink-0 rounded-lg overflow-hidden bg-surface-100 border border-muted/5">
                          <img src={item.image} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-text-700">{item.name}</p>
                          <p className="text-[10px] uppercase font-bold text-muted/40 tracking-widest mt-0.5">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-text-700 shrink-0">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Loyalty Points Redemption */}
                  {user && maxPoints > 0 && (
                    <div className="mb-8 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                               <Tag size={16} />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-text-700">Redeem Loyalty Points</p>
                               <p className="text-[10px] text-muted/60 mt-0.5">You have {maxPoints} points available</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setRedeemPoints(!redeemPoints)}
                           className={`w-10 h-6 rounded-full transition-all relative ${redeemPoints ? 'bg-accent' : 'bg-muted/20'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${redeemPoints ? 'left-5' : 'left-1'}`} />
                         </button>
                      </div>
                      {redeemPoints && (
                        <div className="mt-3 text-[10px] font-bold text-accent uppercase tracking-widest animate-fade-in">
                          ₹{pointsDiscount} discount applied
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 pt-6 border-t border-muted/10">
                     <div className="flex justify-between text-sm text-muted/60">
                        <span>Subtotal</span>
                        <span className="font-semibold text-text-700">₹{cartTotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm text-muted/60">
                        <span>Shipping</span>
                        <span className="font-semibold text-text-700">₹{shippingAmount.toFixed(2)}</span>
                     </div>
                     {redeemPoints && pointsDiscount > 0 && (
                       <div className="flex justify-between text-sm text-accent">
                          <span>Points Discount</span>
                          <span className="font-semibold">- ₹{pointsDiscount.toFixed(2)}</span>
                       </div>
                     )}
                     <div className="flex justify-between text-sm italic text-muted/40">
                        <span>Including GST</span>
                        <span>0%</span>
                     </div>
                     <div className="flex justify-between text-xl pt-5 border-t border-muted/10 mt-5">
                        <span className="font-serif text-text-700">Order Total</span>
                        <span className="font-bold text-text-700 font-sans tracking-tight">₹{finalTotal.toFixed(2)}</span>
                     </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-100 rounded-2xl flex items-center gap-3">
                   <ShieldCheck className="text-accent" size={20} />
                   <p className="text-[10px] text-muted/60 font-medium">Your payment is encrypted and processed securely via SSL. We do not store your card details.</p>
                </div>
              </aside>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

