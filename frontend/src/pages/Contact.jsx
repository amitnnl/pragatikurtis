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
    <div className="border-b border-gray-100 py-5">
      <button className="w-full flex justify-between items-center text-left gap-4 group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base font-medium text-gray-800 group-hover:text-rose-600 transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 bg-rose-50 p-1.5 rounded-full">
          <ChevronDown className="w-4 h-4 text-rose-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <p className="mt-4 text-gray-600 font-light leading-relaxed pr-8">{answer}</p>
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
    { icon: Mail, label: 'Email Us', value: settings?.contact_email || BRAND_CONFIG.contact.email, href: `mailto:${settings?.contact_email || BRAND_CONFIG.contact.email}` },
    { icon: Phone, label: 'Call Us', value: settings?.contact_phone || BRAND_CONFIG.contact.phone, href: `tel:${settings?.contact_phone || BRAND_CONFIG.contact.phone}` },
    { icon: MapPin, label: 'Our Boutique', value: settings?.contact_address || BRAND_CONFIG.contact.address, href: null },
    { icon: Clock, label: 'Business Hours', value: 'Mon – Sat, 10 AM – 8 PM', href: null },
  ];

  return (
    <div className="bg-[#faf9f6] min-h-screen">
      <SEO title="Contact Us | Pragati Kurties" description="Get in touch with Pragati Kurties. We're here to help with your orders, inquiries, or just to say hello." />

      {/* ── Page Hero Header ── */}
      <motion.section 
        className="relative pt-40 pb-20 md:pt-48 md:pb-32 bg-[#faf9f6] flex items-center justify-center overflow-hidden border-b border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 transform -translate-x-1/2 translate-y-1/2"></div>
        <motion.div 
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
        >
          <span className="block text-sm md:text-md uppercase tracking-[0.3em] mb-6 text-rose-400 font-semibold">Get In Touch</span>
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tight uppercase">
            Contact Us
          </h1>
          <p className="mt-8 text-lg md:text-xl font-light tracking-wide text-gray-500 leading-relaxed">
            We'd love to hear from you. Whether you have a question about an order, sizing, or just want to say hello.
          </p>
        </motion.div>
      </motion.section>

      {/* ── Contact Cards ── */}
      <div className="container mx-auto px-6 relative z-20 -mt-16 sm:-mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {contactItems.map(({ icon: Icon, label, value, href }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className="bg-white rounded-2xl p-6 shadow-xl shadow-rose-900/5 border border-rose-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={24} className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                {href ? (
                  <a href={href} className="text-sm text-gray-800 font-medium hover:text-rose-500 transition-colors cursor-pointer">{value}</a>
                ) : (
                  <p className="text-sm text-gray-800 font-medium">{value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-6 py-24 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 max-w-6xl mx-auto relative z-10">

          {/* Left — Info + WhatsApp */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-3">Connect With Us</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight mb-6">
                We're Here<br />to Help You
              </h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">
                Have a question about your order, sizing, or our collection? Reach out anytime — we usually respond within a few hours. Your satisfaction is our priority.
              </p>
            </div>

            {/* WhatsApp CTA */}
            {(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp) && (
              <a
                href={`https://wa.me/${(settings?.contact_whatsapp || BRAND_CONFIG.contact.whatsapp).replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-5 p-6 rounded-2xl bg-white shadow-lg border border-emerald-50 hover:border-emerald-100 hover:shadow-xl transition-all group hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <FaWhatsapp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-serif text-xl text-gray-900 mb-1">Chat on WhatsApp</p>
                  <p className="text-sm text-emerald-600 font-light">Quick replies within minutes</p>
                </div>
                <div className="ml-auto text-emerald-500 group-hover:translate-x-2 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </a>
            )}

            {/* FAQ Teaser */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <MessageSquare size={18} className="text-rose-500" />
                </div>
                <p className="font-serif text-2xl text-gray-900">Common Questions</p>
              </div>
              <div className="divide-y divide-gray-100">
                {faqs.slice(0, 3).map((faq, i) => (
                  <AccordionItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Contact Form */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="lg:col-span-3">
             <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-rose-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/2 -translate-y-1/2"></div>
                
              {success ? (
                <div className="text-center py-20 relative z-10">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                  </motion.div>
                  <h3 className="text-4xl font-serif text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600 text-lg font-light mb-10">{success}</p>
                  <button onClick={() => setSuccess(null)} className="text-rose-500 font-semibold hover:text-rose-600 text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2 mx-auto">
                    Send Another Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="mb-8">
                    <p className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-2">Inquiries</p>
                    <h2 className="text-4xl font-serif text-gray-900">Send a Message</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">First Name</label>
                      <input type="text" name="first_name" required placeholder="Priya"
                        className="w-full bg-[#faf9f6] border-none rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner outline-none" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Last Name</label>
                      <input type="text" name="last_name" required placeholder="Sharma"
                        className="w-full bg-[#faf9f6] border-none rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner outline-none" value={formData.last_name} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                    <input type="email" name="email" required placeholder="you@example.com"
                      className="w-full bg-[#faf9f6] border-none rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner outline-none" value={formData.email} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                    <input type="tel" name="phone" required placeholder="+91 98765 43210"
                      className="w-full bg-[#faf9f6] border-none rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner outline-none" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">Your Message</label>
                    <textarea name="message" required rows={4} placeholder="Tell us how we can help you…"
                      className="w-full bg-[#faf9f6] border-none rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-200 focus:bg-white transition-all shadow-inner resize-none outline-none" value={formData.message} onChange={handleChange} />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full bg-gray-900 hover:bg-rose-900 text-white font-medium rounded-xl px-6 py-4 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 mt-4">
                    {submitting ? 'Sending…' : 'Send Message'} <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Map ── */}
      <motion.div 
        className="container mx-auto px-6 pb-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-3">Visit Us</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-gray-900">Find Our Boutique</h3>
          </div>
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 relative group" style={{ height: '450px' }}>
            <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
            <LocationMap />
          </div>
        </div>
      </motion.div>
    </div>
  );
}