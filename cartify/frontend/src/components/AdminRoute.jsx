import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminRoute.css"

// Admin Route for admin users only
export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="spinner"></div>
          <p className="admin-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return (
      <div className="admin-denied-container">
        <h2 className="admin-denied-title">Access Denied</h2>
        <p className="admin-denied-message">
          You do not have permission to access this page.
        </p>
        <a href="/" className="admin-btn-home">
          Go to Home
        </a>
      </div>
    );
  }

  return children;
}

export default AdminRoute;