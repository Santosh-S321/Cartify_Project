import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.length;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: "#3708f1", padding: "15px 0", position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <h2 style={{ color: "white", fontSize: "30px", margin: 0 }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Cartify
          </Link>
        </h2>

        {/* Hamburger Icon (only on mobile) */}
        <div
          style={{
            display: "none",
            flexDirection: "column",
            cursor: "pointer",
          }}
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div style={{ width: "25px", height: "3px", background: "white", margin: "4px 0" }} />
          <div style={{ width: "25px", height: "3px", background: "white", margin: "4px 0" }} />
          <div style={{ width: "25px", height: "3px", background: "white", margin: "4px 0" }} />
        </div>

        {/* Links (desktop view only) */}
        <div
          className="menu-links desktop-links"
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "18px",
          }}
        >
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
          <Link to="/shop" style={{ color: "white", textDecoration: "none" }}>
            Shop
          </Link>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Log in
          </Link>
          <Link to="/signup" style={{ color: "white", textDecoration: "none" }}>
            Sign Up
          </Link>
          <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>
            Profile
          </Link>
          <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>
            Cart ({cartCount})
          </Link>
        </div>
      </div>

      {/* Mobile Menu (hidden by default, shown only when clicked) */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
        <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
      </div>

      <style>
        {`
          /* Desktop default */
          .desktop-links {
            display: flex;
          }
          .mobile-menu {
            display: none;
          }

          /* Mobile view */
          @media (max-width: 768px) {
            .desktop-links {
              display: none !important;
            }
            .menu-icon {
              display: flex !important;
            }
            .mobile-menu {
              display: none;
              flex-direction: column;
              background: #3708f1;
              position: absolute;
              top: 60px;
              right: 0;
              width: 200px;
              padding: 15px;
              gap: 15px;
            }
            .mobile-menu a {
              color: white;
              text-decoration: none;
              font-size: 18px;
            }
            .mobile-menu.active {
              display: flex;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
