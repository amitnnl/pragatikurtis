import { Settings, Save, Trash2, Layout, Phone, FileText, Image, Globe, AtSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '../config'
import authFetch from '../utils/authFetch';

const SettingsSection = ({ title, icon: Icon, children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 p-8 rounded-2xl shadow-sm border border-surface-200">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-200">
      {Icon && <div className="p-2 bg-accent-soft text-accent rounded-lg"><Icon size={20} /></div>}
      <h3 className="text-xl font-bold text-text-700">{title}</h3>
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </motion.div>
);

const FormField = ({ label, name, value, onChange, placeholder, hint, type = 'text', children, icon: Icon }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-sm font-bold text-text-700 mb-2">{label}</label>
    {children ? (
      children
    ) : (
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50"><Icon size={18} /></div>}
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface transition-all text-text-700 ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    )}
    {hint && <p className="text-xs text-muted/70 mt-2 font-medium bg-surface-200 inline-block px-2 py-1 rounded w-max">{hint}</p>}
  </div>
);

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    site_name: '',
    site_short_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_address: '',
    social_instagram: '',
    social_facebook: '',
    social_youtube: '',
    map_embed_url: '',
    shipping_cost: '0',
    tax_rate: '0',
  });
  
  const [loading, setLoading] = useState(false);
  const [pageContent, setPageContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedPageSlug, setSelectedPageSlug] = useState('about-us');
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', link_url: '', image: null });

  const fetchBanners = () => {
    authFetch(`/admin_banners.php`)
      .then(res => res.json())
      .then(data => setBanners(data));
  }

  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!newBanner.id && !newBanner.image) return alert("Please select an image for new banners");
    
    const formData = new FormData();
    if (newBanner.id) {
      formData.append('action', 'update');
      formData.append('id', newBanner.id);
    }
    formData.append('title', newBanner.title);
    formData.append('subtitle', newBanner.subtitle || '');
    formData.append('link_url', newBanner.link_url || '');
    if (newBanner.image) {
      formData.append('image', newBanner.image);
    }

    await authFetch(`/admin_banners.php`, { method: 'POST', body: formData });
    setNewBanner({ title: '', subtitle: '', link_url: '', image: null });
    fetchBanners();
    alert(newBanner.id ? "Banner updated!" : "Banner uploaded!");
  }

  const handleEditBanner = (banner) => {
    setNewBanner({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      link_url: banner.link_url,
      image: null
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  const handleBannerDelete = async (id) => {
    if (confirm("Delete this banner?")) {
      await authFetch(`/admin_banners.php`, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'delete', id }) 
      });
      fetchBanners();
    }
  }

  useEffect(() => {
    authFetch(`/admin_settings.php?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
      .catch(err => console.error("Error fetching settings:", err))
    fetchBanners();
  }, [])
  
  useEffect(() => {
    if (selectedPageSlug) {
      setPageLoading(true);
      authFetch(`/pages.php?slug=${selectedPageSlug}`)
        .then(res => res.json())
        .then(data => {
          setPageContent(data.content || '');
          setPageTitle(data.page_title || '');
        })
        .finally(() => setPageLoading(false));
    }
  }, [selectedPageSlug]);

  const handleSave = (e) => {
    e.preventDefault()
    setLoading(true)
    authFetch(`/admin_settings.php`, {
      method: 'POST',
      body: JSON.stringify(settings)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message)
    })
    .catch(() => alert("Failed to save settings."))
    .finally(() => setLoading(false))
  }
  
  const handlePageSave = async () => {
    setPageLoading(true);
    try {
      const res = await authFetch(`/pages.php`, {
        method: 'POST',
        body: JSON.stringify({ page_slug: selectedPageSlug, page_title: pageTitle, content: pageContent }),
      });
      const data = await res.json();
      alert(data.message || 'Page content saved!');
    } catch (err) {
      alert("An error occurred while saving page content.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const tabs = [
    { id: 'general', label: 'General Info', icon: Layout },
    { id: 'contact', label: 'Contact & Socials', icon: Phone },
    { id: 'pages', label: 'Static Pages', icon: FileText },
    { id: 'banners', label: 'Home Banners', icon: Image },
  ];

  return (
    <div className="bg-surface min-h-[calc(100vh-64px)] pb-20">
      {/* Header Area */}
      <div className="bg-surface-100 border-b border-surface-200 px-6 py-8 md:px-12 md:py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-accent shadow-lg shadow-accent/20 text-surface rounded-2xl">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-text-700 tracking-tight">Store Settings</h1>
              <p className="text-muted/70 font-medium mt-1">Configure your platform's core identity and features.</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-4 bg-accent text-surface font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-xl flex items-center justify-center gap-3 disabled:bg-surface-300 disabled:shadow-none"
          >
            <Save size={22} /> {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 md:px-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="flex flex-col gap-2 sticky top-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 font-bold px-5 py-4 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-accent text-surface shadow-lg shadow-accent/20 scale-105' 
                      : 'bg-transparent text-muted/70 hover:bg-surface-100 hover:text-text-700'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-surface' : 'text-muted/50'} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SettingsSection title="Brand Identity" icon={Globe}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Store Name" name="site_name" value={settings.site_name} onChange={handleChange} />
                    <FormField label="Short Name (Logo)" name="site_short_name" value={settings.site_short_name} onChange={handleChange} />
                  </div>
                  <FormField label="Tagline / Short Description" name="site_description" value={settings.site_description} onChange={handleChange} />
                </SettingsSection>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SettingsSection title="Contact Information" icon={AtSign}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Support Email" name="contact_email" type="email" value={settings.contact_email} onChange={handleChange} icon={AtSign} />
                    <FormField label="Support Phone" name="contact_phone" value={settings.contact_phone} onChange={handleChange} icon={Phone}/>
                    <FormField label="WhatsApp Connect Number" name="contact_whatsapp" value={settings.contact_whatsapp} onChange={handleChange} hint="Include Country Code (e.g. 919876543210)" />
                  </div>
                  <div className="mt-4">
                    <FormField label="Physical Store Address" name="contact_address" value={settings.contact_address} onChange={handleChange}>
                      <textarea name="contact_address" value={settings.contact_address || ''} onChange={handleChange} rows="3" className="w-full p-4 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-accent bg-surface transition-all text-text-700"></textarea>
                    </FormField>
                  </div>
                </SettingsSection>

                <SettingsSection title="Social Media Connect" icon={Globe}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Instagram Profile URL" name="social_instagram" value={settings.social_instagram} onChange={handleChange} />
                    <FormField label="Facebook Page URL" name="social_facebook" value={settings.social_facebook} onChange={handleChange} />
                    <FormField label="YouTube Channel URL" name="social_youtube" value={settings.social_youtube} onChange={handleChange} />
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {activeTab === 'pages' && (
              <motion.div key="pages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SettingsSection title="Manage Static Pages" icon={FileText}>
                  <div className="flex gap-3 mb-8 p-1 bg-surface-200 rounded-xl inline-flex">
                    {['about-us', 'contact-us'].map(slug => (
                      <button 
                        key={slug} type="button" 
                        onClick={() => setSelectedPageSlug(slug)} 
                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedPageSlug === slug ? 'bg-surface text-accent shadow' : 'text-muted/70 hover:text-text-700'}`}
                      >
                        {slug === 'about-us' ? 'About Us' : 'Contact Us'}
                      </button>
                    ))}
                  </div>

                  {pageLoading ? <p className="text-center py-10 text-muted/50 font-bold animate-pulse">Loading Document...</p> : (
                    <div className="space-y-6">
                      <FormField label="Tab Display Title" name="page_title" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
                      <FormField label="Rich Page Content (HTML supported)" name="page_content" value={pageContent} onChange={e => setPageContent(e.target.value)}>
                         <textarea value={pageContent} onChange={(e) => setPageContent(e.target.value)} rows="15" className="w-full p-4 border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-accent bg-surface font-mono text-sm text-text-700 leading-relaxed"></textarea>
                      </FormField>
                      <button type="button" onClick={handlePageSave} disabled={pageLoading} className="px-8 py-3 bg-accent-soft text-accent font-black rounded-xl hover:bg-accent hover:text-surface transition-colors">
                        Synchronize {pageTitle}
                      </button>
                    </div>
                  )}
                </SettingsSection>
              </motion.div>
            )}

            {activeTab === 'banners' && (
              <motion.div key="banners" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <SettingsSection title="Live Sliders" icon={Image}>
                  {banners.length === 0 ? <p className="text-muted/50 p-6 text-center border-2 border-dashed border-surface-200 rounded-xl">No banners are currently active. Add your first slider below!</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {banners.map(banner => (
                        <div key={banner.id} className="relative group rounded-xl overflow-hidden aspect-[21/9] bg-surface-200 shadow-md">
                          <img src={banner.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                            <h4 className="text-white font-bold text-lg">{banner.title}</h4>
                            <p className="text-white/80 text-xs">{banner.subtitle}</p>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button type="button" onClick={() => handleEditBanner(banner)} className="bg-info/90 hover:bg-info text-surface p-2.5 rounded-full backdrop-blur-sm shadow-xl transition-transform hover:scale-110">
                              <Settings size={18}/>
                            </button>
                            <button type="button" onClick={() => handleBannerDelete(banner.id)} className="bg-danger/90 hover:bg-danger text-surface p-2.5 rounded-full backdrop-blur-sm shadow-xl transition-transform hover:scale-110">
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SettingsSection>

                <SettingsSection title={newBanner.id ? "Edit Slider" : "Upload New Slider"} icon={Image}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Primary Headline" name="title" placeholder="e.g. Summer Collection" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                    <FormField label="Sub-Headline" name="subtitle" placeholder="e.g. Upto 50% Off" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <FormField label="Link Target (Button URL)" name="link_url" placeholder="/shop?category=summer" value={newBanner.link_url} onChange={e => setNewBanner({...newBanner, link_url: e.target.value})} />
                      <FormField label={newBanner.id ? "Replace Image (Optional)" : "High-Res Image"} name="image">
                        <input type="file" onChange={e => setNewBanner({...newBanner, image: e.target.files[0]})} className="w-full p-2.5 bg-surface border border-surface-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-black file:bg-accent file:text-surface hover:file:opacity-90 transition-all cursor-pointer"/>
                      </FormField>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button type="button" onClick={handleBannerUpload} className="px-8 py-3 bg-accent text-surface text-sm font-black rounded-xl hover:bg-opacity-90 transition-all shadow-md">
                      {newBanner.id ? "Save Changes" : "Upload & Make Live"}
                    </button>
                    {newBanner.id && (
                      <button type="button" onClick={() => setNewBanner({ title: '', subtitle: '', link_url: '', image: null })} className="px-8 py-3 bg-surface-200 text-text-700 text-sm font-black rounded-xl hover:bg-surface-300 transition-all shadow-sm">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </SettingsSection>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
