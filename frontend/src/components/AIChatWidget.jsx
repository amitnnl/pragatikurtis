import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaRobot, FaCommentDots, FaWhatsapp } from 'react-icons/fa';
import { BRAND_CONFIG } from '../config/branding';
import { useSettings } from '../context/SettingsContext';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi there! 👋 Welcome to Pragati Kurtis.', time: new Date() },
    { sender: 'ai', text: 'I am your virtual assistant. How can I help you today?', time: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { settings } = useSettings();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const storeName = settings?.site_name || BRAND_CONFIG.name;
  const whatsappNumber = settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const generateAIResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    let responseText = "";

    if (lowerText.includes("price") || lowerText.includes("cost")) {
      responseText = "Our prices vary by collection. We offer premium Kurtis starting from ₹999. Check out our 'Shop' page for detailed pricing!";
    } else if (lowerText.includes("delivery") || lowerText.includes("shipping")) {
      responseText = "We offer Free Delivery on all orders above ₹999! Standard delivery takes 3-5 business days.";
    } else if (lowerText.includes("return") || lowerText.includes("exchange")) {
      responseText = "We have an easy 30-day return and exchange policy. Items must be unused with original tags.";
    } else if (lowerText.includes("human") || lowerText.includes("owner") || lowerText.includes("help") || lowerText.includes("whatsapp")) {
      responseText = "I'm still learning! Would you like to chat directly with our team on WhatsApp?";
    } else {
      responseText = "Thank you for reaching out! Since I am an AI still in training, I might not have the perfect answer. You can always escalate this chat to our human support team via WhatsApp.";
    }

    return responseText;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date() }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: generateAIResponse(userMsg), time: new Date() }]);
    }, 1200);
  };

  const openWhatsApp = () => {
    const text = "Hi, I need some human assistance from the website!";
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
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
            className="mb-4 bg-white rounded-2xl shadow-2xl w-[340px] sm:w-[380px] overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <FaRobot size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-base tracking-wide">Pragati AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[11px] text-white/80">Online & ready to help</p>
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
            <div className="p-4 bg-surface-100 h-[320px] overflow-y-auto flex flex-col gap-4 relative">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  {msg.sender === 'ai' && idx === 0 && <span className="text-[10px] uppercase tracking-wider text-muted mb-1 ml-1">AI Assistant</span>}
                  <div 
                    className={`p-3 text-[13px] leading-relaxed shadow-sm relative ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                        : 'bg-white text-text rounded-tr-xl rounded-br-xl rounded-bl-xl'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted mt-1 px-1">
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="self-start max-w-[85%] flex flex-col items-start pt-2">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-muted text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              {/* Offer Human Help shortcut */}
              {messages.length > 3 && !isTyping && (
                <div className="self-center mt-2">
                   <button onClick={openWhatsApp} className="bg-green-50 text-green-700 border border-green-200 text-xs py-1.5 px-4 rounded-full flex items-center gap-2 hover:bg-green-100 transition-colors shadow-sm">
                     <FaWhatsapp size={14} /> Talk to a Human
                   </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-surface border border-gray-200 rounded-full px-4 py-2.5 text-[13px] text-text outline-none focus:border-accent/50 transition-colors placeholder:text-muted"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  inputValue.trim() && !isTyping
                  ? 'bg-accent text-white shadow-md hover:bg-accent/90' 
                  : 'bg-gray-100 text-gray-400 pointer-events-none'
                }`}
              >
                <FaPaperPlane className="ml-[-2px]" size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 group
          ${isOpen ? 'bg-primary text-white rotate-90 scale-90' : 'bg-primary text-accent hover:scale-105 border-2 border-accent/20'}
        `}
      >
        {isOpen ? <FaTimes size={20} className="-rotate-90" /> : <FaCommentDots size={26} />}
        
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse z-10"></span>
        )}

        {!isOpen && (
          <div className="absolute right-[115%] top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="bg-primary text-white text-[12px] font-medium px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap block border border-white/10">
              Chat with AI
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
