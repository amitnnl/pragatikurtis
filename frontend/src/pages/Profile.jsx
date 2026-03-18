import { useState, useEffect } from 'react';
import { User, Package, LogOut, MapPin, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import authFetch from '../utils/authFetch';

import OrderDetailsModal from '../components/OrderDetailsModal';

const TabButton = ({ id, activeTab, setActiveTab, icon, label }) => {
  const Icon = icon;
  return (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === id ? 'bg-accent text-surface' : 'text-text-500 hover:bg-surface-100 hover:text-text-700'}`}>
      <Icon size={20}/> {label}
    </button>
  );
}

const DashboardCard = ({ title, value, icon }) => {
    const Icon = icon;
    return (
      <div className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm">
        <div className="flex justify-between items-start mb-4"><div className="p-3 bg-accent-light text-accent rounded-lg"><Icon size={24}/></div></div>
        <p className="text-text-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-text-700 mt-1">{value}</h3>
      </div>
    );
}

export default function Profile({ user, setUser }) {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  // Address book specific states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null); // For edit
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const response = await authFetch(`/addresses.php?user_id=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setAddresses(data || []);
      } else {
        setFormMessage({ type: 'error', text: data.message || 'Failed to fetch addresses.' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error fetching addresses.' });
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      authFetch(`/orders.php?user_id=${user.id}`).then(res => res.json()),
      fetchAddresses(), // Fetch addresses using the new function
    ]).then(([ordersData]) => { // Only ordersData here, addresses handled by fetchAddresses
      setOrders(ordersData || []);
      // setAddresses handled by fetchAddresses
    });
  }, [user, navigate, fetchAddresses]); // Added fetchAddresses to dependency array

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Address book helper functions
  const handleAddAddressClick = () => {
    setCurrentAddress({ name: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: '' });
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
        setFormMessage({ type: 'success', text: data.message });
        fetchAddresses(); // Refresh the list
      } else {
        setFormMessage({ type: 'error', text: data.message || 'Failed to delete address.' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error deleting address.' });
      console.error('Error deleting address:', error);
    }
  };

  const handleSubmitAddressForm = async (event) => {
    event.preventDefault();
    const method = currentAddress.id ? 'PUT' : 'POST';
    const endpoint = `/addresses.php${currentAddress.id ? `?id=${currentAddress.id}` : ''}`;
    
    // Construct form data manually to send as JSON
    const addressData = {
      user_id: user.id, // Ensure user_id is sent
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });
      const data = await response.json();
      if (response.ok) {
        setFormMessage({ type: 'success', text: data.message });
        setShowAddressForm(false);
        setCurrentAddress(null);
        fetchAddresses(); // Refresh the list
      } else {
        setFormMessage({ type: 'error', text: data.message || `Failed to ${method === 'POST' ? 'add' : 'update'} address.` });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error submitting address form.' });
      console.error('Error submitting address form:', error);
    }
  };

  // Password change specific states and handlers
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handlePasswordFormChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPasswordForm = async (event) => {
    event.preventDefault();
    setPasswordMessage({ type: '', text: '' }); // Clear previous messages

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      const response = await authFetch('/update_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_new_password: passwordForm.confirmPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordMessage({ type: 'success', text: data.message });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error updating password.' });
      console.error('Error updating password:', error);
    }
  };
  
  const getStatusColor = (status) => {
      switch(status) {
          case 'delivered': return 'bg-success-soft text-success';
          case 'cancelled': return 'bg-danger-soft text-danger';
          case 'shipped': return 'bg-info-soft text-info';
          case 'processing': return 'bg-accent-light text-accent';
          default: return 'bg-warning-soft text-warning';
      }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard title="Total Orders" value={orders.length} icon={Package} />
              <DashboardCard title="Saved Addresses" value={addresses.length} icon={MapPin} />
            </div>
            <div className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm">
              <h3 className="font-semibold text-text-700 mb-4">Recent Orders</h3>
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="grid grid-cols-4 items-center gap-4 p-3 even:bg-surface rounded-md">
                  <p className="font-semibold text-sm text-text-700">Order #{order.id}</p>
                  <p className="text-xs text-text-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-center ${getStatusColor(order.status)}`}>{order.status}</span>
                  <span className="font-bold text-sm text-text-700 text-right">₹{order.total_amount}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'orders':
        return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-text-700 mb-4">My Order History</h3>
              {orders.length === 0 ? (
                <p className="text-muted/70">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-surface-200">
                        <div>
                          <p className="font-semibold text-lg text-text-700">Order #{order.id}</p>
                          <p className="text-sm text-text-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-text-500">Total Amount</p>
                          <p className="font-bold text-text-700">₹{order.total_amount}</p>
                        </div>
                        <div className="text-right md:text-left">
                          <button onClick={() => setSelectedOrderId(order.id)} className="px-4 py-2 bg-accent text-surface rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        );
      case 'addresses':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-700 mb-4">My Address Book</h3>

            {formMessage.text && (
              <div className={`p-3 rounded-lg text-sm ${formMessage.type === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                {formMessage.text}
              </div>
            )}

            {showAddressForm ? (
              <div className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm">
                <h4 className="font-semibold text-text-700 mb-4">{currentAddress && currentAddress.id ? 'Edit Address' : 'Add New Address'}</h4>
                <form onSubmit={handleSubmitAddressForm} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-700">Name</label>
                    <input type="text" id="name" name="name" defaultValue={currentAddress?.name || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-medium text-text-700">Address Line 1</label>
                    <input type="text" id="address_line1" name="address_line1" defaultValue={currentAddress?.address_line1 || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-medium text-text-700">Address Line 2 (Optional)</label>
                    <input type="text" id="address_line2" name="address_line2" defaultValue={currentAddress?.address_line2 || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-text-700">City</label>
                      <input type="text" id="city" name="city" defaultValue={currentAddress?.city || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-text-700">State</label>
                      <input type="text" id="state" name="state" defaultValue={currentAddress?.state || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-text-700">Postal Code</label>
                      <input type="text" id="postal_code" name="postal_code" defaultValue={currentAddress?.postal_code || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-text-700">Country</label>
                    <input type="text" id="country" name="country" defaultValue={currentAddress?.country || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="is_default" name="is_default" defaultChecked={currentAddress?.is_default === 1} className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent" />
                    <label htmlFor="is_default" className="ml-2 block text-sm text-text-700">Set as default address</label>
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {addresses.length === 0 ? (
                  <p className="text-muted/70">You have no saved addresses yet.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map(address => (
                      <div key={address.id} className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm">
                        <p className="font-semibold text-text-700">{address.name}</p>
                        <p className="text-sm text-text-500">{address.address_line1}, {address.address_line2}</p>
                        <p className="text-sm text-text-500">{address.city}, {address.state} {address.postal_code}</p>
                        <p className="text-sm text-text-500">{address.country}</p>
                        <div className="mt-3 space-x-2">
                          <button onClick={() => handleEditAddress(address)} className="px-3 py-1 text-sm bg-accent text-surface rounded-lg hover:bg-opacity-90">Edit</button>
                          <button onClick={() => handleDeleteAddress(address.id)} className="px-3 py-1 text-sm text-danger border border-danger rounded-lg hover:bg-danger-soft">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleAddAddressClick} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Add New Address</button>
              </>
            )}
          </div>
        );
      case 'change_password':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-700 mb-4">Change Password</h3>
            {passwordMessage.text && (
              <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                {passwordMessage.text}
              </div>
            )}
            <form onSubmit={handleSubmitPasswordForm} className="bg-surface-100 p-6 rounded-xl border border-surface-200 shadow-sm space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-text-700">Current Password</label>
                <input type="password" id="current-password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-text-700">New Password</label>
                <input type="password" id="new-password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-text-700">Confirm New Password</label>
                <input type="password" id="confirm-password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Update Password</button>
            </form>
          </div>
        );
      default: return <div className="text-center py-16 text-muted/70">Coming soon...</div>;
    }
  };

  if (!user) return null;

  return (
    <div className="bg-surface min-h-screen">
      <OrderDetailsModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      <header className="bg-surface-100 border-b border-surface-200 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-accent text-surface rounded-full flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-text-700">{user.name}</h1>
            <p className="text-text-500">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="sm:ml-auto flex items-center gap-2 px-4 py-2 border border-surface-200 rounded-lg text-sm font-medium text-text-500 hover:border-text-700 hover:text-text-700 transition-colors">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </header>


      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <div className="space-y-2 sticky top-28">
              <TabButton id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon={User} label="Dashboard" />
              <TabButton id="orders" activeTab={activeTab} setActiveTab={setActiveTab} icon={Package} label="My Orders" />
              <TabButton id="addresses" activeTab={activeTab} setActiveTab={setActiveTab} icon={MapPin} label="Address Book" />
              <TabButton id="change_password" activeTab={activeTab} setActiveTab={setActiveTab} icon={KeyRound} label="Security" />
            </div>
          </aside>

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}