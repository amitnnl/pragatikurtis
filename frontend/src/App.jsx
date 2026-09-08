import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider, useToast } from './components/Toast'
import WhatsAppButton from './components/WhatsAppButton'
import AIChatWidget from './components/AIChatWidget'
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
            element={user?.role === 'admin' ? <Admin products={products} refreshProducts={fetchProducts} setUser={setUser} /> : <Navigate to="/" />} 
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
    <div className="min-h-screen bg-cream text-text-dark">
      <ScrollToTop />
      {!isPanelPage && (
        <>
          <WhatsAppButton />
          {settings?.feature_whatsapp_bot !== '0' && <AIChatWidget />}
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
        <Footer />
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
