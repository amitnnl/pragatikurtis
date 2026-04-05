import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { BRAND_CONFIG } from '../config/branding';
import { useSettings } from '../context/SettingsContext';

export default function WhatsAppWidget({ phoneNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const { settings } = useSettings();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sanitizeWhatsApp = (num) => {
    if (!num) return '';
    return num.replace(/[^0-9]/g, '');
  };

  const whatsappNumber = phoneNumber || settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp;
  const storeName = settings?.site_name || BRAND_CONFIG.name;

  const handleSend = (e) => {
    e.preventDefault();
    const text = message.trim() || `Hi ${storeName}, I need help!`;
    window.open(`https://wa.me/${sanitizeWhatsApp(whatsappNumber)}?text=${encodeURIComponent(text)}`, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-2">
                  <img src="/logo.webp" alt="Logo" className="w-full h-full object-contain brightness-0 invert" onError={(e) => { e.target.style.display='none'; }}/>
                  <FaRobot className="absolute opacity-50" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">{storeName} Support</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
                    <p className="text-[11px] text-white/90">Typically replies instantly</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            {/* Chat Area */}
            <div 
              className="p-5 bg-[#e5ddd5] h-64 overflow-y-auto flex flex-col gap-4 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d0c9c1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            >
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-white p-3 pt-2 text-[#111111] rounded-b-lg rounded-tr-lg shadow-sm text-[13px] self-start max-w-[85%] relative"
               >
                  <p className="text-[#075e54] font-medium mb-1 text-[11px]">Virtual Assistant</p>
                  <p className="leading-relaxed">Hi there! 👋</p>
                  <p className="leading-relaxed mt-1">Welcome to {storeName}. How can I assist you with your shopping today?</p>
                  <p className="text-[10px] text-gray-400 text-right mt-1.5">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  {/* Speech bubble tail */}
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>
               </motion.div>
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-[#f0f0f0] flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-white border-0 rounded-full px-5 py-3 text-[14px] text-gray-700 outline-none shadow-sm font-light placeholder:text-gray-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                  message.trim() 
                  ? 'bg-[#00a884] text-white hover:bg-[#008f6f] scale-100' 
                  : 'bg-white text-gray-400 scale-95 pointer-events-none'
                }`}
              >
                <FaPaperPlane className="ml-[-2px]" size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50 text-white transition-all duration-300 group
            ${isOpen ? 'bg-gray-800 rotate-90 scale-90' : 'bg-[#25D366] hover:scale-105'}
          `}
          aria-label="Chat on WhatsApp"
        >
          {isOpen ? <FaTimes size={24} className="-rotate-90" /> : <FaWhatsapp size={32} />}
          
          {/* Unread Badge indicator */}
          {!isOpen && hasUnread && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse z-10"></span>
          )}

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute right-[110%] top-1/2 -translate-y-1/2 mr-2 pointer-events-none">
              <span className="bg-white text-gray-800 text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap block">
                 Chat with us
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
