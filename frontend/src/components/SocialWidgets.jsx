import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaCommentDots, FaTimes } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { BRAND_CONFIG } from '../config/branding';

const SocialWidgets = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();

  // Helper to sanitize phone number for WhatsApp
  const sanitizeWhatsApp = (num) => {
    if (!num) return '';
    return num.replace(/[^0-9]/g, '');
  };

  const whatsappNumber = settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp;
  const storeShortName = settings?.site_short_name || BRAND_CONFIG.shortName;

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={24} />,
      href: `https://wa.me/${sanitizeWhatsApp(whatsappNumber)}?text=${encodeURIComponent(`Hi ${storeShortName}, I'm interested in your collection!`)}`,
      color: 'bg-green-500',
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={24} />,
      href: settings?.social_instagram || BRAND_CONFIG.social.instagram,
      color: 'bg-pink-500',
    },
    {
      name: 'Facebook',
      icon: <FaFacebook size={24} />,
      href: settings?.social_facebook || BRAND_CONFIG.social.facebook,
      color: 'bg-blue-600',
    },
    {
      name: 'YouTube',
      icon: <FaYoutube size={24} />,
      href: settings?.social_youtube || BRAND_CONFIG.social.youtube,
      color: 'bg-red-600',
    },
  ];

  const toggleOpen = () => setIsOpen(!isOpen);

  const parentVariants = {
    closed: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  };

  const childVariants = {
    closed: {
      y: 10,
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={parentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col items-center space-y-3 mb-4"
          >
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={childVariants}
                className={`${link.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform`}
              >
                {link.icon}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleOpen}
        className="bg-accent text-white p-4 rounded-full shadow-2xl hover:bg-accent-hover transition-colors focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="times" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FaTimes size={24} />
            </motion.div>
          ) : (
            <motion.div key="comment" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FaCommentDots size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default SocialWidgets;
