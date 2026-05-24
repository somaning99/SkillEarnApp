import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { User as UserType } from '../types';
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const navigate = useNavigate();
  const { login, signup, user, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'client') {
        navigate('/client-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'client'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData);
      }
      // Redirection will be handled by the useEffect above or by checking the role
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'An error occurred. Please try again.';
      if (err.message?.includes('503') || err.message?.includes('Failed to fetch') || err.message?.includes('buffering timed out')) {
        message = 'Database Error: Could not connect to MongoDB. Please ensure your MongoDB cluster is active and accessible.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <button onClick={() => navigate('/')} className="mb-8 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white">S</div>
            <span className="text-2xl font-black tracking-tight uppercase">SkillEarn</span>
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 font-medium">
            {isLogin ? "Continue your journey with us" : "Join the student freelance revolution"}
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-soft space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`py-3 rounded-2xl text-sm font-bold border transition-all ${formData.role === 'student' ? 'bg-slate-900 border-slate-900 text-white shadow-soft' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'client' })}
                    className={`py-3 rounded-2xl text-sm font-bold border transition-all ${formData.role === 'client' ? 'bg-slate-900 border-slate-900 text-white shadow-soft' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    Client
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl text-lg font-bold text-white transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
              {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-500 font-medium text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => isLogin ? navigate('/register') : navigate('/login')}
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
