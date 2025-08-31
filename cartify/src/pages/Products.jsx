import React from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import { useCart } from "../context/CartContext"; 

export default function Products() {
  const { addToCart } = useCart();

  return (
    <div className="page grid">
      {products.map((item) => (
        <div key={item.id} className="card">
          {/* Link to ProductDetails */}
          <Link to={`/products/${item.id}`}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
          </Link>

          <p>{item.price}</p>

          <button className="add-btn" onClick={() => addToCart(item)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
