import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import '../styles/profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div className="profile-layout">
        <div className="profile-info">
          <h1>Mi Perfil</h1>
          <div className="info-card">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.company_name && <p><strong>Empresa:</strong> {user.company_name}</p>}
            {user.rfc && <p><strong>RFC:</strong> {user.rfc}</p>}
            {user.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
          </div>
        </div>

        <div className="profile-orders">
          <h2>Mis Órdenes</h2>
          {loading ? (
            <div className="spinner"></div>
          ) : orders.length === 0 ? (
            <p>Aún no has realizado compras</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-number">Orden #{order.order_number}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <span>{new Date(order.created_at).toLocaleDateString('es-MX')}</span>
                    <span className="order-total">
                      ${order.total.toFixed(2)} MXN
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
