import { Settings, Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'
import authFetch from '../utils/authFetch';

// A reusable section component for consistent styling
const SettingsSection = ({ title, children }) => (
  <div className="bg-surface-100 p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-text-700 mb-4 pb-4 border-b border-surface-200">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FormField = ({ label, name, value, onChange, placeholder, hint, type = 'text', children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-muted/70 mb-1">{label}</label>
    {children ? (
      children
    ) : (
              <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full p-2 border border-surface-200 rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface-100 text-text-700"
            />    )}
    {hint && <p className="text-xs text-muted/70 mt-1"></p>}
  </div>
);

export default function AdminSettings() {
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
  })
  const [loading, setLoading] = useState(false)
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
    if (!newBanner.image) return alert("Please select an image");
    
    const formData = new FormData();
    formData.append('title', newBanner.title);
    formData.append('subtitle', newBanner.subtitle);
    formData.append('link_url', newBanner.link_url);
    formData.append('image', newBanner.image);

    await authFetch(`/admin_banners.php`, { method: 'POST', body: formData });
    setNewBanner({ title: '', subtitle: '', link_url: '', image: null });
    fetchBanners();
    alert("Banner uploaded!");
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
      window.location.reload()
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

  return (
    <div className="bg-surface p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-accent-soft text-accent rounded-lg">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-700">Store Customization</h1>
            <p className="text-muted/70">Manage your website's appearance, branding, and content.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column for Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              <SettingsSection title="Brand Identity">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Store Name" name="site_name" value={settings.site_name} onChange={handleChange} />
                  <FormField label="Short Name (for Logo)" name="site_short_name" value={settings.site_short_name} onChange={handleChange} />
                </div>
                <FormField label="Tagline" name="site_description" value={settings.site_description} onChange={handleChange} />
              </SettingsSection>

              <SettingsSection title="Contact & Socials">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Email" name="contact_email" type="email" value={settings.contact_email} onChange={handleChange} />
                  <FormField label="Phone" name="contact_phone" value={settings.contact_phone} onChange={handleChange} />
                  <FormField label="WhatsApp Number" name="contact_whatsapp" value={settings.contact_whatsapp} onChange={handleChange} hint="Include country code, e.g., 919876543210" />
                  <FormField label="Instagram URL" name="social_instagram" value={settings.social_instagram} onChange={handleChange} />
                  <FormField label="Facebook URL" name="social_facebook" value={settings.social_facebook} onChange={handleChange} />
                  <FormField label="YouTube URL" name="social_youtube" value={settings.social_youtube} onChange={handleChange} />
                </div>
                <FormField label="Address" name="contact_address" value={settings.contact_address} onChange={handleChange}>
                  <textarea name="contact_address" value={settings.contact_address} onChange={handleChange} rows="3" className="w-full p-2 border border-surface-200 rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface-100 text-text-700"></textarea>
                </FormField>
              </SettingsSection>
              
               <SettingsSection title="Page Content">
                <div className="flex gap-2 mb-4 border-b border-surface-200 pb-4">
                  <button type="button" onClick={() => setSelectedPageSlug('about-us')} className={`px-4 py-2 text-sm rounded-md ${selectedPageSlug === 'about-us' ? 'bg-accent text-surface' : 'bg-surface-100 text-text-700 hover:bg-accent/10'}`}>About Us</button>
                  <button type="button" onClick={() => setSelectedPageSlug('contact-us')} className={`px-4 py-2 text-sm rounded-md ${selectedPageSlug === 'contact-us' ? 'bg-accent text-surface' : 'bg-surface-100 text-text-700 hover:bg-accent/10'}`}>Contact Us</button>
                </div>
                {pageLoading ? <p className="text-muted/70">Loading...</p> : (
                  <div className="space-y-4">
                    <FormField label="Page Title" name="page_title" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
                    <FormField label="Page Content (HTML allowed)" name="page_content" value={pageContent} onChange={e => setPageContent(e.target.value)}>
                       <textarea value={pageContent} onChange={(e) => setPageContent(e.target.value)} rows="10" className="w-full p-2 border border-surface-200 rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface-100 font-mono text-sm text-text-700"></textarea>
                    </FormField>
                    <button type="button" onClick={handlePageSave} disabled={pageLoading} className="px-5 py-2 bg-primary text-surface text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow disabled:bg-surface-300">
                      {pageLoading ? 'Saving...' : `Save ${pageTitle} Content`}
                    </button>
                  </div>
                )}
              </SettingsSection>

              <SettingsSection title="Home Page Banners">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map(banner => (
                    <div key={banner.id} className="relative group rounded-lg overflow-hidden aspect-video bg-surface-100">
                      <img src={banner.image_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => handleBannerDelete(banner.id)} className="bg-danger text-surface p-2 rounded-full">
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-surface-100 rounded-lg border border-surface-200">
                  <h4 className="font-semibold text-sm mb-4 text-text-700">Add New Banner</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Title" name="title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                    <FormField label="Subtitle" name="subtitle" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                    <FormField label="Link URL" name="link_url" value={newBanner.link_url} onChange={e => setNewBanner({...newBanner, link_url: e.target.value})} />
                    <FormField label="Image" name="image">
                      <input type="file" onChange={e => setNewBanner({...newBanner, image: e.target.files[0]})} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-soft file:text-accent hover:file:bg-accent-soft/80"/>
                    </FormField>
                  </div>
                  <button type="button" onClick={handleBannerUpload} className="mt-4 px-5 py-2 bg-accent text-surface text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow">
                    Upload Banner
                  </button>
                </div>
               </SettingsSection>
            </div>

            {/* Right Column for Theme & Financials */}
            <div className="space-y-6">
              <SettingsSection title="Financials">
                <FormField label="Shipping Cost (Flat Rate)" name="shipping_cost" type="number" value={settings.shipping_cost} onChange={handleChange} />
                <FormField label="Tax Rate (%)" name="tax_rate" type="number" value={settings.tax_rate} onChange={handleChange} />
              </SettingsSection>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-accent text-surface font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-surface-300"
            >
              <Save size={20} /> {loading ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
