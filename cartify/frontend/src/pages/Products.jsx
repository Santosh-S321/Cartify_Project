import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="page grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((item) => (
        <div key={item.id} className="card flex flex-col items-center p-4">
          {item.image && (
            <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded mb-2" />
          )}
          <h3>{item.name}</h3>
          <p>₹{item.price}</p>
          <button className="add-btn mt-2" onClick={() => addToCart(item)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
