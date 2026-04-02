import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = isLogin 
        ? await authService.login({ email: formData.email, password: formData.password })
        : await authService.register(formData);
      
      login(res.data.data, res.data.token);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach backend API. Check deployed API URL configuration.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 items-stretch">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden"
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(130deg, rgba(11,143,119,0.14), rgba(255,255,255,0.2) 44%, rgba(240,138,75,0.16))' }} />
        <motion.div variants={fadeUp} className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'var(--glass-soft)', border: '1px solid var(--line)' }}>
            <TrendingUp size={16} color="#0b8f77" />
            Fintrix Intelligence Suite
          </motion.div>
          <motion.h1 variants={fadeUp} className="mt-10 text-6xl max-w-lg leading-[0.98]">Finance clarity for fast decisions.</motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-muted leading-relaxed">
            Track every rupee, monitor spending behavior, and build confident forecasts with a dashboard that feels premium and precise.
          </motion.p>
        </motion.div>
        <motion.div variants={fadeUp} className="relative z-10 panel-strong max-w-lg p-7">
          <p className="text-sm font-semibold tracking-wide">Why teams pick Fintrix</p>
          <motion.ul variants={stagger} initial="hidden" animate="visible" className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
            {[
              'Instant role-based access for finance teams',
              'Readable analytics with AI-driven commentary',
              'Fast record management with audit-friendly flow',
            ].map((item) => (
              <motion.li key={item} variants={fadeUp}>{item}</motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.section>

      <section className="flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md panel-strong p-8 sm:p-10 space-y-6"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Secure Portal</p>
          <h2 className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-muted">
            {isLogin ? 'Sign in to access your finance workspace.' : 'Join Fintrix and start organizing your records.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Full Name</label>
              <input
                type="text" 
                required 
                className="field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Email Address</label>
            <input
              type="email" 
              required 
              className="field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Password</label>
            <input
              type="password" 
              required 
              className="field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Role</label>
              <select
                className="field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Viewer">Viewer (Read Only)</option>
                <option value="Analyst">Analyst (Read + Insights)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
          )}

          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

          <button
            type="submit" 
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--brand)' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
      </section>
    </div>
  );
};

export default Login;
