import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export default function AddressModal({ addressToEdit, onClose, onSave }) {
  const { showToast } = useToast();
  const [address, setAddress] = useState({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setAddress({
        phone: addressToEdit.phone || '',
        ...addressToEdit
      });
    }
  }, [addressToEdit]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setAddress(prev => ({
              ...prev,
              address_line1: data.address.road || data.address.suburb || data.display_name.split(',')[0],
              address_line2: data.address.neighbourhood || data.address.residential || '',
              city: data.address.city || data.address.town || data.address.village || data.address.county || prev.city,
              state: data.address.state || prev.state,
              postal_code: data.address.postcode || prev.postal_code,
              country: data.address.country || prev.country
            }));
            showToast('Location detected successfully', 'success');
          } else {
            showToast('Could not convert location to address', 'error');
          }
        } catch (error) {
          showToast('Failed to get address. Please enter manually.', 'error');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        showToast('Location access denied or failed.', 'error');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
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
        className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
          <X size={20} />
        </button>
        <div className="flex justify-between items-center mb-6 pr-6">
          <h3 className="text-xl font-bold text-gray-800">{addressToEdit ? 'Edit Address' : 'Add New Address'}</h3>
          <button 
             type="button" 
             onClick={handleUseLocation}
             disabled={locating}
             className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1.5 rounded-full disabled:opacity-50"
          >
             {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />} 
             {locating ? 'Locating...' : 'Use My Location'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            name="phone"
            placeholder="Contact Number"
            value={address.phone || ''}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
            required
            pattern="[0-9]{10,15}"
            title="Please enter a valid phone number"
          />
          <input
            type="text"
            name="address_line1"
            placeholder="Address Line 1"
            value={address.address_line1}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
            required
          />
          <input
            type="text"
            name="address_line2"
            placeholder="Address Line 2 (Optional)"
            value={address.address_line2}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
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
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={address.country}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="py-2.5 px-6 border-none rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2.5 px-8 rounded-xl shadow-md text-sm font-semibold text-white bg-accent hover:bg-accent/90 disabled:opacity-50 transition-all">
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
