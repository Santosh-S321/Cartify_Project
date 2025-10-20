import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/shop" className="shop-now-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">₹{item.price.toLocaleString()}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{getCartTotal().toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-row">
              <span>Tax (18% GST):</span>
              <span>₹{(getCartTotal() * 0.18).toLocaleString()}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>₹{(getCartTotal() * 1.18).toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>

            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>

            <Link to="/shop" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;