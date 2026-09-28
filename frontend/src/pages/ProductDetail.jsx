import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import '../styles/product.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="spinner"></div></div>;
  if (!product) return <div className="container"><p>Producto no encontrado</p></div>;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`${quantity} unidad(es) agregada(s) al carrito`);
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Volver al catálogo
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={product.imagen_principal || '/placeholder.png'}
            alt={product.title}
            onError={(e) => (e.target.src = '/placeholder.png')}
          />
        </div>

        <div className="product-detail-info">
          <h1>{product.title}</h1>
          <p className="sku">SKU: {product.modelo}</p>
          <p className="marca">Marca: {product.marca || 'N/A'}</p>

          {product.category_name && (
            <p className="category">
              Categoría: {product.category_name} {' > '} {product.subcategory_name}
            </p>
          )}

          <div className="price-section">
            <span className="precio">${product.precio_venta.toFixed(2)} MXN</span>
            {product.precio_lista > 0 && (
              <span className="precio-lista">
                Precio Lista: ${product.precio_lista.toFixed(2)}
              </span>
            )}
          </div>

          {product.description && (
            <div className="description">
              <h3>Descripción</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.peso_kg && (
            <p className="specs">Peso: {product.peso_kg} kg</p>
          )}

          <div className="purchase-section">
            <div className="quantity">
              <label>Cantidad:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
              🛒 Agregar al Carrito
            </button>
          </div>

          <div className="additional-info">
            <p>✓ Disponible para compra</p>
            <p>✓ Envío a toda la república</p>
            <p>✓ Factura electrónica disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
