import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

let isRedisConnected = false;

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 500, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully to Redis container at:', redisUrl);
});

redis.on('ready', () => {
  isRedisConnected = true;
});

redis.on('error', (err) => {
  isRedisConnected = false;
  console.warn('[Redis] Connection warning (non-fatal, continuing without cache):', err.message);
});

redis.on('close', () => {
  isRedisConnected = false;
});

export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (error: any) {
    console.warn('[Redis] Initial connect deferred or failed:', error.message);
  }
};

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    if (!isRedisConnected && redis.status !== 'ready') {
      return false;
    }
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    if (!isRedisConnected) return null;
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const setCache = async (key: string, value: string, ttlSeconds = 60): Promise<void> => {
  try {
    if (!isRedisConnected) return;
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    // Non-blocking cache failure
  }
};

export const invalidateCache = async (keyPattern: string): Promise<void> => {
  try {
    if (!isRedisConnected) return;
    const keys = await redis.keys(keyPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Non-blocking
  }
};
