import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

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

        {/* Hamburger Icon */}
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

        {/* Desktop Links */}
        <div
          className="menu-links desktop-links"
          style={{ display: "flex", gap: "20px", fontSize: "18px" }}
        >
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          {!isLoggedIn && <Link to="/login">Log in</Link>}
          {!isLoggedIn && <Link to="/signup">Sign Up</Link>}
          {isLoggedIn && <Link to="/profile">Profile</Link>}
          {isLoggedIn && <Link to="/admin">Admin</Link>}
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-white font-bold">
              Logout
            </button>
          )}
          <Link to="/cart">Cart ({cartCount})</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        {!isLoggedIn && <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>}
        {!isLoggedIn && <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>}
        {isLoggedIn && <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>}
        {isLoggedIn && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
        {isLoggedIn && <button onClick={handleLogout} className="text-white text-left">Logout</button>}
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
      </div>

      <style>
        {`
          .desktop-links { display: flex; }
          .mobile-menu { display: none; }

          @media (max-width: 768px) {
            .desktop-links { display: none !important; }
            .menu-icon { display: flex !important; }
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
            .mobile-menu a, .mobile-menu button {
              color: white;
              text-decoration: none;
              font-size: 18px;
              background: none;
              border: none;
              cursor: pointer;
              text-align: left;
            }
            .mobile-menu.active { display: flex; }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
