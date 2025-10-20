import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  // Load cart from sessionStorage on mount
  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem("cartify_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("cartify_cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product already exists
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);

      if (existingIndex !== -1) {
        // Update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        // Add new product with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem("cartify_cart");
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get total items count
  const getItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemsCount,
    cartCount: cart.length, // For backward compatibility
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}