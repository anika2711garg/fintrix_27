import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass rounded-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/60">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Join us to start managing your finances'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/70">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/70">Password</label>
            <input 
              type="password" 
              required 
              className="w-full"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Role</label>
              <select 
                className="w-full"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Viewer">Viewer (Read Only)</option>
                <option value="Analyst">Analyst (Read + Insights)</option>
                <option value="Admin">Admin (Full Access)</option>
              </select>
            </div>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
