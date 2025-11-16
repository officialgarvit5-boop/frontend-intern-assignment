import React, { useState, useEffect } from 'react';
import './App.css';

function ProductCard({ product, onCardClick, isFavorite, onFavoriteToggle }) {
  return (
    <div className="product-card" onClick={() => onCardClick(product)}>
      <div className="product-image-container">
        <img src={product.image} alt={product.title} className="product-image" />
        <button
          className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(product.id);
          }}
        >
          ♥
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-rating">
          ⭐ {product.rating.rate}
        </div>
        <div className="product-price">${product.price.toFixed(2)}</div>
      </div>
    </div>
  );
}

function ProductModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <img src={product.image} alt={product.title} className="modal-image" />
          <div className="modal-details">
            <h2>{product.title}</h2>
            <p className="modal-category">Category: {product.category}</p>
            <p className="modal-description">{product.description}</p>
            <div className="modal-rating">⭐ {product.rating.rate}</div>
            <div className="modal-price">${product.price.toFixed(2)}</div>
            <button className="modal-buy-btn">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);

        const uniqueCategories = ['all', ...new Set(data.map((p) => p.category))];
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleFavoriteToggle = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">🛍️ Airfy</h1>
          <div className="header-controls">
            <input
              type="text"
              className="search-bar"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="favorites-counter">
              ♥ {favorites.length}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort Price:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="default">Default</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="error-message">Error: {error}</div>
        ) : loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCardClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
                isFavorite={favorites.includes(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">No products found</div>
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
export default App;

