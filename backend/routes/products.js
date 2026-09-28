import express from 'express';
import { pool } from '../server.js';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*,
             c.name as category_name,
             s.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_active = true
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (subcategory) {
      query += ` AND s.id = $${paramCount}`;
      params.push(subcategory);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.modelo ILIKE $${paramCount} OR p.marca ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) as counted`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      products: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
              c.name as category_name,
              s.name as subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories s ON p.subcategory_id = s.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const result = await pool.query(
      `SELECT * FROM products
       WHERE is_active = true AND (
         title ILIKE $1 OR
         modelo ILIKE $1 OR
         marca ILIKE $1 OR
         description ILIKE $1
       )
       LIMIT 50`,
      [`%${query}%`]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products
       WHERE is_active = true AND is_bestseller = true
       LIMIT 12`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
