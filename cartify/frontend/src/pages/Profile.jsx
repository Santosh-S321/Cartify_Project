import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <span className={`profile-role ${user?.role}`}>
              {user?.role === "admin" ? "👑 Admin" : "👤 User"}
            </span>
          </div>

          <div className="profile-menu">
            <Link to="/orders" className="menu-item">
              <span className="menu-icon">📦</span>
              <div>
                <h3>My Orders</h3>
                <p>View and track your orders</p>
              </div>
            </Link>

            {user?.role === "admin" && (
              <Link to="/admin" className="menu-item">
                <span className="menu-icon">⚙️</span>
                <div>
                  <h3>Admin Dashboard</h3>
                  <p>Manage products and orders</p>
                </div>
              </Link>
            )}

            <Link to="/shop" className="menu-item">
              <span className="menu-icon">🛍️</span>
              <div>
                <h3>Continue Shopping</h3>
                <p>Browse our products</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>Account Created</h3>
            <p>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
          <div className="stat-card">
            <h3>Account Status</h3>
            <p className="active-status">✓ Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;