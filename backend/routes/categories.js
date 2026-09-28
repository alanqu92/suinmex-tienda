import express from 'express';
import { pool } from '../server.js';

const router = express.Router();

// Get all categories with visible subcategories
router.get('/', async (req, res) => {
  try {
    const categories = await pool.query(
      `SELECT * FROM categories WHERE is_visible = true ORDER BY order_index ASC`
    );

    const result = [];

    for (const cat of categories.rows) {
      const subcategories = await pool.query(
        `SELECT id, name, slug FROM subcategories
         WHERE category_id = $1 AND is_visible = true
         ORDER BY order_index ASC`,
        [cat.id]
      );

      result.push({
        ...cat,
        subcategories: subcategories.rows,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get category with subcategories
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const catResult = await pool.query(
      `SELECT * FROM categories WHERE slug = $1`,
      [slug]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = catResult.rows[0];

    const subcategories = await pool.query(
      `SELECT id, name, slug FROM subcategories
       WHERE category_id = $1 AND is_visible = true
       ORDER BY order_index ASC`,
      [category.id]
    );

    res.json({
      ...category,
      subcategories: subcategories.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by category
router.get('/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT p.* FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE c.slug = $1 AND p.is_active = true
       ORDER BY p.created_at DESC`,
      [slug]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
