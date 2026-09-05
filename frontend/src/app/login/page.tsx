'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '../../lib/api';
import { Box, Lock, Mail, User as UserIcon, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data.data) {
        const { token, user } = res.data.data;
        setAuthToken(token, user);
        window.dispatchEvent(new Event('auth-changed'));

        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(res.data.message || 'ការផ្ទៀងផ្ទាត់មិនជោគជ័យ');
      }
    } catch {
      setError('មិនអាចភ្ជាប់ទៅកាន់ Backend API Container បានទេ');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill helpers for academic defense
  const autofillAdmin = () => {
    setIsLogin(true);
    setEmail('admin@ecommerce.ctn');
    setPassword('admin123');
  };

  const autofillCustomer = () => {
    setIsLogin(true);
    setEmail('customer@ecommerce.ctn');
    setPassword('customer123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
            <Box className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'ចូលប្រើប្រាស់ប្រព័ន្ធ' : 'បង្កើតគណនីថ្មី'}
          </h2>
          <p className="text-xs text-slate-500">
            CTN University Containers Project Authentication
          </p>
        </div>

        {/* Demo 1-Click Login Quick Helpers */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>គណនីសាកល្បងសម្រាប់បង្ហាញគ្រូ (Demo Credentials):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={autofillAdmin}
              className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-200 shadow-sm transition text-left"
            >
              👑 ចូលជា Admin
              <span className="block text-[10px] text-slate-400 font-normal">admin@ecommerce.ctn</span>
            </button>
            <button
              type="button"
              onClick={autofillCustomer}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 shadow-sm transition text-left"
            >
              🛍️ ចូលជា Customer
              <span className="block text-[10px] text-slate-400 font-normal">customer@ecommerce.ctn</span>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ចូលគណនី (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ចុះឈ្មោះ (Register)
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ឈ្មោះពេញ (Full Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sokha Meas"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                អ៊ីមែល (Email Address)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecommerce.ctn"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  តួនាទី (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="customer">អតិថិជន (Customer)</option>
                  <option value="admin">អ្នកគ្រប់គ្រង (Administrator)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading
                ? 'កំពុងដំណើរការ...'
                : isLogin
                ? 'ចូលប្រើប្រាស់ (Sign In)'
                : 'បង្កើតគណនី (Sign Up)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
