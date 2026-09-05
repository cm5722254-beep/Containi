import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int AS total FROM users');
    const productsCount = await pool.query('SELECT COUNT(*)::int AS total FROM products');
    const ordersCount = await pool.query('SELECT COUNT(*)::int AS total FROM orders');
    const revenueRes = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0)::numeric AS total FROM orders WHERE status != 'cancelled'"
    );
    const lowStockRes = await pool.query(
      'SELECT id, name, stock FROM products WHERE stock < 10 ORDER BY stock ASC'
    );

    res.json({
      success: true,
      data: {
        totalUsers: usersCount.rows[0].total,
        totalProducts: productsCount.rows[0].total,
        totalOrders: ordersCount.rows[0].total,
        totalRevenue: parseFloat(revenueRes.rows[0].total),
        lowStockItems: lowStockRes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
              (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id) AS item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
