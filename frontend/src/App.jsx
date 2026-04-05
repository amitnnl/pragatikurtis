import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider, useToast } from './components/Toast'
import SocialWidgets from './components/SocialWidgets'
import WhatsAppWidget from './components/WhatsAppWidget'
import CartRecovery from './components/CartRecovery'
import { BRAND_CONFIG } from './config/branding'
import authFetch from './utils/authFetch'
import { SettingsProvider, useSettings } from './context/SettingsContext' // Import SettingsProvider and useSettings

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Login = lazy(() => import('./pages/Login'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Profile = lazy(() => import('./pages/Profile'))
const Admin = lazy(() => import('./pages/Admin'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
// const InfoPage = lazy(() => import('./pages/InfoPage.jsx'))
const Shop = lazy(() => import('./pages/Shop'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Sitemap = lazy(() => import('./pages/Sitemap'))



function AppContent({ 
  user, setUser, cart, wishlist, isCartOpen, setIsCartOpen, 
  updateQuantity, removeFromCart, cartTotal, products, 
  categories, addToCart, onToggleWishlist, fetchProducts, clearCart
}) {
  const location = useLocation();
  const { showToast } = useToast()
  const [footerEmail, setFooterEmail] = useState('');
  const [visitorCount, setVisitorCount] = useState(null);
  const { settings } = useSettings();

  useEffect(() => {
    authFetch('/visitor_counter.php')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setVisitorCount(data.count);
      })
      .catch(console.error);
  }, []);
  // Don't block app render while settings load — let pages handle their own loading states
  const isPanelPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile');

  const handleFooterSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/subscribe.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: footerEmail }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(data.message, 'success');
        setFooterEmail('');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Subscription failed. Please try again.', 'error');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product)
    showToast(`Added ${product.name} to bag`, 'success')
  }

  const handleToggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id)
    onToggleWishlist(product)
    showToast(exists ? 'Removed from wishlist' : 'Added to wishlist', 'info')
  }
  
  const PageRoutes = (
      <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home products={products} categories={categories} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} />} />
          <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} user={user} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout cart={cart} cartTotal={cartTotal} user={user} clearCart={clearCart} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <Admin products={products} refreshProducts={fetchProducts} /> : <Navigate to="/" />} 
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onRemoveFromWishlist={(id) => handleToggleWishlist({id})} onAddToCart={handleAddToCart} />} />
          <Route path="/track-order/:id" element={<TrackOrder />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Routes>
  );

  return (
    <div className="min-h-screen bg-surface text-text">
      <ScrollToTop />
      {!isPanelPage && (
        <>
          <SocialWidgets />
          {settings?.feature_whatsapp_bot !== '0' && <WhatsAppWidget />}
        </>
      )}
      <CartRecovery cart={cart} />
      
      {!isPanelPage && (
        <Navbar 
          cartCount={cart.length} 
          wishlistCount={wishlist.length}
          onCartOpen={() => setIsCartOpen(true)} 
          user={user}
          setUser={setUser}
          products={products}
        />
      )}
      
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            cartTotal={cartTotal}
            user={user}
          />
        )}
      </AnimatePresence>

      <div>
        {PageRoutes}
      </div>

      {!isPanelPage && (
        <footer className="bg-primary text-white">
          {/* Main Footer */}
          <div className="container mx-auto px-6 pt-20 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
              {/* Brand */}
              <div className="md:col-span-4 space-y-5">
                <h3 className="font-serif text-2xl font-light">{settings?.site_short_name || BRAND_CONFIG.shortName}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light max-w-xs">
                  {settings?.site_description || BRAND_CONFIG.tagline}
                </p>
                <div className="flex gap-3 pt-2">
                  {[['F', BRAND_CONFIG.social.facebook], ['I', BRAND_CONFIG.social.instagram], ['Y', BRAND_CONFIG.social.youtube]].map(([l, href]) => (
                    <a key={l} href={href} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:bg-accent hover:border-accent hover:text-white text-xs font-bold transition-all">
                      {l}
                    </a>
                  ))}
                </div>
              </div>

              {/* Shop Links */}
              <div className="md:col-span-2">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent mb-5">Shop</p>
                <ul className="space-y-3 text-sm">
                  {[['All Products', '/shop'], ['Kurtis', '/shop?category=Kurti'], ['Suit Sets', '/shop?category=Suit Set'], ['Gowns', '/shop?category=Gown/Dresses']].map(([name, path]) => (
                    <li key={name}><Link to={path} className="text-white/40 hover:text-white transition-colors font-light">{name}</Link></li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div className="md:col-span-2">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent mb-5">Company</p>
                <ul className="space-y-3 text-sm">
                  {[['About Us', '/about'], ['Contact', '/contact'], ['My Account', '/profile'], ['Track Order', '/track-order']].map(([name, path]) => (
                    <li key={name}><Link to={path} className="text-white/40 hover:text-white transition-colors font-light">{name}</Link></li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="md:col-span-4">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-accent mb-5">Newsletter</p>
                <p className="text-white/40 text-sm mb-4 font-light">Subscribe for exclusive deals and new arrivals.</p>
                <form onSubmit={handleFooterSubscribe} className="flex gap-2">
                  <input
                    type="email" placeholder="Your email address"
                    className="flex-1 bg-white/8 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
                    value={footerEmail}
                    onChange={e => setFooterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="bg-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all whitespace-nowrap">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-[13px] text-white/30">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p>© {new Date().getFullYear()} {settings?.site_name || BRAND_CONFIG.name}. All rights reserved.</p>
                {visitorCount !== null && (
                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-medium tracking-widest uppercase text-white/60">
                     Visitors: {visitorCount}
                  </span>
                )}
              </div>
              <div className="flex gap-6">
                <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white/70 transition-colors">Terms of Service</Link>
                <Link to="/sitemap" className="hover:text-white/70 transition-colors">Sitemap</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [categories, setCategories] = useState(['All'])
  const [user, setUser] = useState(null)
  
  const fetchProducts = async () => {
    try {
      const res = await authFetch('/admin_products.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        const uniqueCats = ['All', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCats);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };



  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    fetchProducts();
  }, []);






  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const onToggleWishlist = (product) => {
    // Guests can save to wishlist freely — stored locally
    setWishlist(prev => {
      const isExist = prev.find(item => item.id === product.id)
      if (isExist) return prev.filter(item => item.id !== product.id)
      return [...prev, product]
    })
  }

  const addToCart = (productOrProducts) => {
    // Guests can add to cart freely — login is only required at checkout
    const productsToAdd = Array.isArray(productOrProducts) ? productOrProducts : [productOrProducts];
    
    setCart(prev => {
      let newCart = [...prev];
      
      productsToAdd.forEach(product => {
        const { selectedSize, selectedColor, selectedFabric, customMeasurements } = product;
        const quantityToAdd = product.quantity || 1;
        
        // Determine price based on user role and approval status
        const isApprovedDealer = user?.role === 'dealer' && user?.is_approved == 1;
        let priceToUse = (isApprovedDealer && product.dealer_price) ? parseFloat(product.dealer_price) : parseFloat(product.price);

        // Add custom stitching fee for retail customers
        if (product.isCustomStitching && !isApprovedDealer) {
          priceToUse += 150;
        }

        // Include customMeasurements in cartItemId if present so they don't stack with non-custom items
        const measurementsKey = customMeasurements ? JSON.stringify(customMeasurements) : 'none';
        const cartItemId = `${product.id}-${selectedSize || 'none'}-${selectedColor || 'none'}-${selectedFabric || 'none'}-${measurementsKey}`;

        const existingItemIndex = newCart.findIndex(item => item.cartItemId === cartItemId);

        if (existingItemIndex >= 0) {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantityToAdd,
            price: priceToUse
          };
        } else {
          newCart.push({ ...product, quantity: quantityToAdd, cartItemId, price: priceToUse });
        }
      });
      
      return newCart;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) // Remove null items (quantity <= 0)
    );
  };

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ToastProvider>
                  <SettingsProvider> {/* Wrap AppContent with SettingsProvider */}
                    <AppContent 
                      user={user} 
                      setUser={setUser} 
                      cart={cart} 
                      wishlist={wishlist} 
                      isCartOpen={isCartOpen} 
                      setIsCartOpen={setIsCartOpen}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                      cartTotal={cartTotal}
                      products={products}
                      categories={categories}
                      addToCart={addToCart}
                      onToggleWishlist={onToggleWishlist}
                      fetchProducts={fetchProducts}
                      clearCart={clearCart}
                    />
                  </SettingsProvider>
                </ToastProvider>
              </BrowserRouter>
            )
          }
