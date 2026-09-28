import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Subcategories from './pages/Subcategories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Login from './pages/Login';

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      navigate('/login');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      await axios.post('/api/auth/verify-token', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ authenticated: true });
    } catch (err) {
      logout();
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('admin_token', newToken);
    setUser({ authenticated: true });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="header-top">
          <h1>SUINMEX Admin</h1>
          <button className="btn-logout" onClick={logout}>
            Salir
          </button>
        </div>
        <nav className="admin-nav">
          <Link to="/">📊 Dashboard</Link>
          <Link to="/categories">📁 Categorías</Link>
          <Link to="/subcategories">🏷️ Subcategorías</Link>
          <Link to="/products">📦 Productos</Link>
          <Link to="/orders">📋 Órdenes</Link>
        </nav>
      </header>

      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/categories" element={<Categories token={token} />} />
          <Route path="/subcategories" element={<Subcategories token={token} />} />
          <Route path="/products" element={<Products token={token} />} />
          <Route path="/orders" element={<Orders token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </main>
    </div>
  );
}
