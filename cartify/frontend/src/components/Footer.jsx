import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3 className="footer-title">
            <span className="footer-logo">🛒</span>
            Cartify
          </h3>
          <p className="footer-description">
            Your one-stop shop for electronics, fashion, and home essentials.
            Shop smarter, live better.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h4 className="footer-heading">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="#shipping">Shipping Info</a></li>
            <li><a href="#returns">Returns</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">🐦</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">💼</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Cartify. All rights reserved.</p>
        <p className="footer-credits">Built by CodeXplorers for Full Stack Development Project</p>
      </div>
    </footer>
  );
}

export default Footer;