import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, X, CheckCircle } from 'lucide-react';
import authFetch from '../utils/authFetch';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await authFetch('/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset_password', token, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-surface p-10 rounded-3xl shadow-2xl border border-muted/20 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-text"></div>
          
          <div className="mb-10">
            <div className="w-16 h-16 bg-surface-100 text-accent flex items-center justify-center rounded-2xl mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-text mb-2 tracking-tight">New Password</h2>
            <p className="text-muted/70 text-sm font-bold uppercase tracking-widest">Update your secure access credentials</p>
          </div>
          
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl text-sm font-medium bg-success-soft text-success border border-success-light flex flex-col items-center gap-3">
              <CheckCircle size={24}/> {message}
              <p className="text-xs text-muted/70 mt-2">Redirecting to login portal...</p>
            </motion.div>
          )}
          
          {error && (
            <div className="p-4 rounded-xl text-sm font-medium bg-danger-soft text-danger border border-danger-light flex items-center justify-center gap-2 mb-6">
              <X size={16}/> {error}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted/70 uppercase tracking-widest ml-1">New Secure Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full p-4 bg-surface-100 border-0 rounded-2xl focus:ring-2 focus:ring-accent focus:bg-surface outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted/70 uppercase tracking-widest ml-1">Confirm Selection</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-4 bg-surface-100 border-0 rounded-2xl focus:ring-2 focus:ring-accent focus:bg-surface outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-accent text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent-dark transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-accent-light mt-4"
              >
                {loading ? 'Updating...' : 'Confirm New Password'} <ArrowRight size={16}/>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}