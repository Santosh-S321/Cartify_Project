import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

// Private Admin Route Component
function PrivateAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin" ? children : <Navigate to="/" />;
}

// Private User Route Component
function PrivateUserRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "user" ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: "1", padding: "20px 0" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <PrivateUserRoute>
              <Profile />
            </PrivateUserRoute>
          } />
          <Route path="/admin" element={
            <PrivateAdminRoute>
              <Admin />
            </PrivateAdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
