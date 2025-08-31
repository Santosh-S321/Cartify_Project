import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minHeight: "70vh"
    }}>
      {/* Logo */}
      <img src="/logo.png" alt="Cartify Logo" style={{ width: "400px", marginBottom: "10px" }} />

        {/* Welcome Heading */}
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Welcome to Cartify
      </h1>

      {/* Tagline */}
      <p style={{ 
        maxWidth: "600px", 
        marginTop: "15px", 
        fontSize: "1.2rem", 
        fontWeight: "500" 
      }}>
        Shop smarter and faster with <b>Cartify</b>. Discover products from 
        <b> Tech, Lifestyle, Groceries</b>, and more – all in one place!
      </p>

      {/* Shop Now Button */}
      <Link to="/shop">
        <button className="shop-now-btn">
          Shop Now
        </button>
      </Link>
    </div>
  );
}

export default Home;