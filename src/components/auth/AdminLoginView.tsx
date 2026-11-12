'use client';

import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { API_BASE } from '@/components/shared/ErpCrudView';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser, token: string) => void;
}

export default function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const [email, setEmail] = useState('admin@ginopas.edu.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }
      localStorage.setItem('ginopas_admin_token', data.token);
      localStorage.setItem('ginopas_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#80229a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200/40">
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-br from-[#80229a] to-[#5e1473] px-6 py-8 text-center text-white">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center p-2 shadow-lg mb-3">
            <svg viewBox="0 0 100 100" className="h-12 w-12">
              <circle cx="50" cy="50" r="45" fill="#facc15" opacity="0.2" />
              <path
                d="M50 15L53 25L50 22L47 25Z M30 22L38 29L35 27L33 30Z M70 22L67 30L65 27L62 29Z M20 37L29 41L27 39L26 43Z M80 37L74 43L73 39L71 41Z"
                fill="#facc15"
              />
              <circle cx="50" cy="52" r="18" fill="#f59e0b" />
              <path
                d="M32 60C38 52 46 56 50 62C54 56 62 52 68 60C62 66 54 66 50 64C46 66 38 66 32 60Z"
                fill="#38bdf8"
              />
              <path
                d="M40 64C45 58 50 60 50 64C50 60 55 58 60 64C55 68 50 68 50 66C50 68 45 68 40 64Z"
                fill="#0284c7"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-wide uppercase">
            GINOPAS ERP
          </h1>
          <p className="text-xs text-purple-100 mt-1">
            Gangapur Institute of Nursing and Paramedical Sciences
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-[#80229a] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admin Sign In</h2>
              <p className="text-xs text-slate-500">Enter your credentials to access the admin panel</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ginopas.edu.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#80229a]/30 focus:border-[#80229a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#80229a] hover:bg-[#6a1b82] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Default: <strong className="text-slate-700">admin@ginopas.edu.in</strong> / <strong className="text-slate-700">Admin@123</strong></span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@ginopas.edu.in');
                setPassword('Admin@123');
              }}
              className="text-[#80229a] font-semibold hover:underline"
            >
              Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

