import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { getItemsCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🛒</span>
          Cartify
        </Link>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/shop" className="nav-link" onClick={closeMenu}>
            Shop
          </Link>

          {/* User Menu */}
          {user ? (
            <>
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                Profile
              </Link>
              <Link to="/orders" className="nav-link" onClick={closeMenu}>
                My Orders
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="nav-link admin-link" onClick={closeMenu}>
                  Admin
                </Link>
              )}
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/signup" className="nav-link signup-link" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}

          {/* Cart */}
          <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
            <span className="cart-icon">🛒</span>
            Cart
            {getItemsCount() > 0 && (
              <span className="cart-badge">{getItemsCount()}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;