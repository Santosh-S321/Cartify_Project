import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handlePlaceOrder = async () => {
    setProcessing(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getCartTotal() * 1.18, // Including tax
      };

      await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error) {
      alert("Error placing order: " + error.response?.data?.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Checkout</h1>
      <div style={{ background: "white", padding: "2rem", borderRadius: "15px" }}>
        <h2>Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} style={{ padding: "1rem 0", borderBottom: "1px solid #eee" }}>
            <span>{item.name} x {item.quantity}</span>
            <span style={{ float: "right" }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div style={{ marginTop: "1rem", fontSize: "1.3rem", fontWeight: "bold" }}>
          Total: ₹{(getCartTotal() * 1.18).toLocaleString()}
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "10px",
            marginTop: "2rem",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          {processing ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;