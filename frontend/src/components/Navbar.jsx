import { ShoppingBag, Search, Menu, User, X, Heart, Shield } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND_CONFIG } from '../config/branding'
import { useSettings } from '../context/SettingsContext'
import AnnouncementBar from './AnnouncementBar'

export default function Navbar({ cartCount, wishlistCount, onCartOpen, user, setUser, products }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { settings } = useSettings()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('jwt')
    setUser(null)
    navigate('/')
  }

  const searchResults = searchQuery.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : []

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'New Arrivals', path: '/shop?collection=new' },
    { name: 'Best Sellers', path: '/shop?collection=bestsellers' },
    { name: 'Festive', path: '/shop?category=festive' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-[100] flex flex-col">
        <AnnouncementBar />
        <header className={`transition-all duration-500 bg-cream ${
          scrolled
            ? 'py-3 shadow-md shadow-primary/5'
            : 'py-5 border-b border-border-soft'
        }`}>
          <div className="container mx-auto px-6 flex justify-between items-center relative">

            {/* Left — Mobile Menu + Logo */}
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-text-dark hover:bg-white hover:shadow-sm btn-3d-press transition-all">
                <Menu size={22} />
              </button>
              <Link to="/" className="font-serif text-2xl md:text-3xl text-text-dark font-medium tracking-wide transition-all duration-300 hover:text-primary hover:-translate-y-0.5 inline-block">
                {settings?.site_short_name || 'Pragati Kurtis'}
              </Link>
            </div>

            {/* Center — Nav Links */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 px-4">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path}
                  className={`text-sm font-medium transition-all duration-300 relative group py-1 hover:-translate-y-0.5 ${
                    isActive(link.path) 
                      ? 'text-primary font-semibold' 
                      : 'text-text-dark hover:text-primary'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActive(link.path) ? 'w-full shadow-sm' : 'w-0 group-hover:w-full opacity-60'}`} />
                </Link>
              ))}
            </nav>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 md:gap-4 text-text-dark">
              <button onClick={() => setShowSearch(true)}
                aria-label="Search"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-primary hover:shadow-md btn-3d-press transition-all duration-300">
                <Search size={20} />
              </button>

              <Link to="/wishlist" 
                aria-label="Wishlist"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-primary hover:shadow-md btn-3d-press transition-all duration-300">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-cream animate-ping" />
                )}
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-cream" />
                )}
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" title="Admin Panel" className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full hover:bg-white hover:text-primary hover:shadow-md btn-3d-press transition-all duration-300">
                      <Shield size={20} />
                    </Link>
                  )}
                  <Link to="/profile" title="Profile" className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full hover:bg-white hover:text-primary hover:shadow-md btn-3d-press transition-all duration-300">
                    <User size={20} />
                  </Link>
                </>
              ) : (
                <Link to="/login" className="hidden sm:flex text-sm font-semibold tracking-wide hover:text-primary transition-all px-3 py-1.5 rounded-full hover:bg-white hover:shadow-sm btn-3d-press">
                  Sign In
                </Link>
              )}

              <button onClick={onCartOpen}
                aria-label="Shopping Bag"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-primary hover:shadow-md btn-3d-press transition-all duration-300">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(128,27,52,0.4)] ring-2 ring-cream">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer to push content below fixed header */}
      <div className="h-[104px] md:h-[116px]"></div>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-cream/95 z-[200] backdrop-blur-md flex flex-col"
          >
            <div className="container mx-auto px-6 pt-10 flex justify-between items-center relative z-10">
              <p className="text-xs text-primary uppercase tracking-widest font-semibold">Search Collection</p>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-border-soft flex items-center justify-center transition-all group hover:scale-105">
                <X size={22} className="text-text-dark group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-6 py-16 md:py-24 max-w-3xl">
                <input
                  autoFocus
                  placeholder="Search suits, kurtis, fabrics..."
                  className="w-full text-3xl md:text-5xl font-sans text-center bg-transparent border-b-2 border-border-soft focus:border-primary pb-6 outline-none text-text-dark placeholder:text-text-muted transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchResults.length > 0 ? (
                  <div className="mt-12 space-y-4">
                    {searchResults.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/product/${p.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="group bg-white p-4 rounded-2xl border border-border-soft flex gap-6 items-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          <div className="w-20 h-24 aspect-[4/5] overflow-hidden rounded-xl bg-soft-mint shrink-0 relative">
                            <img src={p.image} className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{p.category}</p>
                            <h4 className="font-medium text-lg text-text-dark group-hover:text-primary transition-colors truncate">{p.name}</h4>
                            <p className="text-text-muted font-medium mt-1">₹{p.price}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <p className="text-center text-text-muted text-lg mt-20">No matching pieces for "<span className="text-text-dark">{searchQuery}</span>"</p>
                ) : (
                  <div className="mt-16">
                    <p className="text-center text-text-muted text-sm uppercase tracking-widest font-semibold mb-6">Trending Searches</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['Anarkali', 'Cotton Suit', 'Party Wear', 'Festive', 'New Arrivals'].map(term => (
                        <button key={term} onClick={() => setSearchQuery(term)} className="px-5 py-2 rounded-full border border-border-soft text-text-dark text-sm hover:bg-soft-mint hover:border-primary transition-colors">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-text-dark/40 z-[140] backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 bottom-0 left-0 w-[85%] max-w-sm z-[150] bg-cream flex flex-col md:hidden shadow-2xl"
            >
              <div className="p-6 flex justify-between items-center border-b border-border-soft bg-white">
                <span className="font-serif text-2xl text-text-dark">{settings?.site_short_name || 'Pragati Kurtis'}</span>
                <button onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-soft-mint flex items-center justify-center text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8 gap-6">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={link.path} onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center"
                    >
                      <span className={`text-2xl font-serif transition-colors ${
                        isActive(link.path) ? 'text-primary' : 'text-text-dark group-hover:text-primary'
                      }`}>
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-border-soft">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-soft-mint flex items-center justify-center">
                        <User size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-dark">{user.name}</p>
                        <p className="text-xs text-text-muted">Logged in</p>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                       <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center border border-border-soft text-text-dark font-medium py-3 rounded-[10px]">Admin Panel</Link>
                    )}
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-primary text-white font-medium py-3 rounded-[10px]">My Account</Link>
                    <button onClick={handleLogout} className="w-full text-center text-text-muted font-medium py-3 hover:text-sale">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-primary text-white font-semibold py-3 rounded-[10px] transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-white border border-border-soft text-text-dark font-semibold py-3 rounded-[10px] transition-colors hover:border-primary">
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}