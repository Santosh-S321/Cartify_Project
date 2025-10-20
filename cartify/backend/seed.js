// seed.js - Run this to populate your database with sample products
const mongoose = require("mongoose");
require("dotenv").config();

// Product Schema (same as in server.js)
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

// Sample Products Data
const sampleProducts = [
  {
    name: "Premium Laptop",
    description: "High-performance laptop perfect for work and gaming with 16GB RAM and 512GB SSD",
    price: 75000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    stock: 15,
  },
  {
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
    price: 8500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    stock: 30,
  },
  {
    name: "Smart Watch Pro",
    description: "Advanced fitness tracking smartwatch with heart rate monitor and GPS",
    price: 12000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    stock: 25,
  },
  {
    name: "4K Smart TV 55-inch",
    description: "Ultra HD 4K Smart TV with HDR and built-in streaming apps",
    price: 45000,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
    stock: 10,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof Bluetooth speaker with 360-degree sound",
    price: 3500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    stock: 40,
  },
  {
    name: "Coffee Maker Pro",
    description: "Automatic coffee brewing machine with programmable settings",
    price: 4500,
    category: "Home",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
    stock: 20,
  },
  {
    name: "Air Purifier",
    description: "HEPA filter air purifier for cleaner, healthier indoor air",
    price: 8500,
    category: "Home",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500",
    stock: 15,
  },
  {
    name: "Vacuum Cleaner Robot",
    description: "Smart robotic vacuum with auto-charging and app control",
    price: 18000,
    category: "Home",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
    stock: 12,
  },
  {
    name: "Running Shoes",
    description: "Comfortable sports shoes with advanced cushioning technology",
    price: 3500,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    stock: 40,
  },
  {
    name: "Leather Backpack",
    description: "Durable leather travel backpack with laptop compartment",
    price: 2500,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    stock: 35,
  },
  {
    name: "Casual T-Shirt",
    description: "Premium cotton t-shirt available in multiple colors",
    price: 800,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    stock: 100,
  },
  {
    name: "Denim Jeans",
    description: "Classic fit denim jeans made from premium quality fabric",
    price: 2200,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    stock: 60,
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life",
    price: 1200,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    stock: 50,
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with touch controls and USB port",
    price: 1800,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    stock: 30,
  },
  {
    name: "Sunglasses",
    description: "Stylish UV protection sunglasses with polarized lenses",
    price: 1500,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    stock: 45,
  },
];

// Seeding Function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cartify", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");

    // Clear existing products (optional - comment out if you want to keep existing products)
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully added ${insertedProducts.length} products!`);
    
    console.log("\n📦 Products added:");
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("You can now view these products in your Shop page or Admin dashboard.\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();