import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import VoiceSearch from "../components/VoiceSearch";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    search: "",
    sort: "newest",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      fetchProducts(); // Refresh products when back online
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      
      // Check if response is from cache
      const isFromCache = response.headers['x-from-cache'] === 'true';
      
      console.log("Products fetched:", response.data);
      setProducts(response.data);
      
      // Show offline indicator if from cache
      if (isFromCache) {
        console.log("📦 Displaying cached products (offline mode)");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // Check if error indicates offline mode
      if (error.message === 'Network Error' || !navigator.onLine) {
        setError("You're offline. Showing cached products if available.");
      } else {
        setError("Failed to load products. Make sure backend is running!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleVoiceResult = (transcript) => {
    handleFilterChange("search", transcript); 
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (error && !isOffline) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="error-container">
            <h2>⚠️ Error Loading Products</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Header */}
        <div className="shop-header">
          <h1 className="shop-title">Explore Our Products</h1>
          <p className="shop-subtitle">Find the perfect items for you</p>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div style={{
            background: 'linear-gradient(135deg, #ff9800 0%, #ff6b00 100%)',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(255, 152, 0, 0.3)'
          }}>
            📡 You're offline - Showing cached products
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
            
            {/* VoiceSearch component */}
            <VoiceSearch onResult={handleVoiceResult} />
          </form>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
          </select>

          {/* Sort Filter */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h2>No products found</h2>
            <p>{isOffline ? 'No cached products available. Please connect to internet.' : 'Try adjusting your filters or check back later.'}</p>
            {!isOffline && (
              <button onClick={() => window.location.href = '/admin'} className="add-products-btn">
                Go to Admin to Add Products
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;