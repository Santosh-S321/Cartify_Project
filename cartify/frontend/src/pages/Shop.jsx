import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      console.log("Products fetched:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (error) {
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
            <p>Try adjusting your filters or check back later.</p>
            <button onClick={() => window.location.href = '/admin'} className="add-products-btn">
              Go to Admin to Add Products
            </button>
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