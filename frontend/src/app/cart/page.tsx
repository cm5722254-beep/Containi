'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, CartData, getCurrentUser } from '../../lib/api';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('Phnom Penh, Cambodia (University CTN Campus)');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/cart');
      if (res.ok && res.data.data) {
        setCart(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [router]);

  const updateQuantity = async (itemId: number, newQty: number) => {
    try {
      const res = await apiFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch {
      // ignore
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await apiFetch(`/cart/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch {
      // ignore
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorMsg('សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន!');
      return;
    }

    setCheckingOut(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ shipping_address: shippingAddress.trim() }),
      });

      if (res.ok) {
        setOrderSuccess(res.data.data);
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        setErrorMsg(res.data.message || 'ការកុម្ម៉ង់បានបរាជ័យ');
      }
    } catch {
      setErrorMsg('បញ្ហាបណ្តាញ៖ មិនអាចទាក់ទង Backend Container បានទេ');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm text-slate-500 font-medium">កំពុងទាញទិន្នន័យកន្ត្រកពី PostgreSQL Container...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">ការកុម្ម៉ង់ជោគជ័យ!</h2>
          <p className="text-sm text-slate-600">
            លេខសម្គាល់ការកុម្ម៉ង់ (Order ID):{' '}
            <span className="font-mono font-bold text-blue-600">#{orderSuccess.orderId}</span>
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-1 text-slate-600 font-mono">
            <p><strong>ស្ថានភាព:</strong> {orderSuccess.status.toUpperCase()}</p>
            <p><strong>ចំនួនសរុប:</strong> ${Number(orderSuccess.totalAmount).toFixed(2)}</p>
            <p><strong>ទីតាំងដឹកជញ្ជូន:</strong> {orderSuccess.shippingAddress}</p>
          </div>
          <p className="text-xs text-slate-500">
            💡 ទិន្នន័យការកុម្ម៉ង់ត្រូវបានរក្សាទុកជាអចិន្ត្រៃយ៍ក្នុង PostgreSQL Container Persistent Volume!
          </p>
          <div className="pt-4 flex gap-3 justify-center">
            <Link
              href="/orders"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition"
            >
              មើលប្រវត្តិកុម្ម៉ង់ (View Orders)
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              បន្តទិញទំនិញ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">កន្ត្រកទំនិញរបស់អ្នកនៅទទេ</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          សូមជ្រើសរើសផលិតផលដែលអ្នកពេញចិត្តពីកាតាឡុក ដើម្បីដាក់ចូលកន្ត្រក។
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition"
        >
          ទៅកាន់ទំព័រទំនិញ <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
        កន្ត្រកទំនិញ (Shopping Cart)
      </h1>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex items-center gap-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    ${Number(item.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    សរុប: ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="លុបចេញពីកន្ត្រក"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Summary Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">សង្ខេបការបញ្ជាទិញ</h3>

            <div className="space-y-2 text-sm text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>ចំនួនទំនិញសរុប:</span>
                <span className="font-semibold">{cart.itemCount} មុខ</span>
              </div>
              <div className="flex justify-between">
                <span>តម្លៃទំនិញសរុប:</span>
                <span className="font-semibold">${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>ថ្លៃដឹកជញ្ជូន:</span>
                <span className="text-emerald-600 font-semibold">ឥតគិតថ្លៃ (Free)</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
              <span>សរុបចុងក្រោយ:</span>
              <span className="text-blue-600">${cart.totalAmount.toFixed(2)}</span>
            </div>

            {/* Shipping address form */}
            <form onSubmit={handleCheckout} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  អាសយដ្ឋានដឹកជញ្ជូន (Shipping Address):
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="បញ្ចូលទីតាំងដឹកជញ្ជូនរបស់អ្នក..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={checkingOut}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    កំពុងដំណើរការ Transaction...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    បញ្ជាក់ការកុម្ម៉ង់ (Confirm Checkout)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
