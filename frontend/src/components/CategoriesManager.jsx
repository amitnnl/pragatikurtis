import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authFetch from '../utils/authFetch';

const Card = ({ children, className = "" }) => (
  <div className={`bg-surface-100 rounded-xl shadow-sm border border-surface-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-accent text-surface hover:bg-opacity-90 shadow-md hover:shadow-lg",
    secondary: "bg-surface-100 text-text-700 border border-surface-200 hover:bg-surface-200 hover:border-surface-300",
    danger: "bg-surface-100 text-danger border border-danger-light hover:bg-danger-soft hover:border-danger-light",
  };
  return <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>{children}</button>;
};

const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-4 py-2.5 bg-surface-100 border border-surface-200 text-text-700 text-sm rounded-lg focus:ring-1 focus:ring-accent focus:border-accent block p-2.5 ${className}`} 
    {...props} 
  />
);

const Label = ({ children }) => (
  <label className="block mb-2 text-sm font-medium text-text-700">{children}</label>
);

const Badge = ({ children, color = "info" }) => {
  const colors = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    gray: "bg-muted/10 text-text-700",
  };
  return <span className={`${colors[color] || colors.gray} text-xs font-medium px-2.5 py-0.5 rounded-full`}>{children}</span>;
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({ id: null, name: '', slug: '', display_order: 0, image: null, image_url: '' });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/admin_categories.php`);
      setCategories(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      id: category.id, 
      name: category.name, 
      slug: category.slug, 
      display_order: category.display_order, 
      image: null, 
      image_url: category.image_url 
    });
    setImagePreview(category.image_url);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this category?")) {
      await authFetch(`/admin_categories.php`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      fetchCategories();
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    await authFetch(`/admin_categories.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, is_active: currentStatus ? 0 : 1 })
    });
    fetchCategories();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('action', editingCategory ? 'update' : 'create');
    if (formData.id) data.append('id', formData.id);
    data.append('name', formData.name);
    data.append('slug', formData.slug || formData.name);
    data.append('display_order', formData.display_order);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await authFetch(`/admin_categories.php`, { method: 'POST', body: data });
      const result = await res.json();
      if (result.status === 'success') {
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert(result.message);
      }
    } catch (err) { alert("Network error."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-text-700">Categories Management</h3>
        <Button onClick={() => { 
          setEditingCategory(null); 
          setFormData({ id: null, name: '', slug: '', display_order: 0, image: null, image_url: '' });
          setImagePreview(null);
          setShowForm(true); 
        }}>
          <Plus size={18} /> Add Category
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="p-6 mb-8 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted/70 hover:text-text-700"><X size={20} /></button>
              <h4 className="text-lg font-bold text-text-700 mb-6 border-b border-surface-200 pb-2">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div><Label>Slug (Internal ID/URL)</Label><Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder={formData.name} /></div>
                  <div><Label>Display Order</Label><Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: e.target.value})} /></div>
                </div>

                <div>
                  <Label>Category Image</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-200 border-dashed rounded-lg hover:bg-surface-100 transition">
                    <div className="space-y-1 text-center">
                      {imagePreview ? <img src={imagePreview} className="mx-auto h-32 object-cover rounded-lg shadow-sm" alt="Preview"/> : <ImageIcon className="mx-auto h-12 w-12 text-muted/70" />}
                      <div className="flex text-sm text-muted/70 justify-center mt-2">
                        <label className="relative cursor-pointer bg-surface-100 rounded-md font-medium text-accent hover:text-accent-hover">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit">Save Category</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {loading ? <p className="text-muted/70">Loading categories...</p> : categories.map(cat => (
          <div key={cat.id} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-md border border-surface-200">
            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleEdit(cat)} className="p-1.5 bg-white text-accent hover:bg-accent hover:text-white rounded-md shadow-sm transition"><Edit size={14}/></button>
               <button onClick={() => handleDelete(cat.id)} className="p-1.5 bg-white text-danger hover:bg-danger hover:text-white rounded-md shadow-sm transition"><Trash2 size={14}/></button>
            </div>
            
            <div className="absolute top-2 left-2 z-20">
               <button onClick={() => handleToggleActive(cat.id, cat.is_active)} className={`text-[10px] px-2 py-0.5 rounded font-bold ${cat.is_active ? 'bg-success text-white' : 'bg-surface-300 text-text-700'}`}>
                 {cat.is_active ? 'Active' : 'Hidden'}
               </button>
            </div>

            <img src={cat.image_url} alt={cat.name} loading="lazy" className={`w-full h-full object-cover transition-transform duration-700 ${!cat.is_active && 'grayscale'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
              <h3 className="text-white font-serif text-lg leading-tight">{cat.name}</h3>
              <p className="text-white/60 text-xs mt-1">Order: {cat.display_order}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
