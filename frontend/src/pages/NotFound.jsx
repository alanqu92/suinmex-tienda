import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ color: '#999', marginBottom: '2rem', fontSize: '1.2rem' }}>
          Página no encontrada
        </p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
