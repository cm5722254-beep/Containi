// Client-side API caller communicating via Nginx Reverse Proxy (/api)
const API_BASE = typeof window !== 'undefined' ? '/api' : (process.env.INTERNAL_API_URL || 'http://backend:5000/api');

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image_url: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count?: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  name: string;
  price: string | number;
  stock: number;
  image_url: string;
  quantity: number;
}

export interface CartData {
  cartId: number;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  image_url: string;
}

export interface Order {
  id: number;
  user_id: number;
  customer_name?: string;
  customer_email?: string;
  total_amount: string | number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
}

export interface HealthData {
  status: string;
  timestamp: string;
  service: string;
  container: {
    hostname: string;
    platform: string;
    uptimeSeconds: number;
    memoryUsageMB: number;
  };
  dependencies: {
    postgresql: { status: string; target: string };
    redis: { status: string; target: string };
  };
  latencyMs: number;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string, user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, data, headers: response.headers };
};
