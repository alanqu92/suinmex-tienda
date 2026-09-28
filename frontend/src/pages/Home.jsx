import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import axios from 'axios';
import '../styles/catalog.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { selectedCategory, selectedSubcategory, searchQuery } = useStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, searchQuery, page]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);
      params.append('limit', 20);

      const res = await axios.get(`/api/products?${params}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="catalog-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Categorías</h3>
          {categories.map(cat => (
            <div key={cat.id} className="category-item">
              <h4>{cat.name}</h4>
              {cat.subcategories?.map(sub => (
                <label key={sub.id} className="subcategory-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSubcategory === sub.id}
                    onChange={() =>
                      useStore.setState({
                        selectedSubcategory:
                          selectedSubcategory === sub.id ? null : sub.id,
                      })
                    }
                  />
                  {sub.name}
                </label>
              ))}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="catalog-main">
          <div className="catalog-header">
            <h1>Catálogo de Productos</h1>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) =>
                useStore.setState({ searchQuery: e.target.value, page: 1 })
              }
              className="search-box"
            />
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img
                        src={product.imagen_principal || '/placeholder.png'}
                        alt={product.title}
                        onError={(e) =>
                          (e.target.src = '/placeholder.png')
                        }
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      <p className="modelo">{product.modelo}</p>
                      <p className="precio">
                        ${product.precio_venta.toFixed(2)} MXN
                      </p>
                      <Link
                        to={`/product/${product.id}`}
                        className="btn btn-primary"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="no-products">
                  <p>No hay productos que coincidan con tu búsqueda.</p>
                </div>
              )}

              <div className="pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  ← Anterior
                </button>
                <span>Página {page}</span>
                <button onClick={() => setPage(page + 1)}>
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
