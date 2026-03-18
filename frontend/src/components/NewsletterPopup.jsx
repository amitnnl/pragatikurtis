import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mail } from 'lucide-react'
import { useToast } from './Toast'
import authFetch from '../utils/authFetch'

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    const hasSeen = localStorage.getItem('newsletter_seen')
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('newsletter_seen', 'true')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await authFetch('/subscribe.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.status === 'success') showToast(data.message, 'success')
      else showToast(data.message, 'error')
    } catch (err) {
      showToast('Subscription failed.', 'error')
    } finally {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-none overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 z-10 p-2 text-gray-400 hover:text-black hover:rotate-90 transition-all duration-300"><X size={24} /></button>
            
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center"></div>
            
            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center text-center space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-indigo-600">The Membership</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-black leading-tight">Elevate Your Wardrobe</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-loose">Join our inner circle for exclusive collection previews and a 10% curated welcome offer.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input 
                    type="email" required placeholder="YOUR EMAIL ADDRESS" 
                    className="w-full py-4 bg-transparent border-b-2 border-gray-100 focus:border-black outline-none transition-colors text-[10px] font-bold uppercase tracking-widest text-center placeholder:text-gray-200"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button className="w-full py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all duration-500 shadow-xl">
                  Send Invitation
                </button>
              </form>
              <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">By subscribing, you agree to our privacy standards.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}