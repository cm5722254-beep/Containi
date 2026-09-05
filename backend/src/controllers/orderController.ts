import { Response } from 'express';
import { pool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    const { shipping_address } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    await client.query('BEGIN');

    // Get cart
    const cartRes = await client.query('SELECT id FROM cart WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    const cartId = cartRes.rows[0].id;

    // Get cart items with current product price & stock
    const itemsRes = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       FOR UPDATE OF p`,
      [cartId]
    );

    if (itemsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cart is empty. Add products before checkout.' });
    }

    // Check stock for each item
    for (const item of itemsRes.rows) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${item.name}". Available: ${item.stock}, requested: ${item.quantity}`,
        });
      }
    }

    // Calculate total amount
    const totalAmount = itemsRes.rows.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // Create order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address)
       VALUES ($1, $2, 'processing', $3)
       RETURNING *`,
      [userId, totalAmount, shipping_address.trim()]
    );
    const order = orderRes.rows[0];

    // Create order items & deduct stock
    for (const item of itemsRes.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart items
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: {
        orderId: order.id,
        totalAmount: order.total_amount,
        status: order.status,
        shippingAddress: order.shipping_address,
        itemCount: itemsRes.rows.length,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT o.*,
              (SELECT json_agg(json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'product_name', p.name,
                 'image_url', p.image_url
              ))
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = o.id) AS items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let query = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
             (SELECT json_agg(json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'product_name', p.name,
                'image_url', p.image_url
             ))
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = o.id) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const params: any[] = [id];

    if (!isAdmin) {
      query += ' AND o.user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
