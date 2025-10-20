import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here!</p>
            <a href="/shop" className="shop-btn">Go to Shop</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`order-status status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <span className="order-total-label">Total Amount:</span>
                  <span className="order-total">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;