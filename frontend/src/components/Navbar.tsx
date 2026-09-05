'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Box, ShoppingCart, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { getCurrentUser, clearAuth, User, apiFetch } from '../lib/api';
import { ContainerStatusBadge } from './ContainerStatusBadge';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const updateUserState = () => {
    setUser(getCurrentUser());
  };

  const fetchCartCount = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setCartCount(0);
      return;
    }
    try {
      const res = await apiFetch('/cart');
      if (res.ok && res.data.data) {
        setCartCount(res.data.data.itemCount || 0);
      }
    } catch {
      // Cart fetch ignore
    }
  };

  useEffect(() => {
    updateUserState();
    fetchCartCount();

    // Listen to custom event for real-time cart update
    const handleCartUpdate = () => fetchCartCount();
    const handleAuthUpdate = () => {
      updateUserState();
      fetchCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('auth-changed', handleAuthUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('auth-changed', handleAuthUpdate);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCartCount(0);
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                DockerShop
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                CTN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 font-medium">Containerized E-Commerce</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition">
            ទំព័រដើម (Home)
          </Link>
          <Link href="/#products" className="hover:text-blue-600 transition">
            ផលិតផល (Products)
          </Link>
          {user && (
            <Link href="/orders" className="hover:text-blue-600 transition">
              ប្រវត្តិកុម្ម៉ង់ (Orders)
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-purple-600 font-semibold hover:text-purple-700 transition px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200"
            >
              <Shield className="w-3.5 h-3.5" />
              ផ្ទាំងគ្រប់គ្រង Admin
            </Link>
          )}
        </nav>

        {/* Right Section: Container Health Badge + Cart + User */}
        <div className="flex items-center gap-3">
          {/* Real-time Container Badge */}
          <div className="hidden sm:block">
            <ContainerStatusBadge />
          </div>

          {/* Shopping Cart Button */}
          <Link
            href="/cart"
            className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="ចាកចេញ (Logout)"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
            >
              <UserIcon className="w-4 h-4" />
              ចូលគណនី (Login)
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
