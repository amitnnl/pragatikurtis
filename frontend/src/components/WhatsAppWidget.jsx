import { FaWhatsapp } from 'react-icons/fa'
import { BRAND_CONFIG } from '../config/branding'
import { useSettings } from '../context/SettingsContext'

export default function WhatsAppWidget({ phoneNumber }) {
  const { settings } = useSettings();
  
  // Helper to sanitize phone number for WhatsApp
  const sanitizeWhatsApp = (num) => {
    if (!num) return '';
    return num.replace(/[^0-9]/g, '');
  };

  const whatsappNumber = phoneNumber || settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp
  const storeShortName = settings?.site_short_name || BRAND_CONFIG.shortName;
  const message = `Hi ${storeShortName}, I'm interested in your collection!`
  
  return (
    <a 
      href={`https://wa.me/${sanitizeWhatsApp(whatsappNumber)}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
    >
      <FaWhatsapp className="w-8 h-8" />
      <span className="absolute left-16 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
        Chat with us
      </span>
    </a>
  )
}
