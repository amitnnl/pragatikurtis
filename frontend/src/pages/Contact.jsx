import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_CONFIG } from '../config/branding';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import authFetch from '../utils/authFetch';
import { useSettings } from '../context/SettingsContext';

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-muted/10 py-5">
      <button className="w-full flex justify-between items-center text-left gap-4" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base font-medium text-text-700">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
          <ChevronDown className="w-5 h-5 text-muted/50" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <p className="mt-4 text-muted/70 font-light leading-relaxed pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const faqs = [
  { question: "What are your business hours?", answer: "Our boutique is open from 10:00 AM to 8:00 PM, Monday to Saturday. Our online support is available 24/7." },
  { question: "How can I track my order?", answer: "You can track your order using the 'Track Order' link in the main menu. You will need your order ID and the email address used to place the order." },
  { question: "What is your return policy?", answer: "We offer a 15-day return policy for all unworn items with tags attached. Please visit our Returns page for more details." },
  { question: "Do you ship internationally?", answer: "Currently, we only ship within India. We are working on expanding our shipping options to more countries in the near future." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } }),
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
    { icon: Mail, label: 'Email Us', value: settings?.contact_email || BRAND_CONFIG.contact.email, href: `mailto:${settings?.contact_email || BRAND_CONFIG.contact.email}` },
    { icon: Phone, label: 'Call Us', value: settings?.contact_phone || BRAND_CONFIG.contact.phone, href: `tel:${settings?.contact_phone || BRAND_CONFIG.contact.phone}` },
    { icon: MapPin, label: 'Our Boutique', value: settings?.contact_address || BRAND_CONFIG.contact.address, href: null },
    { icon: Clock, label: 'Business Hours', value: 'Mon – Sat, 10 AM – 8 PM', href: null },
  ];

  return (
    <div className="bg-surface">
      <SEO title="Contact Us" description="Get in touch with Pragati Kurtis. We're here to help with your orders, inquiries, or just to say hello." />

      {/* ── Page Hero Header ── */}
      <div className="pt-32 pb-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
        <div className="relative container mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Get In Touch</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-light text-white">Contact Us</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 mt-3 font-light max-w-xl mx-auto">
              We'd love to hear from you. Whether you have a question about an order or just want to say hello.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactItems.map(({ icon: Icon, label, value, href }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className="bg-surface rounded-2xl p-5 shadow-lg border border-muted/8 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted/50 uppercase tracking-widest mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-sm text-text-700 font-medium hover:text-accent transition-colors leading-snug">{value}</a>
                ) : (
                  <p className="text-sm text-text-700 font-medium leading-snug">{value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">

          {/* Left — Info + WhatsApp */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Connect With Us</p>
              <h2 className="text-3xl font-serif font-light text-text-700 leading-snug">
                We're Here<br />to Help You
              </h2>
              <p className="text-muted/60 font-light mt-4 leading-relaxed">
                Have a question about your order, sizing, or our collection? Reach out anytime — we usually respond within a few hours.
              </p>
            </div>

            {/* WhatsApp CTA */}
            {(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp) && (
              <a
                href={`https://wa.me/${(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp).replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <FaWhatsapp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Chat on WhatsApp</p>
                  <p className="text-xs text-green-600 font-light">Quick replies • Usually within minutes</p>
                </div>
                <div className="ml-auto text-green-400 group-hover:translate-x-1 transition-transform">→</div>
              </a>
            )}

            {/* FAQ Teaser */}
            <div className="bg-surface-100 rounded-2xl p-6 border border-muted/8">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={18} className="text-accent" />
                <p className="font-semibold text-text-700">Common Questions</p>
              </div>
              <div className="divide-y divide-muted/10">
                {faqs.slice(0, 3).map((faq, i) => (
                  <AccordionItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Contact Form */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="lg:col-span-3">
            <div className="bg-surface rounded-2xl p-8 md:p-10 shadow-sm border border-muted/8">
              {success ? (
                <div className="text-center py-16">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-serif text-text-700 mb-2">Message Sent!</h3>
                  <p className="text-muted/60 font-light">{success}</p>
                  <button onClick={() => setSuccess(null)} className="mt-8 text-accent font-semibold hover:text-accent-dark text-sm transition-colors">
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-6">
                    <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-2">Message Us</p>
                    <h2 className="text-2xl font-serif font-light text-text-700">Send a Message</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-1.5 block">First Name</label>
                      <input type="text" name="first_name" required placeholder="Priya"
                        className="input-field" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-1.5 block">Last Name</label>
                      <input type="text" name="last_name" required placeholder="Sharma"
                        className="input-field" value={formData.last_name} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-1.5 block">Email Address</label>
                    <input type="email" name="email" required placeholder="you@example.com"
                      className="input-field" value={formData.email} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <input type="tel" name="phone" required placeholder="+91 98765 43210"
                      className="input-field" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted/60 uppercase tracking-wider mb-1.5 block">Your Message</label>
                    <textarea name="message" required rows={5} placeholder="Tell us how we can help you…"
                      className="input-field resize-none" value={formData.message} onChange={handleChange} />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full btn-primary justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none">
                    {submitting ? 'Sending…' : 'Send Message'} <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="container mx-auto px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-serif font-light text-text-700 mb-6 text-center">Find Us Here</h2>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-muted/8" style={{ height: '400px' }}>
            <LocationMap />
          </div>
        </div>
      </div>
    </div>
  );
}