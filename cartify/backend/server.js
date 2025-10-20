const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cartify", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ==================== MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// ==================== MIDDLEWARE ====================

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "56222717bc7877835546336271d72c74a50f64e8d7540d40937458f1f392796e", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Input Validation Middleware
const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  next();
};

// ==================== AUTH ROUTES ====================

// Signup Route
app.post("/api/auth/signup", validateSignup, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "56222717bc7877835546336271d72c74a50f64e8d7540d40937458f1f392796e",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "56222717bc7877835546336271d72c74a50f64e8d7540d40937458f1f392796e",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get Current User
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get All Products (Public)
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    let sortOption = {};
    if (sort === "price-asc") sortOption.price = 1;
    if (sort === "price-desc") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get Single Product (Public)
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Create Product (Admin Only)
app.post("/api/products", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image,
      stock: stock || 0,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
});

// Update Product (Admin Only)
app.put("/api/products/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete Product (Admin Only)
app.delete("/api/products/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// ==================== ORDER ROUTES ====================

// Create Order (Authenticated Users)
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
});

// Get User Orders (Authenticated Users)
app.get("/api/orders/my-orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get All Orders (Admin Only)
app.get("/api/orders", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update Order Status (Admin Only)
app.put("/api/orders/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
});


// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});