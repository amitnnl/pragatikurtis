import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import authFetch from '../utils/authFetch';

export default function UserForm({ userToEdit, onSave, onCancel }) {
  const [user, setUser] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    is_approved: 1,
    company_name: '',
    gst_number: '',
    password: '',
  });

  useEffect(() => {
    if (userToEdit) {
      setUser({ ...userToEdit, password: '' });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({ ...user, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = user.id ? 'update_user' : 'add_user';
    
    try {
      const res = await authFetch(`/admin_users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, action }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSave();
      } else {
        alert(data.message || 'An error occurred.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected network error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-3xl w-full max-w-2xl relative shadow-2xl"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X />
        </button>
        <h3 className="text-xl font-bold text-black mb-6 border-b pb-4">
          {user.id ? 'Edit User' : 'Add New User'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input name="name" value={user.name} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" name="email" value={user.email} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input name="phone" value={user.phone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="text-sm font-medium">Password {user.id ? '(Leave blank to keep unchanged)' : ''}</label>
            <input type="password" name="password" value={user.password} onChange={handleChange} required={!user.id} className="w-full p-2 border rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <select name="role" value={user.role} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="customer">Customer</option>
                <option value="dealer">Dealer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="is_approved" checked={user.is_approved == 1} onChange={handleChange} className="h-5 w-5 rounded" />
                <span>Approved</span>
              </div>
            </div>
          </div>
          
          {user.role === 'dealer' && (
            <>
              <h4 className="text-md font-bold pt-4 border-t mt-4">Business Details</h4>
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <input name="company_name" value={user.company_name} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-sm font-medium">GST Number</label>
                <input name="gst_number" value={user.gst_number} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save User</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
