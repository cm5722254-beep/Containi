import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getCache, setCache, invalidateCache } from '../config/redis';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, limit = '50', offset = '0' } = req.query;
    const cacheKey = `products:${category || 'all'}:${search || 'none'}:${limit}:${offset}`;

    // 1. Try Redis Cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT-REDIS');
      return res.json({
        success: true,
        source: 'redis_cache',
        count: JSON.parse(cachedData).length,
        data: JSON.parse(cachedData),
      });
    }

    // 2. Query PostgreSQL
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND (c.slug = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, params);

    // 3. Store in Redis cache for 60 seconds
    await setCache(cacheKey, JSON.stringify(result.rows), 60);

    res.setHeader('X-Cache', 'MISS-POSTGRES');
    res.json({
      success: true,
      source: 'postgresql_db',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT-REDIS');
      return res.json({
        success: true,
        source: 'redis_cache',
        data: JSON.parse(cachedData),
      });
    }

    const query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = result.rows[0];
    await setCache(cacheKey, JSON.stringify(product), 120);

    res.setHeader('X-Cache', 'MISS-POSTGRES');
    res.json({ success: true, source: 'postgresql_db', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { category_id, name, description, price, stock, image_url } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const result = await pool.query(
      `INSERT INTO products (category_id, name, description, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category_id || null, name.trim(), description || '', price, stock || 0, image_url || '']
    );

    // Invalidate product caches
    await invalidateCache('products:*');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock, image_url } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           image_url = COALESCE($6, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [category_id, name, description, price, stock, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate Redis caches
    await invalidateCache('products:*');
    await invalidateCache(`product:${id}`);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Invalidate Redis caches
    await invalidateCache('products:*');
    await invalidateCache(`product:${id}`);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
