import { Request, Response } from 'express';
import os from 'os';
import { checkDatabaseHealth } from '../config/db';
import { checkRedisHealth } from '../config/redis';

export const getHealth = async (req: Request, res: Response) => {
  const startTime = Date.now();

  const [isDbHealthy, isRedisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const latency = Date.now() - startTime;
  const overallHealthy = isDbHealthy; // DB is critical, Redis is cache

  const statusResponse = {
    status: overallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'ctn-ecommerce-backend',
    container: {
      hostname: os.hostname(),
      platform: os.platform(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    },
    dependencies: {
      postgresql: {
        status: isDbHealthy ? 'connected' : 'disconnected',
        target: process.env.DATABASE_URL?.split('@')[1] || 'postgres:5432',
      },
      redis: {
        status: isRedisHealthy ? 'connected' : 'disconnected',
        target: process.env.REDIS_URL || 'redis:6379',
      },
    },
    latencyMs: latency,
  };

  if (!overallHealthy) {
    return res.status(503).json(statusResponse);
  }

  res.status(200).json(statusResponse);
};
