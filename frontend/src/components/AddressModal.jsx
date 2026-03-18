import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddressModal({ addressToEdit, onClose, onSave }) {
  const [address, setAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setAddress(addressToEdit);
    }
  }, [addressToEdit]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(address);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-6">{addressToEdit ? 'Edit Address' : 'Add New Address'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="address_line1"
            placeholder="Address Line 1"
            value={address.address_line1}
            onChange={handleChange}
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="text"
            name="address_line2"
            placeholder="Address Line 2 (Optional)"
            value={address.address_line2}
            onChange={handleChange}
            className="w-full p-3 border rounded-md"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="postal_code"
              placeholder="Postal Code"
              value={address.postal_code}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={address.country}
              onChange={handleChange}
              className="w-full p-3 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-6 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
