import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import authFetch from '../utils/authFetch';
import AuthLayout from '../components/AuthLayout';

export default function Login({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
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
        
        // Handle redirect if found in URL params
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/';
        navigate(redirectTo);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue shopping.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl text-sm text-center bg-red-50 text-red-600 border border-red-100">
            {message}
          </motion.p>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-700">Email Address</label>
          <input
            type="email" name="email" required
            placeholder="you@example.com"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-text-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-dark transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} name="password" required
              placeholder="••••••••"
              className="input-field pr-12"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text-700 transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full btn-primary justify-center disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none mt-2">
          {loading ? 'Signing In…' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-muted/60 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-accent hover:text-accent-dark transition-colors">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}