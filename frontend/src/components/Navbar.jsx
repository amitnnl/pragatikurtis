import { ShoppingBag, Search, Menu, User, X, Heart } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND_CONFIG } from '../config/branding'
import { useSettings } from '../context/SettingsContext'

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
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  // Force solid navbar on pages with light/white backgrounds where transparent text would be invisible
  const lightPages = ['/about', '/contact', '/shop', '/product', '/checkout', '/login', '/register', '/profile', '/forgot-password', '/reset-password', '/wishlist', '/track-order', '/privacy', '/terms', '/sitemap'];
  const isLightPage = lightPages.some(p => location.pathname.startsWith(p));
  const isScrolled = scrolled || isLightPage;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-700 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-2xl shadow-xl shadow-rose-900/5 py-4 border-b border-rose-50'
          : 'bg-transparent py-6 md:py-8'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center relative">

          {/* Left — Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
              <Menu size={22} />
            </button>
            <Link to="/" className={`font-serif text-2xl md:text-3xl tracking-widest transition-all duration-500 hover:scale-105 ${isScrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
              {settings?.site_short_name || BRAND_CONFIG.shortName}
            </Link>
          </div>

          {/* Center — Nav Links */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-12 absolute inset-x-0 mx-auto pointer-events-none">
            <div className="flex items-center gap-12 pointer-events-auto">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path}
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group px-2 py-1 ${
                    isActive(link.path) 
                      ? (isScrolled ? 'text-rose-600' : 'text-rose-200')
                      : (isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white')
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-rose-500 rounded-full transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full opacity-50'}`} />
                </Link>
              ))}
            </div>
          </nav>

          {/* Right — Actions */}
          <div className={`flex items-center gap-2 md:gap-4 z-10 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
            <button onClick={() => setShowSearch(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-300 transform hover:scale-110">
              <Search size={20} />
            </button>

            <Link to="/wishlist" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-300 transform hover:scale-110">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white shadow-sm" />
              )}
            </Link>

            {user ? (
              <Link to="/profile" className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-300 transform hover:scale-110">
                <User size={20} />
              </Link>
            ) : (
              <Link to="/login" className={`hidden sm:flex text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-all shadow-sm ${
                isScrolled 
                  ? 'border border-gray-200 bg-white hover:border-gray-900 text-gray-900' 
                  : 'bg-white/10 hover:bg-white border border-white/20 hover:text-gray-900 text-white backdrop-blur-sm'
              }`}>
                Sign In
              </Link>
            )}

            <button onClick={onCartOpen}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-300 transform hover:scale-110">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#faf9f6]/95 z-[200] backdrop-blur-2xl flex flex-col"
          >
            <div className="container mx-auto px-6 pt-10 flex justify-between items-center relative z-10">
              <p className="text-xs text-rose-400 uppercase tracking-[0.3em] font-semibold">Search Collection</p>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center transition-all group hover:scale-105">
                <X size={22} className="text-gray-900 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-6 py-16 md:py-24 max-w-3xl">
                <input
                  autoFocus
                  placeholder="Discover elegance…"
                  className="w-full text-4xl md:text-6xl font-serif text-center bg-transparent border-b-2 border-gray-200 focus:border-rose-300 pb-6 outline-none text-gray-900 placeholder:text-gray-300 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchResults.length > 0 ? (
                  <div className="mt-12 space-y-4">
                    {searchResults.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/product/${p.id}`}
                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                          className="group bg-white p-4 rounded-3xl border border-gray-50 flex gap-6 items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="w-20 h-24 aspect-[3/4] overflow-hidden rounded-2xl bg-[#faf9f6] shrink-0 relative">
                            <img src={p.image} className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-rose-500 font-bold tracking-[0.2em] uppercase mb-1.5">{p.category}</p>
                            <h4 className="font-serif text-xl md:text-2xl text-gray-900 group-hover:text-rose-700 transition-colors truncate">{p.name}</h4>
                            <p className="text-gray-500 font-medium tracking-wide mt-1">₹{p.price}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-100 transition-all shrink-0 md:mr-4">
                            →
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <p className="text-center text-gray-400 text-xl font-serif mt-20">No matching pieces for "<span className="text-gray-900">{searchQuery}</span>"</p>
                ) : (
                  <p className="text-center text-gray-300 text-lg uppercase tracking-widest font-semibold mt-20">Start typing to explore</p>
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
              className="fixed inset-0 bg-gray-900/40 z-[140] backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 bottom-0 left-0 w-[85%] max-w-sm z-[150] bg-[#faf9f6] flex flex-col md:hidden shadow-2xl border-r border-rose-50"
            >
              <div className="p-8 flex justify-between items-center border-b border-gray-100">
                <span className="font-serif text-2xl text-gray-900 tracking-widest">{settings?.site_short_name || BRAND_CONFIG.shortName}</span>
                <button onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 gap-4">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={link.path}
                      className="group flex items-center border-b border-gray-100 pb-4"
                    >
                      <span className={`text-4xl font-serif transition-colors ${
                        isActive(link.path) ? 'text-rose-600' : 'text-gray-800 group-hover:text-rose-500'
                      }`}>
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 bg-white border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                        <User size={20} className="text-rose-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Logged in as</p>
                        <p className="font-serif text-lg text-gray-900">{user.name}</p>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                       <Link to="/admin" className="block w-full text-center bg-gray-100 text-gray-900 font-bold uppercase tracking-widest text-xs py-4 rounded-full">Admin Panel</Link>
                    )}
                    <Link to="/profile" className="block w-full text-center bg-gray-900 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-full shadow-lg">My Account</Link>
                    <button onClick={handleLogout} className="w-full text-center text-red-500 font-bold uppercase tracking-widest text-xs py-4 hover:underline">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link to="/login" className="block w-full text-center bg-gray-900 hover:bg-rose-900 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-full shadow-lg transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register" className="block w-full text-center bg-white border border-gray-200 text-gray-900 hover:border-gray-900 font-bold uppercase tracking-widest text-xs py-4 rounded-full transition-colors">
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