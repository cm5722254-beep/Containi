import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://admin:secure_university_password_2026@postgres:5432/ecommerce';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err);
});

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT 1 AS healthy');
    return res.rows[0]?.healthy === 1;
  } catch (error) {
    console.error('[PostgreSQL Health Check Failed]:', error);
    return false;
  }
};

// Auto-seed/verify default schema if needed (ensures resilience even if mounted empty volume)
export const initializeDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log(`[PostgreSQL] Attempting connection to ${connectionString}...`);
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        console.log('[PostgreSQL] Connected successfully to container database!');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      retries -= 1;
      console.warn(`[PostgreSQL] Database not ready yet. Retries left: ${retries}. Waiting 3s...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  console.error('[PostgreSQL] Could not establish initial connection to database container.');
};
