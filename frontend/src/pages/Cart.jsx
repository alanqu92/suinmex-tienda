import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import '../styles/cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos antes de proceder al checkout</p>
          <Link to="/" className="btn btn-primary">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Carrito de Compras</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={item.imagen_principal || '/placeholder.png'}
                alt={item.title}
                onError={(e) => (e.target.src = '/placeholder.png')}
              />
              <div className="item-info">
                <h3>{item.title}</h3>
                <p className="modelo">{item.modelo}</p>
                <p className="price">${item.precio_venta.toFixed(2)} MXN</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}>
                  −
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateCartQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <div className="item-subtotal">
                ${(item.precio_venta * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="btn-remove"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>IVA (16%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceder al Pago
          </button>
          <button className="btn btn-secondary btn-block" onClick={clearCart}>
            Vaciar Carrito
          </button>
          <Link to="/" className="btn btn-secondary btn-block">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
