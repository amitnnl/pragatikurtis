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

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'bg-primary/95 backdrop-blur-xl shadow-xl shadow-black/20 py-4'
          : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">

          {/* Left — Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <Menu size={20} />
            </button>
            <Link to="/" className="font-serif text-2xl font-bold text-accent tracking-widest hover:text-white transition-all">
              {settings?.site_short_name || BRAND_CONFIG.shortName}
            </Link>
          </div>

          {/* Center — Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path}
                className={`text-[13px] font-bold uppercase tracking-[0.15em] transition-all duration-300 relative group ${
                  isActive(link.path) ? 'text-accent' : 'text-white/80 hover:text-accent'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-[10px] font-bold text-accent uppercase tracking-widest px-4 py-2 rounded-full border border-accent/20 hover:bg-accent hover:text-white hover:border-accent transition-all">
                Admin Area
              </Link>
            )}
          </nav>

          {/* Right — Actions */}
          <div className="flex items-center gap-3 text-white">
            <button onClick={() => setShowSearch(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all">
              <Search size={18} />
            </button>

            <Link to="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>

            {user ? (
              <Link to="/profile" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all">
                <User size={18} />
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors">
                Sign In
              </Link>
            )}

            <button onClick={onCartOpen}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-lg">
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-surface/98 z-[200] backdrop-blur-xl flex flex-col"
          >
            <div className="container mx-auto px-6 pt-8 flex justify-between items-center">
              <p className="text-xs text-muted/50 uppercase tracking-widest font-semibold">Search</p>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="w-10 h-10 rounded-full hover:bg-primary/10 flex items-center justify-center transition-all group">
                <X size={22} className="text-text-700 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-6 py-8 max-w-2xl">
                <input
                  autoFocus
                  placeholder="Search products, categories…"
                  className="w-full text-3xl md:text-4xl font-serif font-light bg-transparent border-b-2 border-muted/20 focus:border-accent pb-4 outline-none text-text-700 placeholder:text-muted/30 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchResults.length > 0 ? (
                  <div className="mt-8 space-y-3">
                    {searchResults.map(p => (
                      <Link to={`/product/${p.id}`} key={p.id}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="group flex gap-4 items-center p-3 rounded-xl hover:bg-accent/5 transition-all">
                        <div className="w-14 h-18 aspect-[3/4] overflow-hidden rounded-lg bg-surface-100 shrink-0">
                          <img src={p.image} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-1">{p.category}</p>
                          <h4 className="font-serif text-lg text-text-700 group-hover:text-accent transition-colors truncate">{p.name}</h4>
                          <p className="text-text-700 font-bold mt-1">₹{p.price}</p>
                        </div>
                        <div className="text-muted/30 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0">→</div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <p className="text-center text-muted/50 text-lg mt-16 font-light">No results for "<span className="text-text-700">{searchQuery}</span>"</p>
                ) : (
                  <p className="text-center text-muted/40 text-base mt-16 font-light">Start typing to search…</p>
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
              className="fixed inset-0 bg-black/40 z-[140] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 bottom-0 left-0 w-72 z-[150] bg-primary flex flex-col md:hidden shadow-2xl"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <span className="font-serif text-xl text-white">{settings?.site_short_name || BRAND_CONFIG.shortName}</span>
                <button onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-6 gap-2">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <Link to={link.path}
                      className={`flex items-center gap-3 py-4 px-4 rounded-xl text-lg font-serif font-light transition-all ${
                        isActive(link.path)
                          ? 'text-accent bg-white/5'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="py-4 px-4 text-accent text-base font-semibold">Admin Panel</Link>
                )}
              </div>

              <div className="p-6 border-t border-white/10">
                {user ? (
                  <div className="space-y-3">
                    <Link to="/profile" className="flex items-center gap-3 text-white/70 hover:text-white py-2 text-sm font-medium transition-colors">
                      <User size={16} /> My Account
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left text-red-400/80 hover:text-red-400 py-2 text-sm font-medium transition-colors">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="block w-full text-center btn-primary text-sm py-3">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}