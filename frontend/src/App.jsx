import { Routes, Route, Link } from 'react-router-dom';
import { useStore } from './store';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import './App.css';

export default function App() {
  const { cart, user, logout } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <strong>SUINMEX</strong>
          </Link>
          <nav className="nav">
            <Link to="/">Catálogo</Link>
            <Link to="/cart" className="cart-link">
              🛒 Carrito ({cartCount})
            </Link>
            {user ? (
              <>
                <Link to="/profile">{user.name}</Link>
                <button onClick={logout} className="btn-logout">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Iniciar Sesión</Link>
                <Link to="/register">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 SUINMEX. Todos los derechos reservados.</p>
          <p>📞 81 1044 1811 | info@suinmex.com</p>
        </div>
      </footer>
    </div>
  );
}
