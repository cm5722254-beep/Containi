import { Response } from 'express';
import { pool } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get or create user cart
    let cartRes = await pool.query('SELECT id FROM cart WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) {
      cartRes = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userId]);
    }
    const cartId = cartRes.rows[0].id;

    const itemsRes = await pool.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.created_at,
              p.name, p.price, p.stock, p.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const totalAmount = itemsRes.rows.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({
      success: true,
      data: {
        cartId,
        items: itemsRes.rows,
        itemCount: itemsRes.rows.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: Number(totalAmount.toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    // Verify product exists and has stock
    const productRes = await pool.query('SELECT id, stock FROM products WHERE id = $1', [product_id]);
    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure cart exists
    let cartRes = await pool.query('SELECT id FROM cart WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) {
      cartRes = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userId]);
    }
    const cartId = cartRes.rows[0].id;

    // Insert or update cart item
    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *
    `;
    const result = await pool.query(query, [cartId, product_id, parseInt(quantity, 10)]);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Cart updated', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cart_items WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Cart item removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
