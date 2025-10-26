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

// MongoDB Connection - FIXED (Remove deprecated options)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cartify")
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

// New Product Input Validation Middleware
const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({ message: "Product name must be at least 3 characters" });
  }
  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ message: "Price must be a positive number" });
  }
  if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
    return res.status(400).json({ message: "Stock must be a non-negative integer" });
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
app.post("/api/products", authenticateToken, authorizeAdmin, validateProduct, async (req, res) => {
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
app.put("/api/products/:id", authenticateToken, authorizeAdmin, validateProduct, async (req, res) => {
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


// ==================== ADD THIS TO YOUR server.js ====================
// Install: npm install web-push

const webpush = require('web-push');

// VAPID Keys Configuration (Generate your own keys)
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BJ2KpetVrmjMogqeoVCFxMhJgJtKUKcxlIrO-bTD4wtXBhyQ4fMCf_eWofiEgw4LB6o6jWZvrEtiTsm8icC9eLw';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'iEG1U8Owziy8S57OfW95o7x_FW-WiR2hDG8UVTfzgxw';

webpush.setVapidDetails(
  'mailto:admin@cartify.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ==================== NOTIFICATION ROUTES ====================

// Get VAPID Public Key
app.get("/api/notifications/vapid-public-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Subscribe to Push Notifications
app.post("/api/notifications/subscribe", authenticateToken, async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      userId: req.user.id,
      endpoint: subscription.endpoint
    });

    if (existingSubscription) {
      return res.json({ message: "Already subscribed", subscription: existingSubscription });
    }

    // Save new subscription
    const newSubscription = new Subscription({
      userId: req.user.id,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    await newSubscription.save();

    // Send welcome notification
    const payload = JSON.stringify({
      title: '🎉 Welcome to Cartify Notifications!',
      body: 'You will receive updates about your orders and special offers.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: '/shop' }
    });

    await webpush.sendNotification(subscription, payload);

    res.status(201).json({ 
      message: "Subscribed successfully",
      subscription: newSubscription 
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

// Unsubscribe from Push Notifications
app.post("/api/notifications/unsubscribe", authenticateToken, async (req, res) => {
  try {
    await Subscription.deleteMany({ userId: req.user.id });
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// Send Notification to User
app.post("/api/notifications/send", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    // Get user subscriptions
    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No subscriptions found for user" });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: url || '/shop' }
    });

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };
        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    // Remove invalid subscriptions
    const failedSubscriptions = results
      .map((result, index) => result.status === 'rejected' ? subscriptions[index]._id : null)
      .filter(id => id !== null);

    if (failedSubscriptions.length > 0) {
      await Subscription.deleteMany({ _id: { $in: failedSubscriptions } });
    }

    res.json({ 
      message: "Notifications sent",
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: failedSubscriptions.length
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

// Send Notification to All Users
app.post("/api/notifications/broadcast", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, body, url } = req.body;

    // Get all subscriptions
    const subscriptions = await Subscription.find({});

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No subscriptions found" });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url: url || '/shop' }
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
          }
        };
        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    // Remove invalid subscriptions
    const failedIndices = results
      .map((result, index) => result.status === 'rejected' ? index : null)
      .filter(index => index !== null);

    if (failedIndices.length > 0) {
      const failedIds = failedIndices.map(index => subscriptions[index]._id);
      await Subscription.deleteMany({ _id: { $in: failedIds } });
    }

    res.json({ 
      message: "Broadcast sent",
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: failedIndices.length
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ message: "Failed to broadcast notification" });
  }
});

// Automatically send notification when order status changes
// Add this to your existing PUT /api/orders/:id route
app.put("/api/orders/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send notification to user about order status change
    const subscriptions = await Subscription.find({ userId: order.userId._id });
    
    if (subscriptions.length > 0) {
      let notificationBody = '';
      
      switch(status) {
        case 'completed':
          notificationBody = `🎉 Your order #${order._id.toString().slice(-6)} has been completed!`;
          break;
        case 'cancelled':
          notificationBody = `❌ Your order #${order._id.toString().slice(-6)} has been cancelled.`;
          break;
        case 'pending':
          notificationBody = `⏳ Your order #${order._id.toString().slice(-6)} is being processed.`;
          break;
        default:
          notificationBody = `📦 Order #${order._id.toString().slice(-6)} status updated to ${status}`;
      }

      const payload = JSON.stringify({
        title: '📦 Order Status Update',
        body: notificationBody,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: '/orders' }
      });

      // Send to all user's subscriptions
      await Promise.allSettled(
        subscriptions.map(sub => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          };
          return webpush.sendNotification(pushSubscription, payload);
        })
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
});

console.log('✅ Push notification routes initialized');

// ==================== ADD THIS TO YOUR server.js ====================

// User Interaction Schema (Track user behavior)
const userInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['view', 'cart', 'purchase', 'like'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days TTL
});

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

// ==================== RECOMMENDATION ROUTES ====================

// Track User Interaction
app.post("/api/interactions", authenticateToken, async (req, res) => {
  try {
    const { productId, type } = req.body;

    const interaction = new UserInteraction({
      userId: req.user.id,
      productId,
      type
    });

    await interaction.save();
    res.status(201).json({ message: "Interaction tracked" });
  } catch (error) {
    console.error("Track interaction error:", error);
    res.status(500).json({ message: "Failed to track interaction" });
  }
});

// Get Recommendations
app.get("/api/recommendations", async (req, res) => {
  try {
    const { productId, category, userId, algorithm = 'hybrid' } = req.query;
    let recommendations = [];

    switch (algorithm) {
      case 'collaborative':
        recommendations = await getCollaborativeRecommendations(userId);
        break;
      case 'content-based':
        recommendations = await getContentBasedRecommendations(productId, category);
        break;
      case 'hybrid':
        recommendations = await getHybridRecommendations(userId, productId, category);
        break;
      default:
        recommendations = await getContentBasedRecommendations(productId, category);
    }

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

// ==================== FIXED RECOMMENDATION ALGORITHMS ====================

// 1. Content-Based Filtering (Based on product similarity)
async function getContentBasedRecommendations(productId, category, limit = 6) {
  try {
    let query = {};

    // If we have a product ID, find similar products in same category
    if (productId && productId !== 'undefined' && mongoose.Types.ObjectId.isValid(productId)) {
      const currentProduct = await Product.findById(productId);
      if (currentProduct) {
        query.category = currentProduct.category;
        query._id = { $ne: productId };
      }
    } 
    // If only category provided
    else if (category) {
      query.category = category;
    }

    const recommendations = await Product.find(query)
      .limit(limit)
      .sort({ createdAt: -1 });

    return recommendations.map(product => ({
      ...product.toObject(),
      reason: `Similar to items you viewed in ${product.category}`,
      matchScore: 0.8
    }));
  } catch (error) {
    console.error("Content-based filtering error:", error);
    return [];
  }
}

// 2. Collaborative Filtering (Based on similar users) - FIXED
async function getCollaborativeRecommendations(userId, limit = 6) {
  try {
    // Validate userId
    if (!userId || userId === 'undefined' || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid or missing userId, returning popular products');
      return await getPopularProducts(limit);
    }

    // Convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's viewed/purchased products
    const userInteractions = await UserInteraction.find({ userId: userObjectId })
      .distinct('productId');

    if (userInteractions.length === 0) {
      console.log('No user interactions found, returning popular products');
      return await getPopularProducts(limit);
    }

    // Find users who interacted with the same products
    const similarUsers = await UserInteraction.find({
      productId: { $in: userInteractions },
      userId: { $ne: userObjectId }
    }).distinct('userId');

    if (similarUsers.length === 0) {
      console.log('No similar users found, returning popular products');
      return await getPopularProducts(limit);
    }

    // Get products that similar users liked but current user hasn't seen
    const recommendedProductIds = await UserInteraction.find({
      userId: { $in: similarUsers },
      productId: { $nin: userInteractions }
    })
      .distinct('productId')
      .limit(limit);

    const recommendations = await Product.find({
      _id: { $in: recommendedProductIds }
    }).limit(limit);

    return recommendations.map(product => ({
      ...product.toObject(),
      reason: 'Users with similar taste also liked this',
      matchScore: 0.9
    }));
  } catch (error) {
    console.error("Collaborative filtering error:", error);
    return [];
  }
}

// 3. Hybrid Approach (Combines both methods) - FIXED
async function getHybridRecommendations(userId, productId, category, limit = 6) {
  try {
    // Get recommendations from both algorithms
    const collaborative = await getCollaborativeRecommendations(userId, Math.ceil(limit / 2));
    const contentBased = await getContentBasedRecommendations(productId, category, Math.ceil(limit / 2));

    // Combine and deduplicate
    const combined = [...collaborative, ...contentBased];
    const uniqueRecommendations = Array.from(
      new Map(combined.map(item => [item._id.toString(), item])).values()
    );

    // Sort by match score
    uniqueRecommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return uniqueRecommendations.slice(0, limit);
  } catch (error) {
    console.error("Hybrid recommendation error:", error);
    return [];
  }
}

// Helper: Get Popular Products
async function getPopularProducts(limit = 6) {
  try {
    // If no interactions yet, just return newest products
    const interactionCount = await UserInteraction.countDocuments();
    
    if (interactionCount === 0) {
      const products = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return products.map(product => ({
        ...product.toObject(),
        reason: 'New arrivals',
        matchScore: 0.7
      }));
    }

    // Get most viewed products in last 30 days
    const popularProductIds = await UserInteraction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    if (popularProductIds.length === 0) {
      // Fallback to newest products
      const products = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return products.map(product => ({
        ...product.toObject(),
        reason: 'New arrivals',
        matchScore: 0.7
      }));
    }

    const productIds = popularProductIds.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    return products.map(product => ({
      ...product.toObject(),
      reason: 'Trending now - Popular among shoppers',
      matchScore: 0.7
    }));
  } catch (error) {
    console.error("Popular products error:", error);
    return [];
  }
}

// ==================== FIXED PERSONALIZED HOME PAGE ====================

// Get Personalized Content for User - FIXED
app.get("/api/personalized/home", async (req, res) => {
  try {
    const userId = req.query.userId;

    const response = {
      recommendations: [],
      trending: [],
      recentlyViewed: [],
      categorySuggestions: []
    };

    // Validate userId
    if (userId && userId !== 'undefined' && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Get personalized recommendations
        response.recommendations = await getHybridRecommendations(userId, null, null, 8);
        
        // Get recently viewed products
        const recentInteractions = await UserInteraction.find({ 
          userId: userObjectId, 
          type: 'view' 
        })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate('productId');
        
        response.recentlyViewed = recentInteractions
          .filter(i => i.productId)
          .map(i => i.productId);

        // Get user's favorite categories
        const categoryInteractions = await UserInteraction.aggregate([
          { $match: { userId: userObjectId } },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          {
            $group: {
              _id: '$product.category',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 3 }
        ]);

        response.categorySuggestions = categoryInteractions.map(c => c._id);
      } catch (userError) {
        console.error("Error processing user data:", userError);
        // Continue without personalized data
      }
    }

    // Get trending products (for everyone)
    response.trending = await getPopularProducts(6);

    // If no personalized recommendations, add some general ones
    if (response.recommendations.length === 0) {
      response.recommendations = await getContentBasedRecommendations(null, null, 8);
    }

    res.json(response);
  } catch (error) {
    console.error("Personalized home error:", error);
    res.status(500).json({ message: "Failed to get personalized content" });
  }
});

// ==================== FREQUENTLY BOUGHT TOGETHER ====================

// Get Products Frequently Bought Together
app.get("/api/recommendations/bought-together/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Find orders that contain this product
    const ordersWithProduct = await Order.find({
      'items.productId': productId
    }).select('items');

    // Count co-occurrences
    const coOccurrences = {};
    
    ordersWithProduct.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.productId.toString();
        if (itemId !== productId) {
          coOccurrences[itemId] = (coOccurrences[itemId] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top 4
    const topProductIds = Object.entries(coOccurrences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([id]) => id);

    const products = await Product.find({ _id: { $in: topProductIds } });

    const recommendations = products.map(product => ({
      ...product.toObject(),
      reason: 'Frequently bought together',
      matchScore: 0.95
    }));

    res.json(recommendations);
  } catch (error) {
    console.error("Bought together error:", error);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

console.log('✅ Recommendation engine initialized');