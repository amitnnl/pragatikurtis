import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authFetch from '../utils/authFetch';
import AuthLayout from '../components/AuthLayout';

export default function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await authFetch('/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action: 'login' })
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('jwt', data.jwt);
        setUser(data.user);
        navigate('/');
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue.">
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg text-sm text-center bg-danger-soft text-danger">
            {message}
          </motion.p>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted/70">Email Address</label>
          <input 
            type="email" 
            required 
            className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted/70">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            required 
            className="w-full p-3 bg-surface-100 border border-surface-200 rounded-lg focus:ring-1 focus:ring-accent text-text-700"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <button 
          disabled={loading}
          className="w-full py-3 bg-accent text-surface rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-surface-300"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-muted/70 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}