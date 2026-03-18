import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider, useToast } from './components/Toast'
import SocialWidgets from './components/SocialWidgets'
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
import Contact from './pages/Contact.jsx';
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
  const { settings, loading, error } = useSettings(); // Use the settings hook

  // Handle loading and error states for settings
  if (loading) return <div>Loading settings...</div>;
  if (error) return <div>Error loading settings: {error.message}</div>;
  if (!settings) return null; // Or some fallback UI
  
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
          <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} />} />
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
      {!isPanelPage && <SocialWidgets />}
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

      <div className={!isPanelPage ? "pt-16" : ""}>
        {PageRoutes}
      </div>

      {!isPanelPage && (
        <footer className="bg-primary text-white pt-16 pb-8">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-bold">{settings.site_short_name || BRAND_CONFIG.shortName}</h3>
              <p className="text-sm text-white/70">{settings.site_description || BRAND_CONFIG.tagline}</p>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-accent">Shop</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/shop" className="hover:text-accent">All Products</Link></li>
                <li><Link to="/shop?category=Kurti" className="hover:text-accent">Kurtis</Link></li>
                <li><Link to="/shop?category=Suit Set" className="hover:text-accent">Suit Sets</Link></li>
                <li><Link to="/shop?category=Gown/Dresses" className="hover:text-accent">Dresses</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-accent">Company</h5>
              <ul className="space-y-2 text-sm text-white/70">
                  <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
                  <li><Link to="/profile" className="hover:text-accent">My Account</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4 text-accent">Newsletter</h5>
              <p className="text-sm text-white/70 mb-4">Subscribe for updates and exclusive deals.</p>
              <form onSubmit={handleFooterSubscribe} className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent rounded-l-lg" 
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="bg-accent text-white px-4 py-2 rounded-r-lg text-sm font-bold">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="container mx-auto px-6 mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} {settings.site_name || BRAND_CONFIG.name}. All Rights Reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
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
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))

    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))

    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))

    fetchProducts()
  }, [])



  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const onToggleWishlist = (product) => {
    setWishlist(prev => {
      const isExist = prev.find(item => item.id === product.id)
      if (isExist) return prev.filter(item => item.id !== product.id)
      return [...prev, product]
    })
  }

  const addToCart = (product) => {
    const { selectedSize, selectedColor, selectedFabric } = product;
    // Determine price based on user role and approval status
    const isApprovedDealer = user?.role === 'dealer' && user?.is_approved == 1;
    const priceToUse = (isApprovedDealer && product.dealer_price) ? parseFloat(product.dealer_price) : parseFloat(product.price);

    // Create a unique ID for the cart item based on product and variants
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}-${selectedFabric}`;

    setCart(prev => {
      const existingItem = prev.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        // If the exact item (including variants) exists, increase its quantity
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1, price: priceToUse } // Update price just in case
            : item
        );
      } else {
        // Otherwise, add the new item with its variants and a unique cartItemId
        return [...prev, { ...product, quantity: 1, cartItemId, price: priceToUse }];
      }
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
