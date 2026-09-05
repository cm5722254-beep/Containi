import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, pool } from './config/db';
import { connectRedis, redis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsers
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Health check routes
app.get('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Main REST API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

// Server startup
const startServer = async () => {
  console.log('==================================================');
  console.log('Starting CTN Containerized E-Commerce Backend...');
  console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('==================================================');

  // Attempt database and redis initial connections
  await initializeDatabase();
  await connectRedis();

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Backend Container] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[Health Endpoint] Ready at http://0.0.0.0:${PORT}/health`);
  });

  // Graceful shutdown handling for Docker stop/restart
  const handleShutdown = async (signal: string) => {
    console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping container services...`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('[PostgreSQL] Connection pool closed.');
        redis.disconnect();
        console.log('[Redis] Connection closed.');
        console.log('[Backend] Graceful shutdown complete. Exiting.');
        process.exit(0);
      } catch (err) {
        console.error('[Shutdown Error]:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[Fatal Startup Error]:', err);
  process.exit(1);
});
