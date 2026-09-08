import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  const [showTooltip, setShowTooltip] = useState(false);

  const sanitizeWhatsApp = (num) => {
    if (!num) return '';
    return num.replace(/[^0-9]/g, '');
  };

  const whatsappNumber = settings?.contact_whatsapp || '+919876543210';
  const whatsappUrl = `https://wa.me/${sanitizeWhatsApp(whatsappNumber)}?text=${encodeURIComponent('Hi Pragati Kurtis, I need some help!')}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 md:bottom-8 md:left-8 flex items-center perspective-800">
      {/* 3D Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center transition-all duration-300 relative group animate-float-3d btn-3d-press shadow-[0_10px_25px_rgba(37,211,102,0.38),0_4px_10px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_35px_rgba(37,211,102,0.5),0_6px_14px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:rotate-6 active:scale-95"
        style={{ transformStyle: 'preserve-3d' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-md">
          <MessageCircle size={28} />
        </span>
        {/* Pulsing 3D Status Indicator */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full animate-ping opacity-75"></span>
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
      </a>

      {/* 3D Elevated Tooltip */}
      <div 
        className={`ml-3.5 sm:ml-4 bg-white/95 backdrop-blur-md text-text-dark px-4 py-2 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.1)] border border-border-soft text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-300 transform origin-left ${showTooltip ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-2 pointer-events-none'}`}
        style={{ transformStyle: 'preserve-3d', transform: showTooltip ? 'translateZ(16px)' : 'translateZ(0px)' }}
      >
        <span className="text-emerald-600 font-bold mr-1.5">●</span>
        Need help? Chat with us
      </div>
    </div>
  );
};

export default WhatsAppButton;
