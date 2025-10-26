import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import RecommendedProducts from '../components/RecommendedProducts';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>Product not found</h2>
        <Link to="/shop">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <Link to="/shop" style={{ color: "#667eea", marginBottom: "1rem", display: "inline-block" }}>
        ← Back to Shop
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <img
          src={product.image || "https://via.placeholder.com/500"}
          alt={product.name}
          style={{ width: "100%", borderRadius: "15px" }}
        />
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{product.name}</h1>
          <p style={{ color: "#666", marginBottom: "1rem" }}>{product.description}</p>
          <span style={{ display: "inline-block", padding: "0.5rem 1rem", background: "#e3f2fd", borderRadius: "15px", marginBottom: "1rem" }}>
            {product.category}
          </span>
          <h2 style={{ fontSize: "2rem", color: "#667eea", marginBottom: "1rem" }}>
            ₹{product.price.toLocaleString()}
          </h2>
          <p style={{ marginBottom: "2rem" }}>Stock: {product.stock} units</p>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            style={{
              padding: "1rem 2rem",
              background: product.stock > 0 ? "#667eea" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1.1rem",
              cursor: product.stock > 0 ? "pointer" : "not-allowed",
            }}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* Recommended Products Section */}
      {product && (
        <RecommendedProducts 
        currentProductId={product._id}
        category={product.category}
        userId={user?._id}
        />
        )
      }
    </div>
  );
}

export default ProductDetail;