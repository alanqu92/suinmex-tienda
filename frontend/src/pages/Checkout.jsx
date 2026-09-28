import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import '../styles/checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_postal_code: user?.postal_code || '',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Tu carrito está vacío</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Crear orden
      const orderRes = await axios.post('/api/orders', {
        user_id: user?.id || null,
        ...formData,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      const orderId = orderRes.data.id;

      // Crear preference MercadoPago
      const mpRes = await axios.post('/api/checkout/create-preference', {
        order_id: orderId,
        customer_email: formData.customer_email,
        customer_name: formData.customer_name,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.precio_venta,
        })),
      });

      // Redirigir a MercadoPago
      if (mpRes.data.init_point) {
        window.location.href = mpRes.data.init_point;
      } else {
        setError('No se pudo crear la preferencia de pago');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Finalizar Compra</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleCheckout}>
          <div className="form-section">
            <h2>Datos de Facturación</h2>

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Dirección de Envío</h2>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  name="shipping_state"
                  value={formData.shipping_state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Código Postal *</label>
                <input
                  type="text"
                  name="shipping_postal_code"
                  value={formData.shipping_postal_code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Procesando...' : 'Pagar con MercadoPago'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Resumen de Orden</h2>

          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.title}</span>
                <span>× {item.quantity}</span>
                <span>${(item.precio_venta * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>IVA (16%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <p className="payment-info">
            💳 Se abrirá MercadoPago para completar el pago de manera segura
          </p>
        </div>
      </div>
    </div>
  );
}
