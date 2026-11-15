import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, register, clearError } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const ok = await login(email, password);
        if (ok) {
          onClose();
          onSuccess?.();
        } else {
          setFormError('Invalid email or password.');
        }
      } else {
        if (!name.trim()) {
          setFormError('Please enter your full name');
          setLoading(false);
          return;
        }
        const ok = await register(name, email, password, phone, role);
        if (ok) {
          onClose();
          onSuccess?.();
        } else {
          setFormError('Registration failed. Please check your information.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoType: 'admin' | 'traveler') => {
    setTab('login');
    setFormError(null);
    clearError();
    if (demoType === 'admin') {
      setEmail('admin@wanderlust.com');
      setPassword('admin123');
    } else {
      setEmail('traveler@wanderlust.com');
      setPassword('traveler123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-7 h-7 text-sky-200" />
            <span className="font-extrabold text-xl tracking-tight">WanderLust</span>
          </div>
          <h2 className="text-2xl font-bold">
            {tab === 'login' ? 'Welcome Back!' : 'Start Your Journey'}
          </h2>
          <p className="text-sky-100 text-sm mt-1">
            {tab === 'login'
              ? 'Sign in to access your bookings, trips, and saved itineraries.'
              : 'Create your account to unlock personalized travel & hotel bookings.'}
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-2.5 flex items-center justify-between text-xs text-sky-900">
          <span className="font-semibold text-slate-600">Quick Test Credentials:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('traveler')}
              className="px-2.5 py-1 rounded-md bg-white border border-sky-200 text-sky-700 font-medium hover:bg-sky-100 transition shadow-xs"
            >
              Traveler Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="px-2.5 py-1 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700 transition shadow-xs flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin Demo
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => {
              setTab('login');
              setFormError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              tab === 'login'
                ? 'text-sky-700 border-b-2 border-sky-600 bg-sky-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setFormError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition ${
              tab === 'register'
                ? 'text-sky-700 border-b-2 border-sky-600 bg-sky-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              {formError}
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                      role === 'customer'
                        ? 'border-sky-600 bg-sky-50 text-sky-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tourist / Traveler
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition flex items-center justify-center gap-1 ${
                      role === 'admin'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Administrator
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@wanderlust.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In to WanderLust' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
