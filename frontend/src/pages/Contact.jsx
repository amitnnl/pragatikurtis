import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, ChevronDown, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_CONFIG } from '../config/branding';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext';
import Tilt3D from '../components/Tilt3D';

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border-soft/60 py-5">
      <button className="w-full flex justify-between items-center text-left gap-4 group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base font-medium text-text-dark group-hover:text-primary transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 bg-primary/10 p-1.5 rounded-full">
          <ChevronDown className="w-4 h-4 text-primary" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <p className="mt-4 text-text-muted font-light leading-relaxed pr-8 text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const faqs = [
  { question: "What are your boutique operating hours?", answer: "Our flagship Jaipur boutique is open Monday through Saturday from 10:00 AM to 8:00 PM IST. Our dedicated online customer concierges are available 24/7." },
  { question: "How can I track my shipment?", answer: "You can track your order using the 'Track Order' option in our header or customer portal with your unique Order ID and contact number." },
  { question: "What is your return & exchange policy?", answer: "We proudly offer a 15-day complimentary return & exchange window for all unwashed, unworn garments with original tags intact." },
  { question: "Do you accept custom sizing requests?", answer: "Yes! Select the 'Custom Fit' option on any product detail page to provide your bust, waist, hips, and length requirements." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

export default function Contact() {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const { settings } = useSettings();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        setSuccess(`Error: ${data.message}`);
      }
    } catch {
      setSuccess('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email Concierge', value: settings?.contact_email || BRAND_CONFIG.contact.email, href: `mailto:${settings?.contact_email || BRAND_CONFIG.contact.email}` },
    { icon: Phone, label: 'Phone Assistance', value: settings?.contact_phone || BRAND_CONFIG.contact.phone, href: `tel:${settings?.contact_phone || BRAND_CONFIG.contact.phone}` },
    { icon: MapPin, label: 'Flagship Boutique', value: settings?.contact_address || BRAND_CONFIG.contact.address, href: null },
    { icon: Clock, label: 'Boutique Hours', value: 'Mon – Sat, 10 AM – 8 PM', href: null },
  ];

  return (
    <div className="bg-cream min-h-screen text-text-dark">
      <SEO title="Contact Us | Pragati Kurtis" description="Get in touch with Pragati Kurtis. We're here to help with your orders, custom styling, or boutique visits." />

      {/* ── Page Hero Header with 3D Depth ── */}
      <motion.section 
        className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-cream flex items-center justify-center overflow-hidden border-b border-border-soft perspective-1000"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <motion.div 
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-secondary/30 mb-6 animate-float-3d">
            <Sparkles size={14} className="text-secondary" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Client Concierge</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif text-text-dark tracking-tight uppercase leading-tight">
            Connect With Us
          </h1>
          <p className="mt-6 text-base md:text-lg font-light tracking-wide text-text-muted leading-relaxed">
            We would love to hear from you. Whether you have inquiries regarding an order, bespoke styling, or would like to visit our boutique.
          </p>
        </motion.div>
      </motion.section>

      {/* ── 3D Contact Cards ── */}
      <div className="container mx-auto px-6 relative z-20 -mt-12 sm:-mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {contactItems.map(({ icon: Icon, label, value, href }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" animate="visible" custom={i} className="h-full">
              <Tilt3D maxTilt={9} glare={true} scale={1.03} className="h-full">
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-primary/5 border border-border-soft flex flex-col items-center text-center h-full preserve-3d">
                  
                  {/* Floating Icon */}
                  <div 
                    style={{ transform: 'translateZ(26px)' }}
                    className="w-14 h-14 rounded-2xl bg-cream border border-secondary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm"
                  >
                    <Icon size={24} className="text-primary" />
                  </div>

                  <div style={{ transform: 'translateZ(14px)' }}>
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-text-dark font-medium hover:text-primary transition-colors cursor-pointer block leading-relaxed">{value}</a>
                    ) : (
                      <p className="text-sm text-text-dark font-medium leading-relaxed">{value}</p>
                    )}
                  </div>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Main Content Section ── */}
      <div className="container mx-auto px-6 py-24 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 max-w-6xl mx-auto relative z-10">

          {/* Left — Info + VIP WhatsApp + FAQ */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="lg:col-span-2 space-y-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-secondary uppercase mb-2 block">Always Attentive</span>
              <h2 className="text-3xl md:text-5xl font-serif text-text-dark leading-tight mb-5">
                We're Here<br />to Serve You
              </h2>
              <p className="text-text-muted text-base font-light leading-relaxed">
                Have questions regarding custom fittings, fabric choices, or order tracking? Reach out anytime — our styling consultants ensure every request receives our undivided attention.
              </p>
            </div>

            {/* 3D WhatsApp VIP Card */}
            {(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp) && (
              <Tilt3D maxTilt={7} glare={true} scale={1.02}>
                <a
                  href={`https://wa.me/${(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp).replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-5 p-6 rounded-2xl bg-white shadow-xl shadow-primary/5 border border-secondary/30 transition-all group preserve-3d block"
                >
                  <div 
                    style={{ transform: 'translateZ(24px)' }}
                    className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(37,211,102,0.35)] group-hover:scale-105 transition-transform"
                  >
                    <FaWhatsapp className="w-7 h-7" />
                  </div>
                  <div style={{ transform: 'translateZ(14px)' }}>
                    <p className="font-serif text-lg text-text-dark font-medium mb-0.5">VIP WhatsApp Concierge</p>
                    <p className="text-xs text-emerald-600 font-medium">Instant replies within minutes</p>
                  </div>
                  <div 
                    style={{ transform: 'translateZ(18px)' }}
                    className="ml-auto text-primary group-hover:translate-x-2 transition-transform"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </a>
              </Tilt3D>
            )}

            {/* Common Inquiries */}
            <div className="bg-white rounded-3xl p-7 shadow-lg border border-border-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cream border border-secondary/20 flex items-center justify-center">
                  <MessageSquare size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl text-text-dark font-medium">Common Inquiries</h3>
              </div>
              <div className="divide-y divide-border-soft/60">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — 3D Inquiry Form */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="lg:col-span-3">
             <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-border-soft card-3d-lift relative overflow-hidden">
                
              {success ? (
                <div className="text-center py-20 relative z-10">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                  </motion.div>
                  <h3 className="text-3xl font-serif text-text-dark mb-3">Message Received!</h3>
                  <p className="text-text-muted text-base font-light mb-8 max-w-md mx-auto">{success}</p>
                  <button onClick={() => setSuccess(null)} className="text-primary font-semibold hover:text-primary-dark text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 mx-auto btn-3d-press">
                    Send Another Message <Send size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="mb-6">
                    <span className="text-xs font-bold tracking-widest text-secondary uppercase mb-1 block">Inquiries</span>
                    <h3 className="text-3xl font-serif text-text-dark">Send Us a Direct Message</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-text-dark/70 uppercase tracking-widest mb-2 block">First Name</label>
                      <input type="text" name="first_name" required placeholder="Priya"
                        className="w-full bg-cream border border-border-soft rounded-xl px-4 py-3.5 text-text-dark placeholder-text-muted/50 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-dark/70 uppercase tracking-widest mb-2 block">Last Name</label>
                      <input type="text" name="last_name" required placeholder="Sharma"
                        className="w-full bg-cream border border-border-soft rounded-xl px-4 py-3.5 text-text-dark placeholder-text-muted/50 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm" value={formData.last_name} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-dark/70 uppercase tracking-widest mb-2 block">Email Address</label>
                    <input type="email" name="email" required placeholder="you@example.com"
                      className="w-full bg-cream border border-border-soft rounded-xl px-4 py-3.5 text-text-dark placeholder-text-muted/50 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm" value={formData.email} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-dark/70 uppercase tracking-widest mb-2 block">Phone Number</label>
                    <input type="tel" name="phone" required placeholder="+91 98765 43210"
                      className="w-full bg-cream border border-border-soft rounded-xl px-4 py-3.5 text-text-dark placeholder-text-muted/50 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-dark/70 uppercase tracking-widest mb-2 block">Your Message</label>
                    <textarea name="message" required rows={4} placeholder="Describe your inquiry, event date, or styling requirements…"
                      className="w-full bg-cream border border-border-soft rounded-xl px-4 py-3.5 text-text-dark placeholder-text-muted/50 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all resize-none outline-none text-sm" value={formData.message} onChange={handleChange} />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium rounded-xl px-6 py-4 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_12px_24px_rgba(128,27,52,0.35)] btn-3d-press mt-4">
                    {submitting ? 'Transmitting Inquiries…' : 'Send Message'} <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 3D Elevated Map Section ── */}
      <motion.div 
        className="container mx-auto px-6 pb-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest text-secondary uppercase mb-2 block">Visit Us</span>
            <h3 className="text-3xl md:text-5xl font-serif text-text-dark">Find Our Jaipur Boutique</h3>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border-soft relative group card-3d-lift" style={{ height: '440px' }}>
            <LocationMap />
          </div>
        </div>
      </motion.div>
    </div>
  );
}