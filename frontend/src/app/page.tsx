'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, Product, Category, getCurrentUser } from '../lib/api';
import {
  Search,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [cacheSource, setCacheSource] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/categories');
      if (res.ok && res.data.data) {
        setCategories(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  const fetchProducts = async (category = selectedCategory, search = searchQuery) => {
    setLoading(true);
    try {
      let endpoint = '/products?limit=50';
      if (category !== 'all') {
        endpoint += `&category=${encodeURIComponent(category)}`;
      }
      if (search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await apiFetch(endpoint);
      if (res.ok && res.data.data) {
        setProducts(res.data.data);
        setCacheSource(res.data.source || 'db');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    fetchProducts(slug, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(selectedCategory, searchQuery);
  };

  const handleAddToCart = async (product: Product) => {
    const user = getCurrentUser();
    if (!user) {
      setMessage('សូមចូលគណនី (Login) ជាមុនសិន ដើម្បីបន្ថែមទំនិញទៅក្នុងកន្ត្រក!');
      setTimeout(() => setMessage(null), 3500);
      return;
    }

    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });

      if (res.ok) {
        setMessage(`បានបន្ថែម "${product.name}" ទៅក្នុងកន្ត្រកជោគជ័យ!`);
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        setMessage(res.data.message || 'មិនអាចបន្ថែមទំនិញបានទេ');
      }
    } catch {
      setMessage('បញ្ហាបណ្តាញ៖ មិនអាចទាក់ទង Backend Container បានទេ');
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast Message Notification */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Hero Banner with Docker University Theme */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-blue-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            មុខវិជ្ជាសាកលវិទ្យាល័យ [CTN] Containers
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Containerized E-Commerce <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            ប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិកទំនើប ដែលដំណើរការដោយស្ថាបត្យកម្ម <strong>Multi-Container (Docker Compose)</strong>។
            រាល់សេវាកម្មទាំងអស់ (Nginx, Next.js, Express API, PostgreSQL, Redis) ត្រូវបានញែកដាច់ពីគ្នា និងប្រាស្រ័យទាក់ទងគ្នាតាម <strong>Docker Network</strong>។
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-400">
              🐳 5 Containers Active
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-400">
              🌐 Docker Network: app-network
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-purple-400">
              💾 Volume: postgres_data
            </span>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              ទិញទំនិញឥឡូវនេះ <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              <Server className="w-4 h-4 text-cyan-400" /> ផ្ទាំង Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section id="products" className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">កាតាឡុកទំនិញ (Product Catalog)</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">
                បង្ហាញទំនិញដែលទាញចេញពី PostgreSQL Relational Database
              </p>
              {cacheSource && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    cacheSource === 'redis_cache'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                  title="Source of the data"
                >
                  {cacheSource === 'redis_cache' ? '⚡ CACHED IN REDIS' : '🐘 DIRECT POSTGRESQL'}
                </span>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="ស្វែងរកផលិតផល..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </form>
        </div>

        {/* Categories Tab Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ (All Categories)
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-2xl p-4 border border-slate-200 animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">មិនមានផលិតផលត្រូវនឹងការស្វែងរកនេះទេ</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                fetchProducts('all', '');
              }}
              className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
            >
              សម្អាតការស្វែងរក (Clear Filters)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">
                      {product.category_name || 'Electronics'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">តម្លៃ</span>
                      <p className="text-base font-extrabold text-blue-600">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">ស្តុក</span>
                      <p className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {product.stock > 0 ? `${product.stock} គ្រឿង` : 'អស់ស្តុក'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition ${
                      product.stock > 0
                        ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-md shadow-slate-900/10'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {product.stock > 0 ? 'ដាក់ចូលកន្ត្រក' : 'អស់ពីស្តុក'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
