import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    
    // Visual feedback
    e.target.innerHTML = "✓ Added!";
    setTimeout(() => {
      e.target.innerHTML = "Add to Cart";
    }, 1500);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-image-container">
        <img
          src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={product.name}
          className="product-image"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="stock-badge low">Only {product.stock} left!</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out">Out of Stock</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">
            {product.description.substring(0, 60)}...
          </p>
        )}
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        <div className="product-footer">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;