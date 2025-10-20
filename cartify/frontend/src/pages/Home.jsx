import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const categories = [
    { name: "Electronics", icon: "💻", color: "#667eea" },
    { name: "Fashion", icon: "👕", color: "#f093fb" },
    { name: "Home", icon: "🏠", color: "#4facfe" },
  ];

  const features = [
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Get your products delivered within 2-3 days",
    },
    {
      icon: "💳",
      title: "Secure Payment",
      description: "100% secure payment processing",
    },
    {
      icon: "🔄",
      title: "Easy Returns",
      description: "15-day return policy on all products",
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description: "Round-the-clock customer service",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">Cartify</span>
            </h1>
            <p className="hero-description">
              Discover amazing products from electronics, fashion, home essentials, and more.
              Shop smarter with the best deals online!
            </p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary">
                Shop Now
              </Link>
              <Link to="/signup" className="btn btn-secondary">
                Sign Up Free
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">💻</div>
            <div className="floating-card card-2">🛒</div>
            <div className="floating-card card-3">📱</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link
              to={`/shop?category=${category.name}`}
              key={index}
              className="category-card"
              style={{ "--category-color": category.color }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Cartify?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Shopping?</h2>
          <p className="cta-description">
            Join thousands of happy customers and experience the best online shopping!
          </p>
          <Link to="/shop" className="btn btn-large">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;