import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import RecommendedProducts from "../components/RecommendedProducts";
import "./Home.css";

function PersonalizedHome() {
  const { user } = useAuth();
  const [personalizedData, setPersonalizedData] = useState({
    recommendations: [],
    trending: [],
    recentlyViewed: [],
    categorySuggestions: []
  });
  const [loading, setLoading] = useState(true);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchPersonalizedContent();
  }, [user]);

  const fetchPersonalizedContent = async () => {
    try {
      setLoading(true);
      const params = user ? `?userId=${user._id}` : '';
      const response = await axios.get(`${API_URL}/personalized/home${params}`);
      setPersonalizedData(response.data);
    } catch (error) {
      console.error("Error fetching personalized content:", error);
    } finally {
      setLoading(false);
    }
  };

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
              {user ? `Welcome back, ${user.name}! 👋` : 'Welcome to'} 
              {!user && <span className="gradient-text"> Cartify</span>}
            </h1>
            <p className="hero-description">
              {user 
                ? 'We have personalized recommendations just for you based on your shopping preferences!' 
                : 'Discover amazing products from electronics, fashion, home essentials, and more. Shop smarter with the best deals online!'}
            </p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary">
                Shop Now
              </Link>
              {!user && (
                <Link to="/signup" className="btn btn-secondary">
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">💻</div>
            <div className="floating-card card-2">🛒</div>
            <div className="floating-card card-3">📱</div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations (Only for logged-in users) */}
      {user && !loading && personalizedData.recommendations.length > 0 && (
        <section className="personalized-section">
          <div className="section-container">
            <h2 className="section-title">✨ Picked Just for You</h2>
            <p className="section-subtitle">Based on your browsing and purchase history</p>
            <div className="products-grid">
              {personalizedData.recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed (Only for logged-in users) */}
      {user && personalizedData.recentlyViewed.length > 0 && (
        <section className="recently-viewed-section">
          <div className="section-container">
            <h2 className="section-title">👀 Continue Browsing</h2>
            <p className="section-subtitle">Pick up where you left off</p>
            <div className="products-grid">
              {personalizedData.recentlyViewed.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {personalizedData.trending.length > 0 && (
        <section className="trending-section">
          <div className="section-container">
            <h2 className="section-title">🔥 Trending Now</h2>
            <p className="section-subtitle">Popular products among our shoppers</p>
            <div className="products-grid">
              {personalizedData.trending.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category */}
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

export default PersonalizedHome;