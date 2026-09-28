import express from 'express';
import { pool } from '../server.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== CATEGORIES ==========
router.get('/categories', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY order_index ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, is_visible } = req.body;
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, is_visible)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, description, is_visible !== false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_visible, order_index } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           is_visible = COALESCE($4, is_visible),
           order_index = COALESCE($5, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, slug, description, is_visible, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SUBCATEGORIES ==========
router.get('/subcategories', verifyAdmin, async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT * FROM subcategories';
    const params = [];

    if (category_id) {
      query += ' WHERE category_id = $1';
      params.push(category_id);
    }

    query += ' ORDER BY order_index ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subcategories', verifyAdmin, async (req, res) => {
  try {
    const { category_id, name, slug, description, is_visible } = req.body;
    const result = await pool.query(
      `INSERT INTO subcategories (category_id, name, slug, description, is_visible)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category_id, name, slug, description, is_visible !== false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/subcategories/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, is_visible, order_index } = req.body;

    const result = await pool.query(
      `UPDATE subcategories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           is_visible = COALESCE($4, is_visible),
           order_index = COALESCE($5, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, slug, description, is_visible, order_index, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subcategories/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subcategories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PRODUCTS (Admin) ==========
router.get('/products', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (title ILIKE $${params.length + 1} OR modelo ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) as counted`,
      params
    );

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      products: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, precio_venta, is_active, is_bestseller } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           precio_venta = COALESCE($3, precio_venta),
           is_active = COALESCE($4, is_active),
           is_bestseller = COALESCE($5, is_bestseller),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, precio_venta, is_active, is_bestseller, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ORDERS (Admin) ==========
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $1';
      params.push(status);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) as counted`,
      params
    );

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      orders: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
