'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, Order, getCurrentUser } from '../../lib/api';
import { Package, Calendar, MapPin, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/orders');
        if (res.ok && res.data.data) {
          setOrders(res.data.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> រួចរាល់ (Completed)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> កំពុងដំណើរការ (Processing)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5" /> បានបោះបង់ (Cancelled)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> រង់ចាំ (Pending)
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm text-slate-500 font-medium">កំពុងទាញប្រវត្តិកុម្ម៉ង់...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            ប្រវត្តិនៃការបញ្ជាទិញ (Order History)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ទិន្នន័យបញ្ជាទិញទាំងអស់ត្រូវបានរក្សាទុកក្នុង PostgreSQL Database Container
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> ត្រឡប់ទៅទិញទំនិញ
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">មិនទាន់មានការកុម្ម៉ង់នៅឡើយទេ</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            នៅពេលអ្នកធ្វើការ Checkout ទិន្នន័យនឹងបង្ហាញនៅទីនេះ។
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition"
          >
            ទៅជ្រើសរើសទំនិញ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400">លេខកូដកុម្ម៉ង់:</span>
                    <span className="font-mono font-bold text-slate-900 ml-1">#{order.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-extrabold text-sm text-blue-600">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Details & Shipping */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>អាសយដ្ឋានដឹកជញ្ជូន:</strong> {order.shipping_address}</span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80'}
                          alt={item.product_name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{item.product_name}</p>
                          <p className="text-slate-400">ចំនួន: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700">
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
