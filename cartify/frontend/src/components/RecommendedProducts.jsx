import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import './RecommendedProducts.css';

function RecommendedProducts({ currentProductId, category, userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState('collaborative'); // collaborative, content-based, hybrid

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId, category, algorithm]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (currentProductId) params.append('productId', currentProductId);
      if (category) params.append('category', category);
      if (userId) params.append('userId', userId);
      params.append('algorithm', algorithm);

      const response = await axios.get(`${API_URL}/recommendations?${params.toString()}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="recommendations-section">
        <h2 className="recommendations-title">🎯 Recommended for You</h2>
        <div className="loading-recommendations">
          <div className="spinner"></div>
          <p>Finding perfect products for you...</p>
        </div>
      </div>
    );
  }

  // ❌ No recommendations
  if (recommendations.length === 0) {
    return null;
  }

  // ✅ Show recommendations
  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h2 className="recommendations-title">🎯 Recommended for You</h2>

        <div className="algorithm-selector">
          <button
            className={`algo-btn ${algorithm === 'collaborative' ? 'active' : ''}`}
            onClick={() => setAlgorithm('collaborative')}
            title="Based on similar users"
          >
            👥 Similar Users
          </button>
          <button
            className={`algo-btn ${algorithm === 'content-based' ? 'active' : ''}`}
            onClick={() => setAlgorithm('content-based')}
            title="Based on product similarity"
          >
            🔍 Similar Items
          </button>
          <button
            className={`algo-btn ${algorithm === 'hybrid' ? 'active' : ''}`}
            onClick={() => setAlgorithm('hybrid')}
            title="Combined approach"
          >
            ⚡ Smart Mix
          </button>
        </div>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <div key={product._id} className="recommendation-item">
            <ProductCard product={product} />
            {product.matchScore && (
              <div className="match-badge">
                {Math.round(product.matchScore * 100)}% Match
              </div>
            )}
            {product.reason && (
              <div className="recommendation-reason">
                💡 {product.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedProducts;
