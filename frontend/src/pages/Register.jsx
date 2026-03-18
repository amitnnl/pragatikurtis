import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import AuthLayout from '../components/AuthLayout';

export default function Register({ setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await fetch(`${API_BASE_URL}/auth.php`, {
        method: 'POST',
        body: JSON.stringify({ ...payload, action: 'register' }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <AuthLayout title="Create an Account" subtitle="Join us for exclusive offers and faster checkout.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg text-sm text-center bg-danger-soft text-danger">
            {error}
          </motion.p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted/70">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted/70">Phone</label>
            <input type="tel" name="phone" onChange={handleChange} className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted/70">Email Address</label>
          <input type="email" name="email" required onChange={handleChange} className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted/70">Password</label>
            <input type="password" name="password" required minLength="6" onChange={handleChange} className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted/70">Confirm Password</label>
            <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700" />
          </div>
        </div>
        <button 
          disabled={loading}
          className="w-full mt-2 py-3 bg-accent text-surface rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-surface-300"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-muted/70 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
