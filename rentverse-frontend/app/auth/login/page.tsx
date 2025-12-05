'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
// Import the store directly
import useAuthStore from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });

  // Use environment variable or default to 5000
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.requireOTP) {
        setStep('otp');
      } else {
        // Direct login logic (if MFA disabled)
        console.log("Direct Login Success:", data.data.user);
        useAuthStore.getState().login(data.data.user, data.data.token);
        router.push('/'); 
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Verification failed');

      // --- CRITICAL FIX: FORCE STORE UPDATE ---
      console.log("✅ OTP Verified! Updating Store with:", data.data.user);
      
      // 1. Update Zustand Store
      useAuthStore.getState().login(data.data.user, data.data.token);
      
      // 2. Force LocalStorage update manually (Double safety)
      localStorage.setItem('rentverse-auth-store', JSON.stringify({
        state: {
          user: data.data.user,
          isLoggedIn: true,
          token: data.data.token
        },
        version: 0
      }));

      // 3. Redirect
      router.push('/');
      // Force a hard refresh to ensure navbar picks up the change
      setTimeout(() => {
          window.location.href = '/';
      }, 100);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'credentials' ? 'Welcome Back' : 'Security Verification'}
          </h1>
          <p className="text-gray-500">
            {step === 'credentials' 
              ? 'Sign in to access your Rentverse account' 
              : `We sent a 6-digit code to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {step === 'credentials' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password (OTP)</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="otp"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition tracking-widest text-lg font-mono"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-gray-500 text-sm hover:text-gray-700 mt-4"
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 'credentials' && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}