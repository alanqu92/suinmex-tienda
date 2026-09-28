import express from 'express';
import { pool } from '../server.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Create checkout preference
router.post('/create-preference', async (req, res) => {
  try {
    const { items, order_id, customer_email, customer_name } = req.body;

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'MercadoPago not configured' });
    }

    const mpItems = [];
    for (const item of items) {
      const productResult = await pool.query(
        'SELECT title, imagen_principal FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length > 0) {
        const product = productResult.rows[0];
        mpItems.push({
          id: item.product_id.toString(),
          title: product.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          picture_url: product.imagen_principal || undefined,
        });
      }
    }

    const preference = new Preference(client);

    const preferenceData = {
      items: mpItems,
      payer: {
        email: customer_email,
        name: customer_name,
      },
      back_urls: {
        success: `${process.env.VITE_API_URL}/checkout/success?order_id=${order_id}`,
        failure: `${process.env.VITE_API_URL}/checkout/failure?order_id=${order_id}`,
        pending: `${process.env.VITE_API_URL}/checkout/pending?order_id=${order_id}`,
      },
      auto_return: 'approved',
      external_reference: order_id.toString(),
      statement_descriptor: 'SUINMEX',
      expires: false,
    };

    const createdPreference = await preference.create({ body: preferenceData });

    res.json({
      preference_id: createdPreference.id,
      init_point: createdPreference.init_point,
    });
  } catch (err) {
    console.error('MercadoPago error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Payment success
router.post('/success', async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = 'paid',
           payment_method = 'mercadopago',
           mp_payment_id = $1,
           paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [payment_id, order_id]
    );

    if (result.rows.length > 0) {
      // Generate receipt
      const receipt_number = `REC-${order_id}-${Date.now()}`;
      await pool.query(
        `INSERT INTO receipts (order_id, receipt_number)
         VALUES ($1, $2)`,
        [order_id, receipt_number]
      );
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment failure
router.post('/failure', async (req, res) => {
  try {
    const { order_id } = req.body;

    await pool.query(
      `UPDATE orders
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [order_id]
    );

    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook para MercadoPago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      // Aquí iría la lógica para verificar el pago con MercadoPago API
      // Por ahora solo confirmamos recepción
      console.log('Payment webhook received:', paymentId);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
