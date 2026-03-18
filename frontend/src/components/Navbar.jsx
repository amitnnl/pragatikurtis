import { ShoppingBag, Search, Menu, User, LogOut, X, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND_CONFIG } from '../config/branding'
import { useSettings } from '../context/SettingsContext' // Import useSettings

export default function Navbar({ cartCount, wishlistCount, onCartOpen, user, setUser, products }) {
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { settings } = useSettings(); // Get settings from context

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const searchResults = searchQuery.length > 1 
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 border-b ${scrolled ? 'bg-primary/80 backdrop-blur-lg border-primary/10 shadow-sm py-4' : 'bg-primary border-primary py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-white hover:text-accent transition-colors">
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl font-serif font-bold text-white hover:text-accent transition-colors">
              {settings.site_short_name}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              { name: 'About', path: '/about' },
              { name: 'Contact', path: '/contact' },
            ].map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className="text-sm font-medium text-white hover:text-accent transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-sm font-medium text-white hover:text-accent transition-colors relative group"
              >
                Admin Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-text transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 text-white">
            <button onClick={() => setShowSearch(true)} className="hover:text-accent transition-colors">
              <Search size={20} />
            </button>
            
            <Link to="/wishlist" className="relative hover:text-accent transition-colors">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>}
            </Link>

            {user ? (
              <Link to="/profile" className="hover:text-accent transition-colors">
                <User size={20} />
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-text-700 hover:text-accent transition-colors hidden sm:block">
                Sign In
              </Link>
            )}

            <button onClick={onCartOpen} className="relative hover:text-accent transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/95 z-[200] backdrop-blur-lg flex flex-col"
          >
            <div className="container mx-auto px-6 py-6 flex justify-end">
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="group p-2">
                <X size={28} className="text-muted group-hover:text-text transition-transform duration-300 group-hover:rotate-90"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-20">
              <div className="max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <input 
                    autoFocus
                    placeholder="Search products..." 
                    className="w-full text-2xl font-sans bg-transparent border-b-2 border-muted/20 focus:border-accent pb-4 outline-none text-text placeholder:text-muted/50 text-center"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 text-muted/50">
                    <Search size={24} />
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {searchResults.map(p => (
                      <Link to={`/product/${p.id}`} key={p.id} onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="group flex gap-4 items-center p-2 rounded-lg hover:bg-accent/10">
                        <div className="w-16 h-20 overflow-hidden rounded-md bg-surface">
                          <img src={p.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-text group-hover:text-accent transition-colors">{p.name}</h4>
                          <p className="text-sm text-muted">₹{p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
                      <motion.div initial={{ opacity: 0, x: '-100%' }} animate="visible" exit="hidden" variants={{ visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1, delayChildren: 0.2 } }, hidden: { opacity: 0, x: '-100%', transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.05, staggerDirection: -1 } } }} className="fixed top-0 bottom-0 left-0 w-1/2 z-[150] bg-surface flex flex-col md:hidden">            <div className="p-6 flex justify-between items-center border-b border-muted/10">
              <span className="font-serif font-bold text-xl text-text-700">{settings.site_short_name}</span>
              <button onClick={() => setMobileMenuOpen(false)}><X size={24} className="text-text-700"/></button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-6">
               {[
                  { name: 'Home', path: '/' },
                  { name: 'Shop', path: '/shop' },
                  { name: 'About', path: '/about' },
                  { name: 'Contact', path: '/contact' },
               ].map((link) => (
                <motion.div
                  key={link.name}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <Link to={link.path} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold text-text hover:text-accent transition-colors py-2 px-4 rounded-md hover:bg-accent-light">
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            
              {user?.role === 'admin' && (
                <motion.div
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold text-accent hover:text-text-700 transition-colors py-2 px-4 rounded-md hover:bg-accent-light">Admin Panel</Link>
                </motion.div>
              )}
            </div>
            <div className="p-6 border-t border-muted/10">
              {user ? (
                <motion.div
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-center text-sm font-medium text-text-700 hover:text-accent py-2 px-4 rounded-md hover:bg-accent-light">
                    Sign Out
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-accent text-white px-6 py-3 rounded-lg text-sm font-bold py-2 px-4 rounded-md hover:bg-accent-dark">Sign In</Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}