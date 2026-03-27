import { useState, useEffect } from 'react';
import { User, Package, LogOut, MapPin, KeyRound, Tag, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authFetch from '../utils/authFetch';
import OrderDetailsModal from '../components/OrderDetailsModal';
import SEO from '../components/SEO';

const TabButton = ({ id, activeTab, setActiveTab, icon, label }) => {
  const Icon = icon;
  return (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === id ? 'bg-primary text-white shadow-lg translate-x-1' : 'text-muted/40 hover:bg-muted/5 hover:text-text-700'}`}
    >
      <Icon size={18}/> {label}
    </button>
  );
}

const DashboardCard = ({ title, value, icon }) => {
    const Icon = icon;
    return (
      <div className="bg-white p-8 rounded-2xl border border-muted/8 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 bg-accent/5 text-accent rounded-2xl group-hover:bg-accent group-hover:text-white transition-colors">
            <Icon size={24}/>
          </div>
        </div>
        <p className="text-muted/50 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-serif text-text-700 mt-2">{value}</h3>
      </div>
    );
}

export default function Profile({ user, setUser }) {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const response = await authFetch(`/addresses.php?user_id=${user.id}`);
      const data = await response.json();
      if (response.ok) setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    authFetch(`/orders.php?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => setOrders(data || []));
    fetchAddresses();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    setUser(null);
    navigate('/');
  };

  const handleAddAddressClick = () => {
    setCurrentAddress({ name: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '', is_default: 0 });
    setShowAddressForm(true);
    setFormMessage({ type: '', text: '' });
  };

  const handleEditAddress = (address) => {
    setCurrentAddress(address);
    setShowAddressForm(true);
    setFormMessage({ type: '', text: '' });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const response = await authFetch(`/addresses.php?id=${addressId}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        setFormMessage({ type: 'success', text: 'Address deleted successfully.' });
        fetchAddresses();
      } else {
        setFormMessage({ type: 'error', text: data.message || 'Failed to delete address.' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error.' });
    }
  };

  const handleSubmitAddressForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    const method = currentAddress.id ? 'PUT' : 'POST';
    const endpoint = `/addresses.php${currentAddress.id ? `?id=${currentAddress.id}` : ''}`;
    
    const addressData = {
      user_id: user.id,
      name: event.target.name.value,
      address_line1: event.target.address_line1.value,
      address_line2: event.target.address_line2.value,
      city: event.target.city.value,
      state: event.target.state.value,
      postal_code: event.target.postal_code.value,
      country: event.target.country.value,
      is_default: event.target.is_default.checked ? 1 : 0
    };

    try {
      const response = await authFetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });
      const data = await response.json();
      if (response.ok) {
        setFormMessage({ type: 'success', text: `Address ${method === 'POST' ? 'added' : 'updated'} successfully.` });
        setShowAddressForm(false);
        setCurrentAddress(null);
        fetchAddresses();
      } else {
        setFormMessage({ type: 'error', text: data.message || 'Error processing request.' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
      switch(status?.toLowerCase()) {
          case 'delivered': return 'bg-green-50 text-green-600 border border-green-100';
          case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
          case 'shipped': return 'bg-blue-50 text-blue-600 border border-blue-100';
          case 'processing': return 'bg-amber-50 text-amber-600 border border-amber-100';
          default: return 'bg-gray-50 text-gray-600 border border-gray-100';
      }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-serif text-text-700">Order History</h3>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-muted/8">
                <Package className="mx-auto text-muted/20 mb-4" size={48} />
                <p className="text-muted/40 font-light italic">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-3xl border border-muted/8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-muted/5">
                      <div>
                        <p className="font-bold text-lg text-text-700">Order #{order.id}</p>
                        <p className="text-xs text-muted/40 font-light mt-1">Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted/40 uppercase tracking-widest">Total Amount</p>
                        <p className="text-xl font-bold text-text-700">₹{order.total_amount}</p>
                      </div>
                      <button onClick={() => setSelectedOrderId(order.id)} className="btn-primary w-full sm:w-auto">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'addresses':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-text-700">Address Book</h3>
              {!showAddressForm && (
                <button onClick={handleAddAddressClick} className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest hover:text-accent-dark transition-colors">
                  <Plus size={16}/> Add New Address
                </button>
              )}
            </div>

            {formMessage.text && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                className={`p-4 rounded-2xl text-sm ${formMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {formMessage.text}
              </motion.div>
            )}

            {showAddressForm ? (
               <div className="bg-white p-8 rounded-3xl border border-muted/8 shadow-sm max-w-2xl">
                 <h4 className="text-xl font-serif text-text-700 mb-6">{currentAddress?.id ? 'Edit Address' : 'New Delivery Address'}</h4>
                 <form onSubmit={handleSubmitAddressForm} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Recipient Name</label>
                       <input type="text" name="name" defaultValue={currentAddress?.name} required className="input-field py-2.5" placeholder="John Doe"/>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Country</label>
                       <input type="text" name="country" defaultValue={currentAddress?.country || 'India'} required className="input-field py-2.5" />
                     </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Address Line 1</label>
                     <input type="text" name="address_line1" defaultValue={currentAddress?.address_line1} required className="input-field py-2.5" placeholder="House No, Street name..."/>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Address Line 2 (Optional)</label>
                     <input type="text" name="address_line2" defaultValue={currentAddress?.address_line2} className="input-field py-2.5" placeholder="Apartment, Landmark..."/>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">City</label>
                       <input type="text" name="city" defaultValue={currentAddress?.city} required className="input-field py-2.5" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">State</label>
                       <input type="text" name="state" defaultValue={currentAddress?.state} required className="input-field py-2.5" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">PIN Code</label>
                       <input type="text" name="postal_code" defaultValue={currentAddress?.postal_code} required className="input-field py-2.5" />
                     </div>
                   </div>

                   <label className="flex items-center gap-3 cursor-pointer group w-fit">
                     <div className="relative">
                       <input type="checkbox" name="is_default" defaultChecked={currentAddress?.is_default === 1} className="peer sr-only" />
                       <div className="w-10 h-6 bg-muted/20 rounded-full peer-checked:bg-accent transition-colors"></div>
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                     </div>
                     <span className="text-xs font-bold text-text-700 uppercase tracking-widest">Set as default address</span>
                   </label>

                   <div className="flex gap-4 pt-4 border-t border-muted/5">
                     <button type="submit" disabled={loading} className="btn-primary px-8 py-3 uppercase tracking-widest text-[10px]">
                       {loading ? 'Processing...' : (currentAddress?.id ? 'Update Address' : 'Save Address')}
                     </button>
                     <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline px-8 py-3 uppercase tracking-widest text-[10px]">Cancel</button>
                   </div>
                 </form>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 ? (
                  <div className="md:col-span-2 text-center py-20 bg-white rounded-3xl border border-muted/8">
                    <MapPin className="mx-auto text-muted/20 mb-4" size={48} />
                    <p className="text-muted/40 font-light italic">No addresses saved yet.</p>
                  </div>
                ) : (
                  addresses.map(address => (
                    <div key={address.id} className="bg-white p-8 rounded-3xl border border-muted/8 shadow-sm transition-all hover:shadow-md group relative">
                      {address.is_default && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full">
                           <CheckCircle2 size={12}/>
                           <span className="text-[8px] font-bold uppercase tracking-widest">Default</span>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className="font-bold text-text-700 text-lg font-serif">{address.name}</p>
                        <p className="text-sm text-muted/60 font-light leading-relaxed">
                          {address.address_line1}, {address.address_line2 ? `${address.address_line2}, ` : ''}<br/>
                          {address.city}, {address.state} {address.postal_code}<br/>
                          {address.country}
                        </p>
                      </div>

                      <div className="mt-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditAddress(address)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent-dark transition-colors">
                          <Edit2 size={14}/> Edit
                        </button>
                        <button onClick={() => handleDeleteAddress(address.id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14}/> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'change_password':
        return (
           <div className="space-y-8">
             <h3 className="text-2xl font-serif text-text-700">Account Security</h3>
             <div className="bg-white p-8 rounded-3xl border border-muted/8 shadow-sm max-w-md">
                <form className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Current Password</label>
                     <input type="password" placeholder="••••••••" className="input-field py-2.5"/>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">New Password</label>
                     <input type="password" placeholder="••••••••" className="input-field py-2.5"/>
                   </div>
                   <button type="submit" className="btn-primary w-full py-4 uppercase tracking-widest text-[10px]">Update Password</button>
                </form>
             </div>
           </div>
        );
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-surface min-h-screen">
      <SEO title="My Profile" />
      <OrderDetailsModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      <header className="bg-primary pt-32 pb-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-8 text-white">
          <div className="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center text-4xl font-serif font-light shadow-xl border-4 border-white/10 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-light">{user.name}</h1>
            <p className="text-white/40 font-light mt-1">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                {user.role} Account
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent">
                {user.loyalty_points || 0} Points
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="md:ml-auto flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          <aside className="lg:w-64 shrink-0">
            <div className="space-y-1 sticky top-32">
              <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={User} label="Overview" />
              <TabButton id="orders" activeTab={activeTab} setActiveTab={setActiveTab} icon={Package} label="My Orders" />
              <TabButton id="addresses" activeTab={activeTab} setActiveTab={setActiveTab} icon={MapPin} label="Addresses" />
              <TabButton id="change_password" activeTab={activeTab} setActiveTab={setActiveTab} icon={KeyRound} label="Security" />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === 'dashboard' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <DashboardCard title="Total Orders" value={orders.length} icon={Package} />
                      <DashboardCard title="Saved Addresses" value={addresses.length} icon={MapPin} />
                      <DashboardCard title="Loyalty Reward" value={`${user.loyalty_points || 0} pts`} icon={Tag} />
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl border border-muted/8 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl text-text-700">Recent Activity</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-accent uppercase tracking-widest hover:text-accent-dark transition-colors">View All →</button>
                      </div>
                      
                      {orders.length > 0 ? (
                        <div className="divide-y divide-muted/10">
                          {orders.slice(0, 3).map(order => (
                            <div key={order.id} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 py-4 group">
                              <p className="font-bold text-sm text-text-700">Order #{order.id}</p>
                              <p className="text-xs text-muted/50 font-light">{new Date(order.created_at).toLocaleDateString()}</p>
                              <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <span className="font-bold text-sm text-text-700 text-right">₹{order.total_amount}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted/40 font-light italic">No orders found yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}