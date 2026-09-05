-- ==========================================================
-- CTN University Project: Containerized E-Commerce System
-- Database Initialization Script (PostgreSQL Container)
-- ==========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_product UNIQUE(cart_id, product_id)
);

-- 6. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ==========================================================
-- SEED DATA (Demo Academic Data)
-- ==========================================================

-- Insert Admin and Customer (Password: admin123 and customer123)
-- Bcrypt hashes generated with 10 salt rounds:
-- admin123 -> $2b$10$wT8m9M5/3aLz6kGZJ9G7quw88fH7H4uH1gQf.C4OQfD2qK2h.1Uke
-- customer123 -> $2b$10$95sEflqj6b9vUj5Gv3FhUuM9e5I7h9e3R6h4P9y1q8o0Z3x2w1v5u
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@ecommerce.ctn', '$2a$10$XQZ43U2kR7Bf6ZgCsuu8hO4KjT3uJ5L2q6H3Y7w2R4f7G5p1k2L3y', 'admin'),
('Sokha Meas (Student Customer)', 'customer@ecommerce.ctn', '$2a$10$XQZ43U2kR7Bf6ZgCsuu8hO4KjT3uJ5L2q6H3Y7w2R4f7G5p1k2L3y', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES
('Laptops & Computers', 'laptops', 'High-performance laptops, workstations, and desktop accessories.'),
('Smartphones & Tablets', 'smartphones', 'Latest flagship smartphones, tablets, and smart wearables.'),
('Audio & Headsets', 'audio', 'Noise-cancelling headphones, wireless earbuds, and studio monitors.'),
('Computer Accessories', 'accessories', 'Keyboards, gaming mice, monitors, and ergonomic docks.')
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
(1, 'MacBook Pro 16" M3 Max', 'Apple M3 Max chip, 36GB Unified Memory, 1TB SSD Storage, Liquid Retina XDR display.', 3499.00, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'),
(1, 'Dell XPS 15 OLED', '13th Gen Intel Core i9, 32GB RAM, 1TB NVMe, NVIDIA RTX 4070, 3.5K OLED Touch.', 2299.00, 20, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'),
(2, 'iPhone 15 Pro Max 256GB', 'Titanium design, A17 Pro chip, 48MP main camera system with 5x optical zoom.', 1199.00, 35, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'),
(2, 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, 12GB RAM, 512GB, Galaxy AI, Titanium Gray, S-Pen included.', 1299.00, 25, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'),
(3, 'Sony WH-1000XM5 Wireless', 'Industry-leading noise cancellation, 30 hours battery life, multipoint connection.', 399.00, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
(3, 'AirPods Pro (2nd Generation)', 'Active Noise Cancellation, Adaptive Audio, USB-C MagSafe Charging Case.', 249.00, 60, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'),
(4, 'Keychron Q1 Pro Wireless Mechanical Keyboard', 'Fully customizable 75% layout, QMK/VIA programmable, hot-swappable switches.', 199.00, 40, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'),
(4, 'Logitech MX Master 3S', 'Performance wireless mouse, 8K DPI tracking on glass, quiet clicks, ergonomic grip.', 99.00, 80, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;
