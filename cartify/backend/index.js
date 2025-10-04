const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Users array (dummy database)
let users = [
  { id: 1, name: "Admin User", email: "admin@cartify.com", password: "admin123", role: "admin" },
  { id: 2, name: "Regular User", email: "user@cartify.com", password: "user123", role: "user" }
];

// Products array
let products = [
  { id: 1, name: "Laptop", price: 50000, image: "" },
  { id: 2, name: "Headphones", price: 2000, image: "" }
];

// ------------------------ Signup Route ------------------------
app.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Create new user
  const newUser = { id: Date.now(), name, email, password, role: role || "user" };
  users.push(newUser);

  // Return user info (excluding password for security)
  const { password: pwd, ...userData } = newUser;
  res.status(201).json(userData);
});

// ------------------------ Login Route ------------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Return user info without password
  const { password: pwd, ...userData } = user;
  res.json(userData);
});

// ------------------------ Products Routes ------------------------
app.get("/products", (req, res) => res.json(products));

app.post("/products", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  products = products.map(p => p.id === id ? { ...p, ...req.body } : p);
  res.json({ message: "Updated" });
});

app.delete("/products/:id", (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ message: "Deleted" });
});

// ------------------------ Start Server ------------------------
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
