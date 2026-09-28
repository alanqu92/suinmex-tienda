import express from 'express';
import { pool } from '../server.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create order
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      items,
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const productResult = await pool.query(
        'SELECT precio_venta FROM products WHERE id = $1',
        [item.product_id]
      );
      if (productResult.rows.length > 0) {
        subtotal += productResult.rows[0].precio_venta * item.quantity;
      }
    }

    const tax = Math.round(subtotal * 0.16 * 100) / 100; // 16% IVA
    const total = subtotal + tax;
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const orderResult = await pool.query(
      `INSERT INTO orders (
        order_number, user_id, customer_email, customer_name, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_postal_code,
        subtotal, tax, total, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
      [
        orderNumber, user_id, customer_email, customer_name, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_postal_code,
        subtotal, tax, total,
      ]
    );

    const order = orderResult.rows[0];

    // Add order items
    for (const item of items) {
      const productResult = await pool.query(
        'SELECT precio_venta FROM products WHERE id = $1',
        [item.product_id]
      );
      const unitPrice = productResult.rows[0].precio_venta;
      const itemSubtotal = unitPrice * item.quantity;

      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.quantity, unitPrice, itemSubtotal]
      );
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT o.*,
              json_agg(json_build_object(
                'id', oi.id, 'product_id', oi.product_id,
                'quantity', oi.quantity, 'unit_price', oi.unit_price,
                'subtotal', oi.subtotal
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.title, p.modelo, p.imagen_principal
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      ...order,
      items: itemsResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
