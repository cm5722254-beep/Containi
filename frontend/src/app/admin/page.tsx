'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiFetch,
  getCurrentUser,
  Product,
  Category,
  Order,
  User,
  HealthData,
} from '../../lib/api';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Server,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'stats' | 'products' | 'categories' | 'orders' | 'users' | 'docker'
  >('stats');
  const [loading, setLoading] = useState(true);

  // Admin Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);

  // Forms & Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    image_url: '',
  });

  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const checkAdminAndLoad = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    await loadAllData();
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, ordersRes, usersRes, healthRes] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/products?limit=100'),
        apiFetch('/categories'),
        apiFetch('/admin/orders'),
        apiFetch('/admin/users'),
        apiFetch('/health'),
      ]);

      if (statsRes.ok) setStats(statsRes.data.data);
      if (prodRes.ok) setProducts(prodRes.data.data);
      if (catRes.ok) setCategories(catRes.data.data);
      if (ordersRes.ok) setOrders(ordersRes.data.data);
      if (usersRes.ok) setUsers(usersRes.data.data);
      if (healthRes.ok) setHealth(healthRes.data);
    } catch {
      showToast('បរាជ័យក្នុងការទាញទិន្នន័យពី Backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAndLoad();
  }, [router]);

  // Product CRUD Handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: categories[0]?.id?.toString() || '',
      price: '',
      stock: '',
      description: '',
      image_url: '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category_id: p.category_id?.toString() || '',
      price: p.price.toString(),
      stock: p.stock.toString(),
      description: p.description || '',
      image_url: p.image_url || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingProduct ? `/products/${editingProduct.id}` : '/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          name: productForm.name,
          category_id: parseInt(productForm.category_id, 10) || null,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10) || 0,
          description: productForm.description,
          image_url: productForm.image_url,
        }),
      });

      if (res.ok) {
        showToast(editingProduct ? 'បានកែប្រែផលិតផលជោគជ័យ!' : 'បានបង្កើតផលិតផលថ្មីជោគជ័យ!');
        setIsProductModalOpen(false);
        loadAllData();
      } else {
        showToast(res.data.message || 'មិនអាចរក្សាទុកបានទេ', 'error');
      }
    } catch {
      showToast('កំហុសប្រព័ន្ធបណ្តាញ', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?')) return;
    try {
      const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('បានលុបផលិតផលជោគជ័យ (Redis Cache invalidated)!');
        loadAllData();
      } else {
        showToast(res.data.message || 'មិនអាចលុបបានទេ', 'error');
      }
    } catch {
      showToast('កំហុសប្រព័ន្ធបណ្តាញ', 'error');
    }
  };

  // Category Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const res = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryName, description: categoryDesc }),
      });

      if (res.ok) {
        showToast('បានបង្កើតប្រភេទផលិតផលជោគជ័យ!');
        setCategoryName('');
        setCategoryDesc('');
        loadAllData();
      } else {
        showToast(res.data.message || 'មិនអាចបង្កើតបានទេ', 'error');
      }
    } catch {
      showToast('កំហុសប្រព័ន្ធបណ្តាញ', 'error');
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast(`បានកែប្រែស្ថានភាព Order #${orderId} ទៅជា ${status}!`);
        loadAllData();
      } else {
        showToast(res.data.message || 'បរាជ័យក្នុងការកែប្រែស្ថានភាព', 'error');
      }
    } catch {
      showToast('កំហុសប្រព័ន្ធបណ្តាញ', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {msg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold text-white border ${
            msg.type === 'success'
              ? 'bg-emerald-600 border-emerald-500'
              : 'bg-rose-600 border-rose-500'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ (Admin Dashboard)</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
              CTN Admin
            </span>
          </div>
          <p className="text-xs text-purple-200 mt-1">
            គ្រប់គ្រងផលិតផល ប្រភេទ ការបញ្ជាទិញ និងពិនិត្យមើលស្ថានភាព Container Architecture ផ្ទាល់
          </p>
        </div>

        <button
          onClick={loadAllData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/20 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          ទាញទិន្នន័យឡើងវិញ (Refresh)
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> ស្ថិតិទូទៅ (Overview)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" /> គ្រប់គ្រងផលិតផល ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" /> ប្រភេទ ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> ការកុម្ម៉ង់ ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> អ្នកប្រើប្រាស់ ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'docker'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-200'
          }`}
        >
          <Server className="w-4 h-4" /> 🐳 ស្ថានភាព Docker CTN
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">ចំណូលសរុប (Revenue)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  ${Number(stats.totalRevenue).toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">ការកុម្ម៉ង់សរុប (Orders)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">ផលិតផលក្នុងស្តុក</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">អ្នកប្រើប្រាស់ (Users)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              ផលិតផលជិតអស់ពីស្តុក (Stock &lt; 10 គ្រឿង)
            </h3>
            <div className="mt-4 divide-y divide-slate-100">
              {stats.lowStockItems?.length === 0 ? (
                <p className="text-xs text-slate-400">គ្រប់ផលិតផលទាំងអស់មានស្តុកគ្រប់គ្រាន់។</p>
              ) : (
                stats.lowStockItems?.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-mono font-bold text-rose-600">{item.stock} គ្រឿង</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              ការបន្ថែម/កែប្រែ/លុប ផលិតផល នឹងលុប Cache ចេញពី Redis Container ដោយស្វ័យប្រវត្តិ
            </p>
            <button
              onClick={handleOpenCreateProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" /> បន្ថែមផលិតផលថ្មី
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">ផលិតផល</th>
                    <th className="p-3.5">ប្រភេទ</th>
                    <th className="p-3.5">តម្លៃ</th>
                    <th className="p-3.5">ស្តុក</th>
                    <th className="p-3.5 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{p.category_name || '-'}</td>
                      <td className="p-3.5 font-bold text-blue-600">${Number(p.price).toFixed(2)}</td>
                      <td className="p-3.5">
                        <span
                          className={`font-semibold ${
                            p.stock > 10 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="កែប្រែ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="លុប"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">បង្កើតប្រភេទថ្មី</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះប្រភេទ</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Smart Home Devices"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ការពិពណ៌នា</label>
                <textarea
                  rows={3}
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="ឧបករណ៍ឆ្លាតវៃសម្រាប់គេហដ្ឋាន..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow transition"
              >
                បង្កើតប្រភេទ
              </button>
            </form>
          </div>

          {/* Category List */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              បញ្ជីប្រភេទផលិតផលដែលមានស្រាប់
            </div>
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                    <p className="text-slate-400 font-mono text-[11px]">slug: {c.slug}</p>
                    <p className="text-slate-500 mt-1">{c.description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold">
                    {c.product_count || 0} ផលិតផល
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">អតិថិជន</th>
                  <th className="p-3.5">កាលបរិច្ឆេទ</th>
                  <th className="p-3.5">តម្លៃសរុប</th>
                  <th className="p-3.5">ទីតាំងដឹកជញ្ជូន</th>
                  <th className="p-3.5">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-600">#{o.id}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900">{o.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{o.customer_email}</p>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{o.shipping_address}</td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none ${
                          o.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : o.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : o.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">User ID</th>
                  <th className="p-3.5">ឈ្មោះពេញ</th>
                  <th className="p-3.5">អ៊ីមែល</th>
                  <th className="p-3.5">តួនាទី (Role)</th>
                  <th className="p-3.5">កាលបរិច្ឆេទចុះឈ្មោះ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-slate-400">#{u.id}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DOCKER CTN TOPOLOGY LIVE MONITOR */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">ស្ថាបត្យកម្ម Docker Container Topology (CTN)</h3>
                  <p className="text-xs text-slate-400">
                    ព័ត៌មានជាក់ស្តែងអំពីការប្រាស្រ័យទាក់ទងរវាង Container តាមរយៈ Docker Custom Network
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                ● SYSTEM HEALTHY
              </span>
            </div>

            {/* Container grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* NGINX */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    1. nginx
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Port 80:80
                  </span>
                </div>
                <h4 className="font-bold text-sm">Reverse Proxy & Gateway</h4>
                <p className="text-xs text-slate-400">
                  ច្រកទ្វារចូលតែមួយសម្រាប់ Client ។ បញ្ជូន <code className="text-cyan-300">/</code> ទៅ Frontend និង <code className="text-cyan-300">/api/</code> ទៅ Backend។
                </p>
              </div>

              {/* FRONTEND */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                    2. frontend
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                    frontend:3000
                  </span>
                </div>
                <h4 className="font-bold text-sm">Next.js 14 App Router</h4>
                <p className="text-xs text-slate-400">
                  UI សម្រាប់ Customer & Admin ។ ដំណើរការដោយ Multi-stage build និង Non-root user <code className="text-blue-300">nextjs</code>។
                </p>
              </div>

              {/* BACKEND */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    3. backend
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    backend:5000
                  </span>
                </div>
                <h4 className="font-bold text-sm">Express.js + TypeScript</h4>
                <p className="text-xs text-slate-400">
                  REST API Engine ជាមួយ Hostname: <code className="text-indigo-300">{health?.container.hostname}</code>, RAM: <code className="text-indigo-300">{health?.container.memoryUsageMB}MB</code>
                </p>
              </div>

              {/* POSTGRES */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    4. postgres
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    postgres:5432
                  </span>
                </div>
                <h4 className="font-bold text-sm">PostgreSQL 16 Relational DB</h4>
                <p className="text-xs text-slate-400">
                  ភ្ជាប់ជាមួយ Persistent Named Volume <code className="text-cyan-300">postgres_data</code>។ ទិន្នន័យមិនបាត់ពេល <code className="text-cyan-300">docker compose down</code> ឡើយ!
                </p>
              </div>

              {/* REDIS */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                    5. redis
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    redis:6379
                  </span>
                </div>
                <h4 className="font-bold text-sm">Redis In-Memory Cache</h4>
                <p className="text-xs text-slate-400">
                  Cache ផលិតផល និង Query ល្បឿនលឿន។ បញ្ជាក់ <code className="text-rose-300">X-Cache: HIT-REDIS</code>។
                </p>
              </div>

              {/* DOCKER NETWORK */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Docker Network
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Bridge Driver
                  </span>
                </div>
                <h4 className="font-bold text-sm">app-network</h4>
                <p className="text-xs text-slate-400">
                  DNS Service Discovery ដោយស្វ័យប្រវត្តិក្នងបណ្តាញ។ គ្រប់ Container ហៅគ្នាទៅវិញទៅមកដោយផ្ទាល់។
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProduct ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះផលិតផល</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="ឧទាហរណ៍៖ MacBook Pro 16"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ប្រភេទ (Category)</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">តម្លៃ ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="999.00"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ចំនួនក្នុងស្តុក</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  placeholder="25"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">រូបភាពទំនិញ (Image URL)</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ការពិពណ៌នា (Description)</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="លក្ខណៈបច្ចេកទេស..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow"
                >
                  រក្សាទុកផលិតផល
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
