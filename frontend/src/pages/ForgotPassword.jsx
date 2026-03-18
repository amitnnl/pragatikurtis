import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, X, CheckCircle } from 'lucide-react';
import authFetch from '../utils/authFetch';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await authFetch('/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'forgot_password', email }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessage(data.message);
      } else {
        setError(data.message || 'Failed to start password reset. Please try again.');
      }
    } catch (err) {
      console.error("Forgot Password error:", err);
      setError('An unexpected error occurred. Please try again later.');
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
              <Mail size={32} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-text mb-2 tracking-tight">Recover Access</h2>
            <p className="text-muted/70 text-sm font-bold uppercase tracking-widest">Reset your membership credentials</p>
          </div>
          
          {message && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl text-sm font-medium bg-success-soft text-success border border-success-light flex flex-col items-center gap-3">
              <CheckCircle size={24}/> {message}
              <Link to="/login" className="text-accent font-bold underline mt-2">Back to Sign In</Link>
            </motion.div>
          )}
          
          {error && (
            <div className="p-4 rounded-xl text-sm font-medium bg-danger-soft text-danger border border-danger-light flex items-center justify-center gap-2 mb-6">
              <X size={16}/> {error}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-muted/70 uppercase tracking-widest ml-1">Account Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 bg-surface-100 border-0 rounded-2xl focus:ring-2 focus:ring-accent focus:bg-surface outline-none transition-all duration-300 placeholder:text-muted/30"
                  placeholder="name@company.com"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-accent text-surface rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent-dark transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-accent-light"
              >
                {loading ? 'Processing...' : 'Send Recovery Link'} <ArrowRight size={16}/>
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted/70 font-medium mt-8">
            Remembered your access?{' '}
            <Link to="/login" className="text-text font-bold border-b-2 border-text hover:text-accent hover:border-accent transition-all pb-0.5">
              Sign In Instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}