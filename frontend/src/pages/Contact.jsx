import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, ChevronDown } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_CONFIG } from '../config/branding';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext'; // Import useSettings

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-muted/20 py-6">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-text-700">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-6 h-6 text-muted/70" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 text-muted/70"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const faqs = [
    {
      question: "What are your business hours?",
      answer: "Our boutique is open from 10:00 AM to 8:00 PM, Monday to Saturday. Our online support is available 24/7."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order using the 'Track Order' link in the main menu. You will need your order ID and the email address used to place the order."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 15-day return policy for all unworn items with tags attached. Please visit our Returns page for more details."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within India. We are working on expanding our shipping options to more countries in the near future."
    }
];

export default function Contact() {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const { settings, loading, error } = useSettings(); // Get settings from context

  // Handle loading and error states for settings
  if (loading) return <div>Loading contact information...</div>;
  if (error) return <div>Error loading contact information: {error.message}</div>;
  if (!settings) return null; // Or some fallback UI

  // Form submission logic will be added back later
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch('/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess(data.message);
        setFormData({ first_name: '', last_name: '', email: '', phone: '', message: '' });
      } else {
          // Handle error response from API
          console.error("Form submission error:", data.message);
          setSuccess(`Error: ${data.message}`); // Display error message
      }
    } catch (err) {
      console.error("Form submission failed:", err);
      setSuccess(`Form submission failed: ${err.message}`); // Display generic error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-100">
      <SEO 
        title="Contact Us | Pragati Kurties" 
        description="Get in touch with Pragati Kurties. We're here to help with your orders, inquiries, or just to say hello."
      />

      <header className="bg-surface py-20 text-center">
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-text-700 tracking-tighter">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted/70 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question, a comment, or just want to chat, we're here.
          </p>
        </motion.div>
      </header>

      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            <motion.div 
              className="lg:col-span-1 space-y-8"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif text-text-700">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold text-text-700">Email</h3>
                    <a href={`mailto:${settings.contact_email}`} className="text-accent hover:underline">{settings.contact_email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold text-text-700">Phone</h3>
                    <p className="text-text-700">{settings.contact_phone}</p>
                  </div>
                </div>
                {settings.contact_whatsapp && (
                  <div className="flex items-start gap-4">
                    <FaWhatsapp className="w-6 h-6 text-accent mt-1" />
                    <div>
                      <h3 className="font-semibold text-text-700">WhatsApp</h3>
                      <a href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{settings.contact_whatsapp}</a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold text-text-700">Our Boutique</h3>
                    <p className="text-text-700">{settings.contact_address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="lg:col-span-2 bg-surface p-8 sm:p-12 rounded-lg shadow-lg"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {success ? (
                <div className="text-center py-16">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <CheckCircle className="w-24 h-24 text-success mx-auto" />
                  </motion.div>
                  <h3 className="text-3xl font-serif font-bold mt-6">Message Sent!</h3>
                  <p className="text-muted/70 mt-2">{success}</p>
                  <button onClick={() => setSuccess(null)} className="mt-8 text-accent font-semibold hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-3xl font-serif text-text-700 mb-6">Send Us a Message</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" required className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                    <input type="text" required className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                  <input type="email" required className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="tel" required className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  <textarea required className="p-3 bg-surface border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700 w-full h-40" placeholder="Your Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-accent text-surface rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-muted/70 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Sending...' : 'Send Message'} <Send size={18}/>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <section className="py-16 md:py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-serif text-text-700 mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted/70">
              Have a question? We may have already answered it. Check out our FAQ.
            </p>
          </div>
          <div className="max-w-3xl mx-auto mt-12">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-serif text-text-700 mb-6 text-center">Find Us Here</h2>
            <div className="rounded-lg overflow-hidden shadow-xl" style={{height: '450px'}}>
                <LocationMap />
            </div>
          </div>
      </section>
    </div>
  );
}