import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Electronics",
    image: "",
    stock: "",
  });
  const [editId, setEditId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await axios.put(`${API_URL}/products/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product updated successfully!");
      } else {
        await axios.post(`${API_URL}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product added successfully!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      alert("Error saving product: " + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category || "Electronics",
      image: product.image || "",
      stock: product.stock || 0,
    });
    setEditId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      alert("Error deleting product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Electronics",
      image: "",
      stock: "",
    });
    setEditId(null);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order status updated!");
      fetchOrders();
    } catch (error) {
      alert("Error updating order status");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products Management
          </button>
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders Management
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="products-section">
            {/* Add/Edit Product Form */}
            <div className="form-card">
              <h2>{editId ? "Edit Product" : "Add New Product"}</h2>
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                  </select>
                </div>

                <textarea
                  name="description"
                  placeholder="Product Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />

                <div className="form-row">
                  <input
                    type="number"
                    name="price"
                    placeholder="Price (₹)"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                  <input
                    type="number"
                    name="stock"
                    placeholder="Stock Quantity"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <input
                  type="url"
                  name="image"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={handleInputChange}
                />

                <div className="form-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
                  </button>
                  {editId && (
                    <button type="button" onClick={resetForm} className="cancel-btn">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="products-list">
              <h2>All Products ({products.length})</h2>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-item">
                    <img
                      src={product.image || "https://via.placeholder.com/150"}
                      alt={product.name}
                    />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-stock">Stock: {product.stock}</p>
                    </div>
                    <div className="product-actions">
                      <button onClick={() => handleEdit(product)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="orders-section">
            <h2>All Orders ({orders.length})</h2>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order._id.slice(-6)}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-user">Customer: {order.userId?.name || "N/A"}</p>
                  <p className="order-total">Total: ₹{order.totalAmount}</p>
                  <p className="order-date">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <div className="order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;