import React, { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [editId, setEditId] = useState(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update
        await axios.put(`http://localhost:5000/products/${editId}`, form);
      } else {
        // Add
        await axios.post("http://localhost:5000/products", form);
      }
      setForm({ name: "", price: "", image: "" });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, image: product.image });
    setEditId(product.id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Dashboard </h2>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products List */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow flex flex-col items-center">
            {p.image && (
              <img src={p.image} alt={p.name} className="w-32 h-32 object-cover mb-2 rounded" />
            )}
            <span className="font-semibold">{p.name}</span>
            <span>₹{p.price}</span>
            <div className="mt-2 flex gap-2">
              <button
                className="bg-yellow-500 px-2 py-1 rounded"
                onClick={() => handleEdit(p)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 px-2 py-1 text-white rounded"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
